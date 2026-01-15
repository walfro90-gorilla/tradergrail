'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Settings as SettingsIcon,
    TrendingUp,
    Activity,
    History,
    Wallet,
    LogOut,
    BarChart3
} from 'lucide-react'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Link } from '@/i18n/routing'
import MarketChart from '@/components/MarketChart'
import TradingButtons from '@/components/trading/TradingButtons'
import PortfolioWidget from '@/components/trading/PortfolioWidget'
import PositionsWidget from '@/components/trading/PositionsWidget'
import SymbolSelector from '@/components/dashboard/SymbolSelector'

interface MarketData {
    quote: {
        symbol: string
        price: number
        change: number
        changePercent: number
        volume: number
    }
    historicalBars: any[]
    available: boolean
}

export default function TradingPage() {
    const t = useTranslations('Dashboard')
    const [user, setUser] = useState<User | null>(null)
    const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
    const [marketData, setMarketData] = useState<MarketData | null>(null)
    const [isLoadingMarket, setIsLoadingMarket] = useState(true)
    const [marketError, setMarketError] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [supabase])

    const fetchMarketData = async () => {
        setIsLoadingMarket(true)
        setMarketError(null)

        try {
            const response = await fetch(`/api/market?symbol=${selectedSymbol}&timeframe=1Hour&limit=24`)
            const data = await response.json()

            if (!response.ok || !data.available) {
                throw new Error(data.error || 'Market data not available')
            }

            setMarketData(data)
        } catch (error: any) {
            console.error('Failed to fetch market data:', error)
            setMarketError(error.message)
            setMarketData(null)
        } finally {
            setIsLoadingMarket(false)
        }
    }

    useEffect(() => {
        fetchMarketData()
        const interval = setInterval(fetchMarketData, 10000)
        return () => clearInterval(interval)
    }, [selectedSymbol, refreshKey])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    const handleTradeExecuted = () => {
        setRefreshKey(prev => prev + 1)
    }

    return (
        <div className="flex h-screen bg-black text-gray-100 overflow-hidden font-sans">
            {/* Mini Sidebar */}
            <aside className="w-20 border-r border-gray-900 flex flex-col items-center py-8 gap-10 bg-gray-950/50 backdrop-blur-xl">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
                    T
                </div>
                <nav className="flex flex-col gap-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white">
                            <TrendingUp />
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-blue-500 bg-blue-500/10">
                        <Activity />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white">
                        <History />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white">
                        <Wallet />
                    </Button>
                </nav>
                <div className="mt-auto flex flex-col gap-6">
                    <LocaleSwitcher />
                    <Link href="/settings">
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white">
                            <SettingsIcon />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-400"
                        onClick={handleLogout}
                    >
                        <LogOut />
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-gray-900 flex items-center justify-between px-8 bg-gray-950/30 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <BarChart3 className="h-6 w-6 text-blue-400" />
                        <h1 className="text-xl font-bold">Live Trading</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <SymbolSelector
                            currentSymbol={selectedSymbol}
                            onSymbolChange={setSelectedSymbol}
                        />
                        <div className="flex items-center gap-2 pl-4 border-l border-gray-900">
                            {user?.user_metadata?.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="User avatar"
                                    className="w-8 h-8 rounded-full border border-gray-800"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shadow-sm" />
                            )}
                            <div className="text-sm font-medium">
                                {user?.user_metadata?.full_name || user?.email || 'User'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Trading Grid */}
                <div className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-y-auto">
                    {/* Left Column - Chart & Trading */}
                    <div className="col-span-7 space-y-6">
                        {/* Price Card */}
                        <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl font-black text-white">
                                            {selectedSymbol}
                                        </CardTitle>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {isLoadingMarket ? 'Loading...' : marketData?.available ? 'Live Market Data (Alpaca)' : 'Market Data Unavailable'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {marketData?.quote?.price ? (
                                            <>
                                                <div className="text-3xl font-black text-white">
                                                    ${marketData.quote.price.toFixed(2)}
                                                </div>
                                                <div className={`text-sm ${marketData.quote.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {marketData.quote.changePercent >= 0 ? '+' : ''}
                                                    {marketData.quote.changePercent.toFixed(2)}% (Today)
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-sm text-gray-500">--</div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Chart */}
                        <MarketChart
                            data={marketData?.historicalBars || []}
                            color="#3b82f6"
                            isLoading={isLoadingMarket}
                            error={marketError}
                        />

                        {/* Trading Buttons */}
                        <Card className="bg-gradient-to-br from-green-900/10 via-gray-900/40 to-red-900/10 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Execute Trade</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TradingButtons
                                    symbol={selectedSymbol}
                                    currentPrice={marketData?.quote?.price || 0}
                                    onTradeExecuted={handleTradeExecuted}
                                />
                                <p className="text-xs text-gray-500 mt-3 text-center">
                                    ⚠️ Paper Trading Mode - No real money
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Portfolio & Positions */}
                    <div className="col-span-5 space-y-6">
                        {/* Portfolio */}
                        <PortfolioWidget />

                        {/* Positions */}
                        <PositionsWidget />

                        {/* Info Card */}
                        <Card className="bg-blue-900/10 border-blue-500/20">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-blue-400">
                                    📊 Trading Tips
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs text-gray-400 space-y-2">
                                <p>• Market orders execute immediately at current price</p>
                                <p>• Limit orders wait for your specified price</p>
                                <p>• Trading only during market hours (9:30 AM - 4:00 PM ET)</p>
                                <p>• Paper trading = practice without real money</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
