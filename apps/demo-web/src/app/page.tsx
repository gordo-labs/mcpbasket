"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_SOURCE = "http://localhost:4377/api/basket";
const REFRESH_MS = 5000;

type Money = {
  amount?: number;
  currency?: string;
  display?: string;
};

type BasketItem = {
  id: string;
  status?: string;
  quantity?: number;
  title?: string;
  brand?: string;
  merchant?: {
    name?: string;
    domain?: string;
  };
  url?: string;
  image?: string;
  price?: Money;
  locator?: string;
  checkout?: {
    readiness?: string;
  };
  reason?: string;
};

type BasketSummary = {
  context?: {
    title?: string;
    intent?: string;
  };
  itemCount?: number;
  checkoutReady?: number;
  missingCheckoutLocator?: number;
  totalsByCurrency?: Record<string, number>;
  statuses?: Record<string, number>;
  items?: BasketItem[];
};

function money(value?: Money) {
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

function totalText(totals?: Record<string, number>) {
  const entries = Object.entries(totals || {});
  if (entries.length === 0) return "-";
  return entries
    .map(([currency, amount]) => money({ amount, currency }))
    .join(" + ");
}

function statusTone(status?: string) {
  if (status == null) return "border-slate-300 bg-white text-slate-600";
  if (["approved", "ready_for_checkout", "ordered"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (["shortlisted", "needs_review"].includes(status)) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  if (status === "rejected") {
    return "border-red-200 bg-red-50 text-red-800";
  }
  return "border-slate-300 bg-white text-slate-600";
}

function metric(label: string, value: string | number) {
  return (
    <div className="min-h-20 rounded-lg border border-[var(--line)] bg-white px-4 py-3">
      <span className="block text-xs font-semibold uppercase text-[var(--muted)]">
        {label}
      </span>
      <strong className="mt-2 block text-2xl leading-none text-[var(--ink)]">
        {value}
      </strong>
    </div>
  );
}

function initialSource() {
  if (typeof window === "undefined") return DEFAULT_SOURCE;
  const params = new URLSearchParams(window.location.search);
  return params.get("source") || window.localStorage.getItem("basketSource") || DEFAULT_SOURCE;
}

function BasketCard({ item }: { item: BasketItem }) {
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
          <span className="text-lg font-bold text-[var(--ink)]">
            {money(item.price)}
          </span>
          <span className={`h-7 rounded-full border px-2.5 pt-1 text-xs ${statusTone(item.status)}`}>
            {item.status || "candidate"}
          </span>
          <span className="h-7 rounded-full border border-[var(--line)] bg-white px-2.5 pt-1 text-xs text-[var(--muted)]">
            {item.checkout?.readiness || "unknown"}
          </span>
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

export default function Home() {
  const [source, setSource] = useState(initialSource);
  const [draftSource, setDraftSource] = useState(initialSource);
  const [basket, setBasket] = useState<BasketSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBasket = useCallback(async () => {
    try {
      const response = await fetch(source, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      setBasket(await response.json());
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    }
  }, [source]);

  useEffect(() => {
    let cancelled = false;

    async function refreshBasket() {
      try {
        const response = await fetch(source, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const nextBasket = await response.json();
        if (!cancelled) {
          setBasket(nextBasket);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      }
    }

    void refreshBasket();
    const timer = window.setInterval(refreshBasket, REFRESH_MS);
    window.localStorage.setItem("basketSource", source);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [source]);

  const statuses = useMemo(
    () => Object.entries(basket?.statuses || {}).sort(([a], [b]) => a.localeCompare(b)),
    [basket?.statuses],
  );

  function connect() {
    const nextSource = draftSource.trim() || DEFAULT_SOURCE;
    setSource(nextSource);
    window.localStorage.setItem("basketSource", nextSource);
    const url = new URL(window.location.href);
    url.searchParams.set("source", nextSource);
    window.history.replaceState(null, "", url);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] px-7 py-7 max-sm:px-4">
      <header className="mb-5 grid grid-cols-[minmax(0,1fr)_minmax(360px,520px)] items-end gap-6 max-lg:grid-cols-1">
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-[var(--green)]">
            MCPBasket
          </p>
          <h1 className="text-3xl font-bold leading-tight text-[var(--ink)]">
            {basket?.context?.title || "Agent Basket"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            {basket?.context?.intent ||
              "Neutral pre-checkout workspace for agent purchase candidates."}
          </p>
        </div>
        <div className="grid gap-2">
          <label htmlFor="source" className="text-xs font-semibold uppercase text-[var(--muted)]">
            Source
          </label>
          <div className="grid grid-cols-[minmax(0,1fr)_84px_44px] gap-2 max-sm:grid-cols-[minmax(0,1fr)_72px_44px]">
            <input
              id="source"
              value={draftSource}
              onChange={(event) => setDraftSource(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") connect();
              }}
              className="h-11 min-w-0 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--green)]"
              spellCheck={false}
            />
            <button
              onClick={connect}
              className="h-11 rounded-md border border-[var(--line)] bg-white text-sm font-semibold text-[var(--ink)] hover:border-[#9fac9f]"
            >
              Connect
            </button>
            <button
              onClick={loadBasket}
              className="h-11 rounded-md border border-[var(--line)] bg-white text-sm font-semibold text-[var(--ink)] hover:border-[#9fac9f]"
              aria-label="Refresh"
              title="Refresh"
            >
              R
            </button>
          </div>
        </div>
      </header>

      <section className="mb-4 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {metric("Items", basket?.itemCount || 0)}
        {metric("Ready", basket?.checkoutReady || 0)}
        {metric("Missing locator", basket?.missingCheckoutLocator || 0)}
        {metric("Total", totalText(basket?.totalsByCurrency))}
      </section>

      <section className="mb-4 flex min-h-8 flex-wrap gap-2">
        {statuses.length ? (
          statuses.map(([status, count]) => (
            <span key={status} className={`h-7 rounded-full border px-2.5 pt-1 text-xs ${statusTone(status)}`}>
              {status}: {count}
            </span>
          ))
        ) : (
          <span className="h-7 rounded-full border border-[var(--line)] bg-white px-2.5 pt-1 text-xs text-[var(--muted)]">
            empty: 0
          </span>
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
            <code className="mt-2 block font-mono text-xs text-[var(--blue)]">
              {DEFAULT_SOURCE}
            </code>
          </div>
        )}
      </section>
    </main>
  );
}
