import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { KpiMetric } from "@/types/dashboard";

const statusClass = {
  positive: "text-mint bg-mint/10",
  negative: "text-danger bg-danger/10",
  neutral: "text-ocean bg-ocean/10",
  warning: "text-signal bg-signal/10"
};

export function KpiCard({ metric }: { metric: KpiMetric }) {
  const Icon =
    metric.status === "positive" ? ArrowUpRight : metric.status === "negative" ? ArrowDownRight : ArrowRight;

  return (
    <div className="glass-panel rounded-lg p-4 shadow-executive transition duration-300 hover:-translate-y-0.5 dark:shadow-executive-dark">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[rgb(var(--muted))]">{metric.label}</p>
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${statusClass[metric.status]}`}>
          <Icon className="h-3.5 w-3.5" />
          {metric.delta}
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-[rgb(var(--text))]">{metric.value}</div>
      <p className="mt-2 min-h-10 text-sm leading-5 text-[rgb(var(--muted))]">{metric.detail}</p>
    </div>
  );
}
