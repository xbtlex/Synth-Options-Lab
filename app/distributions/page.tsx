"use client";

import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { useDistribution } from "@/components/useSynthData";
import { distributionAnalysis, percentilesToArray } from "@/lib/options-math";
import type { Percentile } from "@/types";

const ASSETS = ["BTC", "ETH", "SOL"];

/**
 * Build prediction cone data from percentiles
 * Creates a fan chart with p5, p25, p50, p75, p95 bands
 */
function buildConeData(percentiles: Record<string, number>, currentPrice: number) {
  const timepoints = ["Now", "6h", "12h", "24h"];
  // Widen bands over time to simulate uncertainty cone
  const widthFactors = [0, 0.4, 0.7, 1.0];

  const p = percentiles;
  const p5 = Number(p["5"] || currentPrice * 0.9);
  const p25 = Number(p["25"] || currentPrice * 0.95);
  const p50 = Number(p["50"] || currentPrice);
  const p75 = Number(p["75"] || currentPrice * 1.05);
  const p95 = Number(p["95"] || currentPrice * 1.1);

  return timepoints.map((label, i) => {
    const w = widthFactors[i];
    return {
      time: label,
      p5: currentPrice + (p5 - currentPrice) * w,
      p25: currentPrice + (p25 - currentPrice) * w,
      p50: currentPrice + (p50 - currentPrice) * w,
      p75: currentPrice + (p75 - currentPrice) * w,
      p95: currentPrice + (p95 - currentPrice) * w,
      actual: currentPrice, // Only show actual price at "now"
    };
  });
}

/**
 * Build histogram from percentile data
 */
function buildHistogram(percentiles: Percentile[], numBins: number = 20) {
  if (percentiles.length === 0) return [];

  const values = percentiles.map((p) => p.value).sort((a, b) => a - b);
  const min = values[0];
  const max = values[values.length - 1];
  const binWidth = (max - min) / numBins;

  const bins: { range: string; count: number; midpoint: number }[] = [];
  for (let i = 0; i < numBins; i++) {
    const lo = min + i * binWidth;
    const hi = lo + binWidth;
    const count = values.filter((v) => v >= lo && v < hi).length;
    bins.push({
      range: `${lo.toFixed(0)}`,
      count,
      midpoint: (lo + hi) / 2,
    });
  }
  return bins;
}

/** Prediction Cone Chart */
function PredictionCone({ asset }: { asset: string }) {
  const dist = useDistribution(asset);

  const coneData = useMemo(() => {
    if (!dist.data) return [];
    return buildConeData(dist.data.percentiles, dist.data.median);
  }, [dist.data]);

  if (!dist.data || coneData.length === 0) {
    return (
      <div className="h-80 bg-gray-50 dark:bg-gray-900/20 rounded-lg flex items-center justify-center text-gray-500">
        {dist.isLoading ? "Loading..." : "No data available"}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="text-sm font-mono font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
        &gt;_ Prediction Cone
      </h3>
      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={coneData} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="red-band" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="orange-band" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="green-band" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} fontFamily="monospace" />
          <YAxis stroke="#9ca3af" fontSize={11} fontFamily="monospace" domain={["auto", "auto"]}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12, fontFamily: "monospace" }}
            formatter={(value: number) => [`$${value.toFixed(0)}`, ""]}
          />
          {/* Outer band: p5 to p95 (red) */}
          <Area type="monotone" dataKey="p95" stroke="none" fill="url(#red-band)" name="95th %ile" />
          <Area type="monotone" dataKey="p5" stroke="none" fill="url(#red-band)" name="5th %ile" />
          {/* Middle band: p25 to p75 (orange) */}
          <Area type="monotone" dataKey="p75" stroke="none" fill="url(#orange-band)" name="75th %ile" />
          <Area type="monotone" dataKey="p25" stroke="none" fill="url(#orange-band)" name="25th %ile" />
          {/* Median line */}
          <Area type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={2.5} fill="url(#green-band)" name="Median" />
          {/* Current price line */}
          <ReferenceLine y={dist.data.median} stroke="#8b5cf6" strokeDasharray="4 4" strokeWidth={1.5}
            label={{ value: "Spot", fill: "#8b5cf6", fontSize: 10, fontFamily: "monospace" }} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center mt-3 text-xs font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-400/50 inline-block" />
          <span className="text-gray-500">5-95th %ile</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-orange-400/50 inline-block" />
          <span className="text-gray-500">25-75th %ile</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
          <span className="text-gray-500">Median</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-purple-500 inline-block" />
          <span className="text-gray-500">Current Price</span>
        </span>
      </div>
    </div>
  );
}

