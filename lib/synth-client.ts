/**
 * Synth API Client
 * Typed HTTP client with error handling & retry logic
 * All requests go through server-side proxy (/api/synth/*)
 */

import {
  OptionPrice,
  Distribution,
  VolatilityData,
  SynthOptionPricingResponse,
  SynthDistributionResponse,
  SynthVolatilityResponse,
  Percentile,
  PolymarketEdge,
  RequestConfig,
} from "@/types";

// ============================================
// CONFIG & HELPERS
// ============================================

const API_BASE = "/api/synth";
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRIES = 2;
const RETRY_DELAY = 1000; // ms

interface FetchOptions {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

// ============================================
// HTTP CLIENT WITH RETRY
// ============================================

async function fetchWithRetry(
  endpoint: string,
  options: FetchOptions = {},
  retries: number = DEFAULT_RETRIES
): Promise<Response> {
  const timeout = options.timeout || DEFAULT_TIMEOUT;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(endpoint, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      // Retry on 5xx or 429
      if ((response.status >= 500 || response.status === 429) && attempt < retries) {
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      const delay = RETRY_DELAY * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error("Request failed after max retries");
}

// ============================================
// OPTION PRICING
// ============================================

export async function getOptionPricing(
  asset: string,
  config?: Partial<RequestConfig>
): Promise<OptionPrice> {
  const params = new URLSearchParams({
    asset,
    ...Object.fromEntries(
      Object.entries(config || {}).filter(([, v]) => v !== undefined)
    ),
  });

  const response = await fetchWithRetry(`${API_BASE}/option-pricing?${params}`);
  const data: SynthOptionPricingResponse = await response.json();

  return {
    call: data.call_price,
    put: data.put_price,
    bid: data.bid,
    ask: data.ask,
    mark: data.mark,
    timestamp: data.timestamp,
  };
}

// ============================================
// DISTRIBUTION (PERCENTILES)
// ============================================

export async function getDistribution(
  asset: string,
  config?: Partial<RequestConfig>
): Promise<Distribution> {
  const params = new URLSearchParams({
    asset,
    ...Object.fromEntries(
      Object.entries(config || {}).filter(([, v]) => v !== undefined)
    ),
  });

  const response = await fetchWithRetry(`${API_BASE}/percentiles?${params}`);
  const data: SynthDistributionResponse = await response.json();

  // Convert percentile array to object
  const percentiles: Record<string, number> = {};
  for (const p of data.percentiles) {
    percentiles[p.percentile] = p.value;
  }

  return {
    percentiles,
    mean: data.mean,
    median: data.median,
    stdDev: data.std_dev,
    min: data.min,
    max: data.max,
    timestamp: data.timestamp,
  };
}

// ============================================
// VOLATILITY
// ============================================

export async function getVolatility(
  asset: string,
  config?: Partial<RequestConfig>
): Promise<VolatilityData> {
  const params = new URLSearchParams({
    asset,
    ...Object.fromEntries(
      Object.entries(config || {}).filter(([, v]) => v !== undefined)
    ),
  });

  const response = await fetchWithRetry(`${API_BASE}/volatility?${params}`);
  const data: SynthVolatilityResponse = await response.json();

  return {
    implied: data.implied_volatility,
    realized: data.realized_volatility,
    ratio: data.ratio,
    skew: data.skew,
    term: data.term,
    timestamp: data.timestamp,
  };
}

// ============================================
// LP PROBABILITIES
// ============================================

export async function getLpProbabilities(
  asset: string,
  config?: Partial<RequestConfig>
): Promise<Record<string, number>> {
  const params = new URLSearchParams({
    asset,
    ...Object.fromEntries(
      Object.entries(config || {}).filter(([, v]) => v !== undefined)
    ),
  });

  const response = await fetchWithRetry(`${API_BASE}/lp-probabilities?${params}`);
  const data = await response.json();

  return data.probabilities || {};
}

// ============================================
// LIQUIDATION DATA
// ============================================

export async function getLiquidationData(
  asset: string,
  config?: Partial<RequestConfig>
): Promise<{
  level: number;
  confidence: number;
  timestamp: number;
}> {
  const params = new URLSearchParams({
    asset,
    ...Object.fromEntries(
      Object.entries(config || {}).filter(([, v]) => v !== undefined)
    ),
  });

  const response = await fetchWithRetry(`${API_BASE}/liquidation?${params}`);
  const data = await response.json();

  return {
    level: data.liquidation_level || 0,
    confidence: data.confidence || 0,
    timestamp: data.timestamp,
  };
}

// ============================================
// POLYMARKET EDGES
// ============================================

export async function getPolymarketEdge(
  asset: string,
  timeframe: "daily" | "hourly" = "daily"
): Promise<PolymarketEdge> {
  const endpoint = timeframe === "hourly" ? "up-down/hourly" : "up-down/daily";

  const params = new URLSearchParams({
    asset,
  });

  const response = await fetchWithRetry(`${API_BASE}/polymarket/${endpoint}?${params}`);
  const data = await response.json();

  const synthPrice = data.synth_price || 0;
  const polyPrice = data.polymarket_price || 0;
  const edge = synthPrice - polyPrice;

  return {
    asset,
    polymarketPrice: polyPrice,
    synthPrice: synthPrice,
    edge: edge,
    edgePercent: polyPrice > 0 ? (edge / polyPrice) * 100 : 0,
    direction:
      edge > 0.02 ? "bullish" : edge < -0.02 ? "bearish" : "neutral",
    timestamp: data.timestamp,
  };
}

// ============================================
// RANGE PREDICTION (POLYMARKET)
// ============================================

export async function getPolymarketRange(
  asset: string
): Promise<{
  lowProbability: number;
  midProbability: number;
  highProbability: number;
  timestamp: number;
}> {
  const params = new URLSearchParams({ asset });

  const response = await fetchWithRetry(`${API_BASE}/polymarket/range?${params}`);
  const data = await response.json();

  return {
    lowProbability: data.low_prob || 0,
    midProbability: data.mid_prob || 0,
    highProbability: data.high_prob || 0,
    timestamp: data.timestamp,
  };
}

// ============================================
// BATCH HELPER (for multiple assets)
// ============================================

export async function getMultipleAssetData(
  assets: string[]
): Promise<
  Record<
    string,
    {
      pricing: OptionPrice;
      distribution: Distribution;
      volatility: VolatilityData;
    }
  >
> {
  const results: Record<
    string,
    {
      pricing: OptionPrice;
      distribution: Distribution;
      volatility: VolatilityData;
    }
  > = {};

  for (const asset of assets) {
    try {
      const [pricing, distribution, volatility] = await Promise.all([
        getOptionPricing(asset),
        getDistribution(asset),
        getVolatility(asset),
      ]);

      results[asset] = {
        pricing,
        distribution,
        volatility,
      };
    } catch (error) {
      console.error(`Failed to fetch data for ${asset}:`, error);
      // Continue with other assets
    }
  }

  return results;
}

// ============================================
// ERROR HANDLING WRAPPER
// ============================================

export class SynthClientError extends Error {
  constructor(
    public endpoint: string,
    public statusCode?: number,
    message?: string
  ) {
    super(message || `Synth API error on ${endpoint}`);
    this.name = "SynthClientError";
  }
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  defaultValue: T,
  errorLabel: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`${errorLabel}:`, error);
    return defaultValue;
  }
}
