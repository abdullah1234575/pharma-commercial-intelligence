import { parse, parseISO, isValid } from "date-fns";
import type { ColumnMapping, ColumnPreview, DetectedType, PharmaRecord } from "@/types/dashboard";

type RawRow = Record<string, unknown>;

const dateFormats = [
  "dd/MM/yyyy",
  "d/M/yyyy",
  "MM/dd/yyyy",
  "M/d/yyyy",
  "yyyy-MM-dd",
  "yyyy/MM/dd",
  "MMM-yyyy",
  "MMMM yyyy",
  "MMM d, yyyy",
  "MMMM d, yyyy",
  "dd-MMM-yyyy",
  "MMM dd, yyyy"
];

const currencyRegex = /^[\p{Sc}\$£€¥₹₽฿₩₪₫₴]?\s*[+-]?\d{1,3}(?:[\s,]\d{3})*(?:\.\d+)?(?:\s*[A-Za-z]{0,5})?$/u;
const percentageRegex = /^[+-]?\d{1,3}(?:[\s,]\d{3})?(?:\.\d+)?\s*%$/;

export function normalizeText(input: unknown, fallback = "Unknown"): string {
  const raw = typeof input === "string" ? input : input == null ? "" : String(input);
  const cleaned = raw
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/[\s\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, " ")
    .trim();
  return cleaned || fallback;
}

export function normalizeNumber(input: unknown): number | null {
  if (typeof input === "number") {
    return Number.isFinite(input) ? input : null;
  }

  if (typeof input !== "string") {
    return null;
  }

  const cleaned = input
    .replace(/[\s\$£€¥₹₽฿₩₪₫₴]+/g, "")
    .replace(/,/g, "")
    .replace(/%/g, "")
    .replace(/[A-Za-z]+/g, "")
    .trim();

  if (cleaned === "" || cleaned === "-") {
    return null;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const serial = Math.round(value);
    if (serial > 0 && serial < 60000) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const date = new Date(excelEpoch.getTime() + (serial - 1) * 24 * 60 * 60 * 1000);
      return isValid(date) ? date : null;
    }
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  const iso = parseISO(trimmed);
  if (isValid(iso)) {
    return iso;
  }

  for (const format of dateFormats) {
    const parsed = parse(trimmed, format, new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }

  const numeric = normalizeNumber(trimmed);
  if (numeric !== null) {
    return normalizeDate(numeric);
  }

  return null;
}

export function inferValueType(value: unknown): DetectedType {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "text";
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? "integer" : "number";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return "text";
    if (percentageRegex.test(trimmed)) return "percentage";
    if (currencyRegex.test(trimmed)) return "currency";
    if (normalizeDate(trimmed)) return "date";

    const numeric = normalizeNumber(trimmed);
    if (numeric !== null) {
      return Number.isInteger(numeric) ? "integer" : "number";
    }

    return "text";
  }

  return "text";
}

export function detectColumnType(values: unknown[]): DetectedType {
  const tally: Record<DetectedType, number> = {
    date: 0,
    currency: 0,
    percentage: 0,
    integer: 0,
    number: 0,
    text: 0,
    unknown: 0
  };

  values.forEach((value) => {
    const type = inferValueType(value);
    tally[type] += 1;
  });

  const ordered: DetectedType[] = ["date", "currency", "percentage", "integer", "number", "text", "unknown"];
  return ordered.reduce((best, candidate) => (tally[candidate] > tally[best] ? candidate : best), "text");
}

export function buildColumnPreview(rows: RawRow[], columns: string[]): ColumnPreview[] {
  return columns.map((column) => {
    const samples = rows.slice(0, 8).map((row) => row[column]);
    const detectedType = detectColumnType(samples);
    const correctedType = detectedType === "percentage" ? "number" : detectedType;
    const correctionCount = rows.reduce((count, row) => {
      const raw = row[column];
      if (detectedType === "text") return count;
      if (detectedType === "date") return normalizeDate(raw) ? count : count + 1;
      if (detectedType === "integer" || detectedType === "number" || detectedType === "currency" || detectedType === "percentage") {
        return normalizeNumber(raw) !== null ? count : count + 1;
      }
      return count;
    }, 0);

    return {
      originalName: column,
      detectedType,
      cleanedType: correctedType,
      sampleValues: samples.map((value) => (value === null || value === undefined ? "" : String(value))).slice(0, 6),
      correctionCount,
      confidence: Math.round((samples.length - Math.min(correctionCount, samples.length)) / Math.max(samples.length, 1) * 100)
    };
  });
}

export function inferColumnTypes(rows: RawRow[], columns: string[]): ColumnPreview[] {
  return buildColumnPreview(rows, columns);
}

export function mapColumnsFromPreview(columns: string[], semanticMap: Record<string, string[]>): ColumnMapping {
  const mapping: ColumnMapping = { confidence: 0, unmappedColumns: [] };
  const usedColumns = new Set<string>();
  let scoreTotal = 0;
  let mappedCount = 0;

  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  const score = (column: string, candidate: string) => {
    const normalizedColumn = normalize(column);
    const normalizedCandidate = normalize(candidate);
    if (normalizedColumn === normalizedCandidate) return 1;
    if (normalizedColumn.includes(normalizedCandidate) || normalizedCandidate.includes(normalizedColumn)) return 0.86;
    const columnTokens = new Set(normalizedColumn.split(" "));
    const candidateTokens = normalizedCandidate.split(" ");
    const overlap = candidateTokens.filter((token) => columnTokens.has(token)).length;
    return overlap / Math.max(candidateTokens.length, 1);
  };

  Object.entries(semanticMap).forEach(([field, candidates]) => {
    const fieldName = field as keyof PharmaRecord;
    const best = columns
      .filter((column) => !usedColumns.has(column))
      .map((column) => ({ column, score: Math.max(...candidates.map((candidate) => score(column, candidate))) }))
      .sort((a, b) => b.score - a.score)[0];

    if (best && best.score >= 0.45) {
      mapping[fieldName] = best.column;
      scoreTotal += best.score;
      mappedCount += 1;
      usedColumns.add(best.column);
    }
  });

  mapping.confidence = mappedCount ? Math.round((scoreTotal / mappedCount) * 100) : 0;
  mapping.unmappedColumns = columns.filter((column) => !usedColumns.has(column));
  return mapping;
}
