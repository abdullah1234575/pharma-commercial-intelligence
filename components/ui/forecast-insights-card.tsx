"use client";

import { AlertTriangle, TrendingUp, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";
import type { ForecastInsight } from "@/types/dashboard";

interface ForecastInsightsCardProps {
  insights: ForecastInsight[];
}

export function ForecastInsightsCard({ insights }: ForecastInsightsCardProps) {
  const priorityColor = {
    critical: "border-red-300 bg-red-50",
    high: "border-orange-300 bg-orange-50",
    medium: "border-yellow-300 bg-yellow-50",
    low: "border-blue-300 bg-blue-50"
  };

  const priorityIcon = {
    critical: <AlertTriangle className="w-4 h-4 text-red-600" />,
    high: <AlertTriangle className="w-4 h-4 text-orange-600" />,
    medium: <Zap className="w-4 h-4 text-yellow-600" />,
    low: <TrendingUp className="w-4 h-4 text-blue-600" />
  };

  const categoryIcon = {
    opportunity: "🎯",
    risk: "⚠️",
    trend: "📈",
    performance: "✨",
    market: "🏆"
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900">AI Forecast Insights</h3>
      
      <div className="grid gap-3">
        {insights.map((insight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-lg border-2 p-4 ${priorityColor[insight.priority]}`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{categoryIcon[insight.category]}</div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-gray-900 text-sm">{insight.title}</h4>
                  {priorityIcon[insight.priority]}
                </div>
                
                <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                
                <div className="mt-2 p-2 bg-white bg-opacity-60 rounded text-xs text-gray-700 font-mono">
                  {insight.metric}
                </div>
                
                {insight.recommendation && (
                  <div className="mt-2 p-2 bg-white bg-opacity-40 rounded text-xs text-gray-800 italic border-l-2 border-current">
                    💡 {insight.recommendation}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
