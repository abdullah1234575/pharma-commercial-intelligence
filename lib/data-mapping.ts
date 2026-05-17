import * as XLSX from "xlsx";
import { templateDefinitions, type TemplateDefinition, type TemplateColumnType } from "@/lib/template-definitions";
import type { ColumnMapping, ParsedSheet, PharmaRecord } from "@/types/dashboard";

type RawRow = Record<string, unknown>;

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const semanticDictionary: Partial<Record<keyof PharmaRecord, string[]>> = {
  year: ["year", "fiscal year", "fy"],
  quarter: ["quarter", "qtr", "period quarter"],
  month: ["month", "period", "period name"],
  region: ["region", "area", "zone", "cluster", "district"],
  territory: ["territory", "brick", "city", "governorate", "district", "geo"],
  productLine: ["product line", "therapy", "therapy area", "portfolio", "franchise", "category"],
  brand: ["brand", "product", "sku", "item", "molecule", "medicine"],
  medicalRep: ["medical rep", "rep", "sales rep", "representative", "mr", "field force"],
  manager: ["manager", "supervisor", "district manager", "line manager", "sales manager"],
  customerType: ["customer type", "segment", "account type", "hcp type", "channel type"],
  channel: ["channel", "route", "business channel", "sales channel"],
  sales: ["sales", "net sales", "value", "revenue", "actual sales", "gross sales", "sell out"],
  target: ["target", "quota", "plan", "budget", "sales target"],
  forecast: ["forecast", "fcst", "projection", "estimate", "rolling forecast"],
  units: ["units", "volume", "packs", "qty", "quantity", "sold units"],
  customers: ["customers", "accounts", "hcp", "prescribers", "universe"],
  activeCustomers: ["active customers", "active accounts", "active hcp", "covered customers"],
  calls: ["calls", "visits", "interactions", "actual calls", "completed calls"],
  plannedCalls: ["planned calls", "call plan", "planned visits", "target calls"],
  prescriptions: ["rx", "prescriptions", "scripts", "trx", "nr x"],
  priorPrescriptions: ["prior rx", "previous rx", "last year rx", "ly rx"],
  imsSales: ["ims", "iqvia", "market sales", "ims sales", "external sales"],
  priorImsSales: ["prior ims", "last year ims", "ly ims", "prior iqvia"],
  marketSize: ["market size", "market", "total market", "market value", "category market"],
  competitorA: ["competitor a", "comp a", "leading competitor"],
  competitorB: ["competitor b", "comp b"],
  competitorC: ["competitor c", "comp c"],
  margin: ["margin", "contribution", "gross margin", "contribution margin", "profit"]
};

const requiredKeys: Array<keyof PharmaRecord> = ["sales", "brand", "year", "month"];

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findColumn(columns: string[], expected: string) {
  const normalizedExpected = normalize(expected);
  return columns.find((column) => normalize(column) === normalizedExpected);
}

function detectTemplate(columns: string[]) {
  return templateDefinitions
    .map((template) => {
      const requiredMatches = template.requiredColumns.filter((column) => findColumn(columns, column)).length;
      const totalMatches = [...template.requiredColumns, ...template.optionalColumns].filter((column) => findColumn(columns, column)).length;
      return {
        template,
        requiredMatches,
        totalMatches,
        score: requiredMatches / template.requiredColumns.length + totalMatches / (template.requiredColumns.length + template.optionalColumns.length)
      };
    })
    .sort((a, b) => b.score - a.score)[0];
}

function scoreColumn(column: string, candidates: string[]) {
  const normalizedColumn = normalize(column);
  return candidates.reduce((best, candidate) => {
    const normalizedCandidate = normalize(candidate);
    if (normalizedColumn === normalizedCandidate) return Math.max(best, 1);
    if (normalizedColumn.includes(normalizedCandidate)) return Math.max(best, 0.86);
    const columnTokens = new Set(normalizedColumn.split(" "));
    const candidateTokens = normalizedCandidate.split(" ");
    const overlap = candidateTokens.filter((token) => columnTokens.has(token)).length;
    return Math.max(best, overlap / Math.max(candidateTokens.length, 1));
  }, 0);
}

