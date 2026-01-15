import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getOrders, cancelOrder } from '@/utils/alpaca-client'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = (searchParams.get('status') as 'open' | 'closed' | 'all') || 'open'

        const orders = await getOrders(status)

        return NextResponse.json({
            orders: orders.map(o => ({
                id: o.id,
                symbol: o.symbol,
                qty: o.qty,
                side: o.side,
                type: o.type,
                status: o.status,
                filledQty: o.filledQty,
                filledAvgPrice: o.filledAvgPrice,
                limitPrice: o.limitPrice,
                stopPrice: o.stopPrice,
                submittedAt: o.submittedAt,
                filledAt: o.filledAt
            }))
        })

    } catch (error: any) {
        console.error('Orders API error:', error)
        return NextResponse.json(
            {
                error: error.message || 'Failed to fetch orders'
            },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const orderId = searchParams.get('id')

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            )
        }

        const success = await cancelOrder(orderId)

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to cancel order' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Order cancelled successfully'
        })

    } catch (error: any) {
        console.error('Cancel order error:', error)
        return NextResponse.json(
            {
                error: error.message || 'Failed to cancel order'
            },
            { status: 500 }
        )
    }
}
