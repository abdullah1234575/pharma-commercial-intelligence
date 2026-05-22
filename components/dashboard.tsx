"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
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
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, BrainCircuit, CheckCircle2, FileSpreadsheet, TrendingUp } from "lucide-react";
import { ChartCard } from "@/components/charts/chart-card";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { FilterPanel } from "@/components/ui/filter-panel";
import { KpiCard } from "@/components/ui/kpi-card";
import { SectionShell } from "@/components/ui/section-shell";
import { UploadCenter } from "@/components/upload/upload-center";
import { ForecastModule } from "@/components/forecast-module";
import { buildDashboardModel, buildFilterOptions, defaultFilters } from "@/lib/analytics";
import { getSupabaseClient } from "@/lib/supabase";
import { persistUploadToSupabase } from "@/lib/persistence";
import type { DashboardFilters, ParsedSheet, PharmaRecord, UploadHistoryItem } from "@/types/dashboard";

const chartColors = ["#0f8ba8", "#49c58d", "#f5a524", "#5267df", "#e45757", "#1bb7b4"];

const moneyTick = (value: number) => `$${Math.round(value / 1000000)}M`;
const pctTick = (value: number) => `${Math.round(value)}%`;

export function PharmaDashboard() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [darkMode, setDarkMode] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string>("");
  const [records, setRecords] = useState<PharmaRecord[]>([]);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [exportCount, setExportCount] = useState<number>(0);
  const [authUser, setAuthUser] = useState<null | { id: string; email: string; emailConfirmedAt?: string }>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [premiumModalLabel, setPremiumModalLabel] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"export" | "pdf" | "save" | null>(null);
  const isEmptyDashboard = records.length === 0;
  const isAuthenticated = Boolean(authUser);
  const isVerified = Boolean(authUser?.emailConfirmedAt);
  const model = useMemo(() => buildDashboardModel(filters, records), [filters, records]);
  const filterOptions = useMemo(() => buildFilterOptions(records), [records]);

  useEffect(() => {
    setLastRefresh(new Date().toISOString());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const storedRecords = window.localStorage.getItem("pci:processed-records");
    const storedHistory = window.localStorage.getItem("pci:upload-history");
    const storedExportCount = window.localStorage.getItem("pci:export-count");
    if (storedRecords) setRecords(JSON.parse(storedRecords) as PharmaRecord[]);
    if (storedHistory) setUploadHistory(JSON.parse(storedHistory) as UploadHistoryItem[]);
    setExportCount(Number(storedExportCount ?? "0"));
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    const client = supabase;
    let subscription: { unsubscribe: () => void } | null = null;

    async function loadSession() {
      const { data } = await client.auth.getSession();
      const user = data.session?.user;
      setAuthUser(user ? { id: user.id, email: user.email ?? "", emailConfirmedAt: user.email_confirmed_at ?? undefined } : null);
      setAuthLoading(false);
      if (user) {
        void client.from("users").update({ last_active: new Date().toISOString() }).eq("id", user.id);
      }
    }

    loadSession().catch(() => setAuthLoading(false));

    const authListener = client.auth.onAuthStateChange((_event, sessionData) => {
      const user = sessionData?.user;
      setAuthUser(user ? { id: user.id, email: user.email ?? "", emailConfirmedAt: user.email_confirmed_at ?? undefined } : null);
      if (user) {
        void client.from("users").update({ last_active: new Date().toISOString() }).eq("id", user.id);
      }
    });

    subscription = authListener.data?.subscription ?? null;

    return () => subscription?.unsubscribe();
  }, [supabase]);

  function updateFilter(key: keyof DashboardFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function handleProcessedUpload(nextRecords: PharmaRecord[], _sheets: ParsedSheet[], item: UploadHistoryItem) {
    if (process.env.NODE_ENV === "development") {
      console.debug("Processed upload:", item.id, item.fileName, "records:", nextRecords.length);
    }

    const mergedRecords = nextRecords.length ? [...records, ...nextRecords] : records;
    const mergedHistory = [item, ...uploadHistory];
    setRecords(mergedRecords);
    setUploadHistory(mergedHistory);
    window.localStorage.setItem("pci:processed-records", JSON.stringify(mergedRecords));
    window.localStorage.setItem("pci:upload-history", JSON.stringify(mergedHistory));
    setFilters(defaultFilters);
    void persistUploadToSupabase(item, nextRecords);
  }

  function handleDeleteUploadHistory(historyItem: UploadHistoryItem) {
    const nextHistory = uploadHistory.filter((item) => item.id !== historyItem.id);
    const nextRecords = records.filter((record) => {
      if (record.uploadId === historyItem.id) return false;
      return !historyItem.sourceFiles.some((sourceFileName) => record.id.startsWith(`${sourceFileName}-`));
    });

    if (process.env.NODE_ENV === "development") {
      console.debug("Deleting upload history:", historyItem.id, historyItem.fileName, "remaining records:", nextRecords.length);
    }

    setUploadHistory(nextHistory);
    setRecords(nextRecords);

    if (!nextRecords.length) {
      if (nextHistory.length) {
        window.localStorage.setItem("pci:upload-history", JSON.stringify(nextHistory));
      } else {
        window.localStorage.removeItem("pci:upload-history");
      }
      window.localStorage.removeItem("pci:processed-records");
      setFilters(defaultFilters);
      return;
    }

    window.localStorage.setItem("pci:upload-history", JSON.stringify(nextHistory));
    window.localStorage.setItem("pci:processed-records", JSON.stringify(nextRecords));
  }

  function triggerPremiumAction(action: "export" | "pdf" | "save") {
    if (!supabase) {
      setPremiumModalLabel("Authentication is not configured in this environment.");
      setPremiumModalOpen(true);
      return;
    }

    if (!isAuthenticated) {
      setPremiumModalLabel("Please sign in to access premium exports and saved dashboards.");
      setPremiumModalOpen(true);
      setPendingAction(action);
      return;
    }

    if (!isVerified) {
      setPremiumModalLabel("Verify your email to unlock premium exports and downloads.");
      setPremiumModalOpen(true);
      setPendingAction(action);
      return;
    }

    setPendingAction(action);
  }

  async function notifyExportEvent(eventType: "export" | "pdf") {
    const nextCount = exportCount + 1;
    setExportCount(nextCount);
    window.localStorage.setItem("pci:export-count", String(nextCount));

    if (!authUser) return;

    void fetch("/api/auth/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: authUser.email ?? authUser.id,
        email: authUser.email,
        company: "",
        phone: "",
        source: "Dashboard export",
        verified: isVerified,
        exportCount: nextCount,
        event: eventType,
        userId: authUser.id,
        lastActive: new Date().toISOString()
      })
    });
  }

  function exportExcel() {
    if (!isAuthenticated || !isVerified) {
      triggerPremiumAction("export");
      return;
    }

    const workbook = XLSX.utils.book_new();
    workbook.Props = {
      Title: "Pharma Commercial Intelligence Dashboard",
      Subject: "Executive analytics export",
      Author: authUser?.email ?? "Unknown",
      CreatedDate: new Date()
    };

    const titleSheet = XLSX.utils.aoa_to_sheet([
      ["Pharma Commercial Intelligence"],
      ["Executive Dashboard Export"],
      [],
      ["Prepared by", authUser?.email ?? "Unknown"],
      ["Exported at", new Date().toLocaleString()],
      ["Export type", "Excel workbook"],
      [],
      ["Filters"],
      ["Region", filters.region],
      ["Territory", filters.territory],
      ["Brand", filters.brand],
      ["Customer Type", filters.customerType],
      ["Channel", filters.channel]
    ]);
    XLSX.utils.book_append_sheet(workbook, titleSheet, "Cover Page");

    const summaryRows = [
      { metric: "Summary", value: "Commercial intelligence dashboard export" },
      { metric: "Total records", value: records.length },
      { metric: "Last refreshed", value: lastRefresh ? new Date(lastRefresh).toISOString() : "Pending" },
      { metric: "Verified user", value: isVerified ? "Yes" : "No" },
      { metric: "Email", value: authUser?.email ?? "Unknown" }
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Executive Summary");

    const kpiSheet = XLSX.utils.json_to_sheet(
      model.kpis.map((metric) => ({
        label: metric.label,
        value: metric.value,
        delta: metric.delta,
        status: metric.status,
        detail: metric.detail
      }))
    );
    XLSX.utils.book_append_sheet(workbook, kpiSheet, "KPIs");

    const chartSnapshotSheet = XLSX.utils.aoa_to_sheet([
      ["Chart snapshot"],
      ["Monthly trend"],
      ["Month", "Sales", "Forecast", "Share", "Growth"],
      ...model.monthly.map((item) => [item.month, item.sales, item.forecast, item.share, item.growth]),
      [],
      ["Top brands"],
      ["Brand", "Sales", "Margin"],
      ...model.byBrand.map((item) => [item.name, item.sales, item.margin]),
      [],
      ["Regional comparison"],
      ["Region", "Sales", "Coverage"],
      ...model.byRegion.map((item) => [item.name, item.sales, item.coverage])
    ]);
    XLSX.utils.book_append_sheet(workbook, chartSnapshotSheet, "Charts Overview");

    if (records.length) {
      const detailsSheet = XLSX.utils.json_to_sheet(
        records.map((record) => ({
          id: record.id,
          year: record.year,
          quarter: record.quarter,
          month: record.month,
          region: record.region,
          territory: record.territory,
          product_line: record.productLine,
          brand: record.brand,
          medical_rep: record.medicalRep,
          manager: record.manager,
          customer_type: record.customerType,
          channel: record.channel,
          sales: record.sales,
          target: record.target,
          forecast: record.forecast,
          units: record.units,
          customers: record.customers,
          active_customers: record.activeCustomers,
          calls: record.calls,
          planned_calls: record.plannedCalls,
          prescriptions: record.prescriptions,
          ims_sales: record.imsSales,
          market_size: record.marketSize,
          contribution_margin: record.margin
        }))
      );
      XLSX.utils.book_append_sheet(workbook, detailsSheet, "Data Details");
    }

    XLSX.writeFile(workbook, "pharma-commercial-intelligence-dashboard.xlsx");
    void notifyExportEvent("export");
  }

  function exportPdf() {
    if (!isAuthenticated || !isVerified) {
      triggerPremiumAction("pdf");
      return;
    }

    void notifyExportEvent("pdf");
    window.print();
  }

  function saveDashboard() {
    if (!isAuthenticated || !isVerified) {
      triggerPremiumAction("save");
      return;
    }

    const configs = JSON.parse(window.localStorage.getItem("pci:dashboard-configs") ?? "[]") as unknown[];
    window.localStorage.setItem(
      "pci:dashboard-configs",
      JSON.stringify([{ id: crypto.randomUUID(), name: "Executive Dashboard", filters, createdAt: new Date().toISOString() }, ...configs])
    );
  }

  return (
    <main className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--text))]">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Topbar
            darkMode={darkMode}
            onToggleDark={() => setDarkMode((value) => !value)}
            onRefresh={() => setLastRefresh(new Date().toISOString())}
            lastRefresh={lastRefresh}
            onExportExcel={exportExcel}
            onExportPdf={exportPdf}
            onSaveDashboard={saveDashboard}
            userEmail={authUser?.email}
            isAuthenticated={isAuthenticated}
            isVerified={isVerified}
            onSignOut={() => void supabase?.auth.signOut()}
          />
          <div className="space-y-8 p-4 md:p-6">
            {authLoading ? (
              <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 text-sm text-[rgb(var(--text))]">
                Loading authentication status…
              </div>
            ) : !isAuthenticated ? (
              <div className="rounded-3xl border border-ocean/20 bg-ocean/5 p-4 text-sm text-[rgb(var(--text))]">
                <strong className="font-semibold">Premium access needed.</strong> Sign in or create an account to unlock secure exports, advanced analytics, and saved dashboard workflows.
              </div>
            ) : !isVerified ? (
              <div className="rounded-3xl border border-signal/20 bg-signal/5 p-4 text-sm text-[rgb(var(--text))]">
                <strong className="font-semibold">Verify your email.</strong> Once verified, premium exports and downloads are available immediately.
              </div>
            ) : null}
            <UploadCenter history={uploadHistory} onProcessed={handleProcessedUpload} onDelete={handleDeleteUploadHistory} />
            {!isEmptyDashboard ? (
              <FilterPanel filters={filters} options={filterOptions} onChange={updateFilter} onReset={() => setFilters(defaultFilters)} />
            ) : null}
            <PremiumGateModal
              open={premiumModalOpen}
              label={premiumModalLabel}
              onClose={() => setPremiumModalOpen(false)}
              onAction={() => {
                setPremiumModalOpen(false);
                if (!isAuthenticated || !isVerified) {
                  window.location.href = "/login";
                  return;
                }
                if (pendingAction === "export") {
                  exportExcel();
                } else if (pendingAction === "pdf") {
                  exportPdf();
                } else if (pendingAction === "save") {
                  saveDashboard();
                }
              }}
            />

            <AnimatePresence mode="wait">
              {isEmptyDashboard ? (
                <motion.section
                  key="empty-dashboard"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                  className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 shadow-executive dark:shadow-executive-dark"
                >
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px]">
                  <div className="space-y-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-ocean/10 text-ocean">
                      <FileSpreadsheet className="h-6 w-6" />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold text-[rgb(var(--text))] sm:text-3xl">No commercial data uploaded yet</h2>
                      <p className="max-w-2xl text-sm leading-7 text-[rgb(var(--muted))]">
                        Upload Excel or CSV files to activate your private analytics workspace. KPI cards, charts, forecasts, filters, and market intelligence will render from your uploaded data.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => document.getElementById("upload-center")?.scrollIntoView({ behavior: "smooth" })}
                          className="inline-flex items-center justify-center rounded-md bg-ocean px-5 py-3 text-sm font-semibold text-white transition hover:bg-aqua"
                        >
                          Upload data
                        </button>
                        <span className="inline-flex items-center rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] px-5 py-3 text-sm font-medium text-[rgb(var(--text))]">
                          Supported files: CSV, XLS, XLSX
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-5">
                    <div className="space-y-4">
                      <div className="rounded-3xl bg-[rgb(var(--background))] p-4 text-sm leading-7 text-[rgb(var(--text))] shadow-sm">
                        <p className="font-semibold">Ready when your data is</p>
                        <p className="mt-2 text-[rgb(var(--muted))]">
                          Your dashboard resets automatically when the final uploaded file is removed. No stale KPIs, graphs, or filters will remain visible.
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 text-sm text-[rgb(var(--muted))]">
                          <p className="font-semibold text-[rgb(var(--text))]">Empty state</p>
                          <p className="mt-2">Clean dashboard with no stale metrics.</p>
                        </div>
                        <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 text-sm text-[rgb(var(--muted))]">
                          <p className="font-semibold text-[rgb(var(--text))]">Smart reset</p>
                          <p className="mt-2">Filters and computed analytics are restored to default.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            ) : (
              <>
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

            <ForecastModule records={records} />

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
          </>
        )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}

function PremiumGateModal({
  open,
  label,
  onClose,
  onAction
}: {
  open: boolean;
  label: string | null;
  onClose: () => void;
  onAction: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 shadow-2xl shadow-slate-900/30">
        <h2 className="text-xl font-semibold">Premium access required</h2>
        <p className="mt-3 text-sm leading-6 text-[rgb(var(--muted))]">{label ?? "Sign in or verify your email before using dashboard exports and downloads."}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-md bg-ocean px-4 text-sm font-semibold text-white transition hover:bg-aqua"
            onClick={onAction}
          >
            Continue
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] px-4 text-sm font-semibold text-[rgb(var(--text))] transition hover:border-ocean hover:text-ocean"
            onClick={onClose}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
