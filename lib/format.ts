/**
 * Number and currency formatting utilities
 */

/** Format as USD with appropriate precision */
export function fmtUSD(n: number, decimals?: number): string {
  const d = decimals ?? (Math.abs(n) >= 1000 ? 0 : Math.abs(n) >= 1 ? 2 : 4)
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}

/** Format as compact number: 1.2K, 3.4M */
export function fmtCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toFixed(1)
}

/** Format as percentage (input 0.52 → "52.0%") */
export function fmtPct(n: number, decimals = 1): string {
  return (n * 100).toFixed(decimals) + '%'
}

/** Format percentage that's already in percentage form (input 52 → "52.0%") */
export function fmtPctRaw(n: number, decimals = 1): string {
  return n.toFixed(decimals) + '%'
}

/** Format volatility (input 0.52 → "52%") */
export function fmtVol(n: number): string {
  return (n * 100).toFixed(0) + '%'
}

/** Format with sign: +$1,234 or -$567 */
export function fmtSignedUSD(n: number): string {
  const prefix = n >= 0 ? '+' : ''
  return prefix + fmtUSD(n)
}

/** Format with sign: +12.3% or -4.5% */
export function fmtSignedPct(n: number, decimals = 1): string {
  const prefix = n >= 0 ? '+' : ''
  return prefix + (n * 100).toFixed(decimals) + '%'
}
