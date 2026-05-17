export function SectionShell({
  id,
  title,
  subtitle,
  children
}: {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[rgb(var(--text))]">{title}</h2>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
