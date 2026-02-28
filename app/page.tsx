/**
 * Home Page
 * Landing with feature overview
 */

import Link from "next/link";
import { VolatilityScannerGrid } from "@/components/VolScannerCard";

export default function Home() {
  const features = [
    {
      title: "Distribution-Based Pricing",
      description: "Real Synth percentile data instead of Black-Scholes assumptions",
      icon: "📊",
    },
    {
      title: "Probability-Weighted P&L",
      description: "Overlay live distribution on payoff diagrams for true risk visualization",
      icon: "📈",
    },
    {
      title: "Synth vs Black-Scholes",
      description: "Always compare distribution-based pricing against traditional models",
      icon: "⚖️",
    },
    {
      title: "Real-Time Synth Data",
      description: "Live option pricing, volatility, and percentiles from Synth API",
      icon: "⚡",
    },
    {
      title: "Cross-Asset Analysis",
      description: "Compare vol ratios, term structure, and skew across 5+ assets",
      icon: "🔄",
    },
    {
      title: "Greeks Tracking",
      description: "Delta, gamma, vega, theta calculated from distribution",
      icon: "🧮",
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      {/* Hero */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-bold font-serif italic text-gray-900 dark:text-white mb-4">
          Synth Options Lab
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Distribution-based option analytics with real Synth API data. Stop guessing.
          Start measuring.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/strikes"
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Open Strikes →
          </Link>
          <Link
            href="/strategy"
            className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Build Strategy →
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold font-serif italic text-gray-900 dark:text-white mb-8">
          Core Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
            5+
          </div>
          <div className="text-sm text-blue-900 dark:text-blue-300">Assets Live</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">
            60s
          </div>
          <div className="text-sm text-green-900 dark:text-green-300">Price Refresh</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono">
            ∞
          </div>
          <div className="text-sm text-purple-900 dark:text-purple-300">Strikes</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 font-mono">
            Live
          </div>
          <div className="text-sm text-orange-900 dark:text-orange-300">Synth API</div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to analyze?</h2>
        <p className="mb-6">Start with volatility scanner or jump straight into option chains.</p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/volatility"
            className="px-6 py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-colors"
          >
            Vol Scanner →
          </Link>
          <Link
            href="/strikes"
            className="px-6 py-3 rounded-lg bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors border border-white/40"
          >
            Strikes Explorer →
          </Link>
        </div>
      </div>
    </div>
  );
}
