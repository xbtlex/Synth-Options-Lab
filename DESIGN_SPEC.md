# Synth Options Lab — Design & Implementation Specification

## Color Palette (CSS Variables)

```css
--bg-primary: #0a0a0a;
--bg-card: #0d0d0d;
--bg-hover: #1a1a1a;
--text-primary: #ffffff;
--text-secondary: #a0a0a0;
--accent-cream: #e8e4b8;
--accent-green: #10b981;
--accent-red: #ef4444;
--border-subtle: #1a1a1a;
--border-hover: #2a2a2a;
--border-accent: #e8e4b830;
```

## Typography

### Font Families
- **Headings (Italic Serif):** Playfair Display, italic, 700, cream (#e8e4b8)
- **Chart Titles:** Inter, 800, uppercase, white
- **Body Text:** Inter, 400, medium gray (#a0a0a0)
- **Data Values:** JetBrains Mono, monospace, tabular-nums
- **Terminal Labels:** ">_ " prefix in cream (#e8e4b8)

### Import Statement
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
```

## Component Patterns

### Cards
```
Background: #0d0d0d
Border: 1px solid #1a1a1a
Border Radius: 8px
Padding: 24px (1.5rem)
Hover Border: #2a2a2a
```

### Navigation
**Top Horizontal Nav (NOT sidebar)**
- Logo (left): "Synth Options Lab"
- Page Links (center): Home, Distributions, Strikes, Volatility, Strategy
- "Powered by Synth SN50" (right)
- Background: #0a0a0a with border-bottom: 1px solid #1a1a1a

### Buttons

**Primary Button**
- Background: #e8e4b8
- Text Color: #000000
- Border Radius: 6px
- Padding: 8px 16px
- Hover: opacity 0.9

**Secondary Button**
- Background: transparent
- Border: 1px solid #e8e4b8
- Text Color: #ffffff
- Border Radius: 6px
- Hover: border-color #2a2a2a, bg #0d0d0d

### Tables

**Row Styling**
- Alternating rows: #0d0d0d and #0a0a0a
- Border: 1px solid #1a1a1a
- Padding: 12px 16px
- Font: JetBrains Mono for numeric columns
- Directional values: Green (#10b981) for +, Red (#ef4444) for -

**Header**
- Background: #0a0a0a
- Font: Inter, 600, white
- Border-bottom: 1px solid #2a2a2a

### Charts

- **Background:** Transparent (blend into card)
- **Gridlines:** Minimal, subtle gray (#1a1a1a)
- **Data Series:** Accent color (#e8e4b8 or #10b981)
- **No fill under curves** — lines only
- **Responsive:** Scale to container width

## Core Computations (lib/options-math.ts)

### 1. Black-Scholes Reference Pricing

```typescript
function blackScholes(
  S: number,      // Current spot price
  K: number,      // Strike price
  T: number,      // Time to expiry (years)
  r: number,      // Risk-free rate
  sigma: number,  // Volatility
  type: 'call' | 'put'
): number {
  const d1 = (Math.log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  
  if (type === 'call') {
    return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
  }
  return K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
}

function normalCDF(x: number): number {
  return (1 + erf(x / Math.sqrt(2))) / 2;
}

function standardNormalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}
```

### 2. Implied Volatility Solver

```typescript
function synthImpliedVol(
  synthPrice: number,  // Price from Synth API
  S: number,           // Spot price
  K: number,           // Strike
  T: number,           // Time to expiry
  r: number,           // Risk-free rate
  type: 'call' | 'put'
): number {
  let sigma = 0.5; // Initial guess
  
  for (let i = 0; i < 100; i++) {
    const price = blackScholes(S, K, T, r, sigma, type);
    const vega = bsVega(S, K, T, r, sigma);
    
    if (Math.abs(vega) < 1e-10) break;
    sigma -= (price - synthPrice) / vega;
    
    if (Math.abs(price - synthPrice) < 0.01) break;
  }
  
  return Math.max(sigma, 0.01);
}

function bsVega(S: number, K: number, T: number, r: number, sigma: number): number {
  const d1 = (Math.log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * Math.sqrt(T));
  return S * standardNormalPDF(d1) * Math.sqrt(T) / 100; // Per 1% vol
}
```

### 3. Probability of ITM (from Synth Percentiles)

```typescript
interface PredictionPercentiles {
  [percentile: string]: number; // { '0.5': 95000, '5': 96000, ... '99.5': 108000 }
}

function probabilityITM(
  percentiles: PredictionPercentiles,
  strike: number,
  type: 'call' | 'put'
): number {
  const levels = [0.5, 5, 20, 35, 50, 65, 80, 95, 99.5];
  const prices = levels.map(l => percentiles[l.toString()]);
  
  // Linear interpolation to find percentile corresponding to strike
  for (let i = 0; i < prices.length - 1; i++) {
    if (strike >= prices[i] && strike <= prices[i + 1]) {
      const frac = (strike - prices[i]) / (prices[i + 1] - prices[i]);
      const percentile = levels[i] + frac * (levels[i + 1] - levels[i]);
      
      // P(above strike) for call, P(below strike) for put
      return type === 'call' ? 1 - percentile / 100 : percentile / 100;
    }
  }
  
  // Edge cases
  if (strike <= prices[0]) return type === 'call' ? 0.995 : 0.005;
  if (strike >= prices[prices.length - 1]) return type === 'call' ? 0.005 : 0.995;
  
  return 0.5;
}
```

### 4. Greeks Calculation

```typescript
function bsDelta(
  S: number, K: number, T: number, r: number, sigma: number, type: 'call' | 'put'
): number {
  const d1 = (Math.log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * Math.sqrt(T));
  return type === 'call' ? normalCDF(d1) : normalCDF(d1) - 1;
}

function bsGamma(
  S: number, K: number, T: number, r: number, sigma: number
): number {
  const d1 = (Math.log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * Math.sqrt(T));
  return standardNormalPDF(d1) / (S * sigma * Math.sqrt(T));
}

function bsTheta(
  S: number, K: number, T: number, r: number, sigma: number, type: 'call' | 'put'
): number {
  const d1 = (Math.log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  
  if (type === 'call') {
    return (
      -S * standardNormalPDF(d1) * sigma / (2 * Math.sqrt(T)) -
      r * K * Math.exp(-r * T) * normalCDF(d2)
    ) / 365; // Per day
  }
  return (
    -S * standardNormalPDF(d1) * sigma / (2 * Math.sqrt(T)) +
    r * K * Math.exp(-r * T) * normalCDF(-d2)
  ) / 365;
}

function bsRho(
  S: number, K: number, T: number, r: number, sigma: number, type: 'call' | 'put'
): number {
  const d2 = (Math.log(S / K) + (r - sigma ** 2 / 2) * T) / (sigma * Math.sqrt(T));
  return type === 'call'
    ? K * T * Math.exp(-r * T) * normalCDF(d2) / 100
    : -K * T * Math.exp(-r * T) * normalCDF(-d2) / 100;
}
```

## Key Pages & Features

### 1. Home/Dashboard
- Asset selector dropdown + quick buttons (BTC, ETH, SOL, SPY, NVDA, GOOGL, TSLA, AAPL, XAU)
- Current spot price + 24h change
- Synth prediction bands (9 percentiles)
- "Powered by Synth" attribution

### 2. Distributions
- Full prediction percentile visualization (0.5, 5, 20, 35, 50, 65, 80, 95, 99.5)
- Animated band rendering
- Current price marker
- Shaded P(ITM) region for selected strike
- Export option (PNG)

### 3. Strikes (Option Chain)
- Table: Strike | Call Price (Synth) | Call IV | Call BS | Put Price (Synth) | Put IV | Put BS | P(ITM)
- Sort by: Strike, IV, Misprice %
- Highlight rows where Synth IV > BS IV (Synth says richer)
- Green/red background for profitable/loss regions

### 4. Volatility
- Synth Implied Vol vs Black-Scholes baseline
- Chart: IV vs Strike (skew visualization)
- Term structure (if 7d/30d available)
- Summary: "Synth sees X% more vol than market"

### 5. Strategy
- Templates: Long Call, Long Put, Call Spread, Put Spread
- Input: Long strike, Short strike (if applicable)
- Output: Payoff diagram + P&L profile
- P&L weighted by Synth probabilities

## Synth API Integration

### Endpoints Used

1. **GET /insights/option-pricing?asset=BTC**
   - Returns: Call and put prices at multiple strikes
   - Display in: Strikes page, Strategy payoff

2. **GET /prediction-percentiles?asset=BTC**
   - Returns: Prices at 9 percentile levels
   - Display in: Distributions page, use for P(ITM) calculation

3. **Calculate Greeks** from percentiles using perturbation method

## Quality Standards

- ✅ Zero TypeScript errors (strict mode)
- ✅ All edge cases handled (API errors, missing data, extreme strikes)
- ✅ Loading states + error messages
- ✅ Mobile responsive + desktop optimized
- ✅ Fast load time (<2s)
- ✅ Matches Synth brand precisely
- ✅ Production-ready code
- ✅ Ready for GitHub + Vercel deployment

## Deployment

- Vercel: syd1 region
- Env var: NEXT_PUBLIC_SYNTH_API_KEY (already set)
- Domain: synth-options-lab.vercel.app
- GitHub: xbtlex/Synth-Options-Lab main branch
