import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getPositions, getAccountInfo } from '@/utils/alpaca-client'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get account info and positions in parallel
        const [account, positions] = await Promise.all([
            getAccountInfo(),
            getPositions()
        ])

        if (!account) {
            return NextResponse.json(
                { error: 'Failed to fetch account information' },
                { status: 500 }
            )
        }

        // Calculate additional metrics
        const totalPositions = positions.length
        const totalUnrealizedPL = positions.reduce((sum, pos) => sum + pos.unrealizedPL, 0)
        const longPositions = positions.filter(p => p.side === 'long')
        const shortPositions = positions.filter(p => p.side === 'short')

        return NextResponse.json({
            account: {
                equity: account.equity,
                cash: account.cash,
                buyingPower: account.buyingPower,
                portfolioValue: account.portfolioValue,
                daytradeCount: account.daytradeCount,
                patternDayTrader: account.patternDayTrader
            },
            positions: positions.map(p => ({
                symbol: p.symbol,
                qty: p.qty,
                avgEntryPrice: p.avgEntryPrice,
                currentPrice: p.currentPrice,
                marketValue: p.marketValue,
                unrealizedPL: p.unrealizedPL,
                unrealizedPLPercent: p.unrealizedPLPercent,
                side: p.side
            })),
            summary: {
                totalPositions,
                totalUnrealizedPL,
                totalUnrealizedPLPercent: account.portfolioValue > 0
                    ? (totalUnrealizedPL / account.portfolioValue) * 100
                    : 0,
                longPositions: longPositions.length,
                shortPositions: shortPositions.length
            }
        })

    } catch (error: any) {
        console.error('Portfolio API error:', error)
        return NextResponse.json(
            {
                error: error.message || 'Failed to fetch portfolio'
            },
            { status: 500 }
        )
    }
}
