/**
 * Synth Options Lab — API Client
 * Interfaces with Synth's 7 API endpoints
 */

export interface OptionPricingResponse {
  asset: string;
  strikePrice: number;
  callPrice: number;
  putPrice: number;
  expiryTime: string;
}

export interface PercentileResponse {
  asset: string;
  timeHorizon: string;
  percentiles: {
    p0_5: number;
    p5: number;
    p20: number;
    p35: number;
    p50: number;
    p65: number;
    p80: number;
    p95: number;
    p99_5: number;
  };
}

export interface VolatilityResponse {
  asset: string;
  synthForwardVol: number;
  realizedVol: number;
  volRatio: number;
  timestamp: string;
}

export interface LPProbabilitiesResponse {
  asset: string;
  strikes: Array<{
    strike: number;
    pitmCall: number;
    pitmPut: number;
  }>;
}

export interface LPBoundsResponse {
  asset: string;
  ranges: Array<{
    lower: number;
    upper: number;
    probability: number;
  }>;
}

export interface LiquidationProbabilityResponse {
  asset: string;
  priceLevel: number;
  probability6h: number;
  probability12h: number;
  probability18h: number;
  probability24h: number;
}

export interface PolymarketComparisonResponse {
  asset: string;
  synthProbability: number;
  polymarketPrice: number;
  discrepancy: number;
  signal: "BUY" | "SELL" | "NEUTRAL";
}

class SynthClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.baseUrl = process.env.NEXT_PUBLIC_SYNTH_API_URL || "https://api.synth.io";
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_SYNTH_API_KEY || "";
  }

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Synth API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Endpoint 1: Option Pricing
   */
  async getOptionPricing(asset: string, strikePrice?: number): Promise<OptionPricingResponse> {
    return this.request<OptionPricingResponse>("/insights/option-pricing", {
      asset,
      ...(strikePrice && { strike: strikePrice }),
    });
  }

  /**
   * Endpoint 2: Prediction Percentiles (9-point distribution)
   */
  async getPredictionPercentiles(asset: string): Promise<PercentileResponse> {
    return this.request<PercentileResponse>("/prediction-percentiles", {
      asset,
    });
  }

  /**
   * Endpoint 3: Volatility (forecast + realized)
   */
  async getVolatility(asset: string): Promise<VolatilityResponse> {
    return this.request<VolatilityResponse>("/insights/volatility", {
      asset,
    });
  }

  /**
   * Endpoint 4: LP Probabilities (P(ITM) by strike)
   */
  async getLPProbabilities(asset: string): Promise<LPProbabilitiesResponse> {
    return this.request<LPProbabilitiesResponse>("/insights/lp-probabilities", {
      asset,
    });
  }

  /**
   * Endpoint 5: LP Bounds (range probabilities)
   */
  async getLPBounds(asset: string): Promise<LPBoundsResponse> {
    return this.request<LPBoundsResponse>("/insights/lp-bounds", {
      asset,
    });
  }

  /**
   * Endpoint 6: Liquidation Probabilities
   */
  async getLiquidationProbabilities(asset: string, priceLevel: number): Promise<LiquidationProbabilityResponse> {
    return this.request<LiquidationProbabilityResponse>("/insights/liquidation", {
      asset,
      priceLevel,
    });
  }

  /**
   * Endpoint 7: Polymarket Comparison
   */
  async getPolymarketComparison(asset: string): Promise<PolymarketComparisonResponse> {
    return this.request<PolymarketComparisonResponse>("/insights/polymarket/up-down/daily", {
      asset,
    });
  }
}

// Export singleton instance
export const synthClient = new SynthClient();

export default SynthClient;
