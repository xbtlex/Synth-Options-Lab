"use client";

import { useState, useEffect } from "react";

interface OptionChainRow {
  strike: number;
  callPrice: number;
  putPrice: number;
  pitmCall: number;
  pitmPut: number;
  synthIv: number;
  edge: number;
  recommendation: "BUY" | "SELL" | "FAIR";
}

const ASSETS = ["BTC", "ETH", "SOL", "SPY", "NVDA", "GOOGL", "TSLA", "AAPL", "XAU"];

export default function StrikesPage() {
  const [asset, setAsset] = useState("BTC");
  const [direction, setDirection] = useState<"CALLS" | "PUTS" | "BOTH">("BOTH");
  const [optionChain, setOptionChain] = useState<OptionChainRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOptionChain();
  }, [asset]);

  const fetchOptionChain = async () => {
    try {
      setLoading(true);
      // Mock data from Synth API /insights/option-pricing + /insights/lp-probabilities
      const currentPrice = 45000 + Math.random() * 5000; // Mock spot price
      const strikes = [
        currentPrice * 0.85,
        currentPrice * 0.9,
        currentPrice * 0.95,
        currentPrice,
        currentPrice * 1.05,
        currentPrice * 1.1,
        currentPrice * 1.15,
      ].sort((a, b) => a - b);

      const chain: OptionChainRow[] = strikes.map((strike) => ({
        strike: Math.round(strike),
        callPrice: Math.random() * 2000 + 100,
        putPrice: Math.random() * 2000 + 100,
        pitmCall: Math.random() * 0.8 + 0.1,
        pitmPut: Math.random() * 0.8 + 0.1,
        synthIv: Math.random() * 40 + 30,
        edge: (Math.random() - 0.5) * 20,
        recommendation: [
          "BUY",
          "SELL",
          "FAIR",
        ][Math.floor(Math.random() * 3)] as "BUY" | "SELL" | "FAIR",
      }));

      setOptionChain(chain);
    } catch (error) {
      console.error("Failed to fetch option chain:", error);
    } finally {
      setLoading(false);
    }
  };

  const badgeClass = (rec: string) => {
    switch (rec) {
      case "BUY":
        return "badge badge-buy";
      case "SELL":
        return "badge badge-sell";
      default:
        return "badge badge-fair";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Asset & Direction Selector */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-8">Strike Selection Tool</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-mono text-accent-cream mb-3">Asset</label>
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
            <label className="block text-sm font-mono text-accent-cream mb-3">Direction</label>
            <div className="flex gap-2">
              {(["CALLS", "PUTS", "BOTH"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  className={`px-4 py-2 rounded font-mono text-sm transition ${
                    direction === d
                      ? "bg-accent-cream text-black font-bold"
                      : "border border-neutral-700 text-neutral-400 hover:text-accent-cream"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Option Chain Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Option Chain</h2>
        <div className="card overflow-x-auto">
          {loading ? (
            <div className="loading">Fetching option chain...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Strike</th>
                  <th>Call Price</th>
                  <th>Put Price</th>
                  <th>P(ITM) Call</th>
                  <th>P(ITM) Put</th>
                  <th>Synth IV</th>
                  <th>Edge vs BS</th>
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {optionChain.map((row, idx) => (
                  <tr key={idx}>
                    <td className="font-bold data-value">${row.strike.toLocaleString()}</td>
                    <td className="text-green-400 data-value">${row.callPrice.toFixed(2)}</td>
                    <td className="text-red-400 data-value">${row.putPrice.toFixed(2)}</td>
                    <td className="data-value">{(row.pitmCall * 100).toFixed(1)}%</td>
                    <td className="data-value">{(row.pitmPut * 100).toFixed(1)}%</td>
                    <td className="data-value">{row.synthIv.toFixed(1)}%</td>
                    <td className={`font-bold data-value ${row.edge > 0 ? "text-green-400" : "text-red-400"}`}>
                      {row.edge > 0 ? "+" : ""}{row.edge.toFixed(1)}%
                    </td>
                    <td>
                      <span className={badgeClass(row.recommendation)}>
                        {row.recommendation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Strike Optimizer Panel */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Strike Optimizer</h2>
        <p className="text-neutral-400 mb-6">
          Select your directional bias and risk tolerance to receive optimal strike recommendations based on expected value.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Bullish", "Neutral", "Bearish"].map((bias) => (
            <button
              key={bias}
              className="card border border-accent-cream/50 text-center py-4 hover:bg-accent-cream/10 transition"
            >
              <div className="text-accent-cream font-bold">{bias}</div>
              <div className="text-sm text-neutral-400 mt-2">Recommended strikes calculating...</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
