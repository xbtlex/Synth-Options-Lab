/**
 * SWR hooks for real-time Synth data
 * Automatic caching, refresh, and error handling
 */

import useSWR from "swr";
import {
  OptionPrice,
  Distribution,
  VolatilityData,
  PolymarketEdge,
  Percentile,
  ApiResponse,
} from "@/types";

// ============================================
// FETCHER (with error handling)
// ============================================

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error("API request failed");
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
}

// ============================================
// OPTION PRICING
// ============================================

export function useSynthOptionPricing(asset: string) {
  const { data, error, isLoading } = useSWR<OptionPrice>(
    asset ? `/api/synth/option-pricing?asset=${asset}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 60s dedup
      focusThrottleInterval: 300000, // 5min between refetches on focus
      refreshInterval: 60000, // Refresh every 60s for live pricing
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  return {
    data,
    error,
    isLoading,
    isValid: !error && data,
  };
}

// ============================================
// DISTRIBUTION (PERCENTILES)
// ============================================

export function useDistribution(asset: string) {
  const { data, error, isLoading } = useSWR<Distribution>(
    asset ? `/api/synth/percentiles?asset=${asset}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5min dedup
      focusThrottleInterval: 600000, // 10min between refetches on focus
      refreshInterval: 300000, // Refresh every 5min for distribution
      errorRetryCount: 2,
      errorRetryInterval: 2000,
    }
  );

  return {
    data,
    error,
    isLoading,
    isValid: !error && data,
    percentiles: data?.percentiles
      ? Object.entries(data.percentiles).map(([p, v]) => ({
          percentile: Number(p),
          value: v,
        }))
      : [],
  };
}

// ============================================
// VOLATILITY
// ============================================

export function useVolatility(asset: string) {
  const { data, error, isLoading } = useSWR<VolatilityData>(
    asset ? `/api/synth/volatility?asset=${asset}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10min dedup
      focusThrottleInterval: 900000, // 15min between refetches
      refreshInterval: 300000, // Refresh every 5min
      errorRetryCount: 2,
      errorRetryInterval: 2000,
    }
  );

  return {
    data,
    error,
    isLoading,
    isValid: !error && data,
  };
}

// ============================================
// LP PROBABILITIES
// ============================================

export function useLpProbabilities(asset: string) {
  const { data, error, isLoading } = useSWR<Record<string, number>>(
    asset ? `/api/synth/lp-probabilities?asset=${asset}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000,
      focusThrottleInterval: 900000,
      refreshInterval: 600000, // 10min refresh
      errorRetryCount: 2,
    }
  );

  return {
    data: data || {},
    error,
    isLoading,
  };
}

// ============================================
// POLYMARKET EDGES
// ============================================

export function usePolymarketEdge(
  asset: string,
  timeframe: "daily" | "hourly" = "daily"
) {
  const endpoint =
    timeframe === "hourly" ? "up-down/hourly" : "up-down/daily";

  const { data, error, isLoading } = useSWR<PolymarketEdge>(
    asset
      ? `/api/synth/polymarket/${endpoint}?asset=${asset}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5min dedup
      focusThrottleInterval: 600000, // 10min throttle
      refreshInterval: 300000, // 5min refresh
      errorRetryCount: 2,
    }
  );

  return {
    data,
    error,
    isLoading,
    edgeDirection: data?.direction || "neutral",
    edgePercent: data?.edgePercent || 0,
  };
}

// ============================================
// LIQUIDATION DATA
// ============================================

export function useLiquidationData(asset: string) {
  const { data, error, isLoading } = useSWR<{
    level: number;
    confidence: number;
    timestamp: number;
  }>(
    asset ? `/api/synth/liquidation?asset=${asset}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000,
      focusThrottleInterval: 900000,
      refreshInterval: 300000, // Liquidation data updates every 5min
      errorRetryCount: 2,
    }
  );

  return {
    data,
    error,
    isLoading,
  };
}

// ============================================
// MULTI-ASSET HOOK
// ============================================

export function useMultiAssetData(assets: string[]) {
  const results: Record<string, any> = {};
  const isLoading = false;
  let hasError = false;

  for (const asset of assets) {
    const pricing = useSynthOptionPricing(asset);
    const distribution = useDistribution(asset);
    const volatility = useVolatility(asset);

    results[asset] = {
      pricing: pricing.data,
      distribution: distribution.data,
      volatility: volatility.data,
      isLoading: pricing.isLoading || distribution.isLoading || volatility.isLoading,
      error: pricing.error || distribution.error || volatility.error,
    };

    if (pricing.error || distribution.error || volatility.error) {
      hasError = true;
    }
  }

  return {
    data: results,
    isLoading,
    error: hasError ? new Error("Some assets failed to load") : null,
  };
}
