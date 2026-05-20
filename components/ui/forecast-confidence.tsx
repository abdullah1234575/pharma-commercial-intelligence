"use client";

import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface ConfidenceIndicatorProps {
  confidence: number; // 0-100
  method: string;
  label?: string;
}

export function ForecastConfidenceIndicator({ confidence, method, label }: ConfidenceIndicatorProps) {
  const getColor = (conf: number) => {
    if (conf >= 85) return "text-green-600";
    if (conf >= 70) return "text-blue-600";
    if (conf >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getLabel = (conf: number) => {
    if (conf >= 85) return "Very High";
    if (conf >= 70) return "High";
    if (conf >= 50) return "Moderate";
    return "Low";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg border border-gray-200 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{label || "Forecast Confidence"}</h3>
        <CheckCircle2 className={`w-5 h-5 ${getColor(confidence)}`} />
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-3xl font-bold ${getColor(confidence)}`}>{confidence}%</span>
          <span className="text-sm text-gray-600">{getLabel(confidence)} Confidence</span>
        </div>

        {/* Confidence bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className={`h-2 rounded-full ${
              confidence >= 85 ? "bg-green-500" : confidence >= 70 ? "bg-blue-500" : "bg-yellow-500"
            }`}
          />
        </div>
      </div>

      <p className="text-xs text-gray-600">
        <strong>Method:</strong> {method}
      </p>
    </motion.div>
  );
}

interface RiskAlertProps {
  riskLevel: "low" | "medium" | "high";
  areas: string[];
  strategies: string[];
  overallScore: number;
}

export function RiskAlert({ riskLevel, areas, strategies, overallScore }: RiskAlertProps) {
  const riskBg = {
    low: "bg-green-50 border-green-200",
    medium: "bg-yellow-50 border-yellow-200",
    high: "bg-red-50 border-red-200"
  };

  const riskIcon = {
    low: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    medium: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    high: <AlertTriangle className="w-5 h-5 text-red-600" />
  };

  const riskLabel = {
    low: "Low Risk",
    medium: "Medium Risk",
    high: "High Risk"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border-2 p-4 ${riskBg[riskLevel]}`}
    >
      <div className="flex items-start gap-3 mb-4">
        {riskIcon[riskLevel]}
        <div>
          <h3 className="font-semibold text-gray-900">{riskLabel[riskLevel]}</h3>
          <p className="text-sm text-gray-700">Overall Risk Score: {overallScore}/100</p>
        </div>
      </div>

      {/* Risk gauge */}
      <div className="mb-4 bg-white bg-opacity-50 p-3 rounded">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallScore}%` }}
            transition={{ delay: 0.3, duration: 1 }}
            className={`h-3 rounded-full ${
              overallScore <= 33 ? "bg-green-500" : overallScore <= 66 ? "bg-yellow-500" : "bg-red-500"
            }`}
          />
        </div>
      </div>

      {areas.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">🚨 High Risk Areas:</h4>
          <ul className="space-y-1">
            {areas.slice(0, 4).map((area, idx) => (
              <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {strategies.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">📋 Mitigation Strategies:</h4>
          <ul className="space-y-1">
            {strategies.slice(0, 3).map((strategy, idx) => (
              <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>{strategy}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

interface ScenarioAnalysisProps {
  optimistic: number;
  realistic: number;
  pessimistic: number;
  unit: string;
  label: string;
}

export function ScenarioAnalysis({
  optimistic,
  realistic,
  pessimistic,
  unit,
  label
}: ScenarioAnalysisProps) {
  const max = Math.max(optimistic, realistic, pessimistic);
  const optimisticPct = (optimistic / max) * 100;
  const realisticPct = (realistic / max) * 100;
  const pessimisticPct = (pessimistic / max) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4"
    >
      <h3 className="font-semibold text-gray-900 mb-4">{label}</h3>

      <div className="space-y-4">
        {/* Optimistic */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">🎯 Optimistic</span>
            <span className="text-sm font-bold text-green-600">{optimistic} {unit}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${optimisticPct}%` }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="h-2 bg-green-500 rounded-full"
            />
          </div>
        </div>

        {/* Realistic */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">💼 Realistic</span>
            <span className="text-sm font-bold text-blue-600">{realistic} {unit}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${realisticPct}%` }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="h-2 bg-blue-500 rounded-full"
            />
          </div>
        </div>

        {/* Pessimistic */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">⚠️ Pessimistic</span>
            <span className="text-sm font-bold text-orange-600">{pessimistic} {unit}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pessimisticPct}%` }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="h-2 bg-orange-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Spread analysis */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-700">
        <p>
          <strong>Range:</strong> ${Math.round(pessimistic / 1000)}K - ${Math.round(optimistic / 1000)}K
          ({Math.round(((optimistic - pessimistic) / realistic) * 100)}% spread)
        </p>
      </div>
    </motion.div>
  );
}
