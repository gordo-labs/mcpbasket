"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BasketSummary } from "./types";

export const DEFAULT_BASKET_SOURCE = "http://localhost:4377/api/basket";
const REFRESH_INTERVAL_MS = 5_000;

function browserSource(): string {
  if (typeof window === "undefined") return DEFAULT_BASKET_SOURCE;
  const params = new URLSearchParams(window.location.search);
  return params.get("source") || window.localStorage.getItem("basketSource") || DEFAULT_BASKET_SOURCE;
}

async function fetchBasket(source: string): Promise<BasketSummary> {
  const response = await fetch(source, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json() as Promise<BasketSummary>;
}

export function useBasketSource() {
  const [source, setSource] = useState(browserSource);
  const [draftSource, setDraftSource] = useState(browserSource);
  const [basket, setBasket] = useState<BasketSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setBasket(await fetchBasket(source));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    }
  }, [source]);

  useEffect(() => {
    let cancelled = false;

    async function refreshOnInterval() {
      try {
        const nextBasket = await fetchBasket(source);
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

    void refreshOnInterval();
    const timer = window.setInterval(() => void refreshOnInterval(), REFRESH_INTERVAL_MS);
    window.localStorage.setItem("basketSource", source);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [source]);

  const connect = useCallback(() => {
    const nextSource = draftSource.trim() || DEFAULT_BASKET_SOURCE;
    setSource(nextSource);
    window.localStorage.setItem("basketSource", nextSource);

    const url = new URL(window.location.href);
    url.searchParams.set("source", nextSource);
    window.history.replaceState(null, "", url);
  }, [draftSource]);

  const statuses = useMemo(
    () => Object.entries(basket?.statuses || {}).sort(([left], [right]) => left.localeCompare(right)),
    [basket?.statuses],
  );

  return {
    basket,
    connect,
    draftSource,
    error,
    refresh,
    setDraftSource,
    source,
    statuses,
  };
}