function detectMapping(columns: string[]): ColumnMapping {
  const mapping: ColumnMapping = { confidence: 0, unmappedColumns: [] };
  const usedColumns = new Set<string>();
  let scoreTotal = 0;
  let mappedCount = 0;

  Object.entries(semanticDictionary).forEach(([field, terms]) => {
    const scored = columns
      .filter((column) => !usedColumns.has(column))
      .map((column) => ({ column, score: scoreColumn(column, terms) }))
      .sort((a, b) => b.score - a.score)[0];

    if (scored && scored.score >= 0.45) {
      mapping[field as keyof PharmaRecord] = scored.column;
      usedColumns.add(scored.column);
      scoreTotal += scored.score;
      mappedCount += 1;
    }
  });

  mapping.confidence = mappedCount ? Math.round((scoreTotal / mappedCount) * 100) : 0;
  mapping.unmappedColumns = columns.filter((column) => !usedColumns.has(column));
  return mapping;
}

function mappingFromTemplate(columns: string[], template: TemplateDefinition): ColumnMapping {
  const fieldMapEntries = Object.entries(template.fieldMap)
    .map(([field, expectedColumn]) => [field, expectedColumn ? findColumn(columns, expectedColumn) : undefined] as const)
    .filter((entry): entry is readonly [string, string] => Boolean(entry[1]));

  const mapping = fieldMapEntries.reduce<ColumnMapping>(
    (acc, [field, column]) => {
      acc[field as keyof PharmaRecord] = column;
      return acc;
    },
    { confidence: 100, unmappedColumns: [] }
  );

  const mappedColumns = new Set(fieldMapEntries.map(([, column]) => column));
  mapping.unmappedColumns = columns.filter((column) => !mappedColumns.has(column));
  return mapping;
}

function value(row: RawRow, mapping: ColumnMapping, key: keyof PharmaRecord) {
  const column = mapping[key];
  return column ? row[column] : undefined;
}

