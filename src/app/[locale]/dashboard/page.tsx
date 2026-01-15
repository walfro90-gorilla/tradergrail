'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    History,
    Settings,
    Bell,
    Search,
    Wallet,
    LogOut,
    AlertCircle
} from 'lucide-react'
import MarketChart from '@/components/MarketChart'
import { motion } from 'framer-motion'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import AiAnalystWidget from '@/components/dashboard/AiAnalystWidget'
import { Link } from '@/i18n/routing'

interface MarketData {
    quote: {
        symbol: string
        price: number
        change: number
        changePercent: number
        volume: number
    } | null
    historicalBars: any[]
    available: boolean
}

export default function Dashboard() {
    const t = useTranslations('Dashboard')
    const [user, setUser] = useState<User | null>(null)
    const [marketData, setMarketData] = useState<MarketData | null>(null)
    const [isLoadingMarket, setIsLoadingMarket] = useState(true)
    const [marketError, setMarketError] = useState<string | null>(null)
    const [trades, setTrades] = useState<any[]>([])
    const [isLoadingTrades, setIsLoadingTrades] = useState(true)
    const supabase = createClient()

    // Fetch user data
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [supabase])

    // Fetch real market data
    useEffect(() => {
        const fetchMarketData = async () => {
            setIsLoadingMarket(true)
            setMarketError(null)

            try {
                const response = await fetch('/api/market?symbol=AAPL&timeframe=1Hour&limit=24')
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

        fetchMarketData()
        // Refresh market data every 30 seconds
        const interval = setInterval(fetchMarketData, 30000)
        return () => clearInterval(interval)
    }, [])

    // Fetch real trades from Supabase
    useEffect(() => {
        if (!user) return

        const fetchTrades = async () => {
            setIsLoadingTrades(true)
            const { data, error } = await supabase
                .from('trades')
                .select('*')
                .eq('user_id', user.id)
                .order('timestamp', { ascending: false })
                .limit(10)

            if (!error && data) {
                setTrades(data)
            }
            setIsLoadingTrades(false)
        }

        fetchTrades()

        // Subscribe to real-time trades
        const channel = supabase
            .channel('trades-realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'trades',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                setTrades(prev => [payload.new as any, ...prev])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <div className="flex h-screen bg-black text-gray-100 overflow-hidden font-sans">
            {/* Mini Sidebar */}
            <aside className="w-20 border-r border-gray-900 flex flex-col items-center py-8 gap-10 bg-gray-950/50 backdrop-blur-xl">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
                    T
                </div>
                <nav className="flex flex-col gap-6">
                    <Button variant="ghost" size="icon" className="text-blue-500 bg-blue-500/10"><TrendingUp /></Button>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white"><Activity /></Button>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white"><History /></Button>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white"><Wallet /></Button>
                </nav>
                <div className="mt-auto flex flex-col gap-6">
                    <LocaleSwitcher />
                    <Link href="/settings">
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white"><Settings /></Button>
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
            <main className="flex-1 flex flex-col overflow-y-auto">
                {/* Header */}
                <header className="h-20 border-b border-gray-900 flex items-center justify-between px-8 bg-gray-950/30 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-xl font-bold">{t('welcome')}</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search assets..."
                                className="bg-gray-900 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 w-64"
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="text-gray-400"><Bell className="h-5 w-5" /></Button>
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
                                {user?.user_metadata?.full_name || user?.email || 'Trader v1'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="p-8 grid grid-cols-12 gap-6">

                    {/* Market Overview Card */}
                    <Card className="col-span-12 lg:col-span-8 bg-gray-900/40 border-gray-800 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    {marketData?.quote?.symbol || 'AAPL'} {marketData?.quote && marketData.quote.changePercent >= 0 ? (
                                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                                    )}
                                </CardTitle>
                                <CardDescription className="text-gray-500">
                                    {isLoadingMarket ? 'Loading...' : marketData?.available ? 'Live Market Data (Alpaca)' : 'Market Data Unavailable'}
                                </CardDescription>
                            </div>
                            <div className="text-right">
                                {marketData?.quote?.price ? (
                                    <>
                                        <div className="text-2xl font-black text-white">
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
                        </CardHeader>
                        <CardContent>
                            <MarketChart
                                data={marketData?.historicalBars || []}
                                isLoading={isLoadingMarket}
                                error={marketError}
                            />
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                        <Card className="bg-blue-600/10 border-blue-500/20 text-blue-100">
                            <CardContent className="p-6">
                                <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Account Status</div>
                                <div className="text-3xl font-black">Free Tier</div>
                                <div className="mt-4 flex items-center gap-2 text-xs">
                                    <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-bold">Demo Mode</span>
                                    <span className="text-blue-400">No real trades</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="flex-1 bg-gray-900/40 border-gray-800 backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold">Active Signals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-8 text-center">
                                    <AlertCircle className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                                    <p className="text-xs text-gray-500">No active signals</p>
                                    <p className="text-[10px] text-gray-600 mt-1">Configure your trading strategy</p>
                                </div>
                            </CardContent>
                        </Card>

                        <AiAnalystWidget symbol={marketData?.quote?.symbol || 'AAPL'} currentPrice={marketData?.quote?.price || 0} />
                    </div>

                    {/* Recent Trades Table */}
                    <Card className="col-span-12 bg-gray-900/40 border-gray-800 backdrop-blur-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Recent Operations</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoadingTrades ? (
                                <div className="p-12 text-center">
                                    <p className="text-sm text-gray-500">Loading trades...</p>
                                </div>
                            ) : trades.length === 0 ? (
                                <div className="p-12 text-center">
                                    <AlertCircle className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                                    <p className="text-sm text-gray-400 font-semibold">No Trades Available</p>
                                    <p className="text-xs text-gray-600 mt-2">Your trading history will appear here</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-800/40 text-gray-500 uppercase text-[10px] font-bold">
                                            <tr>
                                                <th className="px-6 py-4">Symbol</th>
                                                <th className="px-6 py-4">Side</th>
                                                <th className="px-6 py-4">Quantity</th>
                                                <th className="px-6 py-4">Price</th>
                                                <th className="px-6 py-4">Time</th>
                                                <th className="px-6 py-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800/50">
                                            {trades.map((trade) => (
                                                <tr key={trade.id} className="hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-6 py-4 font-bold">{trade.symbol}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                                                            {trade.side.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-400">{trade.quantity}</td>
                                                    <td className="px-6 py-4 font-mono text-gray-300">${trade.price}</td>
                                                    <td className="px-6 py-4 text-gray-500">{new Date(trade.timestamp).toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${trade.status === 'filled' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                            <span className="text-xs text-green-500/80">{trade.status}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    )
}
