'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { X, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react'

interface TradeModalProps {
    symbol: string
    currentPrice: number
    onClose: () => void
    onTradeExecuted?: () => void
}

export default function TradeModal({ symbol, currentPrice, onClose, onTradeExecuted }: TradeModalProps) {
    const [side, setSide] = useState<'buy' | 'sell'>('buy')
    const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
    const [quantity, setQuantity] = useState('')
    const [limitPrice, setLimitPrice] = useState(currentPrice.toFixed(2))
    const [isExecuting, setIsExecuting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const estimatedCost = parseFloat(quantity || '0') * (orderType === 'limit' ? parseFloat(limitPrice) : currentPrice)

    const handleExecute = async () => {
        setError(null)
        setIsExecuting(true)

        try {
            const response = await fetch('/api/trading/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol,
                    qty: parseFloat(quantity),
                    side,
                    type: orderType,
                    limitPrice: orderType === 'limit' ? parseFloat(limitPrice) : undefined
                })
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to execute trade')
            }

            setSuccess(true)
            setTimeout(() => {
                onTradeExecuted?.()
                onClose()
            }, 1500)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsExecuting(false)
        }
    }

    const isValid = quantity && parseFloat(quantity) > 0 &&
        (orderType === 'market' || (limitPrice && parseFloat(limitPrice) > 0))

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg bg-gray-900 border-gray-800">
                <CardHeader className="border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                {side === 'buy' ? (
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-5 w-5 text-red-500" />
                                )}
                                {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
                            </CardTitle>
                            <CardDescription className="text-gray-400 mt-1">
                                Current Price: ${currentPrice.toFixed(2)}
                            </CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {/* Side Selector */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={() => setSide('buy')}
                            className={`h-12 ${side === 'buy'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                }`}
                        >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Buy
                        </Button>
                        <Button
                            onClick={() => setSide('sell')}
                            className={`h-12 ${side === 'sell'
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                }`}
                        >
                            <TrendingDown className="h-4 w-4 mr-2" />
                            Sell
                        </Button>
                    </div>

                    {/* Order Type */}
                    <div>
                        <label className="text-sm font-medium text-gray-300 block mb-2">
                            Order Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={() => setOrderType('market')}
                                variant="outline"
                                className={
                                    orderType === 'market'
                                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                        : 'border-gray-700 text-gray-400'
                                }
                            >
                                Market
                            </Button>
                            <Button
                                onClick={() => setOrderType('limit')}
                                variant="outline"
                                className={
                                    orderType === 'limit'
                                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                        : 'border-gray-700 text-gray-400'
                                }
                            >
                                Limit
                            </Button>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="text-sm font-medium text-gray-300 block mb-2">
                            Quantity
                        </label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Enter quantity"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                            step="1"
                        />
                    </div>

                    {/* Limit Price (only for limit orders) */}
                    {orderType === 'limit' && (
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-2">
                                Limit Price
                            </label>
                            <input
                                type="number"
                                value={limitPrice}
                                onChange={(e) => setLimitPrice(e.target.value)}
                                placeholder="Enter limit price"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0.01"
                                step="0.01"
                            />
                        </div>
                    )}

                    {/* Estimated Cost */}
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">Estimated {side === 'buy' ? 'Cost' : 'Proceeds'}</span>
                            <span className="text-lg font-bold text-white">
                                ${estimatedCost.toFixed(2)}
                            </span>
                        </div>
                        {quantity && (
                            <div className="text-xs text-gray-500">
                                {quantity} shares × ${orderType === 'limit' ? limitPrice : currentPrice.toFixed(2)}
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-400">Trade Failed</p>
                                <p className="text-xs text-red-300/80 mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                            </div>
                            <p className="text-sm font-medium text-green-400">Trade executed successfully!</p>
                        </div>
                    )}

                    {/* Execute Button */}
                    <Button
                        onClick={handleExecute}
                        disabled={!isValid || isExecuting || success}
                        className={`w-full h-12 font-bold text-white ${side === 'buy'
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-red-600 hover:bg-red-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isExecuting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Executing...
                            </>
                        ) : success ? (
                            'Trade Executed ✓'
                        ) : (
                            <>
                                {side === 'buy' ? 'Buy' : 'Sell'} {quantity || '0'} shares
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                        {orderType === 'market'
                            ? 'Market orders are executed immediately at the current market price.'
                            : 'Limit orders will only execute if the market reaches your specified price.'
                        }
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
