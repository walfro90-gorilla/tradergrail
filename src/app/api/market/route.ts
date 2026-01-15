import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')?.toUpperCase()
    const timeframe = searchParams.get('timeframe') || '1Hour'
    const limit = parseInt(searchParams.get('limit') || '24')

    if (!symbol) {
        return NextResponse.json(
            { error: 'Symbol parameter is required' },
            { status: 400 }
        )
    }

    try {
        const supabase = await createClient()

        // 1. Obtener última cotización DIRECTAMENTE de market_snapshots
        const { data: snapshots, error: snapshotError } = await supabase
            .from('market_snapshots')
            .select('*')
            .eq('symbol', symbol)
            .eq('data_type', 'quote')
            .order('timestamp', { ascending: false })
            .limit(1)
            .single()

        if (snapshotError || !snapshots) {
            console.error('Snapshot error:', snapshotError)
            return NextResponse.json(
                {
                    error: 'No market data found',
                    message: `No cached data for ${symbol}. Click "Update Market Data" in Settings first.`,
                    available: false,
                    symbol
                },
                { status: 404 }
            )
        }

        // 2. Obtener datos históricos de market_bars (si existen)
        const { data: bars, error: barsError } = await supabase
            .from('market_bars')
            .select('*')
            .eq('symbol', symbol)
            .eq('timeframe', timeframe)
            .order('timestamp', { ascending: false })
            .limit(limit)

        if (barsError) {
            console.error('Bars error (non-critical):', barsError)
        }

        // 3. Si no hay bars, crear datos sintéticos del último snapshot
        let historicalBars = []
        if (bars && bars.length > 0) {
            historicalBars = bars
                .reverse()
                .map(bar => ({
                    time: new Date(bar.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }),
                    price: parseFloat(bar.close),
                    open: parseFloat(bar.open),
                    high: parseFloat(bar.high),
                    low: parseFloat(bar.low),
                    close: parseFloat(bar.close),
                    volume: parseFloat(bar.volume)
                }))
        } else {
            // Fallback: crear datos sintéticos desde el snapshot actual
            const basePrice = parseFloat(snapshots.price)
            for (let i = 0; i < 24; i++) {
                const time = new Date(Date.now() - (23 - i) * 60 * 60 * 1000)
                historicalBars.push({
                    time: time.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }),
                    price: basePrice,
                    open: basePrice,
                    high: basePrice,
                    low: basePrice,
                    close: basePrice,
                    volume: 0
                })
            }
        }

        return NextResponse.json({
            quote: {
                symbol: snapshots.symbol,
                price: parseFloat(snapshots.price),
                change: parseFloat(snapshots.change || 0),
                changePercent: parseFloat(snapshots.change_percent || 0),
                volume: parseFloat(snapshots.volume || 0),
                timestamp: snapshots.timestamp
            },
            historicalBars,
            available: true,
            cached: true,
            lastUpdate: snapshots.fetched_at
        })

    } catch (error: any) {
        console.error('Market data API error:', error)
        return NextResponse.json(
            {
                error: error.message || 'Failed to fetch market data',
                available: false
            },
            { status: 500 }
        )
    }
}
