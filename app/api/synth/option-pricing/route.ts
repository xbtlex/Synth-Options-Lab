import { NextRequest, NextResponse } from 'next/server'
import { getMockPricing } from '@/lib/mock-data'
import type { Asset } from '@/types/synth'

export async function GET(request: NextRequest) {
  const asset = request.nextUrl.searchParams.get('asset') as Asset | null
  if (!asset || !['BTC', 'ETH', 'SOL'].includes(asset)) {
    return NextResponse.json({ error: 'Invalid asset' }, { status: 400 })
  }

  const data = getMockPricing(asset)
  // Return in the shape the useSynthData hooks expect
  const atm = data.strikes.reduce((best, s) =>
    Math.abs(s.strike - data.current_price) < Math.abs(best.strike - data.current_price) ? s : best
  )

  return NextResponse.json({
    call: atm.call_price,
    put: atm.put_price,
    timestamp: data.timestamp,
    strikes: data.strikes,
    current_price: data.current_price,
  })
}
