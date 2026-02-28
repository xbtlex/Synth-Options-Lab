/**
 * Mock data for development — realistic Synth API responses
 * Used as fallback when NEXT_PUBLIC_SYNTH_API_KEY is not set
 */
import type {
  OptionPricingResponse,
  PredictionPercentilesResponse,
  VolatilityResponse,
  Asset,
} from '@/types/synth'

const now = Date.now()
const expiry = now + 7 * 24 * 60 * 60 * 1000

// --- BTC ---
export const BTC_PRICING: OptionPricingResponse = {
  asset: 'BTC',
  timestamp: now,
  expiration: expiry,
  current_price: 87420,
  strikes: [
    { strike: 78000, call_price: 9680, put_price: 145, call_iv: 0.58, put_iv: 0.62 },
    { strike: 80000, call_price: 7820, put_price: 210, call_iv: 0.56, put_iv: 0.60 },
    { strike: 82000, call_price: 5990, put_price: 380, call_iv: 0.54, put_iv: 0.58 },
    { strike: 84000, call_price: 4310, put_price: 700, call_iv: 0.52, put_iv: 0.56 },
    { strike: 85000, call_price: 3550, put_price: 940, call_iv: 0.51, put_iv: 0.55 },
    { strike: 86000, call_price: 2860, put_price: 1250, call_iv: 0.50, put_iv: 0.54 },
    { strike: 87000, call_price: 2240, put_price: 1630, call_iv: 0.49, put_iv: 0.53 },
    { strike: 88000, call_price: 1700, put_price: 2090, call_iv: 0.49, put_iv: 0.52 },
    { strike: 89000, call_price: 1240, put_price: 2630, call_iv: 0.48, put_iv: 0.52 },
    { strike: 90000, call_price: 880, put_price: 3270, call_iv: 0.48, put_iv: 0.51 },
    { strike: 92000, call_price: 420, put_price: 4810, call_iv: 0.49, put_iv: 0.52 },
    { strike: 95000, call_price: 130, put_price: 7520, call_iv: 0.52, put_iv: 0.55 },
    { strike: 100000, call_price: 18, put_price: 12410, call_iv: 0.58, put_iv: 0.60 },
  ],
}

export const BTC_PERCENTILES: PredictionPercentilesResponse = {
  asset: 'BTC',
  timestamp: now,
  timeframe: '24h',
  current_price: 87420,
  percentiles: {
    '0.5': 78100, '2.5': 80500, '5': 81900, '10': 83200,
    '15': 84000, '20': 84600, '25': 85100, '30': 85500,
    '35': 85900, '40': 86300, '45': 86700, '50': 87200,
    '55': 87700, '60': 88200, '65': 88700, '70': 89300,
    '75': 90000, '80': 90800, '85': 91800, '90': 93200,
    '95': 95400, '97.5': 97800, '99.5': 102500,
  },
  distribution_type: 'student-t',
  confidence_interval: { lower: 81900, upper: 95400, confidence_level: 0.9 },
}

export const BTC_VOLATILITY: VolatilityResponse = {
  asset: 'BTC',
  timestamp: now,
  timeframe: '24h',
  implied_volatility: 0.52,
  realized_volatility: 0.44,
  volatility_of_volatility: 0.18,
  skew: -0.12,
  kurtosis: 4.2,
  term_structure: [
    { tenor: '1d', volatility: 0.58 }, { tenor: '1w', volatility: 0.52 },
    { tenor: '2w', volatility: 0.48 }, { tenor: '1m', volatility: 0.45 },
    { tenor: '3m', volatility: 0.42 },
  ],
}

// --- ETH ---
export const ETH_PRICING: OptionPricingResponse = {
  asset: 'ETH',
  timestamp: now,
  expiration: expiry,
  current_price: 2180,
  strikes: [
    { strike: 1900, call_price: 298, put_price: 8, call_iv: 0.65, put_iv: 0.70 },
    { strike: 1950, call_price: 251, put_price: 12, call_iv: 0.63, put_iv: 0.68 },
    { strike: 2000, call_price: 205, put_price: 18, call_iv: 0.61, put_iv: 0.66 },
    { strike: 2050, call_price: 162, put_price: 28, call_iv: 0.59, put_iv: 0.64 },
    { strike: 2100, call_price: 122, put_price: 45, call_iv: 0.57, put_iv: 0.62 },
    { strike: 2150, call_price: 88, put_price: 68, call_iv: 0.56, put_iv: 0.60 },
    { strike: 2200, call_price: 60, put_price: 98, call_iv: 0.55, put_iv: 0.59 },
    { strike: 2250, call_price: 39, put_price: 138, call_iv: 0.55, put_iv: 0.58 },
    { strike: 2300, call_price: 24, put_price: 188, call_iv: 0.56, put_iv: 0.58 },
    { strike: 2400, call_price: 8, put_price: 310, call_iv: 0.58, put_iv: 0.60 },
    { strike: 2500, call_price: 2, put_price: 462, call_iv: 0.62, put_iv: 0.64 },
  ],
}

