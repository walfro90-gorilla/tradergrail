import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { executeMarketOrder, executeLimitOrder } from '@/utils/alpaca-client'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { symbol, qty, side, type, limitPrice } = body

        // Validation
        if (!symbol || !qty || !side || !type) {
            return NextResponse.json(
                { error: 'Missing required fields: symbol, qty, side, type' },
                { status: 400 }
            )
        }

        if (qty <= 0) {
            return NextResponse.json(
                { error: 'Quantity must be greater than 0' },
                { status: 400 }
            )
        }

        if (!['buy', 'sell'].includes(side)) {
            return NextResponse.json(
                { error: 'Side must be "buy" or "sell"' },
                { status: 400 }
            )
        }

        // Execute order
        let order
        if (type === 'market') {
            order = await executeMarketOrder(symbol, qty, side)
        } else if (type === 'limit') {
            if (!limitPrice || limitPrice <= 0) {
                return NextResponse.json(
                    { error: 'Limit price is required for limit orders' },
                    { status: 400 }
                )
            }
            order = await executeLimitOrder(symbol, qty, side, limitPrice)
        } else {
            return NextResponse.json(
                { error: 'Order type must be "market" or "limit"' },
                { status: 400 }
            )
        }

        // Store trade in database
        const { error: dbError } = await supabase
            .from('trades')
            .insert({
                user_id: user.id,
                symbol: order.symbol,
                side: order.side,
                quantity: order.qty,
                price: order.filledAvgPrice || 0,
                status: order.status,
                strategy_id: 'manual',
                metadata: {
                    order_id: order.id,
                    order_type: order.type,
                    limit_price: order.limitPrice,
                    stop_price: order.stopPrice
                }
            })

        if (dbError) {
            console.error('Failed to store trade in database:', dbError)
        }

        return NextResponse.json({
            success: true,
            order
        })

    } catch (error: any) {
        console.error('Trade execution error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to execute trade'
            },
            { status: 500 }
        )
    }
}
