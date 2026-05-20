/**
 * Pharma-Specific Forecasting Logic
 * Applies industry-specific patterns and business rules
 */

import type { PharmaRecord } from "@/types/dashboard";
import {
  selectBestForecastingMethod,
  analyzeGrowth,
  calculateVolatility,
  detectTrend,
  ForecastResult
} from "./forecasting-engine";

export interface PharmaForecast {
  period: string;
  actual: number;
  forecast: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  method: string;
  trend: "increasing" | "decreasing" | "stable";
  growth: number;
  accuracy?: number;
  riskLevel: "low" | "medium" | "high";
  riskFactors: string[];
}

export interface DimensionalForecast {
  dimension: string;
  dimensionValue: string;
  forecasts: PharmaForecast[];
  nextMonthForecast: number;
  nextQuarterForecast: number;
  ytdExpectedForecast: number;
  confidenceScore: number;
  growth: number;
  insights: string[];
  businessContext: {
    isSeasonalBrand?: boolean;
    isTenderBusiness?: boolean;
    isChronicBrand?: boolean;
    channelStrength?: string;
    territoryPerformance?: string;
    repProductivity?: string;
  };
}

/**
 * Extract time series data for a specific dimension
 */
export function extractTimeSeriesForDimension(
  records: PharmaRecord[],
  dimension: keyof PharmaRecord,
  dimensionValue: string | number,
  filterBy?: { key: keyof PharmaRecord; value: string | number }[]
): { period: string; value: number; timestamp: number }[] {
  
  let filtered = records.filter(r => r[dimension] === dimensionValue);
  
  if (filterBy) {
    for (const filter of filterBy) {
      filtered = filtered.filter(r => r[filter.key] === filter.value);
    }
  }

  // Group by month and year, sorted chronologically
  const grouped = new Map<string, number>();
  
  filtered.forEach(record => {
    const key = `${record.year}-${String(record.monthIndex).padStart(2, "0")}`;
    const current = grouped.get(key) || 0;
    grouped.set(key, current + record.sales);
  });

  return Array.from(grouped.entries())
    .map(([key, value]) => {
      const [year, month] = key.split("-");
      return {
        period: key,
        value,
        timestamp: parseInt(year) * 12 + parseInt(month)
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Pharma-specific business logic adjustments
 */
export function applyPharmaBusinessLogic(
  forecast: ForecastResult,
  brand?: string,
  channel?: string,
  territory?: string,
  rep?: string
): PharmaForecast {
  
  let adjustedForecast = forecast.forecast;
  const riskFactors: string[] = [];
  let riskLevel: "low" | "medium" | "high" = "low";

  // Brand-specific adjustments
  if (brand) {
    const chronicBrands = ["Cardiovex", "Glucofine", "Neurocil"];
    const seasonalBrands = ["Respira"];
    const volatileBrands = ["Oncora"];

    if (chronicBrands.includes(brand)) {
      // Chronic brands: apply stability bonus
      adjustedForecast *= 1.02;
    } else if (seasonalBrands.includes(brand)) {
      // Seasonal brands: increase confidence band
      riskFactors.push(`${brand} shows seasonal volatility`);
    } else if (volatileBrands.includes(brand)) {
      riskFactors.push(`${brand} has high variability - monitor closely`);
      riskLevel = "high";
    }
  }

  // Channel adjustments
  if (channel) {
    if (channel === "Tender") {
      // Tender business is more volatile and unpredictable
      adjustedForecast *= 0.95;
      riskFactors.push("Tender channel has unpredictable tender cycles");
      riskLevel = "medium";
    } else if (channel === "Retail") {
      // Retail is more predictable
      adjustedForecast *= 1.01;
    }
  }

  // Territory assessment
  if (territory) {
    // High-performing territories get slight positive adjustment
    // This would be based on historical performance in real system
    const highPerformingTerritories = ["Cairo A", "Cairo B"];
    if (highPerformingTerritories.includes(territory)) {
      adjustedForecast *= 1.03;
    }
  }

  // Rep productivity consideration
  if (rep) {
    riskFactors.push(`Monitor ${rep} for consistent execution`);
  }

  return {
    period: forecast.period,
    actual: 0, // Will be filled when comparing to actual
    forecast: Math.round(adjustedForecast),
    lowerBound: Math.round(forecast.lowerBound),
    upperBound: Math.round(forecast.upperBound),
    confidence: forecast.confidence,
    method: forecast.method,
    trend: forecast.trend,
    growth: 0, // Will be calculated
    riskLevel,
    riskFactors,
    businessContext: {
      isSeasonalBrand: ["Respira", "Immunex"].includes(brand || ""),
      isTenderBusiness: channel === "Tender",
      isChronicBrand: ["Cardiovex", "Glucofine", "Neurocil"].includes(brand || "")
    }
  };
}

/**
 * Generate forecast for a specific dimension
 */
export function generateDimensionalForecast(
  records: PharmaRecord[],
  dimension: keyof PharmaRecord,
  dimensionValue: string | number,
  filterBy?: { key: keyof PharmaRecord; value: string | number }[],
  forecastMonths: number = 3
): DimensionalForecast {
  
  const timeSeries = extractTimeSeriesForDimension(records, dimension, dimensionValue, filterBy);
  const values = timeSeries.map(ts => ts.value);

  if (values.length === 0) {
    return {
      dimension,
      dimensionValue: String(dimensionValue),
      forecasts: [],
      nextMonthForecast: 0,
      nextQuarterForecast: 0,
      ytdExpectedForecast: 0,
      confidenceScore: 0,
      growth: 0,
      insights: ["Insufficient data for forecasting"],
      businessContext: {}
    };
  }

  // Generate forecasts using multiple methods
  const forecastResults = selectBestForecastingMethod(values, forecastMonths);
  
  // Apply pharma business logic
  const pharmaForecasts = forecastResults.map(result =>
    applyPharmaBusinessLogic(result, dimension === "brand" ? String(dimensionValue) : undefined)
  );

  // Calculate aggregate metrics
  const { rate: growthRate } = analyzeGrowth(values, 3);
  const avgConfidence = pharmaForecasts.reduce((sum, f) => sum + f.confidence, 0) / pharmaForecasts.length;
  
  // Forecast periods
  const nextMonthForecast = pharmaForecasts[0]?.forecast || 0;
  const nextQuarterForecast = pharmaForecasts.slice(0, 3).reduce((sum, f) => sum + f.forecast, 0);
  const ytdExpectedForecast = values.reduce((a, b) => a + b, 0) + nextQuarterForecast;

  // Generate insights
  const insights = generatePharmaInsights(
    String(dimensionValue),
    dimension,
    values,
    pharmaForecasts,
    growthRate
  );

  return {
    dimension: String(dimension),
    dimensionValue: String(dimensionValue),
    forecasts: pharmaForecasts,
    nextMonthForecast,
    nextQuarterForecast,
    ytdExpectedForecast,
    confidenceScore: avgConfidence,
    growth: growthRate,
    insights,
    businessContext: {
      isSeasonalBrand: ["Respira", "Immunex"].includes(String(dimensionValue)),
      isChronicBrand: ["Cardiovex", "Glucofine", "Neurocil"].includes(String(dimensionValue))
    }
  };
}

/**
 * Generate AI-powered insights for forecasts
 */
export function generatePharmaInsights(
  dimensionValue: string,
  dimension: string,
  historicalValues: number[],
  forecasts: PharmaForecast[],
  growthRate: number
): string[] {
  
  const insights: string[] = [];
  
  if (dimension === "brand") {
    if (growthRate > 0.15) {
      insights.push(`${dimensionValue} is projected to grow by ${(growthRate * 100).toFixed(1)}% based on sustained momentum.`);
    } else if (growthRate < -0.1) {
      insights.push(`${dimensionValue} shows declining trend - investigate market challenges.`);
    } else {
      insights.push(`${dimensionValue} is maintaining stable performance with modest growth potential.`);
    }

    // Volatility assessment
    if (historicalValues.length >= 3) {
      const recentAvg = historicalValues.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const olderAvg = historicalValues.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
      if (recentAvg > olderAvg * 1.2) {
        insights.push(`${dimensionValue} is accelerating - opportunity to increase market share.`);
      }
    }
  } else if (dimension === "channel") {
    if (growthRate > 0.2) {
      insights.push(`${dimensionValue} channel is outperforming market expectations with ${(growthRate * 100).toFixed(1)}% growth.`);
    } else if (growthRate < 0) {
      insights.push(`${dimensionValue} channel performance is declining - review competitive landscape.`);
    }
  } else if (dimension === "territory") {
    if (growthRate > 0.1) {
      insights.push(`${dimensionValue} territory shows strong execution and is on track for growth.`);
    } else if (growthRate < -0.1) {
      insights.push(`Forecast risk detected in ${dimensionValue} due to declining trend.`);
    }
  } else if (dimension === "medicalRep") {
    if (growthRate > 0.15) {
      insights.push(`${dimensionValue} is demonstrating excellent productivity and growth.`);
    } else if (growthRate < -0.1) {
      insights.push(`${dimensionValue}'s performance requires attention - provide support and coaching.`);
    }
  }

  // Risk assessment
  const volatility = calculateVolatility(historicalValues);
  if (volatility > 0.4) {
    insights.push(`High volatility detected - forecast confidence is moderate.`);
  } else if (volatility > 0.2) {
    insights.push(`Moderate volatility - typical for this business segment.`);
  } else {
    insights.push(`Performance is stable - forecasts carry high confidence.`);
  }

  // Trend assessment
  const trend = detectTrend(historicalValues);
  if (Math.abs(trend) < 0.01) {
    insights.push(`Flat trend suggests maintenance of current performance levels.`);
  }

  return insights.slice(0, 5); // Return top 5 insights
}

/**
 * Calculate volatility helper
 */
function calculateVolatility(data: number[]): number {
  if (data.length < 2) return 0;
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  if (mean === 0) return 0;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  return Math.sqrt(variance) / mean;
}

/**
 * Detect trend helper
 */
function detectTrend(data: number[]): number {
  if (data.length < 2) return 0;
  const recentAvg = data.slice(-Math.min(6, data.length)).reduce((a, b) => a + b, 0) / Math.min(6, data.length);
  const olderAvg = data.slice(0, Math.min(6, data.length)).reduce((a, b) => a + b, 0) / Math.min(6, data.length);
  return olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
}

/**
 * Generate forecasts for all key dimensions
 */
export function generateComprehensiveForecasts(
  records: PharmaRecord[]
): {
  byBrand: DimensionalForecast[];
  byChannel: DimensionalForecast[];
  byTerritory: DimensionalForecast[];
  byRep: DimensionalForecast[];
  overall: DimensionalForecast;
} {
  
  // Get unique values for each dimension
  const brands = Array.from(new Set(records.map(r => r.brand).filter(Boolean)));
  const channels = Array.from(new Set(records.map(r => r.channel).filter(Boolean)));
  const territories = Array.from(new Set(records.map(r => r.territory).filter(Boolean)));
  const reps = Array.from(new Set(records.map(r => r.medicalRep).filter(Boolean)));

  return {
    byBrand: brands.map(brand =>
      generateDimensionalForecast(records, "brand", brand, undefined, 3)
    ),
    byChannel: channels.map(channel =>
      generateDimensionalForecast(records, "channel", channel, undefined, 3)
    ),
    byTerritory: territories.map(territory =>
      generateDimensionalForecast(records, "territory", territory, undefined, 3)
    ),
    byRep: reps.map(rep =>
      generateDimensionalForecast(records, "medicalRep", rep, undefined, 3)
    ),
    overall: generateDimensionalForecast(records, "year", new Date().getFullYear(), undefined, 3)
  };
}
