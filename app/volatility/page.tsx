/**
 * Volatility Page
 * Vol cards, volatility bands, vol smile, cross-asset comparison
 */

"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useVolatility, useSynthOptionPricing, useDistribution } from "@/components/useSynthData";
import { VolScannerCard } from "@/components/VolScannerCard";

const ASSETS = ["BTC", "ETH", "SOL"];

/** Cross-asset comparison table (extracted to avoid hooks-in-loop) */
function CrossAssetTable({ selectedAsset, onSelectAsset }: { selectedAsset: string; onSelectAsset: (a: string) => void }) {
  // Call hooks at the top level — one per asset
  const btcVol = useVolatility("BTC");
  const ethVol = useVolatility("ETH");
  const solVol = useVolatility("SOL");
  const btcDist = useDistribution("BTC");
  const ethDist = useDistribution("ETH");
  const solDist = useDistribution("SOL");

  const rows = [
    { asset: "BTC", vol: btcVol, dist: btcDist },
    { asset: "ETH", vol: ethVol, dist: ethDist },
    { asset: "SOL", vol: solVol, dist: solDist },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-4">
      <h3 className="font-bold font-mono uppercase text-gray-900 dark:text-white mb-4">
        &gt;_ Cross-Asset Vol Comparison
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Asset</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">IV</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">RV</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Ratio</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Regime</th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ asset, vol: v, dist: d }) => (
              <tr
                key={asset}
                onClick={() => onSelectAsset(asset)}
                className={`border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                  selectedAsset === asset ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
              >
                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{asset}</td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                  {v.data ? (v.data.implied * 100).toFixed(1) : "\u2014"}%
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                  {v.data ? (v.data.realized * 100).toFixed(1) : "\u2014"}%
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${
                  v.data && v.data.ratio > 1.2 ? "text-red-600 dark:text-red-400" :
                  v.data && v.data.ratio < 0.8 ? "text-green-600 dark:text-green-400" :
                  "text-gray-700 dark:text-gray-300"
                }`}>
                  {v.data?.ratio.toFixed(2) || "\u2014"}x
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    v.data && v.data.ratio > 1.2 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                    v.data && v.data.ratio < 0.8 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}>
                    {v.data && v.data.ratio > 1.2 ? "HIGH" : v.data && v.data.ratio < 0.8 ? "LOW" : "NORM"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                  ${d.data?.median.toFixed(0) || "\u2014"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function VolatilityPage() {
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");

  // Load data for selected asset
  const volData = useVolatility(selectedAsset);
  const distribution = useDistribution(selectedAsset);
  const pricing = useSynthOptionPricing(selectedAsset);

  // Vol bands chart data
  const volBandsData = [
    { time: "5D", iv: (volData.data?.implied || 0.25) * 100, rv: (volData.data?.realized || 0.20) * 100 },
    { time: "10D", iv: (volData.data?.implied || 0.25) * 100 * 0.95, rv: (volData.data?.realized || 0.20) * 100 * 0.98 },
    { time: "20D", iv: (volData.data?.implied || 0.25) * 100 * 0.90, rv: (volData.data?.realized || 0.20) * 100 * 0.95 },
    { time: "30D", iv: (volData.data?.implied || 0.25) * 100 * 0.88, rv: (volData.data?.realized || 0.20) * 100 * 0.93 },
    { time: "60D", iv: (volData.data?.implied || 0.25) * 100 * 0.86, rv: (volData.data?.realized || 0.20) * 100 * 0.92 },
  ];

  // Vol smile data (IV across strikes)
  const volSmileData = [
    { strike: "OTM Put", iv: 28 },
    { strike: "-2σ", iv: 26 },
    { strike: "-1σ", iv: 24 },
    { strike: "ATM", iv: 22 },
    { strike: "+1σ", iv: 23 },
    { strike: "+2σ", iv: 25 },
    { strike: "OTM Call", iv: 27 },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif italic text-gray-900 dark:text-white mb-2">
          Volatility Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time implied, realized, and term structure across assets
        </p>
      </div>

      {/* Asset Scanner Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-bold font-mono uppercase text-gray-900 dark:text-white mb-4">
          &gt;_ Multi-Asset Scanner
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ASSETS.map((asset) => (
            <VolScannerCard
              key={asset}
              asset={asset}
              synthVol={0}
              realizedVol={0}
              onClick={() => setSelectedAsset(asset)}
            />
          ))}
        </div>
      </div>

      {/* Selected Asset Analysis */}
      <div className="mb-8">
        <h3 className="text-lg font-bold font-mono uppercase text-gray-900 dark:text-white mb-4">
          &gt;_ {selectedAsset} Volatility Details
        </h3>

        {/* IV vs RV Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-semibold text-blue-900 dark:text-blue-300 uppercase">
              Implied Vol
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono mt-2">
              {(volData.data?.implied ? volData.data.implied * 100 : 0).toFixed(1)}%
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              Synth option market expectation
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="text-sm font-semibold text-green-900 dark:text-green-300 uppercase">
              Realized Vol
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 font-mono mt-2">
              {(volData.data?.realized ? volData.data.realized * 100 : 0).toFixed(1)}%
            </div>
            <div className="text-xs text-green-700 dark:text-green-400 mt-1">
              Historical volatility (20d)
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="text-sm font-semibold text-purple-900 dark:text-purple-300 uppercase">
              IV / RV Ratio
            </div>
            <div className={`text-3xl font-bold font-mono mt-2 ${
              volData.data && volData.data.ratio > 1.2
                ? "text-red-600 dark:text-red-400"
                : volData.data && volData.data.ratio < 0.8
                  ? "text-green-600 dark:text-green-400"
                  : "text-purple-600 dark:text-purple-400"
            }`}>
              {volData.data?.ratio.toFixed(2) || "—"}x
            </div>
            <div className={`text-xs mt-1 ${
              volData.data && volData.data.ratio > 1.2
                ? "text-red-700 dark:text-red-400"
                : volData.data && volData.data.ratio < 0.8
                  ? "text-green-700 dark:text-green-400"
                  : "text-purple-700 dark:text-purple-400"
            }`}>
              {volData.data && volData.data.ratio > 1.2
                ? "Options overpriced"
                : volData.data && volData.data.ratio < 0.8
                  ? "Options underpriced"
                  : "Fair valuation"}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Volatility Term Structure */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="font-bold font-mono uppercase text-gray-900 dark:text-white mb-4">
              &gt;_ Vol Term Structure
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={volBandsData}>
                <defs>
                  <linearGradient id="grad-iv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="time" stroke="#6b7280" className="dark:stroke-gray-600" />
                <YAxis stroke="#6b7280" className="dark:stroke-gray-600" label={{ value: "Vol (%)", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #4b5563", color: "#f3f4f6" }}
                />
                <Legend />
                <Area type="monotone" dataKey="iv" stackId="1" stroke="#3b82f6" fill="url(#grad-iv)" name="IV" />
                <Area type="monotone" dataKey="rv" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="RV" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Volatility Smile */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="font-bold font-mono uppercase text-gray-900 dark:text-white mb-4">
              &gt;_ Vol Smile (Skew)
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={volSmileData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="strike" stroke="#6b7280" className="dark:stroke-gray-600" />
                <YAxis stroke="#6b7280" className="dark:stroke-gray-600" label={{ value: "IV (%)", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #4b5563", color: "#f3f4f6" }}
                />
                <Line
                  type="monotone"
                  dataKey="iv"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="IV"
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cross-Asset Comparison Table */}
      <CrossAssetTable selectedAsset={selectedAsset} onSelectAsset={setSelectedAsset} />

      {/* Info Footer */}
      <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
          Understanding Vol Metrics
        </h3>
        <ul className="text-sm text-green-800 dark:text-green-400 space-y-1">
          <li>
            <strong>IV &gt; RV:</strong> Options are expensive. Sell premium (short calls/puts).
          </li>
          <li>
            <strong>IV &lt; RV:</strong> Options are cheap. Buy premium (long calls/puts).
          </li>
          <li>
            <strong>Vol Smile:</strong> OTM options priced higher than ATM. Indicates tail risk premium.
          </li>
          <li>
            <strong>Term Structure:</strong> Backwardation (near &gt; far) vs Contango (far &gt; near).
          </li>
        </ul>
      </div>
    </div>
  );
}
