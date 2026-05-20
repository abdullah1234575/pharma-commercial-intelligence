import type { ColumnMapping, ImportSummary, PharmaRecord, PreviewRow } from "@/types/dashboard";
import { inferColumnTypes, normalizeDate, normalizeNumber, normalizeText } from "@/lib/schema-inference";
import { buildDataQualityReport, validatePharmaRecord } from "@/lib/pharma-validation";

type RawRow = Record<string, unknown>;

function normalizeTextField(input: unknown, fallback: string) {
  return normalizeText(input, fallback);
}

function normalizeNumericField(input: unknown) {
  return normalizeNumber(input) ?? 0;
}

function getExpectedType(field: string) {
  if (["year", "monthIndex", "sales", "target", "forecast", "units", "customers", "activeCustomers", "calls", "plannedCalls", "prescriptions", "priorPrescriptions", "imsSales", "priorImsSales", "marketSize", "competitorA", "competitorB", "competitorC", "margin"].includes(field)) {
    return "number";
  }
  if (["quarter", "month", "region", "territory", "productLine", "brand", "medicalRep", "manager", "customerType", "channel"].includes(field)) {
    return "text";
  }
  return "text";
}

function formatOriginalValue(value: unknown) {
  if (value === null || value === undefined) return "(empty)";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).trim();
}

function buildSuggestedFix(field: string, rawValue: unknown) {
  const original = formatOriginalValue(rawValue);
  if (original === "(empty)") {
    return field === "brand" || field === "region" ? "Replace with a default field value or fill in the source cell." : "Provide a valid numeric or text value in the source file.";
  }

  if (getExpectedType(field) === "number") {
    return `Strip currency symbols and text, then confirm the numeric value for ${field}.`;
  }

  return `Trim whitespace and standardize naming for ${field}.`;
}

function getRawCellValue(row: RawRow, columnName: string | undefined) {
  if (!columnName) return undefined;
  return row[columnName];
}

