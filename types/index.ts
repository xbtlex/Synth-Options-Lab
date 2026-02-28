/**
 * Core types for Synth Options Lab
 * Distribution-based option analytics with real Synth API data
 */

// ============================================
// PRICING & MARKET DATA
// ============================================

export interface OptionPrice {
  call: number;
  put: number;
  bid?: number;
  ask?: number;
  mark?: number;
  timestamp: number;
}

export interface Distribution {
  percentiles: Record<string, number>; // e.g., { "5": 42100, "25": 43000, "50": 44000, "75": 45000, "95": 46000 }
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  timestamp: number;
}

export interface VolatilityData {
  implied: number; // Synth IV
  realized: number; // Historical volatility
  ratio: number; // IV / Realized
  skew?: number; // Vol smile slope
  term?: number; // Forward vol premium
  timestamp: number;
}

export interface Percentile {
  percentile: number;
  value: number;
}

// ============================================
// OPTIONS ANALYTICS
// ============================================

export interface OptionLeg {
  type: "call" | "put";
  strike: number;
  quantity: number;
  side: "long" | "short";
  price?: number; // Entry price paid/received
}

export interface Strategy {
  legs: OptionLeg[];
  name?: string;
  description?: string;
}

export interface StrategyMetrics {
  maxProfit: number;
  maxLoss: number;
  breakeven: number[];
  probabilityOfProfit: number;
  expectedValue: number;
  expectedProfit: number;
  expectedLoss: number;
  riskRewardRatio: number;
  sharpeRatio?: number;
}

export interface DistributionAnalysis {
  skewness: number;
  tailRatio: number; // 95th / 5th percentile
  maxDrawdown: number; // From mean
  maxUpside: number; // From mean
  iqrPct: number; // Interquartile range as % of median
  var95: number; // Value at risk (5th percentile loss)
  cvar95: number; // Conditional VaR (mean of tail)
}

// ============================================
// SYNTH API RESPONSES
// ============================================

export interface SynthOptionPricingResponse {
  asset: string;
  timeframe: string;
  call_price: number;
  put_price: number;
  bid?: number;
  ask?: number;
  mark?: number;
  timestamp: number;
}

export interface SynthDistributionResponse {
  asset: string;
  timeframe: string;
  percentiles: Percentile[];
  mean: number;
  median: number;
  std_dev: number;
  min: number;
  max: number;
  timestamp: number;
}

export interface SynthVolatilityResponse {
  asset: string;
  implied_volatility: number;
  realized_volatility: number;
  ratio: number;
  skew?: number;
  term?: number;
  timestamp: number;
}

export interface SynthLpProbabilitiesResponse {
  asset: string;
  timeframe: string;
  probabilities: Record<string, number>;
  confidence: number;
  timestamp: number;
}

export interface PolymarketEdge {
  asset: string;
  polymarketPrice: number;
  synthPrice: number;
  edge: number; // Synth price - Polymarket price
  edgePercent: number;
  direction: "bullish" | "bearish" | "neutral";
  timestamp: number;
}

// ============================================
// COMPONENT PROPS
// ============================================

export interface VolScannerCardProps {
  asset: string;
  synthVol: number;
  realizedVol: number;
  regime?: "high" | "normal" | "low";
  onClick?: () => void;
}

export interface OptionChainTableProps {
  asset: string;
  strikes: number[];
  data: Record<
    number,
    {
      call: number;
      put: number;
      pitmCall: number;
      pitmPut: number;
      iv: number;
      edge: number;
      recommendation: "buy" | "sell" | "neutral";
    }
  >;
  selectedStrike?: number;
  onStrikeSelect?: (strike: number) => void;
}

export interface PercentileConeChartProps {
  data: Distribution;
  currentPrice: number;
  title?: string;
  height?: number;
  width?: number;
}

export interface PnLTrackerProps {
  positions: Position[];
  distribution?: Distribution;
}

export interface Position {
  symbol: string;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  delta?: number;
  gamma?: number;
  vega?: number;
  theta?: number;
  pnl?: number;
  pnlPercent?: number;
}

// ============================================
// API RESPONSE WRAPPER
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: "success" | "error" | "loading";
  timestamp: number;
}

export interface RequestConfig {
  asset: string;
  timeframe?: string;
  strike?: number;
  retry?: number;
  timeout?: number;
}
