"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { BrandForecastChart, GrowthForecastChart } from "@/components/charts/forecast-charts";
import { ForecastConfidenceIndicator, RiskAlert, ScenarioAnalysis } from "@/components/ui/forecast-confidence";
import { ForecastInsightsCard } from "@/components/ui/forecast-insights-card";
import { SectionShell } from "@/components/ui/section-shell";
import type { PharmaRecord, ForecastInsight } from "@/types/dashboard";

interface ForecastData {
  forecasts: {
    overall: {
      nextMonth: number;
      nextQuarter: number;
      ytd: number;
      confidence: string;
      growth: string;
    };
    brands: Array<{
      name: string;
      nextMonth: number;
      nextQuarter: number;
      ytd: number;
      confidence: number;
      growth: number;
      trend: string;
      riskLevel: string;
      insights: string[];
    }>;
    channels: Array<{
      name: string;
      nextMonth: number;
      nextQuarter: number;
      ytd: number;
      confidence: number;
      growth: number;
      trend: string;
    }>;
    territories: Array<{
      name: string;
      nextMonth: number;
      nextQuarter: number;
      confidence: number;
      growth: number;
      riskLevel: string;
    }>;
    reps: Array<{
      name: string;
      nextMonth: number;
      confidence: number;
      growth: number;
    }>;
  };
  insights: ForecastInsight[];
  risks: {
    highRiskAreas: string[];
    mitigationStrategies: string[];
    overallRiskScore: number;
  };
  metadata: {
    generatedAt: string;
    dataPoints: number;
    forecastPeriods: number;
    confidence: string;
    method: string;
  };
}

interface ForecastModuleProps {
  records?: PharmaRecord[];
}

