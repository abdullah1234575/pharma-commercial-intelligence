export type DashboardFilters = {
  year: string;
  quarter: string;
  month: string;
  region: string;
  territory: string;
  productLine: string;
  brand: string;
  medicalRep: string;
  manager: string;
  customerType: string;
  channel: string;
};

export type DetectedType = "date" | "currency" | "percentage" | "integer" | "number" | "text" | "unknown";

export type ColumnPreview = {
  originalName: string;
  detectedType: DetectedType;
  cleanedType: DetectedType;
  sampleValues: string[];
  correctionCount: number;
  confidence: number;
};

export type PreviewRow = {
  rowNumber: number;
  original: Record<string, string>;
  cleaned: Record<string, string>;
  status: "ok" | "warning" | "critical";
};

export type ValidationIssue = {
  rowId: string;
  rowIndex: number;
  field: string;
  issue: string;
  severity: "warning" | "critical";
  originalValue?: string;
  expectedType?: string;
  suggestedFix?: string;
};

export type ImportSummary = {
  totalRows: number;
  importedRows: number;
  fixedRows: number;
  warningRows: number;
  rejectedRows: number;
};

export type DataQualityReport = {
  missingValues: number;
  duplicateRows: number;
  invalidDates: number;
  negativeSales: number;
  outliers: number;
  forecastAnomalies: number;
  issues: ValidationIssue[];
  summary: string[];
};

export type PharmaRecord = {
  id: string;
  uploadId?: string;
  year: number;
  quarter: string;
  month: string;
  monthIndex: number;
  region: string;
  territory: string;
  productLine: string;
  brand: string;
  medicalRep: string;
  manager: string;
  customerType: string;
  channel: string;
  sales: number;
  target: number;
  forecast: number;
  units: number;
  customers: number;
  activeCustomers: number;
  calls: number;
  plannedCalls: number;
  prescriptions: number;
  priorPrescriptions: number;
  imsSales: number;
  priorImsSales: number;
  marketSize: number;
  competitorA: number;
  competitorB: number;
  competitorC: number;
  margin: number;
};

export type KpiMetric = {
  label: string;
  value: string;
  delta: string;
  status: "positive" | "negative" | "neutral" | "warning";
  detail: string;
};

export type FilterOptions = Record<keyof DashboardFilters, string[]>;

export type ColumnMapping = Partial<Record<keyof PharmaRecord, string>> & {
  confidence: number;
  unmappedColumns: string[];
};

export type ParsedSheet = {
  fileName: string;
  sheetName: string;
  templateType?: "sales" | "market" | "forecasting";
  rowCount: number;
  mapping: ColumnMapping;
  records: PharmaRecord[];
  warnings: string[];
  errors: string[];
  columnPreview?: ColumnPreview[];
  qualityReport?: DataQualityReport;
  previewRows?: PreviewRow[];
  rowIssues?: ValidationIssue[];
  summaryCounts?: ImportSummary;
  correctedRows?: number;
  invalidRows?: number;
};

export type UploadHistoryItem = {
  id: string;
  fileName: string;
  sourceFiles: string[];
  sheets: number;
  rows: number;
  status: "processed" | "failed";
  createdAt: string;
  message: string;
};

export type TenantSession = {
  userId: string;
  email: string;
  workspaceId: string;
  role: "owner" | "admin" | "analyst" | "viewer";
};

export type ForecastKPI = {
  label: string;
  value: string;
  nextMonth: string;
  nextQuarter: string;
  ytdExpected: string;
  confidence: string;
  trend: "increasing" | "decreasing" | "stable";
  riskLevel: "low" | "medium" | "high";
};

export type ForecastData = {
  dimensionValue: string;
  nextMonthForecast: number;
  nextQuarterForecast: number;
  ytdExpectedForecast: number;
  confidence: number;
  growth: number;
  trend: "increasing" | "decreasing" | "stable";
  riskLevel: "low" | "medium" | "high";
  insights: string[];
};

export type ForecastInsight = {
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  category: "opportunity" | "risk" | "trend" | "performance" | "market";
  metric: string;
  recommendation?: string;
};
