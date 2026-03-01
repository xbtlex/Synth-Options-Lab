/**
 * Synth Options Lab — Type Definitions
 */

export type Asset = "BTC" | "ETH" | "SOL" | "SPY" | "NVDA" | "GOOGL" | "TSLA" | "AAPL" | "XAU";

export type TimeHorizon = "6h" | "12h" | "24h";

export type OptionType = "CALL" | "PUT";

export type OptionSide = "BUY" | "SELL";

export type StrategyType =
  | "LONG_CALL"
  | "LONG_PUT"
  | "BULL_CALL_SPREAD"
  | "BEAR_PUT_SPREAD"
  | "STRADDLE"
  | "STRANGLE"
  | "IRON_CONDOR"
  | "BUTTERFLY";

export type VolatilityRegime = "HIGH" | "NORMAL" | "LOW";

export type Recommendation = "BUY" | "SELL" | "FAIR";

export interface Distribution {
  timeHorizon: TimeHorizon;
  currentPrice: number;
  percentile_0_5: number;
  percentile_5: number;
  percentile_20: number;
  percentile_35: number;
  percentile_50: number;
  percentile_65: number;
  percentile_80: number;
  percentile_95: number;
  percentile_99_5: number;
  mean: number;
  stddev: number;
  skewness: number;
  kurtosis: number;
}

export interface Greeks {
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  rho: number;
}

export interface OptionPricing {
  strike: number;
  callPrice: number;
  putPrice: number;
  callIV: number;
  putIV: number;
  callDelta: number;
  putDelta: number;
  gamma: number;
  vega: number;
  theta: number;
  callProb: number;
  putProb: number;
  callEdge: number;
  putEdge: number;
  callRec: Recommendation;
  putRec: Recommendation;
}

export interface StrategyLeg {
  side: OptionSide;
  type: OptionType;
  strike: number;
  quantity: number;
  premium: number;
  delta: number;
}

export interface StrategyMetrics {
  pop: number;
  expectedValue: number;
  expectedProfitIfWin: number;
  expectedLossIfLose: number;
  maxProfit: number;
  maxLoss: number;
  riskReward: number;
  breakeven: number[];
  synthPop: number;
  bsPop: number;
}

export interface VolProfile {
  asset: Asset;
  synthForwardVol: number;
  realizedVol: number;
  volRatio: number;
  regime: VolatilityRegime;
  trend: "UP" | "DOWN" | "STABLE";
  skew: number;
  smile: OptionChainVol[];
}

export interface OptionChainVol {
  moneyness: number; // strike / spot
  impliedVol: number;
}

export interface Mispricing {
  asset: Asset;
  strike: number;
  type: OptionType;
  synthPrice: number;
  bsPrice: number;
  mispricing: number;
  mispricingPct: number;
  direction: "UNDERPRICED" | "OVERPRICED";
  confidence: number; // 0-1
}

export interface PortfolioRisk {
  totalDelta: number;
  totalGamma: number;
  totalVega: number;
  totalTheta: number;
  var95: number; // 95% Value at Risk
  cvar95: number; // Conditional VaR
  maxLoss: number;
}