function parseNumber(input: unknown) {
  if (typeof input === "number") return Number.isFinite(input) ? input : 0;
  if (typeof input !== "string") return 0;
  const cleaned = input.replace(/[$,%\s,]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isBlank(input: unknown) {
  return input === null || input === undefined || String(input).trim() === "";
}

function isValidDate(input: unknown) {
  if (input instanceof Date) return Number.isFinite(input.getTime());
  if (typeof input === "number") return input > 0;
  if (typeof input === "string") return !isBlank(input) && Number.isFinite(new Date(input).getTime());
  return false;
}

function validateCell(input: unknown, type: TemplateColumnType) {
  if (type === "text") return !isBlank(input);
  if (type === "date") return isValidDate(input);
  if (type === "integer") return Number.isInteger(parseNumber(input));
  if (type === "number") return Number.isFinite(parseNumber(input));
  return true;
}

function validateTemplateRows(rows: RawRow[], columns: string[], template: TemplateDefinition) {
  const errors: string[] = [];
  const missing = template.requiredColumns.filter((column) => !findColumn(columns, column));
  if (missing.length) {
    errors.push(`Missing required columns: ${missing.join(", ")}.`);
  }

  const maxRowsToCheck = Math.min(rows.length, 50);
  for (let rowIndex = 0; rowIndex < maxRowsToCheck; rowIndex += 1) {
    const row = rows[rowIndex];
    template.requiredColumns.forEach((expectedColumn) => {
      const actualColumn = findColumn(columns, expectedColumn);
      if (!actualColumn) return;
      const expectedType = template.columnTypes[expectedColumn];
      if (!validateCell(row[actualColumn], expectedType)) {
        errors.push(`Row ${rowIndex + 2}: "${expectedColumn}" must be ${expectedType}.`);
      }
    });
  }

  return errors;
}

function parseDateParts(row: RawRow, mapping: ColumnMapping) {
  const explicitYear = parseNumber(value(row, mapping, "year"));
  const rawMonth = value(row, mapping, "month");
  const rawQuarter = value(row, mapping, "quarter");
  const possibleDate = rawMonth instanceof Date ? rawMonth : new Date(String(rawMonth ?? ""));
  const year = explicitYear || (Number.isFinite(possibleDate.getTime()) ? possibleDate.getFullYear() : new Date().getFullYear());
  const monthIndex =
    typeof rawMonth === "number"
      ? Math.max(0, Math.min(11, rawMonth - 1))
      : Number.isFinite(possibleDate.getTime())
        ? possibleDate.getMonth()
        : Math.max(0, monthNames.findIndex((month) => normalize(String(rawMonth ?? "")).startsWith(month.toLowerCase())));
  const safeMonthIndex = monthIndex >= 0 ? monthIndex : 0;
  const quarter = String(rawQuarter || `Q${Math.floor(safeMonthIndex / 3) + 1}`).toUpperCase().replace("QUARTER ", "Q");

  return {
    year,
    quarter,
    month: monthNames[safeMonthIndex],
    monthIndex: safeMonthIndex
  };
}

function textValue(input: unknown, fallback: string) {
  const valueText = String(input ?? "").trim();
  return valueText || fallback;
}

function normalizeRows(rows: RawRow[], mapping: ColumnMapping, fileName: string, sheetName: string): PharmaRecord[] {
  return rows.map((row, index) => {
    const dateParts = parseDateParts(row, mapping);
    const sales = parseNumber(value(row, mapping, "sales"));
    const target = parseNumber(value(row, mapping, "target"));
    const forecast = parseNumber(value(row, mapping, "forecast"));
    const customers = parseNumber(value(row, mapping, "customers"));
    const activeCustomers = parseNumber(value(row, mapping, "activeCustomers"));
    const calls = parseNumber(value(row, mapping, "calls"));
    const plannedCalls = parseNumber(value(row, mapping, "plannedCalls"));
    const prescriptions = parseNumber(value(row, mapping, "prescriptions"));
    const imsSales = parseNumber(value(row, mapping, "imsSales"));

    return {
      id: `${fileName}-${sheetName}-${index}`,
      ...dateParts,
      region: textValue(value(row, mapping, "region"), "Unassigned Region"),
      territory: textValue(value(row, mapping, "territory"), "Unassigned Territory"),
      productLine: textValue(value(row, mapping, "productLine"), "Portfolio"),
      brand: textValue(value(row, mapping, "brand"), "Unassigned Product"),
      medicalRep: textValue(value(row, mapping, "medicalRep"), "Unassigned Rep"),
      manager: textValue(value(row, mapping, "manager"), "Unassigned Manager"),
      customerType: textValue(value(row, mapping, "customerType"), "All Customers"),
      channel: textValue(value(row, mapping, "channel"), "All Channels"),
      sales,
      target,
      forecast,
      units: parseNumber(value(row, mapping, "units")),
      customers,
      activeCustomers,
      calls,
      plannedCalls,
      prescriptions,
      priorPrescriptions: parseNumber(value(row, mapping, "priorPrescriptions")),
      imsSales,
      priorImsSales: parseNumber(value(row, mapping, "priorImsSales")),
      marketSize: parseNumber(value(row, mapping, "marketSize")) || Math.max(sales, imsSales),
      competitorA: parseNumber(value(row, mapping, "competitorA")),
      competitorB: parseNumber(value(row, mapping, "competitorB")),
      competitorC: parseNumber(value(row, mapping, "competitorC")),
      margin: parseNumber(value(row, mapping, "margin"))
    };
  });
}

export async function parseCommercialFile(file: File): Promise<ParsedSheet[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["csv", "xls", "xlsx"].includes(extension)) {
    throw new Error("Only CSV, XLS, and XLSX files are supported.");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

  return workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<RawRow>(worksheet, { defval: "" });
    const columns = rows[0] ? Object.keys(rows[0]) : [];
    const detected = detectTemplate(columns);
    const isInstructionSheet = ["instructions", "data dictionary", "data_dictionary"].includes(normalize(sheetName));
    const template = detected?.requiredMatches ? detected.template : undefined;
    const templateErrors = template ? validateTemplateRows(rows, columns, template) : [];
    const mapping = template ? mappingFromTemplate(columns, template) : detectMapping(columns);
    const missingRequired = template ? [] : requiredKeys.filter((key) => !mapping[key]);
    const errors = isInstructionSheet
      ? []
      : [
          ...(template ? templateErrors : ["Correction required: uploaded sheet does not match a standardized Synaptic Group template. Download a template and keep the required headers unchanged."]),
          ...(!template && missingRequired.length ? [`Missing mapped fields: ${missingRequired.join(", ")}.`] : [])
        ];
    const records = errors.length || isInstructionSheet ? [] : normalizeRows(rows, mapping, file.name, sheetName);

    return {
      fileName: file.name,
      sheetName,
      templateType: template?.type,
      rowCount: rows.length,
      mapping,
      records,
      warnings: [
        ...(isInstructionSheet ? ["Reference sheet skipped. Upload processing uses Data_Template sheets only."] : []),
        ...(rows.length === 0 ? ["Sheet has no data rows."] : []),
        ...(template ? [`Recognized ${template.label} template. Automatic mapping applied.`] : []),
        ...(mapping.confidence < 70 ? ["Low mapping confidence. Review source column names for clearer BI semantics."] : [])
      ],
      errors
    };
  });
}
