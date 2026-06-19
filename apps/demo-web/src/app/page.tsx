"use client";

import { BasketCard } from "@/components/basket-card";
import { MetricCard } from "@/components/metric-card";
import { SourceControl } from "@/components/source-control";
import { StatusBadge } from "@/components/status-badge";
import { formatTotals } from "@/features/basket/format";
import { DEFAULT_BASKET_SOURCE, useBasketSource } from "@/features/basket/use-basket-source";

export default function Home() {
  const {
    basket,
    connect,
    draftSource,
    error,
    refresh,
    setDraftSource,
    source,
    statuses,
  } = useBasketSource();

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] px-7 py-7 max-sm:px-4">
      <header className="mb-5 grid grid-cols-[minmax(0,1fr)_minmax(360px,520px)] items-end gap-6 max-lg:grid-cols-1">
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-[var(--green)]">MCPBasket</p>
          <h1 className="text-3xl font-bold leading-tight text-[var(--ink)]">
            {basket?.context?.title || "Agent Basket"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            {basket?.context?.intent || "Neutral pre-checkout workspace for agent purchase candidates."}
          </p>
        </div>
        <SourceControl
          draftSource={draftSource}
          onConnect={connect}
          onRefresh={refresh}
          onSourceChange={setDraftSource}
        />
      </header>

      <section className="mb-4 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <MetricCard label="Items" value={basket?.itemCount || 0} />
        <MetricCard label="Ready" value={basket?.checkoutReady || 0} />
        <MetricCard label="Missing locator" value={basket?.missingCheckoutLocator || 0} />
        <MetricCard label="Total" value={formatTotals(basket?.totalsByCurrency)} />
      </section>

      <section className="mb-4 flex min-h-8 flex-wrap gap-2">
        {statuses.length ? (
          statuses.map(([status, count]) => (
            <StatusBadge key={status} status={status}>
              {status}: {count}
            </StatusBadge>
          ))
        ) : (
          <StatusBadge>empty: 0</StatusBadge>
        )}
      </section>

      <section className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-3 max-sm:grid-cols-1">
        {error ? (
          <div className="col-span-full rounded-lg border border-dashed border-[#b9c4ba] bg-white/70 p-8 text-sm text-[var(--muted)]">
            <strong className="block text-[var(--ink)]">Basket source unavailable.</strong>
            <span className="mt-2 block">{source}</span>
            <span className="mt-2 block">{error}</span>
          </div>
        ) : basket?.items?.length ? (
          basket.items.map((item) => <BasketCard key={item.id} item={item} />)
        ) : (
          <div className="col-span-full rounded-lg border border-dashed border-[#b9c4ba] bg-white/70 p-8 text-sm text-[var(--muted)]">
            <strong className="block text-[var(--ink)]">No products in the basket.</strong>
            <code className="mt-2 block font-mono text-xs text-[var(--blue)]">{DEFAULT_BASKET_SOURCE}</code>
          </div>
        )}
      </section>
    </main>
  );
}
