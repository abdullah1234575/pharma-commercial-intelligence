"use client";

import { Download, FileSpreadsheet, Moon, RefreshCcw, Search, ShieldCheck, Sun } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { templateDefinitions } from "@/lib/template-definitions";

export function Topbar({
  darkMode,
  onToggleDark,
  onRefresh,
  lastRefresh,
  onExportExcel,
  onExportPdf,
  onSaveDashboard
}: {
  darkMode: boolean;
  onToggleDark: () => void;
  onRefresh: () => void;
  lastRefresh: Date;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onSaveDashboard: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-[rgb(var(--border))] bg-[rgb(var(--background))]/92 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="hidden sm:block">
            <BrandMark variant="navbar" />
          </div>
          <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ocean">Global Pharma Commercial Excellence</p>
          <h1 className="text-2xl font-semibold tracking-normal text-[rgb(var(--text))] md:text-3xl">Pharma Commercial Intelligence</h1>
          <p className="mt-1 text-xs font-medium text-[rgb(var(--muted))] sm:hidden">Synaptic Group | Powered by Abdullah Alshawadfy</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1 xl:flex-none">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted))]" />
            <input
              className="h-10 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] pl-9 pr-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
              placeholder="Search brands, reps, territories"
            />
          </div>
          <details className="group relative">
            <summary className="inline-flex h-10 cursor-pointer list-none items-center gap-2 rounded-md border border-[rgb(var(--border))] px-3 text-sm font-medium transition hover:border-ocean hover:text-ocean">
              <Download className="h-4 w-4" />
              Download Template
            </summary>
            <div className="absolute right-0 z-30 mt-2 w-64 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-2 shadow-executive dark:shadow-executive-dark">
              {templateDefinitions.map((template) => (
                <a
                  key={template.type}
                  className="block rounded-md px-3 py-2 text-sm transition hover:bg-[rgb(var(--panel-soft))] hover:text-ocean"
                  href={template.href}
                  download={template.fileName}
                >
                  {template.label}
                </a>
              ))}
            </div>
          </details>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-[rgb(var(--border))] px-3 text-sm font-medium transition hover:border-ocean hover:text-ocean" title="Export to Excel" onClick={onExportExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-[rgb(var(--border))] px-3 text-sm font-medium transition hover:border-ocean hover:text-ocean" title="Export to PDF" onClick={onExportPdf}>
            <Download className="h-4 w-4" />
            PDF
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-[rgb(var(--border))] px-3 text-sm font-medium transition hover:border-ocean hover:text-ocean" title="Refresh data" onClick={onRefresh}>
            <RefreshCcw className="h-4 w-4" />
            Live
          </button>
          <span className="hidden rounded-md border border-[rgb(var(--border))] px-3 py-2 text-xs font-medium text-[rgb(var(--muted))] md:inline-flex">
            Refreshed {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-ocean px-3 text-sm font-semibold text-white transition hover:bg-aqua" title="Save dashboard configuration" onClick={onSaveDashboard}>
            <ShieldCheck className="h-4 w-4" />
            Save
          </button>
          <button
            className="grid h-10 w-10 place-items-center rounded-md border border-[rgb(var(--border))] transition hover:border-ocean hover:text-ocean"
            onClick={onToggleDark}
            title="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
