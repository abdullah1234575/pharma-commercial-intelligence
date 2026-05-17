export function ChartCard({
  title,
  subtitle,
  children,
  className = ""
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-panel rounded-lg p-4 shadow-executive dark:shadow-executive-dark ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[rgb(var(--text))]">{title}</h3>
        {subtitle ? <p className="text-xs text-[rgb(var(--muted))]">{subtitle}</p> : null}
      </div>
      <div className="h-72 min-h-72">{children}</div>
    </div>
  );
}
