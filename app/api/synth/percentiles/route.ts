import { NextRequest, NextResponse } from 'next/server'
import { getMockPercentiles } from '@/lib/mock-data'
import type { Asset } from '@/types/synth'

export async function GET(request: NextRequest) {
  const asset = request.nextUrl.searchParams.get('asset') as Asset | null
  if (!asset || !['BTC', 'ETH', 'SOL'].includes(asset)) {
    return NextResponse.json({ error: 'Invalid asset' }, { status: 400 })
  }

  const pct = getMockPercentiles(asset)
  const values = Object.values(pct.percentiles).sort((a, b) => a - b)
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length

  return NextResponse.json({
    percentiles: pct.percentiles,
    mean,
    median: pct.current_price,
    stdDev: Math.sqrt(variance),
    min: values[0],
    max: values[values.length - 1],
    timestamp: pct.timestamp,
  })
}
