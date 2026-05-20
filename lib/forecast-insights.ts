/**
 * AI-Powered Forecast Insights Generation
 * Produces executive-level commentary and analysis
 */

import type { PharmaRecord } from "@/types/dashboard";
import type { DimensionalForecast } from "./pharma-forecasting";

export interface ForecastInsight {
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  category: "opportunity" | "risk" | "trend" | "performance" | "market";
  metric: string;
  recommendation?: string;
}

/**
 * Generate executive-level insights from forecasts
 */
export function generateExecutiveInsights(
  forecasts: {
    byBrand: DimensionalForecast[];
    byChannel: DimensionalForecast[];
    byTerritory: DimensionalForecast[];
    byRep: DimensionalForecast[];
    overall: DimensionalForecast;
  },
  records: PharmaRecord[]
): ForecastInsight[] {
  
  const insights: ForecastInsight[] = [];

  // Brand-level insights
  const brandInsights = generateBrandInsights(forecasts.byBrand);
  insights.push(...brandInsights);

  // Channel-level insights
  const channelInsights = generateChannelInsights(forecasts.byChannel, records);
  insights.push(...channelInsights);

  // Territory-level insights
  const territoryInsights = generateTerritoryInsights(forecasts.byTerritory);
  insights.push(...territoryInsights);

  // Rep productivity insights
  const repInsights = generateRepInsights(forecasts.byRep);
  insights.push(...repInsights);

  // Overall market insights
  const marketInsights = generateMarketInsights(forecasts.overall, records);
  insights.push(...marketInsights);

  // Sort by priority
  return insights.sort((a, b) => {
    const priorityMap = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityMap[a.priority] - priorityMap[b.priority];
  }).slice(0, 15); // Return top 15 insights
}

/**
 * Brand-specific insights
 */
function generateBrandInsights(brandForecasts: DimensionalForecast[]): ForecastInsight[] {
  const insights: ForecastInsight[] = [];

  for (const brand of brandForecasts) {
    const growth = brand.growth;
    const nextMonth = brand.nextMonthForecast;
    const confidence = brand.confidenceScore;

    // High growth opportunity
    if (growth > 0.15) {
      insights.push({
        title: `${brand.dimensionValue} - Strong Growth Opportunity`,
        description: `${brand.dimensionValue} is projected to grow by ${(growth * 100).toFixed(1)}% based on sustained territory growth and market momentum.`,
        priority: confidence > 0.8 ? "high" : "medium",
        category: "opportunity",
        metric: `Growth Rate: ${(growth * 100).toFixed(1)}% | Next Month: $${Math.round(nextMonth / 1000)}K`,
        recommendation: `Increase allocation and promotional support for ${brand.dimensionValue} to capitalize on upward trend.`
      });
    }

    // Declining trend risk
    if (growth < -0.1) {
      insights.push({
        title: `${brand.dimensionValue} - Declining Trend Alert`,
        description: `${brand.dimensionValue} shows declining trend in private channel and requires immediate attention.`,
        priority: "high",
        category: "risk",
        metric: `Decline: ${(growth * 100).toFixed(1)}%`,
        recommendation: `Conduct competitive analysis and review pricing strategy for ${brand.dimensionValue}.`
      });
    }

    // Seasonality patterns
    if (brand.businessContext.isSeasonalBrand) {
      insights.push({
        title: `${brand.dimensionValue} - Seasonal Pattern Detected`,
        description: `${brand.dimensionValue} exhibits seasonal fluctuations that should be considered in inventory and promotional planning.`,
        priority: "medium",
        category: "trend",
        metric: `Confidence: ${(confidence * 100).toFixed(0)}%`,
        recommendation: `Align distribution and marketing cycles with identified seasonal peaks.`
      });
    }

    // Chronic brand stability
    if (brand.businessContext.isChronicBrand && growth > 0.05 && growth < 0.15) {
      insights.push({
        title: `${brand.dimensionValue} - Stable Growth Profile`,
        description: `${brand.dimensionValue} demonstrates consistent and reliable growth typical of chronic disease management products.`,
        priority: "low",
        category: "performance",
        metric: `Stable Growth: ${(growth * 100).toFixed(1)}%`,
        recommendation: `Focus on maintaining patient compliance programs and territory stability.`
      });
    }
  }

  return insights;
}

