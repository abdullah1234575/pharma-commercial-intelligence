"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
  ZAxis
} from "recharts";
import { AlertTriangle, BrainCircuit, CheckCircle2, TrendingUp } from "lucide-react";
import { ChartCard } from "@/components/charts/chart-card";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { FilterPanel } from "@/components/ui/filter-panel";
import { KpiCard } from "@/components/ui/kpi-card";
import { SectionShell } from "@/components/ui/section-shell";
import { buildDashboardModel, defaultFilters } from "@/lib/analytics";
import type { DashboardFilters } from "@/types/dashboard";

const chartColors = ["#0f8ba8", "#49c58d", "#f5a524", "#5267df", "#e45757", "#1bb7b4"];

const moneyTick = (value: number) => `$${Math.round(value / 1000000)}M`;
const pctTick = (value: number) => `${Math.round(value)}%`;

export function PharmaDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [darkMode, setDarkMode] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const model = useMemo(() => buildDashboardModel(filters), [filters]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  function updateFilter(key: keyof DashboardFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--text))]">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Topbar darkMode={darkMode} onToggleDark={() => setDarkMode((value) => !value)} onRefresh={() => setLastRefresh(new Date())} lastRefresh={lastRefresh} />
          <div className="space-y-8 p-4 md:p-6">
            <FilterPanel filters={filters} onChange={updateFilter} onReset={() => setFilters(defaultFilters)} />

            <SectionShell id="summary" title="Executive Summary" subtitle="Leadership cockpit for sales momentum, market share, execution quality, and risk signals.">
              <div className="grid metric-grid gap-4">
                {model.kpis.map((metric) => (
                  <KpiCard key={metric.label} metric={metric} />
                ))}
              </div>
              <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="glass-panel rounded-lg p-4 shadow-executive dark:shadow-executive-dark">
                  <div className="mb-4 flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-ocean" />
                    <h3 className="font-semibold">AI-Generated Commercial Insights</h3>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {model.insights.map((insight) => (
                      <div key={insight} className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-3 text-sm leading-6">
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-panel rounded-lg p-4 shadow-executive dark:shadow-executive-dark">
                  <div className="mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-signal" />
                    <h3 className="font-semibold">Auto Performance Alerts</h3>
                  </div>
                  <div className="space-y-3">
                    {model.alerts.map((alert, index) => (
                      <div key={alert} className="flex gap-3 rounded-md bg-[rgb(var(--panel-soft))] p-3 text-sm leading-5">
                        {index === 0 ? <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-ocean" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" />}
                        <span>{alert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionShell>

            <SectionShell id="sales" title="Sales Performance" subtitle="Sales trajectory, target delivery, growth by month, product contribution, and regional comparison.">
              <div className="grid gap-4 xl:grid-cols-2">
                <ChartCard title="Monthly Sales Trend" subtitle="Actual sales and rolling forecast">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={model.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,145,160,.25)" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={moneyTick} />
                      <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, ""]} />
                      <Area type="monotone" dataKey="sales" name="Sales" stroke="#0f8ba8" fill="#0f8ba8" fillOpacity={0.18} strokeWidth={3} />
                      <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#f5a524" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Sales vs Target" subtitle="Achievement curve by month">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={model.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,145,160,.25)" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={moneyTick} />
                      <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, ""]} />
                      <Bar dataKey="target" name="Target" fill="#d5e6ec" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="sales" name="Actual" stroke="#49c58d" strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Top-Performing Products" subtitle="Brand sales and contribution margin">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={model.byBrand} layout="vertical" margin={{ left: 18 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,145,160,.25)" />
                      <XAxis type="number" tickFormatter={moneyTick} />
                      <YAxis dataKey="name" type="category" width={86} />
                      <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, ""]} />
                      <Bar dataKey="sales" name="Sales" fill="#0f8ba8" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="margin" name="Margin" fill="#49c58d" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Region Comparison" subtitle="Sales, coverage, and margin view">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={model.byRegion}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,145,160,.25)" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" tickFormatter={moneyTick} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={pctTick} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="sales" name="Sales" fill="#0f8ba8" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="coverage" name="Coverage %" stroke="#f5a524" strokeWidth={3} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </SectionShell>

            <SectionShell id="market" title="Market Intelligence" subtitle="Market share evolution, competitive positioning, product ranking, and market growth signals.">
              <div className="grid gap-4 xl:grid-cols-3">
                <ChartCard title="Market Share Trend" className="xl:col-span-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={model.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,145,160,.25)" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={pctTick} />
                      <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Share"]} />
                      <Line type="monotone" dataKey="share" stroke="#0f8ba8" strokeWidth={3} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Competitor Comparison">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={model.competitor} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                        {model.competitor.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, "Sales"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Brand Positioning" subtitle="Market share by brand">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap data={model.byBrand} dataKey="sales" nameKey="name" stroke="#fff" fill="#0f8ba8" />
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Product Ranking" subtitle="Share, units, and sales">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,145,160,.25)" />
                      <XAxis dataKey="share" name="Share" tickFormatter={pctTick} />
                      <YAxis dataKey="sales" name="Sales" tickFormatter={moneyTick} />
                      <ZAxis dataKey="units" range={[90, 600]} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter data={model.byBrand} fill="#49c58d" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Market Growth Analysis" subtitle="Growth versus target variance">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={model.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,145,160,.25)" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={pctTick} />
                      <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Growth"]} />
                      <Bar dataKey="growth" name="Growth" fill="#5267df" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </SectionShell>

            <SectionShell id="territory" title="Territory Performance" subtitle="Heatmap, territory ranking, sales distribution, and coverage efficiency.">
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="glass-panel rounded-lg p-4 shadow-executive dark:shadow-executive-dark">
                  <h3 className="mb-3 text-sm font-semibold">Territory Heatmap</h3>
                  <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {model.byTerritory.map((territory) => (
                      <button
                        key={territory.name}
                        className="rounded-md border border-[rgb(var(--border))] p-3 text-left transition hover:-translate-y-0.5 hover:border-ocean"
                        onClick={() => updateFilter("territory", territory.name)}
                        style={{ backgroundColor: `rgba(15, 139, 168, ${Math.min(0.16 + territory.achievement / 420, 0.5)})` }}
                        title={`Drill into ${territory.name}`}
                      >
                        <p className="text-sm font-semibold">{territory.name}</p>
                        <p className="text-xs text-[rgb(var(--muted))]">{territory.region}</p>
                        <p className="mt-2 text-lg font-semibold">{territory.achievement.toFixed(0)}%</p>
                      </button>
                    ))}
                  </div>
                </div>
                <ChartCard title="Territory Ranking" subtitle="Sales distribution and coverage">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={model.byTerritory.slice(0, 10)} layout="vertical" margin={{ left: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,145,160,.25)" />
                      <XAxis type="number" tickFormatter={moneyTick} />
                      <YAxis dataKey="name" type="category" width={90} />
                      <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, "Sales"]} />
                      <Bar dataKey="sales" fill="#0f8ba8" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </SectionShell>

            <SectionShell id="reps" title="Medical Rep Performance" subtitle="Rep leaderboard, productivity, calls-to-sales correlation, and achievement ranking.">
              <div className="grid gap-4 xl:grid-cols-3">
                <div className="glass-panel rounded-lg p-4 shadow-executive dark:shadow-executive-dark xl:col-span-1">
                  <h3 className="mb-3 text-sm font-semibold">Rep Leaderboard</h3>
                  <div className="space-y-2">
                    {model.byRep.slice(0, 8).map((rep, index) => (
                      <button
                        key={rep.name}
                        className="flex w-full items-center justify-between rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-3 text-left transition hover:border-ocean"
                        onClick={() => updateFilter("medicalRep", rep.name)}
                      >
                        <span>
                          <span className="block text-sm font-semibold">{index + 1}. {rep.name}</span>
                          <span className="text-xs text-[rgb(var(--muted))]">{rep.manager}</span>
                        </span>
                        <span className="text-sm font-semibold">{rep.achievement.toFixed(0)}%</span>
                      </button>
                    ))}
                  </div>
                </div>
                <ChartCard title="Calls vs Sales Correlation" className="xl:col-span-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,145,160,.25)" />
                      <XAxis dataKey="calls" name="Calls" />
                      <YAxis dataKey="sales" name="Sales" tickFormatter={moneyTick} />
                      <ZAxis dataKey="achievement" range={[80, 480]} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter data={model.byRep} fill="#f5a524" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Productivity Analysis" subtitle="Sales generated per call">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={model.byRep.slice(0, 8)} layout="vertical" margin={{ left: 36 }}>
                      <XAxis type="number" tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}K`} />
                      <YAxis dataKey="name" type="category" width={96} />
                      <Tooltip formatter={(value: number) => [`$${value.toFixed(0)}`, "Sales per call"]} />
                      <Bar dataKey="productivity" fill="#49c58d" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Achievement Ranking" subtitle="Rep target delivery">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={model.byRep.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,145,160,.25)" />
                      <XAxis dataKey="name" hide />
                      <YAxis tickFormatter={pctTick} />
                      <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Achievement"]} />
                      <Bar dataKey="achievement" fill="#5267df" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Manager View" subtitle="Sales by rep">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={model.byRep.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,145,160,.25)" />
                      <XAxis dataKey="name" hide />
                      <YAxis tickFormatter={moneyTick} />
                      <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, "Sales"]} />
                      <Bar dataKey="sales" fill="#0f8ba8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </SectionShell>

            <SectionShell id="forecast" title="Forecasting & Analytics" subtitle="Sales forecasting, seasonality, predictive commentary, and variance decomposition.">
              <div className="grid gap-4 xl:grid-cols-3">
                <ChartCard title="Sales Forecasting" className="xl:col-span-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={model.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,145,160,.25)" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={moneyTick} />
                      <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, ""]} />
                      <Area type="monotone" dataKey="sales" fill="#1bb7b4" stroke="#1bb7b4" fillOpacity={0.18} name="Actual" />
                      <Line type="monotone" dataKey="forecast" stroke="#e45757" strokeWidth={3} name="Forecast" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Forecast Variance Waterfall">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={model.waterfall}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,145,160,.25)" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={moneyTick} />
                      <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, "Value"]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {model.waterfall.map((entry, index) => (
                          <Cell key={entry.name} fill={entry.value >= 0 ? chartColors[index % chartColors.length] : "#e45757"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </SectionShell>

            <SectionShell id="customers" title="Customer Insights" subtitle="Customer segmentation, top channels, prescriber proxy analysis, and retention indicators.">
              <div className="grid gap-4 xl:grid-cols-3">
                <ChartCard title="Customer Segmentation" subtitle="Sales by customer type">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={model.customers} dataKey="sales" nameKey="name" outerRadius={92} label>
                        {model.customers.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, "Sales"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Channel Mix" subtitle="Distribution by commercial channel">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={model.channelMix}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(130,145,160,.25)" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={moneyTick} />
                      <Tooltip formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, "Sales"]} />
                      <Bar dataKey="value" fill="#0f8ba8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
                <div className="glass-panel rounded-lg p-4 shadow-executive dark:shadow-executive-dark">
                  <h3 className="mb-3 text-sm font-semibold">Retention Indicators</h3>
                  <div className="space-y-3">
                    {model.customers.map((customer) => (
                      <div key={customer.name}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span>{customer.name}</span>
                          <span className="font-semibold">{customer.retained}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[rgb(var(--panel-soft))]">
                          <div className="h-2 rounded-full bg-mint" style={{ width: `${customer.retained}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionShell>
          </div>
        </div>
      </div>
    </main>
  );
}
