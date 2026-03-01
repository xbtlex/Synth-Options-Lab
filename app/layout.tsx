import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Synth Options Lab",
  description: "Probability-weighted options analysis powered by Synth's distribution forecasting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} bg-black text-white`}
      >
        <div className="min-h-screen flex flex-col">
          {/* Top Nav */}
          <nav className="border-b border-neutral-800 sticky top-0 z-50 bg-black/95 backdrop-blur">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <a href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded"></div>
                <span className="font-playfair font-bold text-xl">SYNTH</span>
              </a>
              <div className="flex items-center gap-8">
                <a href="/" className="text-sm font-medium hover:text-amber-400 transition">
                  Vol Scanner
                </a>
                <a href="/strikes" className="text-sm font-medium hover:text-amber-400 transition">
                  Strikes
                </a>
                <a href="/strategy" className="text-sm font-medium hover:text-amber-400 transition">
                  Strategy
                </a>
                <a href="/volatility" className="text-sm font-medium hover:text-amber-400 transition">
                  IV Analysis
                </a>
                <a href="/distributions" className="text-sm font-medium hover:text-amber-400 transition">
                  Distributions
                </a>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t border-neutral-800 bg-neutral-950 mt-16">
            <div className="max-w-7xl mx-auto px-6 py-8 text-center text-neutral-500 text-sm">
              <p>Powered by <span className="text-amber-400 font-medium">Synth</span> distribution forecasts</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
