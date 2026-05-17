"use client";

import {
  Activity,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  ChevronRight,
  Gauge,
  Map,
  Stethoscope,
  Users
} from "lucide-react";

const nav = [
  { id: "summary", label: "Executive Summary", icon: Gauge },
  { id: "sales", label: "Sales Performance", icon: BarChart3 },
  { id: "market", label: "Market Intelligence", icon: Activity },
  { id: "territory", label: "Territory", icon: Map },
  { id: "reps", label: "Medical Reps", icon: Stethoscope },
  { id: "forecast", label: "Forecasting", icon: BrainCircuit },
  { id: "customers", label: "Customers", icon: Users }
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-5 lg:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-ocean text-white">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ocean">Pharma CI</p>
          <h1 className="text-lg font-semibold leading-tight">Commercial Intelligence</h1>
        </div>
      </div>
      <nav className="space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="group flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--panel-soft))] hover:text-ocean"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
            </a>
          );
        })}
      </nav>
      <div className="mt-8 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[rgb(var(--muted))]">Role</p>
        <p className="mt-1 text-sm font-semibold">Executive Leadership</p>
        <p className="mt-2 text-xs leading-5 text-[rgb(var(--muted))]">Access-ready for CEO, BU Head, Commercial Excellence, Sales, Marketing, and Finance views.</p>
      </div>
    </aside>
  );
}
