import { formatMoney } from "@/features/basket/format";
import type { BasketItem } from "@/features/basket/types";
import { StatusBadge } from "./status-badge";

interface BasketCardProps {
  item: BasketItem;
}

export function BasketCard({ item }: BasketCardProps) {
  const merchant = item.merchant?.name || item.merchant?.domain || "Unknown merchant";

  return (
    <article className="grid min-h-42 grid-cols-[112px_minmax(0,1fr)] gap-3 rounded-lg border border-[var(--line)] bg-white p-3 shadow-[0_14px_34px_rgba(20,32,26,0.08)] max-sm:grid-cols-[92px_minmax(0,1fr)]">
      <div className="grid h-36 w-28 place-items-center overflow-hidden rounded-md border border-[#d1d9d0] bg-[#e8ece5] text-center text-xs text-[var(--muted)] max-sm:h-30 max-sm:w-23">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        ) : (
          "No image"
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <h2 className="overflow-wrap-anywhere text-base font-bold leading-snug text-[var(--ink)]">
          {item.title || "Untitled product"}
        </h2>
        <p className="overflow-wrap-anywhere text-sm text-[var(--muted)]">
          {item.url ? (
            <a href={item.url} target="_blank" rel="noreferrer" className="text-[var(--blue)]">
              {merchant}
            </a>
          ) : (
            merchant
          )}{" "}
          - Qty {item.quantity || 1}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold text-[var(--ink)]">{formatMoney(item.price)}</span>
          <StatusBadge status={item.status}>{item.status || "candidate"}</StatusBadge>
          <StatusBadge>{item.checkout?.readiness || "unknown"}</StatusBadge>
        </div>
        <p className="overflow-wrap-anywhere text-sm leading-snug text-[var(--muted)]">
          {item.reason || "No rationale captured."}
        </p>
        <p className="overflow-wrap-anywhere mt-auto text-xs leading-snug text-[var(--muted)]">
          {item.locator || "No checkout locator"}
        </p>
      </div>
    </article>
  );
}
