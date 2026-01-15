'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, Download } from 'lucide-react'

export default function MarketDataUpdater() {
    const [isUpdating, setIsUpdating] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    const handleUpdate = async () => {
        setIsUpdating(true)
        setResult(null)

        try {
            const response = await fetch('/api/market/update', {
                method: 'POST'
            })

            const data = await response.json()

            if (data.success) {
                setResult(`✅ Successfully updated ${data.updated} symbols! (${data.failed} failed)`)
            } else {
                setResult(`❌ Error: ${data.error}`)
            }
        } catch (error: any) {
            setResult(`❌ Failed to update: ${error.message}`)
        } finally {
            setIsUpdating(false)
            // Clear message after 5 seconds
            setTimeout(() => setResult(null), 5000)
        }
    }

    return (
        <Card className="bg-gradient-to-br from-green-900/20 via-gray-900/40 to-blue-900/20 border-green-500/20 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Download className="h-5 w-5 text-green-400" />
                    Market Data Management
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <h4 className="text-sm font-bold text-white mb-2">📊 Manual Update</h4>
                    <p className="text-xs text-gray-400 mb-4">
                        Fetch latest market data from Alpaca and store in database cache.
                        This will update prices for all active symbols (AAPL, TSLA, GOOGL, MSFT).
                    </p>

                    <Button
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                        {isUpdating ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Updating Market Data...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Update Market Data Now
                            </>
                        )}
                    </Button>

                    {result && (
                        <div className={`mt-3 p-3 rounded-lg text-sm ${result.startsWith('✅')
                                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}>
                            {result}
                        </div>
                    )}
                </div>

                <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
                    <h4 className="text-xs font-bold text-gray-400 mb-2">ℹ️ How it works</h4>
                    <ul className="text-[10px] text-gray-500 space-y-1 list-disc list-inside">
                        <li>Fetches live quotes from Alpaca for configured symbols</li>
                        <li>Stores data in <code className="px-1 bg-gray-900 rounded">market_snapshots</code> table</li>
                        <li>Dashboard automatically reads from this cache</li>
                        <li>Recommended: Update every few minutes for fresh data</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
