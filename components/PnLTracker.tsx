/**
 * P&L Tracker
 * Display tracked positions with entry price, current price, Greeks, and P&L
 */

"use client";

import React from "react";
import { PnLTrackerProps, Position } from "@/types";
import { delta, gamma, vega, theta } from "@/lib/options-math";

const RISK_FREE_RATE = 0.05; // 5% annual
const VOLATILITY = 0.25; // 25% annual (default)

export function PnLTracker({ positions, distribution }: PnLTrackerProps) {
  const totalPnL = positions.reduce((sum, p) => sum + (p.pnl || 0), 0);
  const totalPnLPercent =
    positions.length > 0
      ? (totalPnL /
          positions.reduce((sum, p) => sum + p.entryPrice * (p.quantity || 1), 0)) *
        100
      : 0;

  const formatPnL = (value: number | undefined) => {
    if (value === undefined) return "—";
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}`;
  };

  const pnlColor = (value: number | undefined) => {
    if (value === undefined) return "text-gray-600 dark:text-gray-400";
    if (value > 0) return "text-green-600 dark:text-green-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="w-full space-y-4">
      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
              Portfolio P&L
            </h3>
            <div className={`text-3xl font-bold font-mono ${pnlColor(totalPnL)}`}>
              {formatPnL(totalPnL)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Return
            </div>
            <div
              className={`text-2xl font-bold font-mono ${pnlColor(
                totalPnLPercent
              )}`}
            >
              {totalPnLPercent > 0 ? "+" : ""}
              {totalPnLPercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Positions table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                Position
              </th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                Entry
              </th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                Current
              </th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                Qty
              </th>
              <th className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">
                Δ
              </th>
              <th className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">
                Γ
              </th>
              <th className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">
                Ν
              </th>
              <th className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">
                Θ
              </th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                P&L
              </th>
              <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                Return
              </th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No positions tracked
                </td>
              </tr>
            ) : (
              positions.map((position, idx) => {
                const entryPnL = (position.currentPrice - position.entryPrice) * position.quantity;
                const entryReturn = ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100;

                // Calculate Greeks if not provided
                const T = 0.083; // ~1 month
                const K = position.entryPrice;
                const S = position.currentPrice;

                const d = position.delta !== undefined ? position.delta : delta(S, K, T, RISK_FREE_RATE, VOLATILITY, "call");
                const g = position.gamma !== undefined ? position.gamma : gamma(S, K, T, RISK_FREE_RATE, VOLATILITY);
                const v = position.vega !== undefined ? position.vega : vega(S, K, T, RISK_FREE_RATE, VOLATILITY);
                const th = position.theta !== undefined ? position.theta : theta(S, K, T, RISK_FREE_RATE, VOLATILITY, "call");

                return (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {position.symbol}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                      ${position.entryPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                      ${position.currentPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                      {position.quantity}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                      {d.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                      {(g * 1000).toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                      {(v * 0.01).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                      {(th * 0.01).toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${pnlColor(entryPnL)}`}>
                      {formatPnL(entryPnL)}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${pnlColor(entryReturn)}`}>
                      {entryReturn > 0 ? "+" : ""}
                      {entryReturn.toFixed(2)}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Greeks legend */}
      <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400">
        <div className="font-semibold mb-1">Greeks Legend:</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <span>Δ (Delta) = directional exposure</span>
          <span>Γ (Gamma) = delta sensitivity</span>
          <span>Ν (Vega) = vol sensitivity (×0.01)</span>
          <span>Θ (Theta) = time decay/day (×0.01)</span>
        </div>
      </div>
    </div>
  );
}
