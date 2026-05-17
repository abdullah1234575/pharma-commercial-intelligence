import type { DashboardFilters, FilterOptions, KpiMetric, PharmaRecord } from "@/types/dashboard";

export const defaultFilters: DashboardFilters = {
  year: "All",
  quarter: "All",
  month: "All",
  region: "All",
  territory: "All",
  productLine: "All",
  brand: "All",
  medicalRep: "All",
  manager: "All",
  customerType: "All",
  channel: "All"
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1
});

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1
});

function sum(records: PharmaRecord[], key: keyof PharmaRecord) {
  return records.reduce((total, record) => total + Number(record[key] || 0), 0);
}

function safeRate(numerator: number, denominator: number) {
  return denominator ? numerator / denominator : 0;
}

function groupBy<T extends string>(records: PharmaRecord[], key: keyof PharmaRecord) {
  return records.reduce<Record<T, PharmaRecord[]>>((acc, record) => {
    const value = String(record[key] || "Unassigned") as T;
    acc[value] = acc[value] || [];
    acc[value].push(record);
    return acc;
  }, {} as Record<T, PharmaRecord[]>);
}

function metric(label: string, value: string, deltaValue: number, detail: string, inverse = false): KpiMetric {
  const isPositive = inverse ? deltaValue <= 0 : deltaValue >= 0;
  return {
    label,
    value,
    delta: `${deltaValue >= 0 ? "+" : ""}${deltaValue.toFixed(1)}%`,
    status: Math.abs(deltaValue) < 0.1 ? "neutral" : isPositive ? "positive" : "negative",
    detail
  };
}

function uniqueOptions(records: PharmaRecord[], key: keyof PharmaRecord) {
  return [
    "All",
    ...Array.from(new Set(records.map((record) => String(record[key] || "")).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    )
  ];
}

export function buildFilterOptions(records: PharmaRecord[]): FilterOptions {
  return {
    year: uniqueOptions(records, "year"),
    quarter: uniqueOptions(records, "quarter"),
    month: ["All", ...months.filter((month) => records.some((record) => record.month === month))],
    region: uniqueOptions(records, "region"),
    territory: uniqueOptions(records, "territory"),
    productLine: uniqueOptions(records, "productLine"),
    brand: uniqueOptions(records, "brand"),
    medicalRep: uniqueOptions(records, "medicalRep"),
    manager: uniqueOptions(records, "manager"),
    customerType: uniqueOptions(records, "customerType"),
    channel: uniqueOptions(records, "channel")
  };
}

export function filterRecords(filters: DashboardFilters, records: PharmaRecord[]) {
  return records.filter((record) => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === "All") return true;
      const recordValue = record[key as keyof DashboardFilters];
      return String(recordValue) === value;
    });
  });
}

