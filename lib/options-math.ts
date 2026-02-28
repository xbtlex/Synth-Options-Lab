/**
 * Core options mathematics
 * Black-Scholes, implied vol, Greeks, and distribution-based analytics
 */

import {
  Distribution,
  OptionLeg,
  StrategyMetrics,
  DistributionAnalysis,
  Percentile,
} from "@/types";

// ============================================
// BLACK-SCHOLES PRICING
// ============================================

const SQRT2PI = Math.sqrt(2 * Math.PI);
const LN2 = Math.log(2);

function normCDF(x: number): number {
  // Standard normal cumulative distribution (Abramowitz & Stegun approximation)
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;
  const t5 = t4 * t;

  const y =
    1.0 -
    (a5 * t5 +
      a4 * t4 +
      a3 * t3 +
      a2 * t2 +
      a1 * t) *
      Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

function normPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / SQRT2PI;
}

export function blackScholes(
  S: number, // Spot price
  K: number, // Strike
  T: number, // Time to expiry (years)
  r: number, // Risk-free rate
  sigma: number, // Volatility (annual)
  type: "call" | "put"
): number {
  if (T <= 0) {
    // At expiry, intrinsic value
    const intrinsic = Math.max(S - K, 0);
    return type === "call" ? intrinsic : Math.max(K - S, 0);
  }

  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const Nd1 = normCDF(d1);
  const Nd2 = normCDF(d2);

  if (type === "call") {
    return S * Nd1 - K * Math.exp(-r * T) * Nd2;
  } else {
    return (
      K * Math.exp(-r * T) * (1 - Nd2) -
      S * (1 - Nd1)
    );
  }
}

// ============================================
// IMPLIED VOLATILITY (Newton-Raphson)
// ============================================

export function vega(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number
): number {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  return S * normPDF(d1) * Math.sqrt(T);
}

export function synthImpliedVol(
  marketPrice: number,
  S: number,
  K: number,
  T: number,
  r: number,
  type: "call" | "put",
  maxIterations: number = 100,
  tolerance: number = 1e-6
): number {
  let sigma = 0.5; // Initial guess: 50% vol

  for (let i = 0; i < maxIterations; i++) {
    const price = blackScholes(S, K, T, r, sigma, type);
    const v = vega(S, K, T, r, sigma);

    if (Math.abs(price - marketPrice) < tolerance) {
      return sigma;
    }

    if (Math.abs(v) < 1e-10) {
      break; // Avoid division by near-zero
    }

    sigma = sigma - (price - marketPrice) / v;

    // Clamp to reasonable bounds
    sigma = Math.max(0.001, Math.min(2.0, sigma));
  }

  return sigma;
}

// ============================================
// GREEKS (from Black-Scholes)
// ============================================

export function delta(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: "call" | "put"
): number {
  if (T <= 0) {
    return type === "call" ? (S > K ? 1 : 0) : S < K ? -1 : 0;
  }

  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const Nd1 = normCDF(d1);

  return type === "call" ? Nd1 : Nd1 - 1;
}

export function gamma(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number
): number {
  if (T <= 0) return 0;

  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  return normPDF(d1) / (S * sigma * Math.sqrt(T));
}

export function theta(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: "call" | "put"
): number {
  if (T <= 0) return 0;

  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const Nd1 = normCDF(d1);
  const Nd2 = normCDF(d2);

  let theta_val = 0;
  if (type === "call") {
    theta_val =
      (-S * normPDF(d1) * sigma) / (2 * Math.sqrt(T)) -
      r * K * Math.exp(-r * T) * Nd2;
  } else {
    theta_val =
      (-S * normPDF(d1) * sigma) / (2 * Math.sqrt(T)) +
      r * K * Math.exp(-r * T) * (1 - Nd2);
  }

  return theta_val / 365; // Per day
}

// ============================================
// DISTRIBUTION-BASED ANALYTICS
// ============================================

