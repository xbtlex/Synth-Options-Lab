/**
 * Synth Data API — Type definitions
 * Covers all 7 endpoints + internal option/strategy types
 */

// Core enums
export type Asset = 'BTC' | 'ETH' | 'SOL'
export type Timeframe = '1h' | '24h' | '7d'
export type OptionType = 'call' | 'put'
export type LegDirection = 'buy' | 'sell'

// ENDPOINT 1: Option Pricing
export interface OptionPricingResponse {
  asset: Asset
  timestamp: number
  expiration: number
  strikes: StrikeData[]
  current_price: number
}

export interface StrikeData {
  strike: number
  call_price: number
  put_price: number
  call_iv: number
  put_iv: number
}

// ENDPOINT 2: Prediction Percentiles
export interface PredictionPercentilesResponse {
  asset: Asset
  timestamp: number
  timeframe: Timeframe
  current_price: number
  percentiles: Record<string, number>
  distribution_type: 'lognormal' | 'student-t' | 'mixture'
  confidence_interval: {
    lower: number
    upper: number
    confidence_level: number
  }
}

// ENDPOINT 3: Volatility
export interface VolatilityResponse {
  asset: Asset
  timestamp: number
  timeframe: Timeframe
  implied_volatility: number
  realized_volatility: number
  volatility_of_volatility: number
  skew: number
  kurtosis: number
  term_structure: { tenor: string; volatility: number }[]
}

// ENDPOINT 4: LP Probabilities
export interface LPProbabilitiesResponse {
  asset: Asset
  timestamp: number
  timeframe: Timeframe
  probabilities: { up: number; down: number; unchanged: number }
  confidence: number
  consensus_probability: number
}

// ENDPOINT 5: LP Bounds
export interface LPBoundsResponse {
  asset: Asset
  timestamp: number
  timeframe: Timeframe
  bounds: { lower: number; upper: number; probability: number }[]
  recommended_spreads: {
    type: 'iron_condor' | 'butterfly' | 'strangle' | 'straddle'
    lower_strike: number
    upper_strike: number
    expected_premium: number
    max_profit: number
    max_loss: number
    probability_of_max_profit: number
  }[]
}

// ENDPOINT 6: Liquidation Risk
export interface LiquidationRiskResponse {
  asset: Asset
  timestamp: number
  liquidation_price: number
  liquidation_probability_24h: number
  liquidation_probability_7d: number
  leverage_level: number
  funding_rate: number
  open_interest: number
  recent_liquidations: {
    timestamp: number
    price: number
    amount: number
    direction: 'long' | 'short'
  }[]
}

// ENDPOINT 7: Polymarket Cross Reference
export interface PolymarketCrossRefResponse {
  asset: Asset
  timestamp: number
  polymarket_markets: {
    market_id: string
    title: string
    question: string
    current_price: number
    volume_24h: number
    expiration: number
    synth_probability: number
    implied_edge: number
    confidence: number
  }[]
}

// --- Internal strategy types ---

export interface StrategyLeg {
  direction: LegDirection
  type: OptionType
  strike: number
  quantity: number
  premium: number // price per contract
}

export interface StrategyMetrics {
  ev: number
  pop: number              // probability of profit
  expectedProfit: number
  expectedLoss: number
  maxProfit: number
  maxLoss: number
  riskReward: number
  breakevens: number[]
}

export interface VolRegime {
  label: 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME'
  ratio: number
}

export interface DistributionAnalysis {
  skewness: number
  kurtosis: number
  tailRatioUp: number
  tailRatioDown: number
  iqr: number
  maxDrawdown: number
  maxUpside: number
  fatTailScore: number
}

// API configuration
export interface SynthAPIConfig {
  baseUrl: string
  apiKey: string
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
}