export function buildDashboardModel(filters: DashboardFilters, sourceRecords: PharmaRecord[]) {
  const records = filterRecords(filters, sourceRecords);
  const numericYear = filters.year === "All" ? null : Number(filters.year);
  const comparisonRecords = numericYear
    ? filterRecords({ ...filters, year: String(numericYear - 1) }, sourceRecords)
    : [];
  const allRecordsForShare = sourceRecords.filter((record) => filters.year === "All" || String(record.year) === filters.year);

  const sales = sum(records, "sales");
  const priorSales = sum(comparisonRecords, "sales");
  const target = sum(records, "target");
  const forecast = sum(records, "forecast");
  const units = sum(records, "units");
  const activeCustomers = sum(records, "activeCustomers");
  const customersTotal = sum(records, "customers");
  const calls = sum(records, "calls");
  const plannedCalls = sum(records, "plannedCalls");
  const margin = sum(records, "margin");
  const prescriptions = sum(records, "prescriptions");
  const priorPrescriptions = sum(records, "priorPrescriptions");
  const imsSales = sum(records, "imsSales");
  const priorImsSales = sum(records, "priorImsSales");
  const totalMarketSize = sum(allRecordsForShare, "marketSize");
  const marketShare = safeRate(sales, totalMarketSize);
  const achievement = safeRate(sales, target);
  const accuracy = sales ? 1 - Math.abs(forecast - sales) / sales : 0;
  const growth = priorSales ? safeRate(sales - priorSales, priorSales) : 0;
  const rxGrowth = priorPrescriptions ? safeRate(prescriptions - priorPrescriptions, priorPrescriptions) : 0;
  const imsGrowth = priorImsSales ? safeRate(imsSales - priorImsSales, priorImsSales) : 0;
  const marginRate = safeRate(margin, sales);
  const coverage = safeRate(calls, plannedCalls);
  const repCount = new Set(records.map((record) => record.medicalRep).filter(Boolean)).size || 1;
  const customerCount = customersTotal || 1;

  const monthly = Object.entries(groupBy(records, "month"))
    .map(([month, monthRecords]) => ({
      month,
      monthIndex: monthRecords[0].monthIndex,
      sales: sum(monthRecords, "sales"),
      target: sum(monthRecords, "target"),
      forecast: sum(monthRecords, "forecast"),
      growth: safeRate(sum(monthRecords, "sales") - sum(monthRecords, "target"), Math.max(sum(monthRecords, "target"), 1)) * 100,
      share: safeRate(sum(monthRecords, "sales"), Math.max(sum(monthRecords, "marketSize"), 1)) * 100
    }))
    .sort((a, b) => a.monthIndex - b.monthIndex);

  const byBrand = Object.entries(groupBy(records, "brand"))
    .map(([name, brandRecords]) => ({
      name,
      sales: sum(brandRecords, "sales"),
      target: sum(brandRecords, "target"),
      margin: sum(brandRecords, "margin"),
      share: safeRate(sum(brandRecords, "sales"), Math.max(sum(brandRecords, "marketSize"), 1)) * 100,
      units: sum(brandRecords, "units")
    }))
    .sort((a, b) => b.sales - a.sales);

  const byRegion = Object.entries(groupBy(records, "region"))
    .map(([name, regionRecords]) => ({
      name,
      sales: sum(regionRecords, "sales"),
      target: sum(regionRecords, "target"),
      coverage: safeRate(sum(regionRecords, "calls"), Math.max(sum(regionRecords, "plannedCalls"), 1)) * 100,
      marginRate: safeRate(sum(regionRecords, "margin"), Math.max(sum(regionRecords, "sales"), 1)) * 100
    }))
    .sort((a, b) => b.sales - a.sales);

  const byTerritory = Object.entries(groupBy(records, "territory"))
    .map(([name, territoryRecords]) => ({
      name,
      region: territoryRecords[0].region,
      sales: sum(territoryRecords, "sales"),
      achievement: safeRate(sum(territoryRecords, "sales"), Math.max(sum(territoryRecords, "target"), 1)) * 100,
      coverage: safeRate(sum(territoryRecords, "calls"), Math.max(sum(territoryRecords, "plannedCalls"), 1)) * 100
    }))
    .sort((a, b) => b.sales - a.sales);

  const byRep = Object.entries(groupBy(records, "medicalRep"))
    .map(([name, repRecords]) => ({
      name,
      manager: repRecords[0].manager,
      sales: sum(repRecords, "sales"),
      calls: sum(repRecords, "calls"),
      productivity: safeRate(sum(repRecords, "sales"), Math.max(sum(repRecords, "calls"), 1)),
      achievement: safeRate(sum(repRecords, "sales"), Math.max(sum(repRecords, "target"), 1)) * 100
    }))
    .sort((a, b) => b.sales - a.sales);

  const competitor = [
    { name: "Portfolio", value: sales },
    { name: "Competitor A", value: sum(records, "competitorA") },
    { name: "Competitor B", value: sum(records, "competitorB") },
    { name: "Competitor C", value: sum(records, "competitorC") }
  ].filter((entry) => entry.value > 0).sort((a, b) => b.value - a.value);

  const customers = Object.entries(groupBy(records, "customerType"))
    .map(([name, customerRecords]) => ({
      name,
      sales: sum(customerRecords, "sales"),
      active: sum(customerRecords, "activeCustomers"),
      retained: Math.round(safeRate(sum(customerRecords, "activeCustomers"), Math.max(sum(customerRecords, "customers"), 1)) * 100)
    }))
    .sort((a, b) => b.sales - a.sales);

  const channelMix = Object.entries(groupBy(records, "channel")).map(([name, channelRecords]) => ({
    name,
    value: sum(channelRecords, "sales")
  }));

  const waterfall = [
    { name: "YTD Sales", value: sales },
    { name: "Target Gap", value: sales - target },
    { name: "Margin", value: margin },
    { name: "Forecast Var.", value: sales - forecast }
  ];

  const kpis: KpiMetric[] = [
    metric("Total Sales", currency.format(sales), growth * 100, "Calculated from uploaded sales columns"),
    metric("Sales Growth %", percent.format(growth), growth * 100, "Versus previous available year"),
    metric("Market Share %", percent.format(marketShare), marketShare * 100, "Sales divided by uploaded market size"),
    metric("Achievement %", percent.format(achievement), (achievement - 1) * 100, "Actual sales versus uploaded target"),
    metric("Forecast Accuracy %", percent.format(Math.max(accuracy, 0)), (accuracy - 0.9) * 100, "Actual versus uploaded forecast"),
    metric("Contribution Margin", currency.format(margin), marginRate * 100, "Uploaded or inferred margin value"),
    metric("Units Sold", compact.format(units), growth * 100, "Uploaded unit volume"),
    metric("Active Customers", compact.format(activeCustomers), safeRate(activeCustomers, customerCount) * 100, "Active customers from tenant data"),
    metric("Rx Growth", percent.format(rxGrowth), rxGrowth * 100, "Prescription trend from uploaded data"),
    metric("IMS Growth", percent.format(imsGrowth), imsGrowth * 100, "External market trend from uploaded data"),
    metric("Productivity per Rep", currency.format(safeRate(sales, repCount)), growth * 100, "Sales generated per active representative")
  ];

  const alerts =
    records.length === 0
      ? ["Upload Excel or CSV data to activate tenant analytics.", "KPIs and charts will be generated from private workspace data.", "Supabase RLS keeps uploaded rows isolated by workspace."]
      : [
          achievement < 0.98 ? "Achievement is below plan; review target gaps by territory." : "Achievement is at or above plan in the selected scope.",
          coverage && coverage < 0.86 ? "Calls coverage indicates field execution risk." : "Field execution coverage is within expected tolerance.",
          accuracy && accuracy < 0.9 ? "Forecast accuracy requires review; variance is elevated." : "Forecast accuracy is stable for the selected data."
        ];

  const insights =
    records.length === 0
      ? [
          "No tenant dataset is loaded yet. Upload files to generate live insights.",
          "The mapping engine will infer sales, products, dates, territories, reps, targets, and market fields.",
          "Saved dashboards and exports are ready to connect to Supabase once credentials are configured.",
          "All KPI values are dynamic and calculated from processed_data rows."
        ]
      : [
          `${byBrand[0]?.name ?? "Top product"} is the leading product with ${currency.format(byBrand[0]?.sales ?? 0)} in sales.`,
          `${byTerritory.at(-1)?.name ?? "Lowest territory"} is the lowest territory by sales and should be reviewed.`,
          `${byRep[0]?.name ?? "Top rep"} leads rep effectiveness at ${currency.format(byRep[0]?.productivity ?? 0)} per call.`,
          `Forecast variance is ${currency.format(sales - forecast)}, with ${percent.format(Math.max(accuracy, 0))} forecast accuracy.`
        ];

  return {
    records,
    kpis,
    monthly,
    byBrand,
    byRegion,
    byTerritory,
    byRep,
    competitor,
    customers,
    channelMix,
    waterfall,
    alerts,
    insights,
    summary: {
      sales,
      growth,
      achievement,
      accuracy,
      marketShare,
      marginRate
    }
  };
}
