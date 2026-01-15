'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, DollarSign, Loader2 } from 'lucide-react'

interface PortfolioData {
    account: {
        equity: number
        cash: number
        buyingPower: number
        portfolioValue: number
    }
    positions: Array<{
        symbol: string
        qty: number
        avgEntryPrice: number
        currentPrice: number
        marketValue: number
        unrealizedPL: number
        unrealizedPLPercent: number
        side: string
    }>
    summary: {
        totalPositions: number
        totalUnrealizedPL: number
        totalUnrealizedPLPercent: number
    }
}

export default function PortfolioWidget() {
    const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchPortfolio = async () => {
        try {
            const response = await fetch('/api/trading/portfolio')
            if (response.ok) {
                const data = await response.json()
                setPortfolio(data)
            }
        } catch (error) {
            console.error('Failed to fetch portfolio:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPortfolio()
        // Refresh every 10 seconds
        const interval = setInterval(fetchPortfolio, 10000)
        return () => clearInterval(interval)
    }, [])

    if (isLoading) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6 flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    if (!portfolio) {
        return null
    }

    const { account, summary } = portfolio
    const dayPL = summary.totalUnrealizedPL
    const dayPLPercent = summary.totalUnrealizedPLPercent

    return (
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border-gray-800 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-blue-400" />
                    Portfolio Overview
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Portfolio Value</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            ${account.portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                            <Wallet className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Cash</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            ${account.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Day P&L */}
                <div className={`p-4 rounded-lg border ${dayPL >= 0
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-red-500/10 border-red-500/20'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {dayPL >= 0 ? (
                                <TrendingUp className="h-5 w-5 text-green-500" />
                            ) : (
                                <TrendingDown className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm font-medium text-gray-300">Today's P&L</span>
                        </div>
                        <div className="text-right">
                            <div className={`text-lg font-bold ${dayPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {dayPL >= 0 ? '+' : ''}${Math.abs(dayPL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className={`text-xs ${dayPL >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                {dayPL >= 0 ? '+' : ''}{dayPLPercent.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-400">Buying Power</span>
                        <div className="text-white font-semibold mt-0.5">
                            ${account.buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-400">Positions</span>
                        <div className="text-white font-semibold mt-0.5">
                            {summary.totalPositions}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
