/**
 * Strikes Page
 * Asset selector, direction toggle, strike optimizer, P(Profit) chart
 */

"use client";

import React, { useState, useMemo } from "react";
import { OptionChainTable } from "@/components/OptionChainTable";
import { PercentileConeChart } from "@/components/PercentileConeChart";
import { useDistribution, useSynthOptionPricing } from "@/components/useSynthData";
import { expectedValue, percentilesToArray } from "@/lib/options-math";
import { OptionLeg } from "@/types";

const ASSETS = ["BTC", "ETH", "SOL", "HYPE", "TAO"];
const DIRECTIONS = ["CALLS", "PUTS", "BOTH"] as const;

export default function StrikesPage() {
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  const [selectedDirection, setSelectedDirection] = useState<typeof DIRECTIONS[number]>("CALLS");
  const [selectedStrike, setSelectedStrike] = useState<number | null>(null);

  const pricing = useSynthOptionPricing(selectedAsset);
  const distribution = useDistribution(selectedAsset);

  // Generate strikes around current price
  const strikes = useMemo(() => {
    if (!distribution.data) return [];

    const median = distribution.data.median;
    const stdDev = distribution.data.stdDev;

    const baseStrikes = [
      Math.floor(median - 2 * stdDev),
      Math.floor(median - stdDev),
      Math.floor(median - stdDev / 2),
      Math.floor(median),
      Math.floor(median + stdDev / 2),
      Math.floor(median + stdDev),
      Math.floor(median + 2 * stdDev),
    ];

    return baseStrikes.filter((s) => s > 0).sort((a, b) => a - b);
  }, [distribution.data]);

  // Optimizer: find top 3 EV-maximizing strikes
  const topStrikes = useMemo(() => {
    if (!distribution.data || strikes.length === 0) return [];

    const percentiles = percentilesToArray(distribution.data.percentiles);
    const results: Array<{
      strike: number;
      ev: number;
      pop: number;
    }> = [];

    for (const strike of strikes) {
      const leg: OptionLeg = {
        type: selectedDirection === "PUTS" ? "put" : "call",
        strike,
        quantity: 1,
        side: "long",
        price: pricing.data?.call || 0.01,
      };

      const metrics = expectedValue([leg], percentiles);
      results.push({
        strike,
        ev: metrics.ev,
        pop: metrics.pop,
      });
    }

    return results
      .sort((a, b) => b.ev - a.ev)
      .slice(0, 3);
  }, [strikes, distribution.data, pricing.data, selectedDirection]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif italic text-gray-900 dark:text-white mb-2">
          Strike Optimizer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Distribution-based option chain analysis with probability-weighted P&L
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Asset Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Asset
          </label>
          <select
            value={selectedAsset}
            onChange={(e) => {
              setSelectedAsset(e.target.value);
              setSelectedStrike(null);
            }}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            {ASSETS.map((asset) => (
              <option key={asset} value={asset}>
                {asset}
              </option>
            ))}
          </select>
        </div>

        {/* Direction Toggle */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Direction
          </label>
          <div className="flex gap-2">
            {DIRECTIONS.map((dir) => (
              <button
                key={dir}
                onClick={() => setSelectedDirection(dir)}
                className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  selectedDirection === dir
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>

        {/* Current Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Current Price
          </label>
          <div className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
            <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">
              ${distribution.data?.median.toFixed(2) || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Distribution Chart */}
        <div className="lg:col-span-2">
          {distribution.data ? (
            <PercentileConeChart
              data={distribution.data}
              currentPrice={distribution.data.median}
              height={400}
            />
          ) : (
            <div className="h-96 bg-gray-50 dark:bg-gray-900/20 rounded-lg flex items-center justify-center text-gray-500">
              {distribution.isLoading ? "Loading..." : "No data available"}
            </div>
          )}
        </div>

        {/* Top Strikes */}
        <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-700 h-fit">
          <h3 className="text-lg font-bold font-mono uppercase text-gray-900 dark:text-white mb-4">
            &gt;Top Strikes
          </h3>

          {topStrikes.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : (
            <div className="space-y-2">
              {topStrikes.map((item, idx) => (
                <button
                  key={item.strike}
                  onClick={() => setSelectedStrike(item.strike)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedStrike === item.strike
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">
                      #{idx + 1} ${item.strike}
                    </span>
                    <span className={`text-sm font-mono ${item.ev > 0 ? "text-green-600" : "text-red-600"}`}>
                      {item.ev > 0 ? "+" : ""}{item.ev.toFixed(4)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    P(Profit): {(item.pop * 100).toFixed(1)}%
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Option Chain Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-4">
        <h2 className="text-xl font-bold font-mono uppercase text-gray-900 dark:text-white mb-4">
          &gt;Option Chain
        </h2>
        <OptionChainTable
          asset={selectedAsset}
          strikes={strikes}
          selectedStrike={selectedStrike ?? undefined}
          onStrikeSelect={setSelectedStrike}
        />
      </div>

      {/* Info Footer */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          About This Tool
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-400">
          Strike optimizer uses distribution-based analytics from Synth API. P(Profit) is calculated
          from actual percentile data, not Black-Scholes assumptions. Click a strike to view detailed
          Greeks and risk metrics.
        </p>
      </div>
    </div>
  );
}
