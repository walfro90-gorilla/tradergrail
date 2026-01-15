'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react'

interface Position {
    symbol: string
    qty: number
    avgEntryPrice: number
    currentPrice: number
    marketValue: number
    unrealizedPL: number
    unrealizedPLPercent: number
    side: string
}

export default function PositionsWidget() {
    const [positions, setPositions] = useState<Position[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchPositions = async () => {
        try {
            const response = await fetch('/api/trading/portfolio')
            if (response.ok) {
                const data = await response.json()
                setPositions(data.positions || [])
            }
        } catch (error) {
            console.error('Failed to fetch positions:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPositions()
        const interval = setInterval(fetchPositions, 10000)
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

    return (
        <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
                {positions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400">No open positions</p>
                        <p className="text-xs text-gray-500 mt-1">Execute a trade to see your positions here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {positions.map((position) => {
                            const isProfit = position.unrealizedPL >= 0
                            return (
                                <div
                                    key={position.symbol}
                                    className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <div className="font-bold text-white">{position.symbol}</div>
                                            <div className="text-xs text-gray-400">
                                                {position.qty} shares @ ${position.avgEntryPrice.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-white">
                                                ${position.currentPrice.toFixed(2)}
                                            </div>
                                            <div className={`text-xs flex items-center gap-1 justify-end ${isProfit ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {isProfit ? (
                                                    <TrendingUp className="h-3 w-3" />
                                                ) : (
                                                    <TrendingDown className="h-3 w-3" />
                                                )}
                                                {isProfit ? '+' : ''}${position.unrealizedPL.toFixed(2)} ({position.unrealizedPLPercent.toFixed(2)}%)
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>Market Value</span>
                                        <span className="font-semibold text-gray-300">${position.marketValue.toFixed(2)}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