/**
 * Channel-specific insights
 */
function generateChannelInsights(
  channelForecasts: DimensionalForecast[],
  records: PharmaRecord[]
): ForecastInsight[] {
  
  const insights: ForecastInsight[] = [];

  for (const channel of channelForecasts) {
    const growth = channel.growth;
    const nextQuarter = channel.nextQuarterForecast;

    // Retail outperformance
    if (channel.dimensionValue === "Retail" && growth > 0.12) {
      const tenderForecasts = channelForecasts.find(c => c.dimensionValue === "Tender");
      const comparison = tenderForecasts ? ((channel.growth - tenderForecasts.growth) * 100).toFixed(1) : "N/A";
      
      insights.push({
        title: "Retail Channel Outperformance",
        description: `Retail channel is outperforming Tender by ${comparison}% with strong momentum across product lines.`,
        priority: "high",
        category: "opportunity",
        metric: `Retail Growth: ${(growth * 100).toFixed(1)}% | Q Forecast: $${Math.round(nextQuarter / 1000)}K`,
        recommendation: "Increase retail network investment and strengthen pharmacy partnerships."
      });
    }

    // Tender business volatility
    if (channel.dimensionValue === "Tender" && growth < 0.05) {
      insights.push({
        title: "Tender Channel - Uncertain Outlook",
        description: `Tender business shows lower predictability with volatile tender cycles affecting quarterly performance.`,
        priority: "medium",
        category: "risk",
        metric: `Growth: ${(growth * 100).toFixed(1)}% | Confidence: ${(channel.confidenceScore * 100).toFixed(0)}%`,
        recommendation: "Diversify tender pipeline and strengthen proposal management processes."
      });
    }

    // E-commerce growth
    if (channel.dimensionValue === "E-commerce" && growth > 0.2) {
      insights.push({
        title: "E-commerce - Rapid Growth Segment",
        description: `E-commerce channel is experiencing accelerated growth and represents a significant opportunity.`,
        priority: "high",
        category: "opportunity",
        metric: `Growth: ${(growth * 100).toFixed(1)}%`,
        recommendation: "Invest in digital infrastructure and online marketing campaigns."
      });
    }

    // Channel balance
    if (channel.dimensionValue === "Private" && growth > 0.1) {
      insights.push({
        title: "Private Market - Steady Growth",
        description: `Private channel continues steady growth, indicating strong healthcare provider relationships.`,
        priority: "medium",
        category: "performance",
        metric: `Growth: ${(growth * 100).toFixed(1)}%`,
        recommendation: "Maintain strong KOL relationships and continue medical education initiatives."
      });
    }
  }

  return insights;
}

/**
 * Territory-specific insights
 */
