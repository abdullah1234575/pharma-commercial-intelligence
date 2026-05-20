import { NextResponse } from "next/server";
import type { PharmaRecord } from "@/types/dashboard";
import { generateComprehensiveForecasts } from "@/lib/pharma-forecasting";
import type { DimensionalForecast, PharmaForecast } from "@/lib/pharma-forecasting";
import { generateExecutiveInsights, generateRiskSummary } from "@/lib/forecast-insights";
import type { ForecastInsight } from "@/lib/forecast-insights";
import { pharmaRecords } from "@/lib/pharma-data";

/**
 * Format raw forecasts and insights into a unified schema matching ForecastData on the frontend.
 */
function formatForecastResponse(
  forecasts: {
    byBrand: DimensionalForecast[];
    byChannel: DimensionalForecast[];
    byTerritory: DimensionalForecast[];
    byRep: DimensionalForecast[];
    overall: DimensionalForecast;
  },
  insights: ForecastInsight[],
  filteredRecords: PharmaRecord[]
) {
  const { highRiskAreas, mitigationStrategies } = generateRiskSummary({
    byBrand: forecasts.byBrand,
    byChannel: forecasts.byChannel,
    byTerritory: forecasts.byTerritory,
    byRep: forecasts.byRep
  });

  return {
    forecasts: {
      overall: {
        nextMonth: forecasts.overall.nextMonthForecast,
        nextQuarter: forecasts.overall.nextQuarterForecast,
        ytd: forecasts.overall.ytdExpectedForecast,
        confidence: (forecasts.overall.confidenceScore * 100).toFixed(0) + "%",
        growth: (forecasts.overall.growth * 100).toFixed(1) + "%"
      },
      brands: forecasts.byBrand.slice(0, 10).map(f => ({
        name: f.dimensionValue,
        nextMonth: f.nextMonthForecast,
        nextQuarter: f.nextQuarterForecast,
        ytd: f.ytdExpectedForecast,
        confidence: f.confidenceScore,
        growth: f.growth,
        trend: f.forecasts[0]?.trend || "stable",
        riskLevel: f.forecasts[0]?.riskLevel || "low",
        insights: f.insights.slice(0, 3)
      })),
      channels: forecasts.byChannel.map(f => ({
        name: f.dimensionValue,
        nextMonth: f.nextMonthForecast,
        nextQuarter: f.nextQuarterForecast,
        ytd: f.ytdExpectedForecast,
        confidence: f.confidenceScore,
        growth: f.growth,
        trend: f.forecasts[0]?.trend || "stable"
      })),
      territories: forecasts.byTerritory.slice(0, 15).map(f => ({
        name: f.dimensionValue,
        nextMonth: f.nextMonthForecast,
        nextQuarter: f.nextQuarterForecast,
        confidence: f.confidenceScore,
        growth: f.growth,
        riskLevel: f.forecasts[0]?.riskLevel || "low"
      })),
      reps: forecasts.byRep.slice(0, 10).map(f => ({
        name: f.dimensionValue,
        nextMonth: f.nextMonthForecast,
        confidence: f.confidenceScore,
        growth: f.growth
      }))
    },
    insights: insights.slice(0, 10).map(i => ({
      title: i.title,
      description: i.description,
      priority: i.priority,
      category: i.category,
      metric: i.metric,
      recommendation: i.recommendation
    })),
    risks: {
      highRiskAreas: highRiskAreas.slice(0, 8),
      mitigationStrategies,
      overallRiskScore: calculateOverallRiskScore(forecasts)
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      dataPoints: filteredRecords.length,
      forecastPeriods: 3,
      confidence: (forecasts.overall.confidenceScore * 100).toFixed(0) + "%",
      method: "Multi-Method Ensemble (Linear Regression, Exponential Smoothing, Seasonal Decomposition)"
    }
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { records = pharmaRecords, filterBrand, filterChannel, filterTerritory, filterRep } = body;

    // Filter records if specific dimensions requested
    let filteredRecords: PharmaRecord[] = records;
    
    if (filterBrand) {
      filteredRecords = filteredRecords.filter((r: PharmaRecord) => r.brand === filterBrand);
    }
    if (filterChannel) {
      filteredRecords = filteredRecords.filter((r: PharmaRecord) => r.channel === filterChannel);
    }
    if (filterTerritory) {
      filteredRecords = filteredRecords.filter((r: PharmaRecord) => r.territory === filterTerritory);
    }
    if (filterRep) {
      filteredRecords = filteredRecords.filter((r: PharmaRecord) => r.medicalRep === filterRep);
    }

    if (filteredRecords.length === 0) {
      return NextResponse.json({
        error: "No data available for forecasting with selected filters"
      }, { status: 400 });
    }

    // Generate comprehensive forecasts
    const forecasts = generateComprehensiveForecasts(filteredRecords);

    // Generate executive insights
    const insights = generateExecutiveInsights(forecasts);

    // Transform and return formatted response data
    const responseData = formatForecastResponse(forecasts, insights, filteredRecords);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Forecast generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Forecast generation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Generate forecasts from default pharma data
    const forecasts = generateComprehensiveForecasts(pharmaRecords);
    const insights = generateExecutiveInsights(forecasts);
    
    const responseData = formatForecastResponse(forecasts, insights, pharmaRecords);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Forecast API error:", error);
    return NextResponse.json(
      { error: "Failed to generate forecasts" },
      { status: 500 }
    );
  }
}

/**
 * Calculate overall portfolio risk score
 */
function calculateOverallRiskScore(forecasts: {
  byBrand: DimensionalForecast[];
  byChannel: DimensionalForecast[];
  byTerritory: DimensionalForecast[];
  byRep: DimensionalForecast[];
  overall: DimensionalForecast;
}): number {
  let totalRisk = 0;
  let count = 0;

  const allForecasts = [
    ...forecasts.byBrand,
    ...forecasts.byChannel,
    ...forecasts.byTerritory,
    ...forecasts.byRep
  ];

  for (const forecast of allForecasts) {
    const riskForecasts = forecast.forecasts.filter((f: PharmaForecast) => f.riskLevel === "high");
    const riskCount = riskForecasts.length;
    const riskWeight = riskCount / Math.max(forecast.forecasts.length, 1);
    totalRisk += riskWeight;
    count++;
  }

  const score = count > 0 ? (totalRisk / count) * 100 : 0;
  return Math.min(100, Math.round(score));
}

