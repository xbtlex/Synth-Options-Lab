# Synth Options Lab — Complete Specification

## SYNTH API ENDPOINTS (7 TOTAL)

### 1. Option Pricing (CORE)
```
GET /insights/option-pricing?asset=BTC
Returns: Call and put prices at multiple strike prices with expiry time
Use: Display in Strikes page, Strategy payoff
```

### 2. Prediction Percentiles (CORE)
```
GET /prediction-percentiles?asset=BTC
Returns: Prices at 9 percentile levels (0.5, 5, 20, 35, 50, 65, 80, 95, 99.5)
Use: Distribution visualization, P(ITM) calculation, percentile cone chart
```

### 3. Volatility (CORE)
```
GET /insights/volatility?asset=BTC
Returns: Forward-looking volatility forecast + realized volatility
Use: Vol Scanner, IV Comparison Dashboard
```

### 4. LP Probabilities (Probability of Finishing ITM)
```
GET /insights/lp-probabilities?asset=BTC
Returns: P(ITM) for 22 different strike levels
Use: Quick P(ITM) scanner, option chain recommendation badges
```

### 5. LP Bounds (Range Probability)
```
GET /insights/lp-bounds?asset=BTC
Returns: Probability of staying within price intervals
Use: Iron condors, butterflies, range-bound strategies
```

### 6. Liquidation Probabilities (Risk Context)
```
GET /insights/liquidation?asset=BTC
Returns: Probability of hitting price levels within 6/12/18/24 hours
Use: Stop-loss/take-profit probability estimates
```

### 7. Polymarket Comparison (Cross-Reference)
```
GET /insights/polymarket/up-down/daily?asset=BTC
GET /insights/polymarket/up-down/hourly?asset=BTC
GET /insights/polymarket/range?asset=BTC
Returns: Synth's options-derived probabilities vs prediction market prices
Use: High-conviction signal when Synth ≠ market significantly
```

## SUPPORTED ASSETS

**Crypto:** BTC, ETH, SOL
**Equities:** SPY (SPYX), NVDA (NVDAX), GOOGL (GOOGLX), TSLA (TSLAX), AAPL (AAPLX)
**Commodities:** XAU (Gold)
**Total:** 9 assets

## APPLICATION ARCHITECTURE

```
synth-options-lab/
├── app/
│   ├── layout.tsx                    # Root layout + top nav
│   ├── page.tsx                      # Vol Scanner (landing)
│   ├── globals.css                   # Tailwind + Synth CSS
│   ├── fonts.ts                      # Google Fonts config
│   ├── api/synth/[...path]/route.ts # Proxy to Synth API
│   ├── strikes/page.tsx              # Strike Selection Tool
│   ├── strategy/page.tsx             # Strategy Builder + P&L
│   ├── volatility/page.tsx           # IV Comparison Dashboard
│   └── distributions/page.tsx        # Distribution Explorer
├── components/
│   ├── charts/
│   │   ├── OptionPayoffChart.tsx
│   │   ├── ProbabilityWeightedPnL.tsx
│   │   ├── VolSmileChart.tsx
│   │   ├── PercentileCone.tsx
│   │   ├── StrikeProbabilityBar.tsx
│   │   ├── GreeksHeatmap.tsx
│   │   └── PriceDistHistogram.tsx
│   ├── options/
│   │   ├── OptionChain.tsx
│   │   ├── StrategyLegBuilder.tsx
│   │   ├── StrikeRecommender.tsx
│   │   ├── ProbabilityOfProfit.tsx
│   │   └── MispricingScanner.tsx
│   ├── dashboard/
│   │   ├── VolRegimeCard.tsx
│   │   ├── AssetVolCard.tsx
│   │   ├── TopMispricings.tsx
│   │   └── StatsBar.tsx
│   ├── layout/
│   │   ├── TopNav.tsx
│   │   └── Footer.tsx
│   └── ui/
│       ├── Card.tsx
│       ├── TerminalLabel.tsx
│       ├── DataValue.tsx
│       ├── Badge.tsx
│       ├── AssetSelector.tsx
│       └── Slider.tsx
├── lib/
│   ├── synth-client.ts               # Typed API client
│   ├── options-math.ts               # BS, Greeks, IV solver
│   ├── distribution-analysis.ts      # Percentile → distribution
│   ├── strategy-engine.ts            # Multi-leg P&L computation
│   ├── types.ts
│   ├── constants.ts
│   └── utils.ts
├── hooks/
│   └── useSynthData.ts               # SWR hooks
└── .env.local
```

