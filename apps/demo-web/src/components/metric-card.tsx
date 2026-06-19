interface MetricCardProps {
  label: string;
  value: number | string;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="min-h-20 rounded-lg border border-[var(--line)] bg-white px-4 py-3">
      <span className="block text-xs font-semibold uppercase text-[var(--muted)]">{label}</span>
      <strong className="mt-2 block text-2xl leading-none text-[var(--ink)]">{value}</strong>
    </div>
  );
}
