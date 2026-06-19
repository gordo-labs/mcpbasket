import type { Money } from "./types";

export function formatMoney(value?: Money): string {
  if (!value) return "-";
  if (value.display) return value.display;
  if (value.amount == null) return "-";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: value.currency || "USD",
    }).format(value.amount);
  } catch {
    return `${value.amount} ${value.currency || ""}`.trim();
  }
}

export function formatTotals(totals?: Record<string, number>): string {
  const entries = Object.entries(totals || {});
  if (entries.length === 0) return "-";

  return entries
    .map(([currency, amount]) => formatMoney({ amount, currency }))
    .join(" + ");
}

export function statusTone(status?: string): string {
  if (status == null) return "border-slate-300 bg-white text-slate-600";
  if (["approved", "ready_for_checkout", "ordered"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (["shortlisted", "needs_review"].includes(status)) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-800";
  return "border-slate-300 bg-white text-slate-600";
}
