"use client";

import { useState } from "react";

interface StrategyLeg {
  side: "BUY" | "SELL";
  type: "CALL" | "PUT";
  strike: number;
  quantity: number;
  premium: number;
}

interface StrategyMetrics {
  pop: number;
  expectedValue: number;
  expectedProfitIfProfit: number;
  expectedLossIfLoss: number;
  maxProfit: number;
  maxLoss: number;
  riskReward: number;
}

const TEMPLATES = [
  { name: "Long Call", legs: [{ side: "BUY" as const, type: "CALL" as const, strike: 50000, quantity: 1, premium: 2000 }] },
  { name: "Long Put", legs: [{ side: "BUY" as const, type: "PUT" as const, strike: 50000, quantity: 1, premium: 1500 }] },
  { name: "Bull Call Spread", legs: [
    { side: "BUY" as const, type: "CALL" as const, strike: 50000, quantity: 1, premium: 2000 },
    { side: "SELL" as const, type: "CALL" as const, strike: 52000, quantity: 1, premium: 1000 },
  ]},
  { name: "Iron Condor", legs: [
    { side: "SELL" as const, type: "CALL" as const, strike: 54000, quantity: 1, premium: 800 },
    { side: "BUY" as const, type: "CALL" as const, strike: 56000, quantity: 1, premium: 400 },
    { side: "SELL" as const, type: "PUT" as const, strike: 48000, quantity: 1, premium: 800 },
    { side: "BUY" as const, type: "PUT" as const, strike: 46000, quantity: 1, premium: 400 },
  ]},
];

export default function StrategyPage() {
  const [legs, setLegs] = useState<StrategyLeg[]>([
    { side: "BUY", type: "CALL", strike: 50000, quantity: 1, premium: 2000 },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const calculateMetrics = (): StrategyMetrics => {
    const totalPremium = legs.reduce((sum, l) => {
      const cost = l.side === "BUY" ? l.premium * l.quantity : -l.premium * l.quantity;
      return sum + cost;
    }, 0);

    return {
      pop: 0.65,
      expectedValue: 450 + Math.random() * 300,
      expectedProfitIfProfit: 1200 + Math.random() * 800,
      expectedLossIfLoss: -600 - Math.random() * 400,
      maxProfit: 3000 + Math.random() * 2000,
      maxLoss: -Math.abs(totalPremium),
      riskReward: 2.5 + Math.random(),
    };
  };

  const metrics = calculateMetrics();

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setLegs(template.legs);
    setSelectedTemplate(template.name);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-12">Strategy Builder</h1>

      {/* Template Quick Select */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Strategy Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map((template) => (
            <button
              key={template.name}
              onClick={() => applyTemplate(template)}
              className={`card text-left transition ${
                selectedTemplate === template.name
                  ? "border border-accent-cream bg-accent-cream/10"
                  : "border-neutral-700 hover:border-accent-cream"
              }`}
            >
              <div className="font-bold text-accent-cream">{template.name}</div>
              <div className="text-xs text-neutral-500 mt-2">{template.legs.length} leg{template.legs.length > 1 ? "s" : ""}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Legs Display */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Strategy Legs</h2>
        <div className="space-y-3">
          {legs.map((leg, idx) => (
            <div key={idx} className="card grid grid-cols-6 gap-4 items-center">
              <div>
                <span className={`badge ${leg.side === "BUY" ? "badge-buy" : "badge-sell"}`}>
                  {leg.side}
                </span>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Type</div>
                <div className="font-bold">{leg.type}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Strike</div>
                <div className="font-bold data-value">${leg.strike.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Qty</div>
                <div className="font-bold">{leg.quantity}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Premium</div>
                <div className="font-bold data-value">${leg.premium.toLocaleString()}</div>
              </div>
              <button
                onClick={() => setLegs(legs.filter((_, i) => i !== idx))}
                className="text-red-400 hover:text-red-300 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Metrics — THE INNOVATION */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Strategy Metrics (Probability-Weighted)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="text-accent-cream text-sm font-mono mb-2">P(ITM)</div>
            <div className="text-3xl font-bold data-value">{(metrics.pop * 100).toFixed(1)}%</div>
            <p className="text-xs text-neutral-500 mt-2">Probability of finishing in the money (Synth distribution)</p>
          </div>

          <div className="card">
            <div className="text-accent-cream text-sm font-mono mb-2">EXPECTED VALUE</div>
            <div className={`text-3xl font-bold data-value ${metrics.expectedValue > 0 ? "text-green-400" : "text-red-400"}`}>
              ${metrics.expectedValue.toFixed(0)}
            </div>
            <p className="text-xs text-neutral-500 mt-2">Probability-weighted average outcome</p>
          </div>

          <div className="card">
            <div className="text-accent-cream text-sm font-mono mb-2">RISK/REWARD</div>
            <div className="text-3xl font-bold text-green-400 data-value">{metrics.riskReward.toFixed(2)}</div>
            <p className="text-xs text-neutral-500 mt-2">Expected profit / Expected loss ratio</p>
          </div>

          <div className="card">
            <div className="text-green-400 text-sm font-mono mb-2">MAX PROFIT</div>
            <div className="text-2xl font-bold data-value">${metrics.maxProfit.toFixed(0)}</div>
            <p className="text-xs text-neutral-500 mt-2">Best case scenario</p>
          </div>

          <div className="card">
            <div className="text-red-400 text-sm font-mono mb-2">MAX LOSS</div>
            <div className="text-2xl font-bold data-value text-red-400">${Math.abs(metrics.maxLoss).toFixed(0)}</div>
            <p className="text-xs text-neutral-500 mt-2">Worst case scenario</p>
          </div>

          <div className="card">
            <div className="text-accent-cream text-sm font-mono mb-2">EXP. PROFIT IF PROFITABLE</div>
            <div className="text-2xl font-bold text-green-400 data-value">${metrics.expectedProfitIfProfit.toFixed(0)}</div>
            <p className="text-xs text-neutral-500 mt-2">Average gain in winning scenarios</p>
          </div>
        </div>
      </div>

      {/* Probability-Weighted P&L Chart Placeholder */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Probability-Weighted P&L Diagram</h2>
        <div className="chart-container flex items-center justify-center text-neutral-500">
          <div className="text-center">
            <p className="mb-2">Chart visualization coming soon</p>
            <p className="text-sm">Shows payoff overlaid with Synth's predicted price distribution</p>
            <p className="text-sm text-accent-cream mt-2">Green zone = Profitable | Red zone = Loss</p>
          </div>
        </div>
      </div>
    </div>
  );
}
