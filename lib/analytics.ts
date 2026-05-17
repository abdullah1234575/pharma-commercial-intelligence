import { pharmaRecords } from "@/lib/pharma-data";
import type { DashboardFilters, KpiMetric, PharmaRecord } from "@/types/dashboard";

export const defaultFilters: DashboardFilters = {
  year: "2026",
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
  return records.reduce((total, record) => total + Number(record[key]), 0);
}

function groupBy<T extends string>(records: PharmaRecord[], key: keyof PharmaRecord) {
  return records.reduce<Record<T, PharmaRecord[]>>((acc, record) => {
    const value = String(record[key]) as T;
    acc[value] = acc[value] || [];
    acc[value].push(record);
    return acc;
  }, {} as Record<T, PharmaRecord[]>);
}

function metric(
  label: string,
  value: string,
  deltaValue: number,
  detail: string,
  inverse = false
): KpiMetric {
  const isPositive = inverse ? deltaValue <= 0 : deltaValue >= 0;
  return {
    label,
    value,
    delta: `${deltaValue >= 0 ? "+" : ""}${deltaValue.toFixed(1)}%`,
    status: Math.abs(deltaValue) < 0.1 ? "neutral" : isPositive ? "positive" : "negative",
    detail
  };
}

export function filterRecords(filters: DashboardFilters) {
  return pharmaRecords.filter((record) => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === "All") return true;
      const recordValue = record[key as keyof DashboardFilters];
      return String(recordValue) === value;
    });
  });
}

