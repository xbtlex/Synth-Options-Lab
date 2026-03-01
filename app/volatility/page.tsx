"use client";

import { useState, useEffect } from "react";

interface VolData {
  asset: string;
  synthVol: number;
  realizedVol: number;
  volRatio: number;
  regime: "HIGH" | "NORMAL" | "LOW";
  trend: "UP" | "DOWN" | "STABLE";
}

const ASSETS = ["BTC", "ETH", "SOL", "SPY", "NVDA", "GOOGL", "TSLA", "AAPL", "XAU"];

export default function VolatilityPage() {
  const [volData, setVolData] = useState<VolData[]>([]);
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVolData();
  }, []);

  const fetchVolData = async () => {
    try {
      setLoading(true);
      const data: VolData[] = ASSETS.map((asset) => ({
        asset,
        synthVol: Math.random() * 60 + 20,
        realizedVol: Math.random() * 50 + 15,
        volRatio: 0,
        regime: ["HIGH", "NORMAL", "LOW"][Math.floor(Math.random() * 3)] as "HIGH" | "NORMAL" | "LOW",
        trend: ["UP", "DOWN", "STABLE"][Math.floor(Math.random() * 3)] as "UP" | "DOWN" | "STABLE",
      })).map((d) => ({
        ...d,
        volRatio: d.synthVol / d.realizedVol,
      }));

      setVolData(data);
    } catch (error) {
      console.error("Failed to fetch vol data:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedData = volData.find((d) => d.asset === selectedAsset);

  const regimeColor = (regime: string) => {
    switch (regime) {
      case "HIGH":
        return "text-red-400";
      case "NORMAL":
        return "text-neutral-400";
      case "LOW":
        return "text-green-400";
      default:
        return "";
    }
  };

  const trendArrow = (trend: string) => {
    switch (trend) {
      case "UP":
        return "↑";
      case "DOWN":
        return "↓";
      default:
        return "→";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-12">Implied Volatility Analysis</h1>

      {/* Asset Selector */}
      <div className="mb-12">
        <label className="block text-sm font-mono text-accent-cream mb-4">Select Asset</label>
        <div className="flex flex-wrap gap-2">
          {ASSETS.map((a) => (
            <button
              key={a}
              onClick={() => setSelectedAsset(a)}
              className={`px-4 py-2 rounded font-mono text-sm transition ${
                selectedAsset === a
                  ? "bg-accent-cream text-black font-bold"
                  : "border border-neutral-700 text-neutral-400 hover:text-accent-cream"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Volatility Overview Cards */}
      {selectedData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card">
            <div className="text-accent-cream text-sm font-mono mb-2">SYNTH FORWARD VOL</div>
            <div className="text-3xl font-bold data-value">{selectedData.synthVol.toFixed(1)}%</div>
          </div>

          <div className="card">
            <div className="text-accent-cream text-sm font-mono mb-2">REALIZED VOL</div>
            <div className="text-3xl font-bold data-value text-neutral-400">{selectedData.realizedVol.toFixed(1)}%</div>
          </div>

          <div className="card">
            <div className="text-accent-cream text-sm font-mono mb-2">VOL RATIO</div>
            <div className={`text-3xl font-bold data-value ${selectedData.volRatio > 1.2 ? "text-green-400" : "text-red-400"}`}>
              {selectedData.volRatio.toFixed(2)}x
            </div>
          </div>

          <div className="card">
            <div className="text-accent-cream text-sm font-mono mb-2">REGIME</div>
            <div className={`text-3xl font-bold ${regimeColor(selectedData.regime)}`}>
              {selectedData.regime}
            </div>
          </div>
        </div>
      )}

      {/* Vol Smile Chart */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Volatility Smile / Skew</h2>
        <div className="card">
          <div className="chart-container flex items-center justify-center text-neutral-500">
            <div className="text-center">
              <p className="mb-2">Implied volatility across strike prices</p>
              <p className="text-sm text-accent-cream">Shows the vol surface that Synth's distribution implies</p>
              <p className="text-xs text-neutral-400 mt-4">X-axis: Strike (moneyness) | Y-axis: Implied Vol</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vol Bands Chart */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Synth Volatility Forecast vs Realized</h2>
        <div className="card">
          <div className="chart-container flex items-center justify-center text-neutral-500">
            <div className="text-center">
              <p className="mb-2">Blue gradient bands for percentile ranges</p>
              <p className="text-sm">White dashed line = Synth forecast | Amber line = Realized vol</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Asset Comparison Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Cross-Asset Volatility Comparison</h2>
        <div className="card overflow-x-auto">
          {loading ? (
            <div className="loading">Loading volatility data...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Synth Vol</th>
                  <th>Realized Vol</th>
                  <th>Vol Ratio</th>
                  <th>Trend</th>
                  <th>Regime</th>
                </tr>
              </thead>
              <tbody>
                {volData.map((d) => (
                  <tr key={d.asset}>
                    <td className="font-bold">{d.asset}</td>
                    <td className="data-value">{d.synthVol.toFixed(1)}%</td>
                    <td className="data-value">{d.realizedVol.toFixed(1)}%</td>
                    <td className={`data-value font-bold ${d.volRatio > 1.2 ? "text-green-400" : d.volRatio < 0.8 ? "text-red-400" : ""}`}>
                      {d.volRatio.toFixed(2)}x
                    </td>
                    <td className="data-value">
                      <span className={d.trend === "UP" ? "text-green-400" : d.trend === "DOWN" ? "text-red-400" : ""}>
                        {trendArrow(d.trend)}
                      </span>
                    </td>
                    <td className={`font-bold ${regimeColor(d.regime)}`}>{d.regime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Earnings Context (for equities) */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Earnings Context</h2>
        <div className="text-neutral-400 text-sm">
          <p>For equities (NVDA, TSLA, AAPL, GOOGL), Synth predicts implied vol based on historical earnings vol patterns.</p>
          <p className="mt-3">Next earnings events and expected volatility impact shown here.</p>
        </div>
      </div>
    </div>
  );
}
