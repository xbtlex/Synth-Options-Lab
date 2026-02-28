import { NextRequest, NextResponse } from 'next/server'
import { getMockVolatility } from '@/lib/mock-data'
import type { Asset } from '@/types/synth'

export async function GET(request: NextRequest) {
  const asset = request.nextUrl.searchParams.get('asset') as Asset | null
  if (!asset || !['BTC', 'ETH', 'SOL'].includes(asset)) {
    return NextResponse.json({ error: 'Invalid asset' }, { status: 400 })
  }

  const vol = getMockVolatility(asset)
  return NextResponse.json({
    implied: vol.implied_volatility,
    realized: vol.realized_volatility,
    ratio: vol.implied_volatility / vol.realized_volatility,
    skew: vol.skew,
    kurtosis: vol.kurtosis,
    term_structure: vol.term_structure,
    timestamp: vol.timestamp,
  })
}