## PAGE 1: Vol Scanner Overview (/) — LANDING PAGE

When trader opens app, immediately see which assets have biggest vol mispricings.

### Hero Stats Bar (Monospace)
- Assets Scanned: 9
- Vol Mispricings Found: X (where Synth vol ≠ market vol by >15%)
- Best Opportunity: "NVDA Calls — Synth says 42% vol, market implies 35%"
- Avg Vol Edge: X%

### Volatility Scanner Grid (3 columns desktop)
Card per asset showing:
- Asset name + current price
- Synth Predicted Vol (from /insights/volatility)
- Market/Realized Vol (from same endpoint)
- Vol Ratio: Synth Vol / Realized Vol (if >1.2, options underpriced)
- Vol Regime Badge: HIGH VOL (red), NORMAL (gray), LOW VOL (green)
- Mini spark-chart of predicted vol fan

### Top Mispricings Table (Full Width)
From /insights/option-pricing, compare Synth vs Black-Scholes at market IV:

| Asset | Strike | Type | Synth Fair Price | BS Price at Market IV | Mispricing ($) | Mispricing (%) | Direction |

Sorted by absolute mispricing descending.
Highlight rows where mispricing > 10% with cream accent.

### Quick P(ITM) Scanner
Horizontal bar chart of P(ITM) across key strikes (from /insights/lp-probabilities).

---

## PAGE 2: Strike Selection Tool (/strikes) — THE CORE TOOL

### Asset + Direction Selector
- Asset tabs: BTC, ETH, SOL, XAU, SPY, NVDA, GOOGL, TSLA, AAPL
- Direction toggle: CALLS | PUTS | BOTH

### Option Chain Table (THE CENTERPIECE)
Pull from /insights/option-pricing:

| Strike | Synth Call Price | Synth Put Price | P(ITM) Call | P(ITM) Put | Synth IV | Edge vs BS | Recommendation |

**Column Details:**
- **Synth Call/Put Price:** Direct from API
- **P(ITM):** Derived from prediction percentiles
- **Synth IV:** Back-solve Black-Scholes to find IV matching Synth's price
- **Edge vs BS:** Difference vs standard BS at market vol
- **Recommendation:** Badge — "BUY" (green) if underpriced, "SELL" (red) if overpriced, "FAIR" (gray) if within 5%

### Strike Optimizer Panel
Given directional view (bullish/bearish/neutral) and risk tolerance:
- Recommend optimal strikes maximizing EV = P(ITM) × Expected_Payoff - Premium
- Show top 3 recommended strikes with rationale
- Factor in full distribution shape (not just P(ITM))

### Probability of Profit by Strike Chart
- X-axis: Strike prices
- Y-axis: Probability of profit
- Dual line: calls vs puts
- Highlight "sweet spot" where P(Profit) maximized
- Overlay faded zone showing BS prediction — difference = Synth's edge

### Distribution Overlay
- Show prediction percentile cone for asset
- Draw vertical lines at each strike price on chain
- Area of distribution above call strike = P(ITM) (visually obvious)

---

## PAGE 3: Strategy Builder (/strategy) — INNOVATION SHOWCASE

### Strategy Leg Builder
Add up to 4 legs:
- Buy/Sell Call/Put Strike Quantity
- Pre-built templates: Long Call, Long Put, Bull Call Spread, Bear Put Spread, Straddle, Strangle, Iron Condor, Butterfly

### Traditional Payoff Diagram
Classic hockey-stick showing:
- Breakeven points
- Max profit
- Max loss
- Individual leg P&L (dotted) vs combined (solid)