export function ForecastModule({ records = [] }: ForecastModuleProps) {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "brands" | "channels" | "territories" | "insights">("overview");
  const [refreshing, setRefreshing] = useState(false);

  const fetchForecasts = useCallback(async () => {
    try {
      setRefreshing(true);
      const hasRecords = records && records.length > 0;
      
      const response = await fetch("/api/forecast", {
        method: hasRecords ? "POST" : "GET",
        headers: hasRecords ? { "Content-Type": "application/json" } : undefined,
        body: hasRecords ? JSON.stringify({ records }) : undefined,
      });

      if (!response.ok) throw new Error("Failed to fetch forecasts");
      const forecastData = await response.json();
      setData(forecastData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load forecasts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [records]);

  useEffect(() => {
    fetchForecasts();
  }, [fetchForecasts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
          <RefreshCw className="w-8 h-8 text-blue-600" />
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <SectionShell id="forecast-error" title="AI-Powered Forecasting Module" subtitle={error || "No data available"}>
        <button
          onClick={fetchForecasts}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </SectionShell>
    );
  }

  const tabs = [
    { id: "overview" as const, label: "📊 Overview" },
    { id: "brands" as const, label: "💊 Brands" },
    { id: "channels" as const, label: "📢 Channels" },
    { id: "territories" as const, label: "🗺️ Territories" },
    { id: "insights" as const, label: "💡 Insights" }
  ];

  return (
    <SectionShell
      id="forecast"
      title="AI-Powered Forecasting Module"
      subtitle="Advanced forecasting with AI-generated insights and risk analysis"
    >
      {/* Header with refresh and download */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchForecasts();
          }}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Overall KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6"
              >
                <p className="text-sm text-gray-600 mb-2">Next Month Forecast</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${Math.round(data.forecasts.overall.nextMonth / 1000)}K
                </p>
                <p className="text-xs text-gray-600 mt-2">Growth: {data.forecasts.overall.growth}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6"
              >
                <p className="text-sm text-gray-600 mb-2">Next Quarter Forecast</p>
                <p className="text-3xl font-bold text-green-600">
                  ${Math.round(data.forecasts.overall.nextQuarter / 1000)}K
                </p>
                <p className="text-xs text-gray-600 mt-2">Confidence: {data.forecasts.overall.confidence}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6"
              >
                <p className="text-sm text-gray-600 mb-2">YTD Expected</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${Math.round(data.forecasts.overall.ytd / 1000)}K
                </p>
                <p className="text-xs text-gray-600 mt-2">Data Points: {data.metadata.dataPoints}</p>
              </motion.div>
            </div>

            {/* Confidence and Risk */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ForecastConfidenceIndicator
                confidence={parseInt(data.forecasts.overall.confidence)}
                method={data.metadata.method}
                label="Portfolio Forecast Confidence"
              />

              <RiskAlert
                riskLevel={data.risks.overallRiskScore <= 33 ? "low" : data.risks.overallRiskScore <= 66 ? "medium" : "high"}
                areas={data.risks.highRiskAreas}
                strategies={data.risks.mitigationStrategies}
                overallScore={data.risks.overallRiskScore}
              />
            </div>

            {/* Scenario Analysis */}
            <ScenarioAnalysis
              optimistic={data.forecasts.overall.nextQuarter * 1.15}
              realistic={data.forecasts.overall.nextQuarter}
              pessimistic={data.forecasts.overall.nextQuarter * 0.85}
              unit="INR"
              label="Q Forecast Scenarios"
            />
          </motion.div>
        )}

        {/* BRANDS TAB */}
        {activeTab === "brands" && (
          <motion.div
            key="brands"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <BrandForecastChart
              data={data.forecasts.brands.map(b => ({
                name: b.name,
                nextMonth: b.nextMonth,
                nextQuarter: b.nextQuarter,
                growth: b.growth
              }))}
              title="Brand Forecasts - Next Month vs Quarter"
            />

            <GrowthForecastChart
              data={data.forecasts.brands}
              title="Brand Growth Rates"
            />

            {/* Brand details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.forecasts.brands.slice(0, 9).map((brand, idx) => (
                <motion.div
                  key={brand.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-gray-900 mb-3">{brand.name}</h4>
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Month:</span>
                      <span className="font-semibold">${Math.round(brand.nextMonth / 1000)}K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Growth:</span>
                      <span className={`font-semibold ${brand.growth > 0 ? "text-green-600" : "text-red-600"}`}>
                        {(brand.growth * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      brand.riskLevel === "low" ? "bg-green-100 text-green-700" :
                      brand.riskLevel === "medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {brand.riskLevel === "low" ? "✓ Low Risk" : brand.riskLevel === "medium" ? "⚠ Medium" : "🔴 High"}
                    </span>
                    <span className="text-xs text-gray-600">{(brand.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CHANNELS TAB */}
        {activeTab === "channels" && (
          <motion.div
            key="channels"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <BrandForecastChart
              data={data.forecasts.channels}
              title="Channel Forecasts"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.forecasts.channels.map((channel, idx) => (
                <motion.div
                  key={channel.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-gray-900 mb-3">{channel.name} Channel</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Next Quarter</p>
                      <p className="text-2xl font-bold text-gray-900">${Math.round(channel.nextQuarter / 1000)}K</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Growth</p>
                        <p className={`font-semibold ${channel.growth > 0 ? "text-green-600" : "text-red-600"}`}>
                          {(channel.growth * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Confidence</p>
                        <p className="font-semibold text-blue-600">{(channel.confidence * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TERRITORIES TAB */}
        {activeTab === "territories" && (
          <motion.div
            key="territories"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.forecasts.territories.slice(0, 15).map((territory, idx) => (
                <motion.div
                  key={territory.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-lg border-2 p-4 ${
                    territory.riskLevel === "low" ? "border-green-200 bg-green-50" :
                    territory.riskLevel === "medium" ? "border-yellow-200 bg-yellow-50" :
                    "border-red-200 bg-red-50"
                  }`}
                >
                  <h4 className="font-semibold text-gray-900 mb-3">{territory.name}</h4>
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Month:</span>
                      <span className="font-semibold">${Math.round(territory.nextMonth / 1000)}K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Growth:</span>
                      <span className={`font-semibold ${territory.growth > 0 ? "text-green-600" : "text-red-600"}`}>
                        {(territory.growth * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-700 pt-2 border-t border-opacity-30">
                    Risk: <span className="font-semibold">{territory.riskLevel.toUpperCase()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === "insights" && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ForecastInsightsCard insights={data.insights} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer with metadata */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600"
      >
        <p>
          <strong>Forecast Generated:</strong> {new Date(data.metadata.generatedAt).toLocaleString()} |
          <strong className="ml-2">Method:</strong> {data.metadata.method} |
          <strong className="ml-2">Forecast Periods:</strong> {data.metadata.forecastPeriods} months
        </p>
      </motion.div>
    </SectionShell>
  );
}
