/**
 * Volatility Scanner Card
 * Display: Asset, Synth Vol, Realized Vol, Ratio, Regime Badge
 */

"use client";

import React from "react";
import { VolScannerCardProps } from "@/types";
import { useVolatility } from "./useSynthData";

export function VolScannerCard({
  asset,
  synthVol,
  realizedVol,
  regime = "normal",
  onClick,
}: VolScannerCardProps) {
  const volData = useVolatility(asset);

  const displayVol = volData.data?.implied || synthVol;
  const displayReal = volData.data?.realized || realizedVol;
  const ratio = displayReal > 0 ? displayVol / displayReal : 1;

  const regimeBg =
    ratio > 1.2
      ? "bg-red-50 dark:bg-red-900/20"
      : ratio < 0.8
        ? "bg-green-50 dark:bg-green-900/20"
        : "bg-gray-50 dark:bg-gray-900/20";

  const regimeText =
    ratio > 1.2
      ? "HIGH"
      : ratio < 0.8
        ? "LOW"
        : "NORMAL";

  const regimeColor =
    ratio > 1.2
      ? "text-red-700 dark:text-red-300"
      : ratio < 0.8
        ? "text-green-700 dark:text-green-300"
        : "text-gray-700 dark:text-gray-300";

  if (volData.isLoading) {
    return (
      <div className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${regimeBg}`}>
        <div className="animate-pulse space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-24" />
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:shadow-md ${regimeBg}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {asset}
          </h3>

          <div className="mt-3 space-y-1 font-mono text-sm">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Synth Vol</span>
              <span className="font-semibold">
                {(displayVol * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Realized Vol</span>
              <span className="font-semibold">
                {(displayReal * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-300 dark:border-gray-600">
              <span>Ratio (IV/RV)</span>
              <span className="font-semibold">{ratio.toFixed(2)}x</span>
            </div>
          </div>
        </div>

        <div className="ml-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-mono ${regimeColor} bg-white/50 dark:bg-gray-800/50`}
          >
            {regimeText}
          </span>
        </div>
      </div>

      {volData.error && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
          Data unavailable
        </div>
      )}
    </div>
  );
}

// ============================================
// SCANNER (Multiple Assets)
// ============================================

export function VolatilityScannerGrid({
  assets,
}: {
  assets: string[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.map((asset) => (
        <VolScannerCard key={asset} asset={asset} synthVol={0} realizedVol={0} />
      ))}
    </div>
  );
}
