import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Synth Options Lab",
  description: "Distribution-based options analytics with real Synth API data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
      >
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4 max-w-7xl">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-2xl font-bold font-serif italic text-gray-900 dark:text-white"
              >
                Synth Lab
              </Link>

              <div className="flex gap-6 items-center">
                <Link
                  href="/strikes"
                  className="font-mono font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  &gt;_ Strikes
                </Link>
                <Link
                  href="/strategy"
                  className="font-mono font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  &gt;_ Strategy
                </Link>
                <Link
                  href="/volatility"
                  className="font-mono font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  &gt;_ Volatility
                </Link>
                <Link
                  href="/distributions"
                  className="font-mono font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  &gt;_ Distribution
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-black text-gray-400 py-8 border-t border-gray-800">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-between items-center">
              <div className="text-sm">
                Built with Synth API • Next.js 15 • Recharts
              </div>
              <div className="text-xs text-gray-500">
                v1.0.0 • Options Lab
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
