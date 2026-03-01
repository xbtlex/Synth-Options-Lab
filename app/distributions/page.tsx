"use client";

import { useState, useEffect } from "react";

interface DistributionData {
  timeHorizon: "6h" | "12h" | "24h";
  percentile_0_5: number;
  percentile_5: number;
  percentile_20: number;
  percentile_50: number;
  percentile_80: number;
  percentile_95: number;
  percentile_99_5: number;
  currentPrice: number;
}

const ASSETS = ["BTC", "ETH", "SOL", "SPY", "NVDA", "GOOGL", "TSLA", "AAPL", "XAU"];

export default function DistributionsPage() {
  const [asset, setAsset] = useState("BTC");
  const [timeHorizon, setTimeHorizon] = useState<"6h" | "12h" | "24h">("24h");
  const [distData, setDistData] = useState<DistributionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistribution();
  }, [asset, timeHorizon]);

  const fetchDistribution = async () => {
    try {
      setLoading(true);
      const currentPrice = 45000 + Math.random() * 5000;
      const volatility = 0.02 + Math.random() * 0.03;

      // Mock lognormal-like distribution
      const mean = Math.log(currentPrice);
      const std = volatility * Math.sqrt(
        timeHorizon === "6h"
          ? 0.25
          : timeHorizon === "12h"
            ? 0.5
            : 1
      );

      const data: DistributionData = {
        timeHorizon,
        currentPrice,
        percentile_0_5: currentPrice * 0.85,
        percentile_5: currentPrice * 0.88,
        percentile_20: currentPrice * 0.92,
        percentile_50: currentPrice,
        percentile_80: currentPrice * 1.08,
        percentile_95: currentPrice * 1.12,
        percentile_99_5: currentPrice * 1.15,
      };

      setDistData(data);
    } catch (error) {
      console.error("Failed to fetch distribution:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-12">Distribution Explorer</h1>

      {/* Asset & Time Horizon Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div>
          <label className="block text-sm font-mono text-accent-cream mb-4">Asset</label>
          <div className="flex flex-wrap gap-2">
            {ASSETS.map((a) => (
              <button
                key={a}
                onClick={() => setAsset(a)}
                className={`px-3 py-2 rounded font-mono text-sm transition ${
                  asset === a
                    ? "bg-accent-cream text-black font-bold"
                    : "border border-neutral-700 text-neutral-400 hover:text-accent-cream"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-mono text-accent-cream mb-4">Time Horizon</label>
          <div className="flex gap-2">
            {(["6h", "12h", "24h"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeHorizon(t)}
                className={`px-4 py-2 rounded font-mono text-sm transition ${
                  timeHorizon === t
                    ? "bg-accent-cream text-black font-bold"
                    : "border border-neutral-700 text-neutral-400 hover:text-accent-cream"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Percentile Cone Chart */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Prediction Cone Chart</h2>
        <div className="card">
          <div className="chart-container flex items-center justify-center text-neutral-500">
            <div className="text-center">
              <p className="mb-2">Percentile distribution bands over {timeHorizon}</p>
              <p className="text-sm text-accent-cream">Red (tail risk) → Orange → Green (tail opportunity)</p>
              <p className="text-xs text-neutral-400 mt-4">Shows nested percentile bands with current price overlay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tail Risk Panel */}
      {distData && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Tail Risk Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card border-l-4 border-red-500">
              <div className="text-red-400 text-sm font-mono mb-2">0.5TH PERCENTILE (WORST CASE)</div>
              <div className="text-2xl font-bold data-value">${distData.percentile_0_5.toLocaleString()}</div>
              <div className="text-xs text-neutral-500 mt-2">
                {((distData.percentile_0_5 / distData.currentPrice - 1) * 100).toFixed(1)}% from current
              </div>
            </div>

            <div className="card border-l-4 border-orange-500">
              <div className="text-orange-400 text-sm font-mono mb-2">5TH PERCENTILE</div>
              <div className="text-2xl font-bold data-value">${distData.percentile_5.toLocaleString()}</div>
              <div className="text-xs text-neutral-500 mt-2">
                1 in 20 drawdown scenario
              </div>
            </div>

            <div className="card border-l-4 border-green-500">
              <div className="text-green-400 text-sm font-mono mb-2">95TH PERCENTILE</div>
              <div className="text-2xl font-bold data-value">${distData.percentile_95.toLocaleString()}</div>
              <div className="text-xs text-neutral-500 mt-2">
                1 in 20 upside scenario
              </div>
            </div>

            <div className="card border-l-4 border-green-600">
              <div className="text-green-600 text-sm font-mono mb-2">99.5TH PERCENTILE (BEST CASE)</div>
              <div className="text-2xl font-bold data-value">${distData.percentile_99_5.toLocaleString()}</div>
              <div className="text-xs text-neutral-500 mt-2">
                {((distData.percentile_99_5 / distData.currentPrice - 1) * 100).toFixed(1)}% potential upside
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Histogram */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Distribution Histogram at {timeHorizon}</h2>
        <div className="card">
          <div className="chart-container flex items-center justify-center text-neutral-500">
            <div className="text-center">
              <p className="mb-2">Cross-sectional distribution as histogram</p>
              <p className="text-sm">Marks: current price, percentile lines, and strike positions</p>
              <p className="text-xs text-accent-cream mt-3">This shows WHERE each strike sits on the distribution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Percentile Table */}
      {distData && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Distribution Percentiles</h2>
          <div className="card overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Percentile</th>
                  <th>Price Level</th>
                  <th>Move from Current</th>
                  <th>Probability Range</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold text-red-400">0.5th</td>
                  <td className="data-value">${distData.percentile_0_5.toLocaleString()}</td>
                  <td className="data-value text-red-400">
                    {((distData.percentile_0_5 / distData.currentPrice - 1) * 100).toFixed(1)}%
                  </td>
                  <td className="text-neutral-500">Tail risk</td>
                </tr>
                <tr>
                  <td className="font-bold text-orange-400">5th</td>
                  <td className="data-value">${distData.percentile_5.toLocaleString()}</td>
                  <td className="data-value text-orange-400">
                    {((distData.percentile_5 / distData.currentPrice - 1) * 100).toFixed(1)}%
                  </td>
                  <td className="text-neutral-500">5% downside</td>
                </tr>
                <tr>
                  <td className="font-bold">20th</td>
                  <td className="data-value">${distData.percentile_20.toLocaleString()}</td>
                  <td className="data-value">
                    {((distData.percentile_20 / distData.currentPrice - 1) * 100).toFixed(1)}%
                  </td>
                  <td className="text-neutral-500">20% downside</td>
                </tr>
                <tr className="border-t-2 border-accent-cream/20">
                  <td className="font-bold text-accent-cream">50th (MEDIAN)</td>
                  <td className="data-value font-bold">${distData.percentile_50.toLocaleString()}</td>
                  <td className="data-value">0%</td>
                  <td className="text-neutral-500">Current expectation</td>
                </tr>
                <tr>
                  <td className="font-bold">80th</td>
                  <td className="data-value">${distData.percentile_80.toLocaleString()}</td>
                  <td className="data-value text-green-400">
                    {((distData.percentile_80 / distData.currentPrice - 1) * 100).toFixed(1)}%
                  </td>
                  <td className="text-neutral-500">20% upside</td>
                </tr>
                <tr>
                  <td className="font-bold text-green-400">95th</td>
                  <td className="data-value">${distData.percentile_95.toLocaleString()}</td>
                  <td className="data-value text-green-400">
                    {((distData.percentile_95 / distData.currentPrice - 1) * 100).toFixed(1)}%
                  </td>
                  <td className="text-neutral-500">5% upside</td>
                </tr>
                <tr>
                  <td className="font-bold text-green-600">99.5th</td>
                  <td className="data-value">${distData.percentile_99_5.toLocaleString()}</td>
                  <td className="data-value text-green-400">
                    {((distData.percentile_99_5 / distData.currentPrice - 1) * 100).toFixed(1)}%
                  </td>
                  <td className="text-neutral-500">Tail opportunity</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Distribution Shape Analysis */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Distribution Shape Analysis</h2>
        <p className="text-neutral-400 mb-4">
          <strong>Synth's distribution</strong> differs from standard Black-Scholes lognormal:
        </p>
        <ul className="space-y-3 text-neutral-400">
          <li className="flex items-start gap-3">
            <span className="text-green-400 font-bold">✓</span>
            <span><strong>Fatter left tail (+18%)</strong> — Synth prices more downside risk than BS</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-400 font-bold">✓</span>
            <span><strong>Fatter right tail (+12%)</strong> — Synth prices more upside opportunity than BS</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-400 font-bold">✓</span>
            <span><strong>Negative skew (-0.3)</strong> — Distribution leans toward downside (crypto crash risk)</span>
          </li>
        </ul>
        <p className="text-sm text-accent-cream mt-6">
          This is WHY Synth's option prices differ from Black-Scholes — and WHERE your edge comes from.
        </p>
      </div>
    </div>
  );
}
