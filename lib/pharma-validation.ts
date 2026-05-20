import { z } from "zod";
import type { PharmaRecord, DataQualityReport, ValidationIssue } from "@/types/dashboard";

const PharmaRecordSchema = z.object({
  id: z.string(),
  uploadId: z.string().optional(),
  year: z.number().int(),
  quarter: z.string(),
  month: z.string(),
  monthIndex: z.number().int(),
  region: z.string(),
  territory: z.string(),
  productLine: z.string(),
  brand: z.string(),
  medicalRep: z.string(),
  manager: z.string(),
  customerType: z.string(),
  channel: z.string(),
  sales: z.number(),
  target: z.number(),
  forecast: z.number(),
  units: z.number(),
  customers: z.number(),
  activeCustomers: z.number(),
  calls: z.number(),
  plannedCalls: z.number(),
  prescriptions: z.number(),
  priorPrescriptions: z.number(),
  imsSales: z.number(),
  priorImsSales: z.number(),
  marketSize: z.number(),
  competitorA: z.number(),
  competitorB: z.number(),
  competitorC: z.number(),
  margin: z.number()
});

export function validatePharmaRecord(record: PharmaRecord): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const parseResult = PharmaRecordSchema.safeParse(record);

  if (!parseResult.success) {
    parseResult.error.issues.forEach((error) => {
      issues.push({
        rowId: record.id,
        rowIndex: Number(record.id.split("-").pop() ?? 0),
        field: error.path.join(".") || "record",
        issue: error.message,
        severity: "critical"
      });
    });
    return issues;
  }

  if (record.sales < 0) {
    issues.push({ rowId: record.id, rowIndex: Number(record.id.split("-").pop() ?? 0), field: "sales", issue: "Negative sales value detected.", severity: "warning" });
  }

  if (record.forecast < 0) {
    issues.push({ rowId: record.id, rowIndex: Number(record.id.split("-").pop() ?? 0), field: "forecast", issue: "Negative forecast value detected.", severity: "warning" });
  }

  if (record.target < 0) {
    issues.push({ rowId: record.id, rowIndex: Number(record.id.split("-").pop() ?? 0), field: "target", issue: "Negative target value detected.", severity: "warning" });
  }

  if (!Number.isInteger(record.units)) {
    issues.push({ rowId: record.id, rowIndex: Number(record.id.split("-").pop() ?? 0), field: "units", issue: "Units should be an integer.", severity: "warning" });
  }

  if (record.marketSize < record.sales) {
    issues.push({ rowId: record.id, rowIndex: Number(record.id.split("-").pop() ?? 0), field: "marketSize", issue: "Market size is smaller than sales, review the source data.", severity: "warning" });
  }

  if (record.sales === 0 && record.margin > 0) {
    issues.push({ rowId: record.id, rowIndex: Number(record.id.split("-").pop() ?? 0), field: "margin", issue: "Margin exists even though sales are zero.", severity: "warning" });
  }

  if (record.forecast > record.target * 4 && record.target > 0) {
    issues.push({ rowId: record.id, rowIndex: Number(record.id.split("-").pop() ?? 0), field: "forecast", issue: "Forecast is more than 4x target, review the projected values.", severity: "warning" });
  }

  if (record.forecast > record.marketSize * 1.5 && record.marketSize > 0) {
    issues.push({ rowId: record.id, rowIndex: Number(record.id.split("-").pop() ?? 0), field: "forecast", issue: "Forecast exceeds market size by more than 50%.", severity: "warning" });
  }

  if (record.margin > record.sales * 1.5 && record.sales > 0) {
    issues.push({ rowId: record.id, rowIndex: Number(record.id.split("-").pop() ?? 0), field: "margin", issue: "Margin is unusually high relative to sales.", severity: "warning" });
  }

  return issues;
}

export function buildDataQualityReport(records: PharmaRecord[]): DataQualityReport {
  const issues: ValidationIssue[] = [];
  const duplicateIndex: Record<string, number[]> = {};
  const salesValues: number[] = [];

  records.forEach((record) => {
    const idParts = [record.year, record.month, record.region, record.territory, record.brand, record.medicalRep].join("|");
    duplicateIndex[idParts] = duplicateIndex[idParts] ?? [];
    duplicateIndex[idParts].push(Number(record.id.split("-").pop() ?? 0));
    salesValues.push(record.sales);
    issues.push(...validatePharmaRecord(record));
  });

  const duplicateRows = Object.values(duplicateIndex).filter((entries) => entries.length > 1).length;
  const mean = salesValues.reduce((sum, value) => sum + value, 0) / Math.max(salesValues.length, 1);
  const variance = salesValues.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(salesValues.length, 1);
  const stdDev = Math.sqrt(variance);
  const outlierThreshold = mean + stdDev * 3;
  let outliers = 0;

  salesValues.forEach((value) => {
    if (value > outlierThreshold) {
      outliers += 1;
    }
  });

  return {
    missingValues: issues.filter((issue) => issue.severity === "critical").length,
    duplicateRows,
    invalidDates: issues.filter((issue) => issue.field === "year" || issue.field === "month").length,
    negativeSales: issues.filter((issue) => issue.field === "sales" && issue.issue.includes("Negative")).length,
    outliers,
    forecastAnomalies: issues.filter((issue) => issue.field === "forecast").length,
    issues,
    summary: [
      `Duplicate groups: ${duplicateRows}`,
      `Outlier sales rows: ${outliers}`,
      `Forecast flags: ${issues.filter((issue) => issue.field === "forecast").length}`
    ]
  };
}
