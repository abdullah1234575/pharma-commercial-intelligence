"use client";

import { Download, FileSpreadsheet, Moon, RefreshCcw, Search, ShieldCheck, Sun } from "lucide-react";
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
    <header className="sticky top-0 z-20 border-b border-[rgb(var(--border))] bg-[rgb(var(--background))]/92 px-4 py-4 backdrop-blur transition dark:bg-[#020617]/95 md:px-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ocean">Global Pharma Commercial Excellence</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
              <h1 className="min-w-0 text-3xl font-semibold tracking-tight text-[rgb(var(--text))] sm:text-4xl md:text-5xl">
                Pharma Commercial Intelligence
              </h1>
              <span className="inline-flex rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[rgb(var(--muted))] sm:text-sm">
                Executive dashboard
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[rgb(var(--border))] px-3 text-sm font-medium transition hover:border-ocean hover:text-ocean"
              title="Refresh data"
              onClick={onRefresh}
            >
              <RefreshCcw className="h-4 w-4" />
              Live
            </button>
            <span className="inline-flex rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-xs font-medium text-[rgb(var(--muted))] sm:text-sm">
              Refreshed {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_1fr] xl:grid-cols-[minmax(0,1.6fr)_1fr]">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted))]" />
            <input
              className="h-12 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-10 pr-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
              placeholder="Search brands, reps, territories"
            />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <details className="group relative w-full sm:w-auto">
              <summary className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 text-sm font-medium transition hover:border-ocean hover:text-ocean sm:w-auto">
                <Download className="h-4 w-4" />
                Download Template
              </summary>
              <div className="absolute right-0 z-30 mt-2 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-2 shadow-executive dark:shadow-executive-dark sm:w-64">
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
            <button
              className="inline-flex h-12 items-center gap-2 rounded-md border border-[rgb(var(--border))] px-4 text-sm font-medium transition hover:border-ocean hover:text-ocean"
              title="Export to Excel"
              onClick={onExportExcel}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </button>
            <button
              className="inline-flex h-12 items-center gap-2 rounded-md border border-[rgb(var(--border))] px-4 text-sm font-medium transition hover:border-ocean hover:text-ocean"
              title="Export to PDF"
              onClick={onExportPdf}
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
            <button
              className="inline-flex h-12 items-center gap-2 rounded-md bg-ocean px-4 text-sm font-semibold text-white transition hover:bg-aqua"
              title="Save dashboard configuration"
              onClick={onSaveDashboard}
            >
              <ShieldCheck className="h-4 w-4" />
              Save
            </button>
            <button
              className="grid h-12 w-12 place-items-center rounded-md border border-[rgb(var(--border))] transition hover:border-ocean hover:text-ocean"
              onClick={onToggleDark}
              title="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
