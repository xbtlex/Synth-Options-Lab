/**
 * Option Chain Table
 * Columns: Strike, Synth Call, Synth Put, P(ITM), IV, Edge, Recommendation
 */

"use client";

import React, { useMemo } from "react";
import { OptionChainTableProps } from "@/types";
import { useSynthOptionPricing, useDistribution } from "./useSynthData";
import { probabilityITM, percentilesToArray } from "@/lib/options-math";

interface RowData {
  strike: number;
  callPrice: number;
  putPrice: number;
  pitmCall: number;
  pitmPut: number;
  iv: number;
  edge: number;
  recommendation: "buy" | "sell" | "neutral";
}

export function OptionChainTable({
  asset,
  strikes,
  selectedStrike,
  onStrikeSelect,
}: Omit<OptionChainTableProps, "data">) {
  const pricing = useSynthOptionPricing(asset);
  const distribution = useDistribution(asset);

  const rows = useMemo<RowData[]>(() => {
    if (!pricing.data || !distribution.data) return [];

    const percentiles = percentilesToArray(distribution.data.percentiles);

    return strikes.map((strike) => {
      const pitmCall = probabilityITM(percentiles, strike, "call");
      const pitmPut = probabilityITM(percentiles, strike, "put");

      // Simple edge: compare Synth IV to realized vol
      const volRatio =
        distribution.data!.stdDev > 0
          ? (pricing.data!.call / distribution.data!.stdDev) * 100
          : 0;

      // Recommendation based on probability
      let recommendation: "buy" | "sell" | "neutral" = "neutral";
      if (pitmCall > 0.65) {
        recommendation = "buy"; // High prob ITM = attractive call
      } else if (pitmCall < 0.35) {
        recommendation = "sell"; // Low prob ITM = attractive put sell
      }

      return {
        strike,
        callPrice: pricing.data!.call,
        putPrice: pricing.data!.put,
        pitmCall,
        pitmPut,
        iv: volRatio,
        edge: volRatio - 50,
        recommendation,
      };
    });
  }, [strikes, pricing, distribution]);

  const isLoading = pricing.isLoading || distribution.isLoading;

  const recommendationColor = (rec: string) => {
    switch (rec) {
      case "buy":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "sell":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="border-b border-gray-300 dark:border-gray-600">
            <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
              Strike
            </th>
            <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
              Call
            </th>
            <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
              Put
            </th>
            <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
              P(ITM) C
            </th>
            <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
              P(ITM) P
            </th>
            <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
              IV
            </th>
            <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
              Edge %
            </th>
            <th className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">
              Recommendation
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={8} className="px-4 py-4 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                </div>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-4 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.strike}
                onClick={() => onStrikeSelect?.(row.strike)}
                className={`border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                  selectedStrike === row.strike
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : ""
                }`}
              >
                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                  ${row.strike.toFixed(0)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                  ${row.callPrice.toFixed(4)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                  ${row.putPrice.toFixed(4)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                  {(row.pitmCall * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                  {(row.pitmPut * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                  {row.iv.toFixed(1)}%
                </td>
                <td
                  className={`px-4 py-3 text-right font-semibold ${
                    row.edge > 5
                      ? "text-green-600 dark:text-green-400"
                      : row.edge < -5
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {row.edge > 0 ? "+" : ""}{row.edge.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${recommendationColor(
                      row.recommendation
                    )}`}
                  >
                    {row.recommendation === "neutral" ? "N/A" : row.recommendation}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {(pricing.error || distribution.error) && (
        <div className="mt-4 p-3 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          Failed to load option chain data
        </div>
      )}
    </div>
  );
}
