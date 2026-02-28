/**
 * Percentile Cone Chart
 * Fan chart with RED→ORANGE→GREEN bands + current price overlay
 */

"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PercentileConeChartProps, Distribution } from "@/types";

interface ChartDataPoint {
  percentile: number;
  p5: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
}

export function PercentileConeChart({
  data,
  currentPrice,
  title = ">_ DISTRIBUTION CONE",
  height = 400,
  width = 100,
}: PercentileConeChartProps) {
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!data || !data.percentiles) return [];

    // Create synthetic percentile bands
    const p = data.percentiles;
    const percentages = [5, 10, 25, 50, 75, 90, 95];

    const point: ChartDataPoint = {
      percentile: 0,
      p5: p["5"] || 0,
      p10: p["10"] || 0,
      p25: p["25"] || 0,
      p50: p["50"] || 0,
      p75: p["75"] || 0,
      p90: p["90"] || 0,
      p95: p["95"] || 0,
    };

    // For the fan chart, we create data points across time
    // Here we simulate multiple timepoints
    return [
      point,
      { ...point, percentile: 1 },
      { ...point, percentile: 2 },
    ];
  }, [data]);

  if (!data || chartData.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
        <span className="text-gray-500 dark:text-gray-400">
          No distribution data available
        </span>
      </div>
    );
  }

  const minPrice = Math.min(
    data.percentiles["5"] || currentPrice * 0.8,
    currentPrice * 0.8
  );
  const maxPrice = Math.max(
    data.percentiles["95"] || currentPrice * 1.2,
    currentPrice * 1.2
  );

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold font-mono text-gray-900 dark:text-white mb-4 uppercase">
        {title}
      </h2>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
        >
          <defs>
            {/* Gradient bands for visualization */}
            <linearGradient id="grad-red" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="grad-orange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="grad-green" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            className="dark:stroke-gray-700"
          />

          <XAxis
            dataKey="percentile"
            stroke="#6b7280"
            className="dark:stroke-gray-600"
          />

          <YAxis
            domain={[minPrice, maxPrice]}
            stroke="#6b7280"
            className="dark:stroke-gray-600"
            label={{
              value: "Price ($)",
              angle: -90,
              position: "insideLeft",
            }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #4b5563",
              borderRadius: "8px",
              color: "#f3f4f6",
            }}
            formatter={(value) => {
              if (typeof value === "number") {
                return `$${value.toFixed(2)}`;
              }
              return String(value);
            }}
          />

          {/* Confidence bands (Red = 5-10th percentile) */}
          <Area
            type="monotone"
            dataKey="p5"
            stroke="#ef4444"
            fill="url(#grad-red)"
            isAnimationActive={false}
            name="5th %ile"
          />

          {/* Middle band (Orange = 25-75th percentile) */}
          <Area
            type="monotone"
            dataKey="p25"
            stroke="#f97316"
            fill="url(#grad-orange)"
            isAnimationActive={false}
            name="25th %ile"
          />

          {/* Tight band (Green = 75-95th percentile) */}
          <Area
            type="monotone"
            dataKey="p75"
            stroke="#22c55e"
            fill="url(#grad-green)"
            isAnimationActive={false}
            name="75th %ile"
          />

          {/* Median line */}
          <Line
            type="monotone"
            dataKey="p50"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
            name="Median"
          />

          {/* Current price horizontal */}
          <Line
            type="stepAfter"
            dataKey={() => currentPrice}
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={false}
            name="Current Price"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded" />
          <span className="text-gray-700 dark:text-gray-300">5th %ile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-400 rounded" />
          <span className="text-gray-700 dark:text-gray-300">25th %ile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 rounded" />
          <span className="text-gray-700 dark:text-gray-300">75th %ile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 rounded" />
          <span className="text-gray-700 dark:text-gray-300">Median</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-400 rounded" />
          <span className="text-gray-700 dark:text-gray-300">Current</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-gray-50 dark:bg-gray-900/20 p-2 rounded">
          <div className="text-gray-600 dark:text-gray-400">Mean</div>
          <div className="font-semibold text-gray-900 dark:text-white">
            ${data.mean?.toFixed(2) || "N/A"}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/20 p-2 rounded">
          <div className="text-gray-600 dark:text-gray-400">StdDev</div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {((data.stdDev / data.mean) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/20 p-2 rounded">
          <div className="text-gray-600 dark:text-gray-400">Range</div>
          <div className="font-semibold text-gray-900 dark:text-white">
            ${data.min?.toFixed(0)} – ${data.max?.toFixed(0)}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/20 p-2 rounded">
          <div className="text-gray-600 dark:text-gray-400">Current</div>
          <div className="font-semibold text-gray-900 dark:text-white">
            ${currentPrice.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
