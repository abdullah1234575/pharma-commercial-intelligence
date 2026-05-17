import { NextResponse } from "next/server";
import { buildDashboardModel, defaultFilters } from "@/lib/analytics";
import type { DashboardFilters } from "@/types/dashboard";

const filterKeys = Object.keys(defaultFilters) as Array<keyof DashboardFilters>;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = filterKeys.reduce<DashboardFilters>((acc, key) => {
    acc[key] = searchParams.get(key) ?? defaultFilters[key];
    return acc;
  }, { ...defaultFilters });

  const model = buildDashboardModel(filters);

  return NextResponse.json({
    filters,
    kpis: model.kpis,
    charts: {
      monthly: model.monthly,
      brands: model.byBrand,
      regions: model.byRegion,
      territories: model.byTerritory,
      reps: model.byRep,
      competitors: model.competitor,
      customers: model.customers,
      channels: model.channelMix,
      waterfall: model.waterfall
    },
    alerts: model.alerts,
    insights: model.insights
  });
}
