import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getLatestQuote } from '@/utils/alpaca-client'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Obtener símbolos activos
        const { data: tickers, error: tickersError } = await supabase
            .from('market_tickers')
            .select('symbol, refresh_interval, last_fetched_at')
            .eq('is_active', true)

        if (tickersError) {
            throw new Error(`Error fetching tickers: ${tickersError.message}`)
        }

        const results = []
        const now = new Date()

        // Actualizar cada símbolo
        for (const ticker of tickers || []) {
            try {
                // 1. Llamar a Alpaca para este símbolo
                const quote = await getLatestQuote(ticker.symbol)

                if (!quote) {
                    results.push({
                        symbol: ticker.symbol,
                        status: 'error',
                        message: 'No data from Alpaca'
                    })
                    continue
                }

                // 2. Guardar en market_snapshots
                const { error: insertError } = await supabase
                    .from('market_snapshots')
                    .insert({
                        symbol: ticker.symbol,
                        price: quote.price,
                        change: quote.change,
                        change_percent: quote.changePercent,
                        volume: quote.volume,
                        timestamp: quote.timestamp,
                        data_type: 'quote',
                        source: 'alpaca',
                        raw_data: quote
                    })

                if (insertError) {
                    throw insertError
                }

                // 3. Actualizar last_fetched_at
                await supabase
                    .from('market_tickers')
                    .update({
                        last_fetched_at: now.toISOString()
                    })
                    .eq('symbol', ticker.symbol)

                results.push({
                    symbol: ticker.symbol,
                    status: 'success',
                    price: quote.price,
                    changePercent: quote.changePercent
                })

            } catch (error: any) {
                console.error(`Error updating ${ticker.symbol}:`, error)
                results.push({
                    symbol: ticker.symbol,
                    status: 'error',
                    message: error.message
                })
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: now.toISOString(),
            updated: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'error').length,
            results
        })

    } catch (error: any) {
        console.error('Update market data error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to update market data'
            },
            { status: 500 }
        )
    }
}