/** Distribution Histogram */
function DistributionHistogram({ asset }: { asset: string }) {
  const dist = useDistribution(asset);

  const histogram = useMemo(() => {
    if (!dist.data) return [];
    const pcts = percentilesToArray(dist.data.percentiles);
    return buildHistogram(pcts, 18);
  }, [dist.data]);

  if (!dist.data || histogram.length === 0) {
    return (
      <div className="h-80 bg-gray-50 dark:bg-gray-900/20 rounded-lg flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  const median = dist.data.median;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="text-sm font-mono font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
        &gt;_ Price Distribution at T=24h
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={histogram} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="range" stroke="#9ca3af" fontSize={9} fontFamily="monospace" angle={-45} textAnchor="end" height={60} />
          <YAxis stroke="#9ca3af" fontSize={11} fontFamily="monospace" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12, fontFamily: "monospace" }}
          />
          <Bar dataKey="count" name="Frequency" radius={[3, 3, 0, 0]}>
            {histogram.map((entry, idx) => (
              <Cell key={idx} fill={entry.midpoint > median ? "#22c55e" : "#ef4444"} fillOpacity={0.7} />
            ))}
          </Bar>
          <ReferenceLine x={median.toFixed(0)} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={2}
            label={{ value: "Spot", fill: "#f59e0b", fontSize: 10 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Tail Risk Panel */
function TailRiskPanel({ asset }: { asset: string }) {
  const dist = useDistribution(asset);

  const analysis = useMemo(() => {
    if (!dist.data) return null;
    const pcts = percentilesToArray(dist.data.percentiles);
    return distributionAnalysis(pcts, dist.data.median);
  }, [dist.data]);

  if (!dist.data || !analysis) {
    return <div className="text-gray-500 text-sm">Loading tail risk data...</div>;
  }

  const p = dist.data.percentiles;

  const metrics = [
    { label: "p0.5 (Extreme Low)", value: `$${Number(p["0.5"] || p["5"] || 0).toFixed(0)}`, color: "text-red-600 dark:text-red-400" },
    { label: "p5 (VaR 95)", value: `$${Number(p["5"] || 0).toFixed(0)}`, color: "text-red-500 dark:text-red-400" },
    { label: "p95 (Upside 95)", value: `$${Number(p["95"] || 0).toFixed(0)}`, color: "text-green-500 dark:text-green-400" },
    { label: "p99.5 (Extreme High)", value: `$${Number(p["99.5"] || p["95"] || 0).toFixed(0)}`, color: "text-green-600 dark:text-green-400" },
    { label: "IQR", value: `$${analysis.iqrPct > 0 ? (analysis.iqrPct * dist.data.median).toFixed(0) : "—"}`, color: "text-blue-600 dark:text-blue-400" },
    { label: "Skewness", value: analysis.skewness.toFixed(3), color: analysis.skewness > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400" },
    { label: "Max Drawdown", value: `${(analysis.maxDrawdown * 100).toFixed(1)}%`, color: "text-red-600 dark:text-red-400" },
    { label: "Max Upside", value: `${(analysis.maxUpside * 100).toFixed(1)}%`, color: "text-green-600 dark:text-green-400" },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="text-sm font-mono font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
        &gt;_ Tail Risk Analysis
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider">{m.label}</div>
            <div className={`text-lg font-mono font-bold mt-1 ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Shape Analysis Panel */
function ShapeAnalysis({ asset }: { asset: string }) {
  const dist = useDistribution(asset);

  const analysis = useMemo(() => {
    if (!dist.data) return null;
    const pcts = percentilesToArray(dist.data.percentiles);
    return distributionAnalysis(pcts, dist.data.median);
  }, [dist.data]);

  if (!analysis) return null;

  // Compare to normal distribution characteristics
  const normalSkew = 0;
  const normalTailRatio = 2.5; // approx p95/p5 for normal
  const isLeftSkewed = analysis.skewness < -0.1;
  const isRightSkewed = analysis.skewness > 0.1;
  const hasFatTails = analysis.tailRatio > normalTailRatio * 1.2;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="text-sm font-mono font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
        &gt;_ Shape Analysis vs Normal
      </h3>
      <div className="space-y-3">
        {/* Skewness */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div>
            <div className="font-mono text-sm font-semibold text-gray-900 dark:text-white">Skewness</div>
            <div className="text-xs text-gray-500">Normal = 0</div>
          </div>
          <div className="text-right">
            <div className={`font-mono font-bold ${isLeftSkewed ? "text-red-500" : isRightSkewed ? "text-green-500" : "text-blue-500"}`}>
              {analysis.skewness.toFixed(3)}
            </div>
            <div className="text-xs font-mono text-gray-500">
              {isLeftSkewed ? "Left-skewed (crash risk)" : isRightSkewed ? "Right-skewed (upside bias)" : "Symmetric"}
            </div>
          </div>
        </div>

        {/* Tail Ratio */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div>
            <div className="font-mono text-sm font-semibold text-gray-900 dark:text-white">Tail Ratio (p95/p5)</div>
            <div className="text-xs text-gray-500">Normal ~ {normalTailRatio.toFixed(1)}</div>
          </div>
          <div className="text-right">
            <div className={`font-mono font-bold ${hasFatTails ? "text-amber-500" : "text-blue-500"}`}>
              {analysis.tailRatio.toFixed(2)}
            </div>
            <div className="text-xs font-mono text-gray-500">
              {hasFatTails ? "Fat tails detected" : "Normal-like tails"}
            </div>
          </div>
        </div>

        {/* VaR */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div>
            <div className="font-mono text-sm font-semibold text-gray-900 dark:text-white">VaR 95</div>
            <div className="text-xs text-gray-500">Value at Risk (5th percentile loss)</div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-red-500">{(analysis.var95 * 100).toFixed(1)}%</div>
          </div>
        </div>

        {/* CVaR */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div>
            <div className="font-mono text-sm font-semibold text-gray-900 dark:text-white">CVaR 95</div>
            <div className="text-xs text-gray-500">Conditional VaR (mean of tail)</div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-red-600">{(analysis.cvar95 * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Distribution Explorer Page */
export default function DistributionsPage() {
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-serif italic text-gray-900 dark:text-white">
          &gt;_ Distribution Explorer
        </h1>
        <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-1">
          Synth prediction distributions — tail risk, shape analysis, and probability cones
        </p>
      </div>

      {/* Asset Tabs */}
      <div className="flex gap-2 mb-6">
        {ASSETS.map((a) => (
          <button
            key={a}
            onClick={() => setSelectedAsset(a)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold uppercase tracking-wider transition-colors ${
              selectedAsset === a
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Prediction Cone */}
      <div className="mb-8">
        <PredictionCone asset={selectedAsset} />
      </div>

      {/* Histogram + Tail Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DistributionHistogram asset={selectedAsset} />
        <TailRiskPanel asset={selectedAsset} />
      </div>

      {/* Shape Analysis */}
      <div className="mb-8">
        <ShapeAnalysis asset={selectedAsset} />
      </div>

      {/* Footer */}
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
          Understanding Distributions
        </h3>
        <p className="text-sm text-purple-800 dark:text-purple-400">
          Synth distributions are derived from real prediction market data and ML models.
          Unlike Black-Scholes (which assumes log-normal), Synth captures fat tails, skewness,
          and regime-dependent behavior. The prediction cone shows how uncertainty grows over time.
        </p>
      </div>
    </div>
  );
}