export function cleanSheetRecords(rows: RawRow[], mapping: ColumnMapping, fileName: string, sheetName: string, uploadId?: string) {
  const mappedFields = Object.entries(mapping).filter(([field, column]) => field !== "confidence" && column) as [keyof typeof mapping, string][];
  const cleanedRecords = rows.map((row, index) => {
    const year = normalizeNumericField(row[mapping.year ?? ""]);
    const monthValue = row[mapping.month ?? ""];
    const quarterValue = row[mapping.quarter ?? ""];
    const parsedDate = normalizeDate(monthValue ?? quarterValue ?? year);
    const dateParts = {
      year: year || (parsedDate ? parsedDate.getFullYear() : new Date().getFullYear()),
      quarter: String(quarterValue || `Q${Math.floor((parsedDate ? parsedDate.getMonth() : 0) / 3) + 1}`).toUpperCase().replace("QUARTER ", "Q"),
      month: parsedDate ? parsedDate.toLocaleString("en-US", { month: "short" }) : "Jan",
      monthIndex: parsedDate ? parsedDate.getMonth() : 0
    };

    const sales = normalizeNumericField(row[mapping.sales ?? ""]);
    const target = normalizeNumericField(row[mapping.target ?? ""]);
    const forecast = normalizeNumericField(row[mapping.forecast ?? ""]);
    const customers = normalizeNumericField(row[mapping.customers ?? ""]);
    const activeCustomers = normalizeNumericField(row[mapping.activeCustomers ?? ""]);
    const calls = normalizeNumericField(row[mapping.calls ?? ""]);
    const plannedCalls = normalizeNumericField(row[mapping.plannedCalls ?? ""]);
    const prescriptions = normalizeNumericField(row[mapping.prescriptions ?? ""]);
    const imsSales = normalizeNumericField(row[mapping.imsSales ?? ""]);

    return {
      id: uploadId ? `${uploadId}-${fileName}-${sheetName}-${index}` : `${fileName}-${sheetName}-${index}`,
      uploadId,
      ...dateParts,
      region: normalizeTextField(row[mapping.region ?? ""], "Unassigned Region"),
      territory: normalizeTextField(row[mapping.territory ?? ""], "Unassigned Territory"),
      productLine: normalizeTextField(row[mapping.productLine ?? ""], "Portfolio"),
      brand: normalizeTextField(row[mapping.brand ?? ""], "Unassigned Product"),
      medicalRep: normalizeTextField(row[mapping.medicalRep ?? ""], "Unassigned Rep"),
      manager: normalizeTextField(row[mapping.manager ?? ""], "Unassigned Manager"),
      customerType: normalizeTextField(row[mapping.customerType ?? ""], "All Customers"),
      channel: normalizeTextField(row[mapping.channel ?? ""], "All Channels"),
      sales,
      target,
      forecast,
      units: normalizeNumericField(row[mapping.units ?? ""]),
      customers,
      activeCustomers,
      calls,
      plannedCalls,
      prescriptions,
      priorPrescriptions: normalizeNumericField(row[mapping.priorPrescriptions ?? ""]),
      imsSales,
      priorImsSales: normalizeNumericField(row[mapping.priorImsSales ?? ""]),
      marketSize: normalizeNumericField(row[mapping.marketSize ?? ""]) || Math.max(sales, imsSales),
      competitorA: normalizeNumericField(row[mapping.competitorA ?? ""]),
      competitorB: normalizeNumericField(row[mapping.competitorB ?? ""]),
      competitorC: normalizeNumericField(row[mapping.competitorC ?? ""]),
      margin: normalizeNumericField(row[mapping.margin ?? ""])
    };
  });

  const rowIssues = cleanedRecords.flatMap((record, index) => {
    const issues = validatePharmaRecord(record);
    return issues.map((issue) => {
      const mappedColumn = mapping[issue.field as keyof ColumnMapping];
      const rawValue = getRawCellValue(rows[index], typeof mappedColumn === "string" ? mappedColumn : undefined);
      return {
        ...issue,
        originalValue: formatOriginalValue(rawValue),
        expectedType: getExpectedType(issue.field),
        suggestedFix: buildSuggestedFix(issue.field, rawValue)
      };
    });
  });

  const criticalRows = new Set(rowIssues.filter((issue) => issue.severity === "critical").map((issue) => issue.rowIndex));
  const warningRows = new Set(rowIssues.filter((issue) => issue.severity === "warning").map((issue) => issue.rowIndex));
  const importedRecords = cleanedRecords.filter((_, index) => !criticalRows.has(index));

  const mappedColumns = mappedFields.map(([, column]) => column);
  const fixedRows = rows.reduce((count, row, index) => {
    const cleaned = cleanedRecords[index];
    const hasChange = mappedColumns.some((column) => formatOriginalValue(row[column]) !== formatOriginalValue(cleaned[column as keyof PharmaRecord]));
    return count + (hasChange ? 1 : 0);
  }, 0);

  const previewRows: PreviewRow[] = rows.slice(0, 20).map((row, index) => {
    const cleaned = cleanedRecords[index];
    return {
      rowNumber: index + 2,
      original: mappedFields.reduce<Record<string, string>>((acc, [, column]) => {
        acc[column] = formatOriginalValue(row[column]);
        return acc;
      }, {}),
      cleaned: mappedFields.reduce<Record<string, string>>((acc, [field, column]) => {
        acc[column] = formatOriginalValue(cleaned[field as keyof typeof cleaned] ?? "");
        return acc;
      }, {}),
      status: criticalRows.has(index) ? "critical" : warningRows.has(index) ? "warning" : "ok"
    };
  });

  const qualityReport = buildDataQualityReport(cleanedRecords);

  const summaryCounts: ImportSummary = {
    totalRows: rows.length,
    importedRows: importedRecords.length,
    fixedRows,
    warningRows: warningRows.size,
    rejectedRows: criticalRows.size
  };

  return {
    records: importedRecords,
    qualityReport,
    columnPreview: inferColumnTypes(rows, Object.keys(rows[0] ?? {})),
    correctedRows: qualityReport.issues.length,
    invalidRows: qualityReport.duplicateRows + qualityReport.invalidDates + qualityReport.outliers,
    previewRows,
    rowIssues,
    summaryCounts
  };
}
