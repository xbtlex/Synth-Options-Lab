"use client";

import { useEffect, useState } from "react";

interface AssetVol {
  asset: string;
  synthVol: number;
  realizedVol: number;
  ratio: number;
  regime: "HIGH" | "NORMAL" | "LOW";
}

const ASSETS = ["BTC", "ETH", "SOL", "SPY", "NVDA", "GOOGL", "TSLA", "AAPL", "XAU"];

export default function VolScanner() {
  const [assets, setAssets] = useState<AssetVol[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVolData();
  }, []);

  const fetchVolData = async () => {
    try {
      setLoading(true);
      // Simulate API calls to Synth /insights/volatility
      // In production, this would call the actual Synth API
      const mockData: AssetVol[] = ASSETS.map((asset) => ({
        asset,
        synthVol: Math.random() * 80 + 20,
        realizedVol: Math.random() * 60 + 15,
        ratio: 0,
        regime: ["HIGH", "NORMAL", "LOW"][Math.floor(Math.random() * 3)] as "HIGH" | "NORMAL" | "LOW",
      })).map((d) => ({
        ...d,
        ratio: d.synthVol / d.realizedVol,
      }));

      setAssets(mockData);
    } catch (error) {
      console.error("Failed to fetch volatility data:", error);
    } finally {
      setLoading(false);
    }
  };

  const mispricings = assets
    .filter((a) => Math.abs(a.ratio - 1) > 0.15)
    .sort((a, b) => Math.abs(b.ratio - 1) - Math.abs(a.ratio - 1));

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

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero Stats */}
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          Volatility Intelligence
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="text-accent-cream text-sm font-mono mb-2">ASSETS SCANNED</div>
            <div className="text-3xl font-bold data-value">{ASSETS.length}</div>
          </div>
          
          <div className="card">
            <div className="text-accent-cream text-sm font-mono mb-2">MISPRICINGS FOUND</div>
            <div className="text-3xl font-bold text-red-400 data-value">{mispricings.length}</div>
          </div>

          <div className="card">
            <div className="text-accent-cream text-sm font-mono mb-2">AVG VOL EDGE</div>
            <div className="text-3xl font-bold text-green-400 data-value">
              {mispricings.length > 0
                ? `${(mispricings.reduce((a, m) => a + Math.abs((m.ratio - 1) * 100), 0) / mispricings.length).toFixed(1)}%`
                : "—"}
            </div>
          </div>

          <div className="card">
            <div className="text-accent-cream text-sm font-mono mb-2">BEST OPPORTUNITY</div>
            <div className="text-sm data-value">
              {mispricings.length > 0
                ? `${mispricings[0].asset} ${mispricings[0].ratio > 1 ? "underpriced" : "overpriced"}`
                : "Scanning..."}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Asset Volatility Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full loading">Loading volatility data...</div>
          ) : (
            assets.map((a) => (
              <div key={a.asset} className="card group cursor-pointer hover:border-accent-cream/50 transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{a.asset}</h3>
                  <span className={`badge ${regimeColor(a.regime)}`}>
                    {a.regime}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-neutral-500 uppercase font-mono mb-1">Synth Vol</div>
                    <div className="text-2xl font-bold data-value">{a.synthVol.toFixed(1)}%</div>
                  </div>

                  <div>
                    <div className="text-xs text-neutral-500 uppercase font-mono mb-1">Realized Vol</div>
                    <div className="text-xl data-value text-neutral-400">{a.realizedVol.toFixed(1)}%</div>
                  </div>

                  <div className="pt-3 border-t border-neutral-700">
                    <div className="text-xs text-neutral-500 uppercase font-mono mb-1">Vol Ratio</div>
                    <div className={`text-lg font-bold data-value ${a.ratio > 1.15 ? "text-green-400" : a.ratio < 0.85 ? "text-red-400" : "text-neutral-400"}`}>
                      {a.ratio.toFixed(2)}x
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Mispricings Table */}
      {mispricings.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Top Mispricings</h2>
          <div className="card overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Synth Vol</th>
                  <th>Realized Vol</th>
                  <th>Ratio</th>
                  <th>Direction</th>
                </tr>
              </thead>
              <tbody>
                {mispricings.slice(0, 10).map((m) => (
                  <tr key={m.asset}>
                    <td className="font-bold">{m.asset}</td>
                    <td className="data-value">{m.synthVol.toFixed(1)}%</td>
                    <td className="data-value">{m.realizedVol.toFixed(1)}%</td>
                    <td className="data-value font-bold">
                      {m.ratio > 1 ? (
                        <span className="text-green-400">{m.ratio.toFixed(2)}x ↑</span>
                      ) : (
                        <span className="text-red-400">{m.ratio.toFixed(2)}x ↓</span>
                      )}
                    </td>
                    <td>
                      {m.ratio > 1 ? (
                        <span className="badge badge-buy">Underpriced</span>
                      ) : (
                        <span className="badge badge-sell">Overpriced</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
