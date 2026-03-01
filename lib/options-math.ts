/**
 * Options Math Library — Black-Scholes, Greeks, IV Solver
 */

const PHI = 0.39894228; // 1/sqrt(2*pi)

/** Standard normal CDF (approximation) */
export function normalCDF(x: number): number {
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;

  if (x >= 0) {
    const t = 1.0 / (1.0 + p * x);
    return 1.0 - c * Math.exp(-x * x / 2.0) * t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
  } else {
    const t = 1.0 / (1.0 - p * x);
    return c * Math.exp(-x * x / 2.0) * t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
  }
}

/** Standard normal PDF */
export function normalPDF(x: number): number {
  return PHI * Math.exp((-x * x) / 2);
}

/** Black-Scholes option pricing */
export function blackScholes(
  S: number, // spot price
  K: number, // strike price
  T: number, // time to expiry (years)
  r: number, // risk-free rate
  sigma: number, // volatility
  type: "call" | "put"
): number {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  if (type === "call") {
    return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
  } else {
    return K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
  }
}

/** Delta: rate of change of option price w.r.t. spot price */
export function bsDelta(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: "call" | "put"
): number {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));

  if (type === "call") {
    return normalCDF(d1);
  } else {
    return normalCDF(d1) - 1;
  }
}

/** Gamma: rate of change of delta w.r.t. spot price */
export function bsGamma(S: number, K: number, T: number, r: number, sigma: number): number {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  return normalPDF(d1) / (S * sigma * Math.sqrt(T));
}

/** Vega: sensitivity to volatility */
export function bsVega(S: number, K: number, T: number, r: number, sigma: number): number {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  return S * normalPDF(d1) * Math.sqrt(T) / 100; // per 1% vol change
}

/** Theta: time decay (per day) */
export function bsTheta(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: "call" | "put"
): number {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const theta1 = (-S * normalPDF(d1) * sigma) / (2 * Math.sqrt(T));

  if (type === "call") {
    return (theta1 - r * K * Math.exp(-r * T) * normalCDF(d2)) / 365;
  } else {
    return (theta1 + r * K * Math.exp(-r * T) * normalCDF(-d2)) / 365;
  }
}

/** Rho: sensitivity to interest rates */
export function bsRho(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: "call" | "put"
): number {
  const d2 = (Math.log(S / K) + (r - 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));

  if (type === "call") {
    return K * T * Math.exp(-r * T) * normalCDF(d2) / 100;
  } else {
    return -K * T * Math.exp(-r * T) * normalCDF(-d2) / 100;
  }
}

/**
 * Implied Volatility Solver (Newton-Raphson)
 * Finds sigma that matches the given option price
 */
export function impliedVolatility(
  marketPrice: number,
  S: number,
  K: number,
  T: number,
  r: number,
  type: "call" | "put",
  initialGuess: number = 0.2
): number {
  let sigma = initialGuess;
  let tolerance = 1e-6;
  let maxIterations = 100;

  for (let i = 0; i < maxIterations; i++) {
    const price = blackScholes(S, K, T, r, sigma, type);
    const vega = bsVega(S, K, T, r, sigma);

    if (vega === 0) return sigma; // Avoid division by zero

    const diff = price - marketPrice;

    if (Math.abs(diff) < tolerance) {
      return sigma;
    }

    sigma = sigma - diff / vega;

    // Bounds check
    if (sigma < 0) sigma = 0.001;
    if (sigma > 3) sigma = 3;
  }

  return sigma;
}

/**
 * Probability of finishing ITM
 * Derived from Synth's prediction percentiles
 */
export function probabilityITM(
  percentiles: {
    p0_5: number;
    p5: number;
    p20: number;
    p50: number;
    p80: number;
    p95: number;
    p99_5: number;
  },
  strike: number,
  type: "call" | "put"
): number {
  // For calls: P(ITM) = P(spot > strike at expiry)
  // For puts: P(ITM) = P(spot < strike at expiry)

  if (type === "call") {
    // Interpolate using percentiles
    if (strike <= percentiles.p50) {
      return 0.5 + (0.5 * (percentiles.p50 - strike)) / (percentiles.p50 - percentiles.p5);
    } else {
      return 0.5 * (percentiles.p95 - strike) / (percentiles.p95 - percentiles.p50);
    }
  } else {
    // For puts
    if (strike >= percentiles.p50) {
      return 0.5 + (0.5 * (strike - percentiles.p50)) / (percentiles.p95 - percentiles.p50);
    } else {
      return 0.5 * (strike - percentiles.p5) / (percentiles.p50 - percentiles.p5);
    }
  }
}

/**
 * Expected Value of an option position using Synth distribution
 * Returns the probability-weighted average outcome
 */
export function expectedValue(
  optionPrice: number,
  maxPayoff: number,
  probabilityITM: number,
  side: "long" | "short"
): number {
  if (side === "long") {
    const expectedPayoff = maxPayoff * probabilityITM;
    return expectedPayoff - optionPrice;
  } else {
    const expectedPayoff = maxPayoff * (1 - probabilityITM);
    return optionPrice - expectedPayoff;
  }
}

/**
 * Probability of Profit for a multi-leg strategy
 * Simplified: uses weighted distribution across strikes
 */
export function strategyProbabilityOfProfit(
  legs: Array<{
    side: "long" | "short";
    type: "call" | "put";
    strike: number;
    price: number;
  }>,
  spot: number,
  distribution: any // Synth percentiles
): number {
  // Simplified: count legs that are profitable
  // In production: use Monte Carlo on distribution

  const profitableLegs = legs.filter((leg) => {
    if (leg.type === "call" && leg.side === "long") {
      return spot > leg.strike + leg.price; // ITM by more than premium paid
    }
    return 0.5; // Simplified for demo
  });

  return profitableLegs.length / Math.max(legs.length, 1);
}

export default {
  blackScholes,
  bsDelta,
  bsGamma,
  bsVega,
  bsTheta,
  bsRho,
  impliedVolatility,
  probabilityITM,
  expectedValue,
  strategyProbabilityOfProfit,
  normalCDF,
  normalPDF,
};
