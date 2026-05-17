import type { PharmaRecord } from "@/types/dashboard";

export type TemplateType = "sales" | "market" | "forecasting";
export type TemplateColumnType = "text" | "number" | "integer" | "date";

export type TemplateDefinition = {
  type: TemplateType;
  label: string;
  fileName: string;
  href: string;
  requiredColumns: string[];
  optionalColumns: string[];
  columnTypes: Record<string, TemplateColumnType>;
  fieldMap: Partial<Record<keyof PharmaRecord, string>>;
};

const numericColumns = [
  "Sales",
  "Target",
  "Forecast",
  "Units Sold",
  "Active Customers",
  "Customers",
  "Calls",
  "Planned Calls",
  "Prescriptions",
  "Prior Prescriptions",
  "IMS Sales",
  "Prior IMS Sales",
  "Market Size",
  "Contribution Margin",
  "Competitor A",
  "Competitor B",
  "Competitor C",
  "Confidence %"
];

function typeMap(columns: string[]) {
  return columns.reduce<Record<string, TemplateColumnType>>((acc, column) => {
    if (column === "Period Date") acc[column] = "date";
    else if (column === "Year") acc[column] = "integer";
    else if (numericColumns.includes(column)) acc[column] = "number";
    else acc[column] = "text";
    return acc;
  }, {});
}

const salesRequired = [
  "Period Date",
  "Year",
  "Quarter",
  "Month",
  "Region",
  "Territory",
  "Product Line",
  "Brand",
  "Medical Rep",
  "Manager",
  "Customer Type",
  "Channel",
  "Sales",
  "Target",
  "Units Sold",
  "Active Customers"
];

const salesOptional = [
  "Customers",
  "Calls",
  "Planned Calls",
  "Prescriptions",
  "Prior Prescriptions",
  "IMS Sales",
  "Prior IMS Sales",
  "Market Size",
  "Contribution Margin"
];

const marketRequired = [
  "Period Date",
  "Year",
  "Quarter",
  "Month",
  "Region",
  "Territory",
  "Product Line",
  "Brand",
  "Sales",
  "Market Size",
  "IMS Sales"
];

const marketOptional = [
  "Prior IMS Sales",
  "Competitor A",
  "Competitor B",
  "Competitor C",
  "Units Sold",
  "Prescriptions",
  "Prior Prescriptions",
  "Channel",
  "Customer Type"
];

const forecastingRequired = [
  "Period Date",
  "Year",
  "Quarter",
  "Month",
  "Region",
  "Territory",
  "Product Line",
  "Brand",
  "Sales",
  "Target",
  "Forecast"
];

const forecastingOptional = [
  "Units Sold",
  "Contribution Margin",
  "Market Size",
  "Medical Rep",
  "Manager",
  "Channel",
  "Scenario",
  "Forecast Driver",
  "Confidence %"
];

const commonFieldMap: Partial<Record<keyof PharmaRecord, string>> = {
  year: "Year",
  quarter: "Quarter",
  month: "Month",
  region: "Region",
  territory: "Territory",
  productLine: "Product Line",
  brand: "Brand",
  medicalRep: "Medical Rep",
  manager: "Manager",
  customerType: "Customer Type",
  channel: "Channel",
  sales: "Sales",
  target: "Target",
  forecast: "Forecast",
  units: "Units Sold",
  customers: "Customers",
  activeCustomers: "Active Customers",
  calls: "Calls",
  plannedCalls: "Planned Calls",
  prescriptions: "Prescriptions",
  priorPrescriptions: "Prior Prescriptions",
  imsSales: "IMS Sales",
  priorImsSales: "Prior IMS Sales",
  marketSize: "Market Size",
  competitorA: "Competitor A",
  competitorB: "Competitor B",
  competitorC: "Competitor C",
  margin: "Contribution Margin"
};

export const templateDefinitions: TemplateDefinition[] = [
  {
    type: "sales",
    label: "Sales Data",
    fileName: "sales-data-template.xlsx",
    href: "/templates/sales-data-template.xlsx",
    requiredColumns: salesRequired,
    optionalColumns: salesOptional,
    columnTypes: typeMap([...salesRequired, ...salesOptional]),
    fieldMap: commonFieldMap
  },
  {
    type: "market",
    label: "Market Intelligence",
    fileName: "market-intelligence-template.xlsx",
    href: "/templates/market-intelligence-template.xlsx",
    requiredColumns: marketRequired,
    optionalColumns: marketOptional,
    columnTypes: typeMap([...marketRequired, ...marketOptional]),
    fieldMap: commonFieldMap
  },
  {
    type: "forecasting",
    label: "Forecasting",
    fileName: "forecasting-template.xlsx",
    href: "/templates/forecasting-template.xlsx",
    requiredColumns: forecastingRequired,
    optionalColumns: forecastingOptional,
    columnTypes: typeMap([...forecastingRequired, ...forecastingOptional]),
    fieldMap: commonFieldMap
  }
];
