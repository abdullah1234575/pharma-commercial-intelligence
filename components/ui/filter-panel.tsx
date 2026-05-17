"use client";

import { RotateCcw } from "lucide-react";
import { filterOptions } from "@/lib/pharma-data";
import type { DashboardFilters } from "@/types/dashboard";

type FilterKey = keyof DashboardFilters;

const labels: Record<FilterKey, string> = {
  year: "Year",
  quarter: "Quarter",
  month: "Month",
  region: "Region",
  territory: "Territory",
  productLine: "Product Line",
  brand: "Brand",
  medicalRep: "Medical Rep",
  manager: "Manager",
  customerType: "Customer Type",
  channel: "Channel"
};

export function FilterPanel({
  filters,
  onChange,
  onReset
}: {
  filters: DashboardFilters;
  onChange: (key: FilterKey, value: string) => void;
  onReset: () => void;
}) {
  return (
    <section className="glass-panel rounded-lg p-4 shadow-executive dark:shadow-executive-dark">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[rgb(var(--muted))]">Commercial Slicers</h2>
          <p className="text-sm text-[rgb(var(--muted))]">Filter the executive view across geography, brands, field force, and channel.</p>
        </div>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-[rgb(var(--border))] px-3 text-sm font-medium transition hover:border-ocean hover:text-ocean"
          onClick={onReset}
          title="Reset filters"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {(Object.keys(filters) as FilterKey[]).map((key) => (
          <label key={key} className="block">
            <span className="mb-1 block text-xs font-semibold text-[rgb(var(--muted))]">{labels[key]}</span>
            <select
              className="h-10 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] px-3 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
              value={filters[key]}
              onChange={(event) => onChange(key, event.target.value)}
            >
              {filterOptions[key].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}
