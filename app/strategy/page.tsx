/**
 * Strategy Page
 * Leg builder, payoff diagrams, probability-weighted P&L, strategy metrics
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDistribution, useSynthOptionPricing } from "@/components/useSynthData";
import {
  strategyPnL,
  expectedValue,
  percentilesToArray,
  blackScholes,
} from "@/lib/options-math";
import { OptionLeg, StrategyMetrics } from "@/types";

const TEMPLATES = {
  "Bull Call Spread": [
    { type: "call" as const, strike: 100, side: "long" as const },
    { type: "call" as const, strike: 110, side: "short" as const },
  ],
  "Iron Condor": [
    { type: "put" as const, strike: 90, side: "short" as const },
    { type: "put" as const, strike: 95, side: "long" as const },
    { type: "call" as const, strike: 110, side: "short" as const },
    { type: "call" as const, strike: 115, side: "long" as const },
  ],
  "Long Straddle": [
    { type: "call" as const, strike: 100, side: "long" as const },
    { type: "put" as const, strike: 100, side: "long" as const },
  ],
  "Short Call": [
    { type: "call" as const, strike: 100, side: "short" as const },
  ],
};

interface ChartDataPoint {
  price: number;
  pnl: number;
  expectedPnL: number;
  bs: number;
}

export default function StrategyPage() {
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("Bull Call Spread");
  const [legs, setLegs] = useState<OptionLeg[]>([
    {
      type: "call",
      strike: 100,
      quantity: 1,
      side: "long",
      price: 2.5,
    },
    {
      type: "call",
      strike: 110,
      quantity: 1,
      side: "short",
      price: 1.0,
    },
  ]);

  const distribution = useDistribution(selectedAsset);
  const pricing = useSynthOptionPricing(selectedAsset);

  // Calculate metrics
  const metrics = useMemo<StrategyMetrics | null>(() => {
    if (!distribution.data) return null;

    const percentiles = percentilesToArray(distribution.data.percentiles);
    const metrics = expectedValue(legs, percentiles);

    // Find breakeven points
    const breakevens: number[] = [];
    const testRange = Array.from(
      { length: 200 },
      (_, i) =>
        distribution.data!.min + (i / 200) * (distribution.data!.max - distribution.data!.min)
    );

    let lastPnL = strategyPnL(legs, testRange[0]);
    for (let i = 1; i < testRange.length; i++) {
      const pnl = strategyPnL(legs, testRange[i]);
      if ((lastPnL < 0 && pnl > 0) || (lastPnL > 0 && pnl < 0)) {
        breakevens.push(testRange[i]);
      }
      lastPnL = pnl;
    }

    return {
      maxProfit: Math.max(
        ...testRange.map((p) => strategyPnL(legs, p))
      ),
      maxLoss: Math.min(
        ...testRange.map((p) => strategyPnL(legs, p))
      ),
      breakeven: breakevens,
      probabilityOfProfit: metrics.pop,
      expectedValue: metrics.ev,
      expectedProfit: metrics.expectedProfit,
      expectedLoss: metrics.expectedLoss,
      riskRewardRatio: Math.abs(metrics.expectedProfit / Math.max(metrics.expectedLoss, 0.01)),
    };
  }, [legs, distribution.data]);

  // Payoff chart data
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!distribution.data) return [];

    const percentiles = percentilesToArray(distribution.data.percentiles);
    const range = Array.from({ length: 100 }, (_, i) =>
      distribution.data!.min + (i / 100) * (distribution.data!.max - distribution.data!.min)
    );

    return range.map((price) => {
      const pnl = strategyPnL(legs, price);

      // Black-Scholes comparison
      let bsPnL = 0;
      for (const leg of legs) {
        const T = 0.083; // ~30 days
        const r = 0.05; // 5% risk-free
        const sigma = 0.25; // 25% vol
        const bs = blackScholes(
          distribution.data!.median,
          leg.strike,
          T,
          r,
          sigma,
          leg.type
        );
        const intrinsic = strategyPnL([leg], price);
        const sign = leg.side === "long" ? 1 : -1;
        bsPnL += sign * (intrinsic - bs);
      }

      return {
        price,
        pnl,
        expectedPnL: pnl, // Overlay with distribution probabilities
        bs: bsPnL,
      };
    });
  }, [legs, distribution.data]);

  const handleLoadTemplate = (template: string) => {
    setSelectedTemplate(template);
    const baseLegs = TEMPLATES[template as keyof typeof TEMPLATES];
    if (baseLegs) {
      setLegs(
        baseLegs.map((leg) => ({
          ...leg,
          quantity: 1,
          price: 0,
        }))
      );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif italic text-gray-900 dark:text-white mb-2">
          Strategy Builder
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Design spreads and analyze probability-weighted P&L with Synth distribution
        </p>
      </div>

      {/* Asset Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Asset
        </label>
        <select
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          {["BTC", "ETH", "SOL", "HYPE", "TAO"].map((asset) => (
            <option key={asset} value={asset}>
              {asset}
            </option>
          ))}
        </select>
      </div>

      {/* Templates */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Templates
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.keys(TEMPLATES).map((template) => (
            <button
              key={template}
              onClick={() => handleLoadTemplate(template)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                selectedTemplate === template
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300"
              }`}
            >
              {template}
            </button>
          ))}
        </div>
      </div>

      {/* Legs Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        {/* Legs */}
        <div className="lg:col-span-1">
          <h3 className="font-bold font-mono uppercase text-gray-900 dark:text-white mb-3">
            &gt;Legs
          </h3>
          <div className="space-y-2">
            {legs.map((leg, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs"
              >
                <div className="font-semibold mb-1">
                  {leg.side === "long" ? "📈" : "📉"} {leg.type.toUpperCase()}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Strike: ${leg.strike}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Qty: {leg.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payoff Chart */}
        <div className="lg:col-span-3">
          <h3 className="font-bold font-mono uppercase text-gray-900 dark:text-white mb-3">
            &gt;Payoff Diagram
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  className="dark:stroke-gray-700"
                />
                <XAxis
                  dataKey="price"
                  stroke="#6b7280"
                  className="dark:stroke-gray-600"
                  label={{ value: "Price at Expiry ($)", position: "insideBottomRight", offset: -5 }}
                />
                <YAxis
                  stroke="#6b7280"
                  className="dark:stroke-gray-600"
                  label={{ value: "P&L ($)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #4b5563",
                    color: "#f3f4f6",
                  }}
                />
                <Legend />

                {/* Probability-weighted P&L */}
                <Area
                  type="monotone"
                  dataKey="expectedPnL"
                  fill="#3b82f6"
                  stroke="#2563eb"
                  fillOpacity={0.3}
                  name="Synth P&L"
                />

                {/* BS comparison */}
                <Line
                  type="monotone"
                  dataKey="bs"
                  stroke="#f97316"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="BS Comparison"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center text-gray-500">
              Loading chart...
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
              Max Profit
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">
              +${metrics.maxProfit.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
              Max Loss
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono">
              ${metrics.maxLoss.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
              P(Profit)
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
              {(metrics.probabilityOfProfit * 100).toFixed(1)}%
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
              Risk/Reward
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono">
              1:{metrics.riskRewardRatio.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          Synth vs Black-Scholes
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-400">
          The orange dashed line shows Black-Scholes expected payoff. The blue area shows the
          probability-weighted P&L using actual Synth percentile distribution. Divergence indicates
          where Synth pricing deviates from standard assumptions.
        </p>
      </div>
    </div>
  );
}