export const ETH_PERCENTILES: PredictionPercentilesResponse = {
  asset: 'ETH',
  timestamp: now,
  timeframe: '24h',
  current_price: 2180,
  percentiles: {
    '0.5': 1850, '2.5': 1940, '5': 1980, '10': 2020,
    '15': 2050, '20': 2070, '25': 2090, '30': 2110,
    '35': 2130, '40': 2150, '45': 2165, '50': 2180,
    '55': 2200, '60': 2220, '65': 2245, '70': 2270,
    '75': 2300, '80': 2340, '85': 2390, '90': 2460,
    '95': 2570, '97.5': 2680, '99.5': 2900,
  },
  distribution_type: 'student-t',
  confidence_interval: { lower: 1980, upper: 2570, confidence_level: 0.9 },
}

export const ETH_VOLATILITY: VolatilityResponse = {
  asset: 'ETH',
  timestamp: now,
  timeframe: '24h',
  implied_volatility: 0.62,
  realized_volatility: 0.55,
  volatility_of_volatility: 0.22,
  skew: -0.18,
  kurtosis: 4.8,
  term_structure: [
    { tenor: '1d', volatility: 0.68 }, { tenor: '1w', volatility: 0.62 },
    { tenor: '2w', volatility: 0.56 }, { tenor: '1m', volatility: 0.52 },
    { tenor: '3m', volatility: 0.48 },
  ],
}

// --- SOL ---
export const SOL_PRICING: OptionPricingResponse = {
  asset: 'SOL',
  timestamp: now,
  expiration: expiry,
  current_price: 140.5,
  strikes: [
    { strike: 115, call_price: 27.2, put_price: 0.8, call_iv: 0.78, put_iv: 0.84 },
    { strike: 120, call_price: 22.8, put_price: 1.4, call_iv: 0.75, put_iv: 0.81 },
    { strike: 125, call_price: 18.6, put_price: 2.2, call_iv: 0.72, put_iv: 0.78 },
    { strike: 130, call_price: 14.8, put_price: 3.5, call_iv: 0.70, put_iv: 0.75 },
    { strike: 135, call_price: 11.2, put_price: 5.8, call_iv: 0.68, put_iv: 0.73 },
    { strike: 140, call_price: 8.1, put_price: 8.8, call_iv: 0.66, put_iv: 0.71 },
    { strike: 145, call_price: 5.6, put_price: 12.8, call_iv: 0.65, put_iv: 0.70 },
    { strike: 150, call_price: 3.6, put_price: 17.8, call_iv: 0.65, put_iv: 0.69 },
    { strike: 155, call_price: 2.2, put_price: 23.4, call_iv: 0.66, put_iv: 0.70 },
    { strike: 160, call_price: 1.2, put_price: 29.8, call_iv: 0.68, put_iv: 0.72 },
    { strike: 170, call_price: 0.3, put_price: 43.0, call_iv: 0.74, put_iv: 0.78 },
  ],
}

export const SOL_PERCENTILES: PredictionPercentilesResponse = {
  asset: 'SOL',
  timestamp: now,
  timeframe: '24h',
  current_price: 140.5,
  percentiles: {
    '0.5': 108, '2.5': 116, '5': 120, '10': 125,
    '15': 128, '20': 130, '25': 132, '30': 134,
    '35': 136, '40': 137.5, '45': 139, '50': 140.5,
    '55': 142, '60': 144, '65': 146, '70': 148,
    '75': 151, '80': 155, '85': 160, '90': 167,
    '95': 178, '97.5': 190, '99.5': 212,
  },
  distribution_type: 'student-t',
  confidence_interval: { lower: 120, upper: 178, confidence_level: 0.9 },
}

export const SOL_VOLATILITY: VolatilityResponse = {
  asset: 'SOL',
  timestamp: now,
  timeframe: '24h',
  implied_volatility: 0.72,
  realized_volatility: 0.58,
  volatility_of_volatility: 0.28,
  skew: -0.22,
  kurtosis: 5.1,
  term_structure: [
    { tenor: '1d', volatility: 0.82 }, { tenor: '1w', volatility: 0.72 },
    { tenor: '2w', volatility: 0.65 }, { tenor: '1m', volatility: 0.60 },
    { tenor: '3m', volatility: 0.55 },
  ],
}

// --- Lookup helpers ---
const PRICING: Record<Asset, OptionPricingResponse> = { BTC: BTC_PRICING, ETH: ETH_PRICING, SOL: SOL_PRICING }
const PERCENTILES: Record<Asset, PredictionPercentilesResponse> = { BTC: BTC_PERCENTILES, ETH: ETH_PERCENTILES, SOL: SOL_PERCENTILES }
const VOLATILITY: Record<Asset, VolatilityResponse> = { BTC: BTC_VOLATILITY, ETH: ETH_VOLATILITY, SOL: SOL_VOLATILITY }

export function getMockPricing(asset: Asset): OptionPricingResponse { return PRICING[asset] }
export function getMockPercentiles(asset: Asset): PredictionPercentilesResponse { return PERCENTILES[asset] }
export function getMockVolatility(asset: Asset): VolatilityResponse { return VOLATILITY[asset] }

export const ASSETS: Asset[] = ['BTC', 'ETH', 'SOL']