### Probability-Weighted P&L Diagram (THE INNOVATION)
Instead of standard payoff:
- X-axis: Price at expiry
- Y-axis LEFT: P&L ($)
- Y-axis RIGHT: Probability density (from Synth)
- Overlay: Probability density as filled area
- Payoff × probability = EXPECTED payoff
- Green where P&L positive, red where negative
- Integral of this = total Expected Value

### Strategy Metrics Panel
Computed from Synth's ACTUAL distribution:
- **Probability of Profit (PoP):** % of distribution where profitable
- **Expected Value:** Probability-weighted avg P&L
- **Expected Profit if Profitable:** Avg profit in winning scenarios
- **Expected Loss if Unprofitable:** Avg loss in losing scenarios
- **Max Profit:** Best case from distribution range
- **Max Loss:** Worst case (capped at premium for buyers)
- **Risk/Reward Ratio:** Expected profit / Expected loss
- **Breakeven Price(s):** Where strategy flips loss to profit
- **P(Breakeven Exceeded):** Probability of finishing beyond breakeven

### Synth vs Black-Scholes Comparison
Side-by-side or toggle:
- PoP using Synth distribution vs lognormal (BS)
- Expected Value using Synth vs using BS
- Show where distributions disagree most = Synth's edge

Explanatory text: "Synth's fat-tailed distribution gives this iron condor a 62% PoP vs Black-Scholes' 73% — the tail risk is higher than market assumes"

---

## PAGE 4: IV Comparison Dashboard (/volatility) — PRACTICAL RELEVANCE

### Volatility Overview Cards (Per Asset)
- Synth Forward Vol
- Realized Vol
- Vol Ratio (Synth / Realized)
- Vol Regime: High / Normal / Low

### Synth Volatility Bands Chart (EXACT SYNTH STYLE)
Replicate their dashboard:
- Blue gradient bands for percentile ranges (light → dark blue)
- White dashed line for forecast
- Amber/gold line for realized vol
- Title: Bold uppercase "ANNUALIZED IMPLIED VOLATILITY — SYNTH FORECAST VS REALIZED"

### Vol Smile / Skew Analysis
Plot Synth's implied volatility across strikes:
- X-axis: Strike (moneyness)
- Y-axis: Implied vol
- Show vol smile/skew that Synth's distribution implies
- Compare to exchange IV if available (future: integrate Deribit)
- Analysis: Is Synth pricing more tail risk? Is skew steeper?

### Cross-Asset Vol Comparison Table

| Asset | Synth Vol | Realized Vol | Vol Ratio | Vol Trend | Regime |

Sorted by vol ratio.

### Earnings Context (For Equities)
For NVDA, TSLA, AAPL, GOOGL:
- "Synth predicts X% vol — historical earnings moves average Y%"

---

## PAGE 5: Distribution Explorer (/distributions) — DEEP SYNTH DATA

### Prediction Cone Chart
Fan chart with nested percentile bands over 24h:
- Color: RED (0.5-5th) → ORANGE → GREEN (95-99.5th)
- Light blue actual price overlay
- Bold title matching Synth style

### Distribution Histogram at Time T
Slider to select time point (6h, 12h, 24h):
- Cross-sectional distribution as histogram
- Mark current price, percentile lines, strike prices
- Show where specific strikes sit

### Tail Risk Panel
- 0.5th percentile: worst-case drawdown
- 5th percentile: 1-in-20 drawdown
- 95th percentile: 1-in-20 upside
- 99.5th percentile: best-case upside
- Interquartile range (20th-80th)
- Skewness (from Bowley formula)

### Distribution Shape Analysis (INNOVATION)
Compare distribution shape to normal/lognormal:
- "Synth's distribution has X% fatter left tail and Y% fatter right tail than Black-Scholes assumes"
- Explains WHY Synth's options differ from BS
- Directly explains Synth's edge

---

## DESIGN SYSTEM — EXACT SYNTH AESTHETIC

### Color Palette

