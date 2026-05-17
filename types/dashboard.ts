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

export type PharmaRecord = {
  id: string;
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
};

export type UploadHistoryItem = {
  id: string;
  fileName: string;
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