function generateTerritoryInsights(territoryForecasts: DimensionalForecast[]): ForecastInsight[] {
  const insights: ForecastInsight[] = [];

  // Sort territories by performance
  const sorted = [...territoryForecasts].sort((a, b) => b.growth - a.growth);

  // Top performer
  if (sorted[0] && sorted[0].growth > 0.1) {
    insights.push({
      title: `${sorted[0].dimensionValue} - Leading Territory`,
      description: `${sorted[0].dimensionValue} is the top-performing territory with ${(sorted[0].growth * 100).toFixed(1)}% growth momentum.`,
      priority: "medium",
      category: "performance",
      metric: `Growth: ${(sorted[0].growth * 100).toFixed(1)}% | Confidence: ${(sorted[0].confidenceScore * 100).toFixed(0)}%`,
      recommendation: `Replicate best practices from ${sorted[0].dimensionValue} across other territories.`
    });
  }

  // Underperformer
  if (sorted[sorted.length - 1] && sorted[sorted.length - 1].growth < -0.05) {
    const poorPerformer = sorted[sorted.length - 1];
    insights.push({
      title: `${poorPerformer.dimensionValue} - Performance Risk`,
      description: `Forecast risk detected in ${poorPerformer.dimensionValue} due to declining unit trend.`,
      priority: "high",
      category: "risk",
      metric: `Decline: ${(poorPerformer.growth * 100).toFixed(1)}%`,
      recommendation: `Conduct field assessment and implement turnaround plan for ${poorPerformer.dimensionValue}.`
    });
  }

  // Territory with highest variance
  const highVariance = territoryForecasts.find(t => {
    const risks = t.forecasts.filter(f => f.riskLevel === "high");
    return risks.length > 0;
  });

  if (highVariance) {
    insights.push({
      title: `${highVariance.dimensionValue} - Execution Risk`,
      description: `${highVariance.dimensionValue} shows high forecast variance and requires close monitoring.`,
      priority: "medium",
      category: "risk",
      metric: `Risk Level: ${highVariance.forecasts[0]?.riskLevel || "medium"}`,
      recommendation: `Increase field supervision and implement mitigation strategies.`
    });
  }

  return insights;
}

/**
 * Medical rep productivity insights
 */
function generateRepInsights(repForecasts: DimensionalForecast[]): ForecastInsight[] {
  const insights: ForecastInsight[] = [];

  const sorted = [...repForecasts].sort((a, b) => b.growth - a.growth);

  // High performer recognition
  if (sorted[0] && sorted[0].growth > 0.15) {
    insights.push({
      title: `${sorted[0].dimensionValue} - Top Performer`,
      description: `${sorted[0].dimensionValue} is demonstrating exceptional productivity and growth with ${(sorted[0].growth * 100).toFixed(1)}% momentum.`,
      priority: "low",
      category: "performance",
      metric: `Growth: ${(sorted[0].growth * 100).toFixed(1)}%`,
      recommendation: `Consider for leadership mentoring and succession planning programs.`
    });
  }

  // Underperformer support
  if (sorted[sorted.length - 1] && sorted[sorted.length - 1].growth < -0.1) {
    const poorPerformer = sorted[sorted.length - 1];
    insights.push({
      title: `${poorPerformer.dimensionValue} - Performance Support Needed`,
      description: `${poorPerformer.dimensionValue}'s performance requires attention - provide coaching and support.`,
      priority: "high",
      category: "risk",
      metric: `Decline: ${(poorPerformer.growth * 100).toFixed(1)}%`,
      recommendation: `Schedule field coaching and assess any operational challenges.`
    });
  }

  return insights;
}

/**
 * Overall market insights
 */
function generateMarketInsights(
  overall: DimensionalForecast,
  records: PharmaRecord[]
): ForecastInsight[] {
  
  const insights: ForecastInsight[] = [];
  const growth = overall.growth;
  const nextQuarter = overall.nextQuarterForecast;

  // Market momentum
  if (growth > 0.2) {
    insights.push({
      title: "Market Momentum - Strong Growth Trajectory",
      description: `Portfolio is experiencing strong growth momentum with ${(growth * 100).toFixed(1)}% increase.`,
      priority: "high",
      category: "opportunity",
      metric: `Growth: ${(growth * 100).toFixed(1)}% | Next Quarter: $${Math.round(nextQuarter / 1000)}K`,
      recommendation: "Accelerate expansion plans and increase market penetration investments."
    });
  } else if (growth < 0) {
    insights.push({
      title: "Market Contraction Alert",
      description: `Portfolio is showing contraction requiring strategic intervention and competitive response.`,
      priority: "high",
      category: "risk",
      metric: `Decline: ${(growth * 100).toFixed(1)}%`,
      recommendation: "Review competitive positioning and pricing strategy across all segments."
    });
  } else {
    insights.push({
      title: "Market Stability",
      description: `Portfolio is maintaining stable performance with modest growth potential across segments.`,
      priority: "low",
      category: "performance",
      metric: `Growth: ${(growth * 100).toFixed(1)}%`,
      recommendation: "Focus on optimization and selective investments in high-potential areas."
    });
  }

  // Forecast confidence
  if (overall.confidenceScore > 0.85) {
    insights.push({
      title: "High Forecast Reliability",
      description: `Forecast confidence is high (${(overall.confidenceScore * 100).toFixed(0)}%), indicating stable historical patterns and strong predictability.`,
      priority: "low",
      category: "performance",
      metric: `Confidence: ${(overall.confidenceScore * 100).toFixed(0)}%`,
      recommendation: "Use forecasts with confidence for planning and resource allocation."
    });
  }

  return insights;
}

