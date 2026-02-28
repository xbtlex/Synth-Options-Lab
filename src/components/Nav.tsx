'use client'

import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="border-b border-[#1a1a1a] bg-[#000000] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-[#e8e4b8]">
          >_ SYNTH OPTIONS LAB
        </Link>
        <div className="flex gap-6">
          <Link href="/" className="text-sm text-[#a0a0a0] hover:text-[#e8e4b8]">
            Vol Scanner
          </Link>
          <Link href="/strikes" className="text-sm text-[#a0a0a0] hover:text-[#e8e4b8]">
            Strike Selection
          </Link>
          <Link href="/strategy" className="text-sm text-[#a0a0a0] hover:text-[#e8e4b8]">
            Strategy Builder
          </Link>
          <Link href="/volatility" className="text-sm text-[#a0a0a0] hover:text-[#e8e4b8]">
            IV Dashboard
          </Link>
          <Link href="/distributions" className="text-sm text-[#a0a0a0] hover:text-[#e8e4b8]">
            Distribution
          </Link>
        </div>
      </div>
    </nav>
  )
}
