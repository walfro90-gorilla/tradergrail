import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface AlpacaQuote {
    quote: {
        ap: number  // Ask price
        bp: number  // Bid price
        as: number  // Ask size
        bs: number  // Bid size
        t: string   // Timestamp
    }
}

serve(async (req) => {
    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Obtener símbolos activos que necesitan actualización
        const { data: tickers, error: tickersError } = await supabase
            .from('market_tickers')
            .select('symbol, refresh_interval, last_fetched_at')
            .eq('is_active', true)

        if (tickersError) throw tickersError

        const results = []
        const now = new Date()

        for (const ticker of tickers || []) {
            const lastFetch = ticker.last_fetched_at ? new Date(ticker.last_fetched_at) : new Date(0)
            const ageSeconds = (now.getTime() - lastFetch.getTime()) / 1000

            // Solo actualizar si ha pasado el refresh_interval
            if (ageSeconds < ticker.refresh_interval) {
                results.push({ symbol: ticker.symbol, status: 'skipped', reason: 'too soon' })
                continue
            }

            try {
                // 2. Llamar a Alpaca API
                const alpacaResponse = await fetch(
                    `https://data.alpaca.markets/v2/stocks/${ticker.symbol}/quotes/latest`,
                    {
                        headers: {
                            'APCA-API-KEY-ID': Deno.env.get('ALPACA_API_KEY') ?? '',
                            'APCA-API-SECRET-KEY': Deno.env.get('ALPACA_SECRET_KEY') ?? ''
                        }
                    }
                )

                if (!alpacaResponse.ok) {
                    throw new Error(`Alpaca API error: ${alpacaResponse.status}`)
                }

                const alpacaData: AlpacaQuote = await alpacaResponse.json()

                if (!alpacaData.quote) {
                    throw new Error('No quote data received')
                }

                const quote = alpacaData.quote
                const spread = quote.ap - quote.bp

                // 3. Insertar en market_snapshots
                const { error: insertError } = await supabase
                    .from('market_snapshots')
                    .insert({
                        symbol: ticker.symbol,
                        price: quote.ap,
                        bid: quote.bp,
                        ask: quote.ap,
                        spread: spread,
                        timestamp: quote.t,
                        data_type: 'quote',
                        source: 'alpaca',
                        raw_data: alpacaData
                    })

                if (insertError) throw insertError

                // 4. Actualizar last_fetched_at en market_tickers
                const { error: updateError } = await supabase
                    .from('market_tickers')
                    .update({
                        last_fetched_at: now.toISOString(),
                        fetch_count: supabase.rpc('increment', { x: 1, field_name: 'fetch_count' } as any)
                    })
                    .eq('symbol', ticker.symbol)

                if (updateError) {
                    console.error('Update error:', updateError)
                }

                results.push({
                    symbol: ticker.symbol,
                    status: 'updated',
                    price: quote.ap,
                    timestamp: quote.t
                })

            } catch (error: any) {
                console.error(`Error updating ${ticker.symbol}:`, error)

                // Incrementar error_count
                await supabase
                    .from('market_tickers')
                    .update({
                        error_count: supabase.rpc('increment', { x: 1, field_name: 'error_count' } as any)
                    })
                    .eq('symbol', ticker.symbol)

                results.push({
                    symbol: ticker.symbol,
                    status: 'error',
                    error: error.message
                })
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                timestamp: now.toISOString(),
                processed: results.length,
                results
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error: any) {
        console.error('Function error:', error)
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
