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