/**
 * Generate forecast commentary for specific period
 */
export function generateForecastCommentary(
  period: string,
  forecast: number,
  actual?: number,
  comparison?: { vs: string; value: number; metric: string }
): string {
  
  const commentary: string[] = [];

  // Build commentary based on available data
  if (actual !== undefined) {
    const variance = forecast - actual;
    const accuracyPct = (1 - Math.abs(variance) / (actual || 1)) * 100;
    
    if (accuracyPct > 95) {
      commentary.push(`Forecast accuracy of ${accuracyPct.toFixed(0)}% demonstrates precision in period ${period}.`);
    } else if (accuracyPct > 85) {
      commentary.push(`Forecast tracked reasonably well with ${accuracyPct.toFixed(0)}% accuracy in period ${period}.`);
    } else {
      commentary.push(`Forecast variance of ${Math.abs(variance)} requires root cause analysis for period ${period}.`);
    }
  }

  if (comparison) {
    const percentChange = ((forecast - comparison.value) / comparison.value * 100).toFixed(1);
    if (parseFloat(percentChange) > 0) {
      commentary.push(`Projected to exceed ${comparison.vs} by ${percentChange}% (${comparison.metric}).`);
    } else {
      commentary.push(`Expected to fall short of ${comparison.vs} by ${Math.abs(parseFloat(percentChange))}% (${comparison.metric}).`);
    }
  }

  return commentary.join(" ");
}

/**
 * Generate risk summary
 */
export function generateRiskSummary(
  forecasts: {
    byBrand: DimensionalForecast[];
    byChannel: DimensionalForecast[];
    byTerritory: DimensionalForecast[];
    byRep: DimensionalForecast[];
  }
): { highRiskAreas: string[]; mitigationStrategies: string[] } {
  
  const highRiskAreas: Set<string> = new Set();
  const mitigationStrategies: Set<string> = new Set();

  // Aggregate all high-risk forecasts
  const allForecasts = [
    ...forecasts.byBrand,
    ...forecasts.byChannel,
    ...forecasts.byTerritory,
    ...forecasts.byRep
  ];

  for (const forecast of allForecasts) {
    const highRisks = forecast.forecasts.filter(f => f.riskLevel === "high");
    for (const risk of highRisks) {
      for (const factor of risk.riskFactors) {
        highRiskAreas.add(`${forecast.dimensionValue}: ${factor}`);
      }
    }
  }

  // Generic mitigation strategies
  if (highRiskAreas.size > 0) {
    mitigationStrategies.add("Increase field supervision and monitoring");
    mitigationStrategies.add("Conduct competitive market analysis");
    mitigationStrategies.add("Review and adjust resource allocation");
    mitigationStrategies.add("Implement contingency planning");
  }

  return {
    highRiskAreas: Array.from(highRiskAreas).slice(0, 10),
    mitigationStrategies: Array.from(mitigationStrategies)
  };
}
