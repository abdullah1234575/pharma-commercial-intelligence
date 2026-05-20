"use client";

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from "recharts";

interface ForecastTrendData {
  name: string;
  actual: number;
  forecast: number;
  lowerBound: number;
  upperBound: number;
}

interface ForecastTrendChartProps {
  data: ForecastTrendData[];
  title: string;
  height?: number;
}

export function ForecastTrendChart({ data, title, height = 300 }: ForecastTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <p>No forecast data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px"
            }}
          />
          <Legend />
          
          {/* Confidence band */}
          <Area
            type="monotone"
            dataKey="upperBound"
            stackId="1"
            stroke="none"
            fill="url(#confidenceGradient)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="lowerBound"
            stackId="1"
            stroke="none"
            fill="#fff"
            isAnimationActive={false}
          />
          
          {/* Actual and forecast lines */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Actual"
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
            name="Forecast"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BrandForecastProps {
  data: Array<{
    name: string;
    nextMonth: number;
    nextQuarter: number;
    growth: number;
  }>;
  title: string;
}

export function BrandForecastChart({ data, title }: BrandForecastProps) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px"
            }}
            formatter={(value) => `$${Math.round(value / 1000)}K`}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="nextMonth"
            stackId="1"
            stroke="#06b6d4"
            fill="url(#brandGradient)"
            name="Next Month"
          />
          <Area
            type="monotone"
            dataKey="nextQuarter"
            stackId="1"
            stroke="#0891b2"
            fill="#0891b2"
            fillOpacity={0.6}
            name="Next Quarter"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface GrowthForecastProps {
  data: Array<{
    name: string;
    growth: number;
  }>;
  title: string;
}

export function GrowthForecastChart({ data, title }: GrowthForecastProps) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
          <YAxis stroke="#6b7280" label={{ value: 'Growth %', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px"
            }}
            formatter={(value) => `${(value as number * 100).toFixed(1)}%`}
          />
          <Area
            type="monotone"
            dataKey="growth"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.6}
            name="Growth Rate"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
