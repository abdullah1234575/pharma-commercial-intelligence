"use client";

import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import type { ForecastKPI } from "@/types/dashboard";

interface ForecastKpiCardProps {
  kpi: ForecastKPI;
  index?: number;
}

export function ForecastKpiCard({ kpi, index = 0 }: ForecastKpiCardProps) {
  const riskColor = {
    low: "border-green-200 bg-green-50",
    medium: "border-yellow-200 bg-yellow-50",
    high: "border-red-200 bg-red-50"
  };

  const trendIcon = kpi.trend === "increasing" 
    ? <TrendingUp className="w-5 h-5 text-green-600" />
    : kpi.trend === "decreasing"
    ? <TrendingDown className="w-5 h-5 text-red-600" />
    : <CheckCircle2 className="w-5 h-5 text-blue-600" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-lg border-2 p-4 ${riskColor[kpi.riskLevel]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-700">{kpi.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
        </div>
        {kpi.riskLevel === "high" && (
          <AlertTriangle className="w-5 h-5 text-red-600" />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs mt-4 pt-3 border-t border-opacity-30">
        <div>
          <p className="text-gray-600">Next Month</p>
          <p className="font-semibold text-gray-900">{kpi.nextMonth}</p>
        </div>
        <div>
          <p className="text-gray-600">Next Quarter</p>
          <p className="font-semibold text-gray-900">{kpi.nextQuarter}</p>
        </div>
        <div>
          <p className="text-gray-600">YTD Expected</p>
          <p className="font-semibold text-gray-900">{kpi.ytdExpected}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-opacity-30">
        <div className="flex items-center gap-2">
          {trendIcon}
          <span className="text-sm font-medium text-gray-700">Trend: {kpi.trend}</span>
        </div>
        <div className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded font-medium text-gray-700">
          {kpi.confidence}
        </div>
      </div>
    </motion.div>
  );
}