```css
:root {
  /* BACKGROUNDS — true black */
  --bg-primary: #000000;
  --bg-secondary: #0a0a0a;
  --bg-card: #0d0d0d;
  --bg-chart: #0a0a0a;

  /* TEXT */
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-muted: #666666;

  /* ACCENT — Synth's signature cream */
  --accent-cream: #e8e4b8;
  --accent-cream-light: #f0ecc8;
  --accent-cream-dim: #c8c498;
  --accent-cream-bg: #e8e4b810;

  /* PERCENTILE CONE (red bottom → green top) */
  --band-0_5-5: #dc2626;
  --band-5-20: #ef4444;
  --band-20-35: #f97316;
  --band-35-50: #fb923c;
  --band-50-65: #22c55e;
  --band-65-80: #16a34a;
  --band-80-95: #15803d;
  --band-95-99_5: #166534;
  --line-actual-price: #60a5fa;

  /* VOLATILITY CHART (blue bands) */
  --vol-band-outer: #bfdbfe;
  --vol-band-mid: #93c5fd;
  --vol-band-inner: #60a5fa;
  --vol-band-core: #3b82f6;
  --vol-line-forecast: #ffffff;
  --vol-line-actual: #f59e0b;

  /* OPTIONS COLORS */
  --call-color: #22c55e;
  --put-color: #ef4444;
  --profit-zone: #22c55e20;
  --loss-zone: #ef444420;
  --breakeven-line: #e8e4b8;
  --synth-line: #e8e4b8;
  --bs-line: #666666;

  /* SEMANTIC */
  --positive: #22c55e;
  --negative: #ef4444;
  --warning: #f59e0b;
}
```

### Typography
- **Headings (Italic Serif):** Playfair Display, italic, 700, cream
- **Chart Titles:** Inter, 800, uppercase, white
- **Body:** Inter, 400, medium gray
- **Data Values:** JetBrains Mono, monospace, tabular-nums
- **Terminal Labels:** ">_ " prefix in cream

### Component Patterns
- **Cards:** bg-[#0d0d0d] border-[#1a1a1a] rounded-lg p-6
- **Tables:** Dark rows, monospace numbers, green/red for directional
- **Charts:** Dark bg, minimal gridlines, accent data, no fill
- **Navigation:** Horizontal top nav (NOT sidebar)
- **Buttons:** Primary cream bg, secondary transparent border

---

## CORE COMPUTATIONS (lib/options-math.ts)

### 1. Black-Scholes Reference
```typescript
function blackScholes(S, K, T, r, sigma, type): number
```

### 2. Implied Volatility Solver
```typescript
function synthImpliedVol(synthPrice, S, K, T, r, type): number
```

### 3. P(ITM) from Prediction Percentiles
```typescript
function probabilityITM(percentiles, strike, type): number
```

### 4. Greeks (Delta, Gamma, Vega, Theta, Rho)
```typescript
function bsDelta(S, K, T, r, sigma, type): number
function bsGamma(S, K, T, r, sigma): number
function bsVega(S, K, T, r, sigma): number
function bsTheta(S, K, T, r, sigma, type): number
function bsRho(S, K, T, r, sigma, type): number
```

---

## QUALITY STANDARDS

- ✅ Zero TypeScript errors (strict mode)
- ✅ All 7 Synth API endpoints working
- ✅ All 5 pages fully functional
- ✅ Edge cases handled (API errors, missing data, extreme strikes)
- ✅ Loading states + error messages
- ✅ Mobile responsive + desktop optimized
- ✅ Fast load time (<2s)
- ✅ Exact Synth brand aesthetic
- ✅ Production-ready code
- ✅ Ready for Vercel deployment

---

## HACKATHON SCORING

- **Technical Implementation (30%):** Clean architecture, TypeScript, real-time data, error handling ✅
- **Use of Synth Data (30%):** Deep integration with all 7 endpoints, probabilistic modeling, Greeks ✅
- **Market Relevance (25%):** Trader immediately sees actionable opportunities ✅
- **Innovation (15%):** Probability-weighted P&L, distribution analysis, Synth vs BS comparison ✅

**Expected Score:** 95+/100