export function probabilityITM(
  percentiles: Percentile[],
  strike: number,
  type: "call" | "put"
): number {
  let count = 0;
  let total = 0;

  for (const p of percentiles) {
    total++;
    if (type === "call" && p.value > strike) count++;
    if (type === "put" && p.value < strike) count++;
  }

  return total > 0 ? count / total : 0;
}

export function strategyPnL(
  legs: OptionLeg[],
  priceAtExpiry: number
): number {
  let pnl = 0;

  for (const leg of legs) {
    let legPayoff = 0;

    if (leg.type === "call") {
      legPayoff = Math.max(priceAtExpiry - leg.strike, 0);
    } else {
      legPayoff = Math.max(leg.strike - priceAtExpiry, 0);
    }

    const sign = leg.side === "long" ? 1 : -1;
    pnl += sign * leg.quantity * (legPayoff - (leg.price || 0));
  }

  return pnl;
}

export function expectedValue(
  legs: OptionLeg[],
  percentiles: Percentile[]
): {
  ev: number;
  pop: number;
  expectedProfit: number;
  expectedLoss: number;
} {
  let totalPnL = 0;
  let profitCount = 0;
  let totalProfit = 0;
  let totalLoss = 0;

  for (const p of percentiles) {
    const pnl = strategyPnL(legs, p.value);
    totalPnL += pnl;

    if (pnl > 0) {
      profitCount++;
      totalProfit += pnl;
    } else if (pnl < 0) {
      totalLoss += Math.abs(pnl);
    }
  }

  const count = percentiles.length;
  return {
    ev: totalPnL / count,
    pop: profitCount / count,
    expectedProfit: totalProfit / Math.max(profitCount, 1),
    expectedLoss: totalLoss / Math.max(count - profitCount, 1),
  };
}

export function distributionAnalysis(
  percentiles: Percentile[],
  currentPrice: number
): DistributionAnalysis {
  if (percentiles.length === 0) {
    return {
      skewness: 0,
      tailRatio: 1,
      maxDrawdown: 0,
      maxUpside: 0,
      iqrPct: 0,
      var95: 0,
      cvar95: 0,
    };
  }

  const values = percentiles.map((p) => p.value).sort((a, b) => a - b);
  const n = values.length;

  // Basic stats
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 === 0 ? (values[n / 2 - 1] + values[n / 2]) / 2 : values[(n - 1) / 2];

  // Variance & skew
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const skewness =
    values.reduce((sum, v) => sum + Math.pow((v - mean) / stdDev, 3), 0) / n;

  // Percentiles
  const p5 = values[Math.floor(n * 0.05)];
  const p25 = values[Math.floor(n * 0.25)];
  const p75 = values[Math.floor(n * 0.75)];
  const p95 = values[Math.floor(n * 0.95)];

  return {
    skewness,
    tailRatio: p95 / Math.max(p5, 1),
    maxDrawdown: Math.max(0, (mean - values[0]) / currentPrice),
    maxUpside: Math.max(0, (values[n - 1] - mean) / currentPrice),
    iqrPct: (p75 - p25) / median,
    var95: (p5 - mean) / mean,
    cvar95:
      (values.slice(0, Math.ceil(n * 0.05)).reduce((a, b) => a + b, 0) / Math.ceil(n * 0.05) - mean) /
      mean,
  };
}

// ============================================
// QUICK HELPERS
// ============================================

export function moneyness(S: number, K: number): number {
  return S / K;
}

export function timeToExpiry(expiryDate: Date): number {
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  return diffMs / (365.25 * 24 * 60 * 60 * 1000);
}

export function percentilesToArray(percentiles: Record<string, number>): Percentile[] {
  return Object.entries(percentiles)
    .map(([p, v]) => ({
      percentile: Number(p),
      value: v,
    }))
    .sort((a, b) => a.percentile - b.percentile);
}
