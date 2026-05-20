/**
 * Advanced Time-Series Forecasting Engine
 * Implements multiple statistical forecasting methods for pharma data
 */

export interface TimeSeriesPoint {
  period: string;
  value: number;
  timestamp?: number;
}

export interface ForecastResult {
  period: string;
  forecast: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  method: string;
  trend: "increasing" | "decreasing" | "stable";
  seasonality?: number;
}

export interface ForecastMetrics {
  mae: number; // Mean Absolute Error
  rmse: number; // Root Mean Squared Error
  mape: number; // Mean Absolute Percentage Error
  accuracy: number; // 0-1 scale
}

/**
 * Calculate simple moving average
 */
export function simpleMovingAverage(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(data[i]);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

/**
 * Calculate exponential moving average
 */
export function exponentialMovingAverage(data: number[], alpha: number = 0.3): number[] {
  if (data.length === 0) return [];
  
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    const ema = alpha * data[i] + (1 - alpha) * result[i - 1];
    result.push(ema);
  }
  return result;
}

/**
 * Calculate double exponential smoothing (Holt's method)
 * Useful for data with trend but no seasonality
 */
export function doubleExponentialSmoothing(
  data: number[],
  alpha: number = 0.3,
  beta: number = 0.1,
  periods: number = 3
): ForecastResult[] {
  if (data.length < 2) return [];

  // Initialize level and trend
  let level = data[0];
  let trend = data[1] - data[0];
  const forecasts: ForecastResult[] = [];

  // Smooth the historical data
  for (let i = 1; i < data.length; i++) {
    const prevLevel = level;
    level = alpha * data[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  // Generate forecasts
  for (let p = 1; p <= periods; p++) {
    const forecast = level + trend * p;
    const std = calculateStandardDeviation(data) * Math.sqrt(p);
    
    forecasts.push({
      period: `+${p}`,
      forecast: Math.max(0, forecast),
      lowerBound: Math.max(0, forecast - 1.96 * std),
      upperBound: forecast + 1.96 * std,
      confidence: Math.max(0.5, 1 - p * 0.05),
      method: "holt-exponential",
      trend: trend > 0 ? "increasing" : trend < 0 ? "decreasing" : "stable"
    });
  }

  return forecasts;
}

/**
 * Linear regression forecasting
 */
export function linearRegression(data: number[], periods: number = 3): ForecastResult[] {
  if (data.length < 2) return [];

  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const xy = x.map((xi, i) => xi * data[i]);
  const x2 = x.map(xi => xi * xi);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = data.reduce((a, b) => a + b, 0);
  const sumXY = xy.reduce((a, b) => a + b, 0);
  const sumX2 = x2.reduce((a, b) => a + b, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const residuals = data.map((y, i) => y - (slope * i + intercept));
  const std = calculateStandardDeviation(residuals);

  const forecasts: ForecastResult[] = [];
  for (let p = 1; p <= periods; p++) {
    const forecast = slope * (n + p - 1) + intercept;
    const margin = 1.96 * std * Math.sqrt(1 + 1 / n);

    forecasts.push({
      period: `+${p}`,
      forecast: Math.max(0, forecast),
      lowerBound: Math.max(0, forecast - margin),
      upperBound: forecast + margin,
      confidence: Math.max(0.5, 1 - p * 0.03),
      method: "linear-regression",
      trend: slope > 0 ? "increasing" : slope < 0 ? "decreasing" : "stable"
    });
  }

  return forecasts;
}

/**
 * Seasonal decomposition and forecasting
 * Detects seasonality pattern in data
 */
export function seasonalForecasting(
  data: number[],
  seasonalPeriod: number = 12,
  forecastPeriods: number = 3
): ForecastResult[] {
  if (data.length < seasonalPeriod * 2) {
    // Fall back to linear regression if not enough data
    return linearRegression(data, forecastPeriods);
  }

  // Decompose into trend and seasonal
  const trend = simpleMovingAverage(data, seasonalPeriod);
  const detrended = data.map((val, i) => val / (trend[i] || 1));

  // Calculate seasonal indices
  const seasonalIndices: number[] = Array(seasonalPeriod).fill(0);
  const counts: number[] = Array(seasonalPeriod).fill(0);

  for (let i = 0; i < detrended.length; i++) {
    const seasonIdx = i % seasonalPeriod;
    seasonalIndices[seasonIdx] += detrended[i];
    counts[seasonIdx]++;
  }

  for (let i = 0; i < seasonalPeriod; i++) {
    seasonalIndices[i] = counts[i] > 0 ? seasonalIndices[i] / counts[i] : 1;
  }

  // Forecast using trend + seasonal
  const lastTrend = trend[data.length - 1] || data[data.length - 1];
  const trendGrowth = trend[data.length - 1] && trend[data.length - 2]
    ? (trend[data.length - 1] - trend[data.length - 2]) / trend[data.length - 2]
    : 0;

  const forecasts: ForecastResult[] = [];
  for (let p = 1; p <= forecastPeriods; p++) {
    const projectedTrend = lastTrend * Math.pow(1 + trendGrowth, p);
    const seasonIdx = (data.length + p - 1) % seasonalPeriod;
    const forecast = projectedTrend * seasonalIndices[seasonIdx];
    const std = calculateStandardDeviation(data) * 0.1 * p;

    forecasts.push({
      period: `+${p}`,
      forecast: Math.max(0, forecast),
      lowerBound: Math.max(0, forecast - 1.96 * std),
      upperBound: forecast + 1.96 * std,
      confidence: Math.max(0.5, 1 - p * 0.05),
      method: "seasonal-decomposition",
      trend: trendGrowth > 0 ? "increasing" : trendGrowth < 0 ? "decreasing" : "stable",
      seasonality: calculateSeasonalityStrength(seasonalIndices)
    });
  }

  return forecasts;
}

/**
 * Weighted moving average - gives more weight to recent data
 */
export function weightedMovingAverage(data: number[], weights: number[]): number {
  const n = Math.min(data.length, weights.length);
  let weightedSum = 0;
  let weightSum = 0;

  for (let i = 0; i < n; i++) {
    const dataIdx = data.length - n + i;
    weightedSum += data[dataIdx] * weights[i];
    weightSum += weights[i];
  }

  return weightSum > 0 ? weightedSum / weightSum : 0;
}

/**
 * Automatic method selection based on data characteristics
 */
export function selectBestForecastingMethod(
  data: number[],
  periods: number = 3
): ForecastResult[] {
  if (data.length < 3) {
    // Not enough data - use simple extension
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    return Array(periods).fill(null).map((_, i) => ({
      period: `+${i + 1}`,
      forecast: avg,
      lowerBound: avg * 0.8,
      upperBound: avg * 1.2,
      confidence: 0.5,
      method: "fallback-average",
      trend: "stable"
    }));
  }

  // Detect data characteristics
  const trend = detectTrend(data);
  const seasonality = detectSeasonality(data);
  const volatility = calculateVolatility(data);

  // Select best method based on characteristics
  if (seasonality > 0.3 && data.length >= 24) {
    return seasonalForecasting(data, 12, periods);
  } else if (Math.abs(trend) > 0.05 || volatility > 0.3) {
    return doubleExponentialSmoothing(data, 0.3, 0.1, periods);
  } else {
    return linearRegression(data, periods);
  }
}

/**
 * Calculate trend coefficient
 */
export function detectTrend(data: number[]): number {
  if (data.length < 2) return 0;
  
  const recentAvg = data.slice(-Math.min(6, data.length)).reduce((a, b) => a + b, 0) / Math.min(6, data.length);
  const olderAvg = data.slice(0, Math.min(6, data.length)).reduce((a, b) => a + b, 0) / Math.min(6, data.length);
  
  return olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
}

/**
 * Detect seasonality strength (0-1 scale)
 */
export function detectSeasonality(data: number[], period: number = 12): number {
  if (data.length < period * 2) return 0;

  const trend = simpleMovingAverage(data, period);
  const detrended = data.map((val, i) => (trend[i] ? val / trend[i] : 0));

  let seasonalVariance = 0;
  for (let s = 0; s < period; s++) {
    const seasonalValues = [];
    for (let i = s; i < detrended.length; i += period) {
      if (detrended[i] > 0) seasonalValues.push(detrended[i]);
    }
    if (seasonalValues.length > 1) {
      const avg = seasonalValues.reduce((a, b) => a + b, 0) / seasonalValues.length;
      const variance = seasonalValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / seasonalValues.length;
      seasonalVariance += variance;
    }
  }

  return Math.min(1, seasonalVariance / period);
}

/**
 * Calculate volatility (coefficient of variation)
 */
export function calculateVolatility(data: number[]): number {
  if (data.length === 0) return 0;
  
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  if (mean === 0) return 0;
  
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  return Math.sqrt(variance) / mean;
}

/**
 * Calculate seasonality strength from indices
 */
export function calculateSeasonalityStrength(indices: number[]): number {
  const mean = indices.reduce((a, b) => a + b, 0) / indices.length;
  const variance = indices.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / indices.length;
  return Math.sqrt(variance / mean);
}

/**
 * Calculate standard deviation
 */
export function calculateStandardDeviation(data: number[]): number {
  if (data.length === 0) return 0;
  
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
}

/**
 * Calculate forecast metrics
 */
export function calculateForecastMetrics(actual: number[], predicted: number[]): ForecastMetrics {
  const n = Math.min(actual.length, predicted.length);
  
  let mae = 0;
  let mse = 0;
  let sumAbsActual = 0;

  for (let i = 0; i < n; i++) {
    const error = Math.abs(actual[i] - predicted[i]);
    mae += error;
    mse += error * error;
    sumAbsActual += Math.abs(actual[i]);
  }

  mae /= n;
  mse /= n;
  const rmse = Math.sqrt(mse);
  const mape = sumAbsActual > 0 ? mae / (sumAbsActual / n) * 100 : 0;
  const accuracy = Math.max(0, 1 - rmse / (sumAbsActual / n || 1));

  return {
    mae,
    rmse,
    mape,
    accuracy: Math.min(1, accuracy)
  };
}

/**
 * Growth rate analysis
 */
export function analyzeGrowth(data: number[], periods: number = 3): { rate: number; momentum: number } {
  if (data.length < periods) {
    return { rate: 0, momentum: 0 };
  }

  const recentData = data.slice(-periods);
  const olderData = data.slice(-periods * 2, -periods);

  const recentAvg = recentData.reduce((a, b) => a + b, 0) / recentData.length;
  const olderAvg = olderData.reduce((a, b) => a + b, 0) / olderData.length;

  const rate = olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
  
  // Momentum: acceleration of growth
  const recentGrowth = data.slice(-2).reduce((a, b) => a + (b - a) / a, 0) / 2;
  const olderGrowth = data.slice(-4, -2).reduce((a, b) => a + (b - a) / a, 0) / 2;
  const momentum = (recentGrowth - olderGrowth) / (Math.abs(olderGrowth) || 0.01);

  return { rate, momentum };
}