export function buildDashboardModel(filters: DashboardFilters) {
  const records = filterRecords(filters);
  const comparisonYear = filters.year === "All" ? "2025" : String(Number(filters.year) - 1);
  const comparisonRecords = filterRecords({ ...filters, year: comparisonYear });
  const allRecordsForShare = pharmaRecords.filter((record) => {
    return filters.year === "All" || String(record.year) === filters.year;
  });

  const sales = sum(records, "sales");
  const priorSales = sum(comparisonRecords, "sales") || sales * 0.91;
  const target = sum(records, "target");
  const forecast = sum(records, "forecast");
  const units = sum(records, "units");
  const activeCustomers = sum(records, "activeCustomers");
  const calls = sum(records, "calls");
  const plannedCalls = sum(records, "plannedCalls");
  const margin = sum(records, "margin");
  const prescriptions = sum(records, "prescriptions");
  const priorPrescriptions = sum(records, "priorPrescriptions");
  const imsSales = sum(records, "imsSales");
  const priorImsSales = sum(records, "priorImsSales");
  const totalMarketSize = sum(allRecordsForShare, "marketSize");
  const marketShare = totalMarketSize ? sales / totalMarketSize : 0;
  const achievement = target ? sales / target : 0;
  const accuracy = sales ? 1 - Math.abs(forecast - sales) / sales : 0;
  const growth = priorSales ? (sales - priorSales) / priorSales : 0;
  const rxGrowth = priorPrescriptions ? (prescriptions - priorPrescriptions) / priorPrescriptions : 0;
  const imsGrowth = priorImsSales ? (imsSales - priorImsSales) / priorImsSales : 0;
  const marginRate = sales ? margin / sales : 0;
  const coverage = plannedCalls ? calls / plannedCalls : 0;
  const repCount = new Set(records.map((record) => record.medicalRep)).size || 1;
  const customerCount = sum(records, "customers") || 1;

  const monthGroups = groupBy(records, "month");
  const monthly = Object.entries(monthGroups)
    .map(([month, monthRecords]) => ({
      month,
      monthIndex: monthRecords[0].monthIndex,
      sales: sum(monthRecords, "sales"),
      target: sum(monthRecords, "target"),
      forecast: sum(monthRecords, "forecast"),
      growth: ((sum(monthRecords, "sales") - sum(monthRecords, "target")) / Math.max(sum(monthRecords, "target"), 1)) * 100,
      share: (sum(monthRecords, "sales") / Math.max(sum(monthRecords, "marketSize"), 1)) * 100
    }))
    .sort((a, b) => a.monthIndex - b.monthIndex);

  const byBrand = Object.entries(groupBy(records, "brand"))
    .map(([name, brandRecords]) => ({
      name,
      sales: sum(brandRecords, "sales"),
      target: sum(brandRecords, "target"),
      margin: sum(brandRecords, "margin"),
      share: (sum(brandRecords, "sales") / Math.max(sum(brandRecords, "marketSize"), 1)) * 100,
      units: sum(brandRecords, "units")
    }))
    .sort((a, b) => b.sales - a.sales);

  const byRegion = Object.entries(groupBy(records, "region"))
    .map(([name, regionRecords]) => ({
      name,
      sales: sum(regionRecords, "sales"),
      target: sum(regionRecords, "target"),
      coverage: (sum(regionRecords, "calls") / Math.max(sum(regionRecords, "plannedCalls"), 1)) * 100,
      marginRate: (sum(regionRecords, "margin") / Math.max(sum(regionRecords, "sales"), 1)) * 100
    }))
    .sort((a, b) => b.sales - a.sales);

  const byTerritory = Object.entries(groupBy(records, "territory"))
    .map(([name, territoryRecords]) => ({
      name,
      region: territoryRecords[0].region,
      sales: sum(territoryRecords, "sales"),
      achievement: (sum(territoryRecords, "sales") / Math.max(sum(territoryRecords, "target"), 1)) * 100,
      coverage: (sum(territoryRecords, "calls") / Math.max(sum(territoryRecords, "plannedCalls"), 1)) * 100
    }))
    .sort((a, b) => b.sales - a.sales);

  const byRep = Object.entries(groupBy(records, "medicalRep"))
    .map(([name, repRecords]) => ({
      name,
      manager: repRecords[0].manager,
      sales: sum(repRecords, "sales"),
      calls: sum(repRecords, "calls"),
      productivity: sum(repRecords, "sales") / Math.max(sum(repRecords, "calls"), 1),
      achievement: (sum(repRecords, "sales") / Math.max(sum(repRecords, "target"), 1)) * 100
    }))
    .sort((a, b) => b.sales - a.sales);

  const competitor = [
    { name: "Our Portfolio", value: sales },
    { name: "Competitor A", value: sum(records, "competitorA") },
    { name: "Competitor B", value: sum(records, "competitorB") },
    { name: "Competitor C", value: sum(records, "competitorC") }
  ].sort((a, b) => b.value - a.value);

  const customers = Object.entries(groupBy(records, "customerType"))
    .map(([name, customerRecords]) => ({
      name,
      sales: sum(customerRecords, "sales"),
      active: sum(customerRecords, "activeCustomers"),
      retained: Math.round((sum(customerRecords, "activeCustomers") / Math.max(sum(customerRecords, "customers"), 1)) * 100)
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
    metric("Total Sales", currency.format(sales), growth * 100, "Net sales across filtered scope"),
    metric("Sales Growth %", percent.format(growth), growth * 100, "Versus equivalent prior year"),
    metric("Market Share %", percent.format(marketShare), (marketShare - 0.18) * 100, "Portfolio share of tracked market"),
    metric("Achievement %", percent.format(achievement), (achievement - 1) * 100, "Actual sales versus commercial target"),
    metric("Forecast Accuracy %", percent.format(accuracy), (accuracy - 0.92) * 100, "Actual versus rolling forecast"),
    metric("Contribution Margin", currency.format(margin), (marginRate - 0.35) * 100, "Gross contribution margin value"),
    metric("Units Sold", compact.format(units), growth * 92, "Pack and unit volume"),
    metric("Active Customers", compact.format(activeCustomers), 4.8, "Customers with activity this period"),
    metric("Calls Coverage %", percent.format(coverage), (coverage - 0.85) * 100, "Executed calls versus plan"),
    metric("Productivity per Rep", currency.format(sales / repCount), 7.2, "Sales value per active rep"),
    metric("Average Sales per Customer", currency.format(sales / customerCount), 3.4, "Customer monetization quality"),
    metric("Target vs Actual", currency.format(sales - target), ((sales - target) / Math.max(target, 1)) * 100, "Commercial gap to plan"),
    metric("Profitability %", percent.format(marginRate), (marginRate - 0.34) * 100, "Contribution margin rate"),
    metric("Rx Growth", percent.format(rxGrowth), rxGrowth * 100, "Prescription growth proxy"),
    metric("IMS Growth", percent.format(imsGrowth), imsGrowth * 100, "External market growth proxy"),
    metric("YTD Sales", currency.format(sales), growth * 100, "Year-to-date filtered sales"),
    metric("MAT Growth", percent.format(growth * 0.86), growth * 86, "Moving annual total trend")
  ];

  const alerts = [
    achievement < 0.98
      ? "Achievement is below plan; prioritize territory recovery actions."
      : "Achievement is ahead of plan; protect momentum in high-value accounts.",
    coverage < 0.86
      ? "Calls coverage is creating execution risk in selected territories."
      : "Field execution coverage is healthy across the selected scope.",
    accuracy < 0.92
      ? "Forecast accuracy needs review; variance is above leadership tolerance."
      : "Forecast variance remains within executive tolerance."
  ];

  const insights = [
    `${byBrand[0]?.name ?? "Lead brand"} is the leading brand and contributes ${percent.format((byBrand[0]?.sales ?? 0) / Math.max(sales, 1))} of filtered sales.`,
    `${byRegion[0]?.name ?? "Top region"} leads regional performance with ${currency.format(byRegion[0]?.sales ?? 0)} in sales.`,
    `${byRep[0]?.name ?? "Top rep"} has the strongest field contribution at ${currency.format(byRep[0]?.sales ?? 0)}.`,
    `Forecast accuracy is ${percent.format(accuracy)}, with a variance of ${currency.format(sales - forecast)}.`
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
