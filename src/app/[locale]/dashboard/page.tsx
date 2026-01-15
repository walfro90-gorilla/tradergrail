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
    Menu,
    LogOut
} from 'lucide-react'
import MarketChart from '@/components/MarketChart'
import { motion } from 'framer-motion'
import LocaleSwitcher from '@/components/LocaleSwitcher'

// Mock Data
const chartData = [
    { time: '09:00', price: 62450 },
    { time: '10:00', price: 63800 },
    { time: '11:00', price: 63100 },
    { time: '12:00', price: 64200 },
    { time: '13:00', price: 65400 },
    { time: '14:00', price: 64900 },
    { time: '15:00', price: 66100 },
    { time: '16:00', price: 67200 },
    { time: '17:00', price: 68500 },
]

const recentTrades = [
    { id: 1, symbol: 'BTC/USDT', side: 'buy', amount: '0.12', price: '64,200', time: '2m ago' },
    { id: 2, symbol: 'ETH/USDT', side: 'sell', amount: '1.5', price: '3,450', time: '15m ago' },
    { id: 3, symbol: 'SOL/USDT', side: 'buy', amount: '10.0', price: '145.20', time: '1h ago' },
]

export default function Dashboard() {
    const t = useTranslations('Dashboard')

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
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white"><Settings /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400"><LogOut /></Button>
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
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shadow-sm" />
                            <div className="text-sm font-medium">Trader v1</div>
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
                                    BTC/USDT <ArrowUpRight className="h-4 w-4 text-green-500" />
                                </CardTitle>
                                <CardDescription className="text-gray-500">Live AI Analysis Active</CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">$68,542.20</div>
                                <div className="text-sm text-green-500">+4.2% (24h)</div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <MarketChart data={chartData} />
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                        <Card className="bg-blue-600/10 border-blue-500/20 text-blue-100">
                            <CardContent className="p-6">
                                <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Total Profit</div>
                                <div className="text-3xl font-black">$12,450.80</div>
                                <div className="mt-4 flex items-center gap-2 text-xs">
                                    <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold">PRO</span>
                                    <span className="text-blue-400">Monthly renewal in 5 days</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="flex-1 bg-gray-900/40 border-gray-800 backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold">Active Signals</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <div className="p-3 rounded-xl bg-gray-800/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-green-500/20 text-green-500"><TrendingUp className="h-4 w-4" /></div>
                                        <div>
                                            <div className="text-xs font-bold">ETH Long</div>
                                            <div className="text-[10px] text-gray-500">Confidence: 94%</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] px-2 py-1 rounded-md bg-green-500/10 text-green-400 font-bold">NEW</span>
                                </div>
                                <div className="p-3 rounded-xl bg-gray-800/50 flex items-center justify-between opacity-60">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500"><TrendingUp className="h-4 w-4" /></div>
                                        <div>
                                            <div className="text-xs font-bold">SOL Buy</div>
                                            <div className="text-[10px] text-gray-500">Confidence: 82%</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-medium">12m</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Trades Table */}
                    <Card className="col-span-12 bg-gray-900/40 border-gray-800 backdrop-blur-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Recent Operations</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-800/40 text-gray-500 uppercase text-[10px] font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Asset</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Time</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/50">
                                        {recentTrades.map((trade) => (
                                            <tr key={trade.id} className="hover:bg-gray-800/30 transition-colors">
                                                <td className="px-6 py-4 font-bold">{trade.symbol}</td>
                                                <td className="px-6 py-4">
                                                    <span className={trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                                                        {trade.side.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400">{trade.amount}</td>
                                                <td className="px-6 py-4 font-mono text-gray-300">${trade.price}</td>
                                                <td className="px-6 py-4 text-gray-500">{trade.time}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                        <span className="text-xs text-green-500/80">Filled</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    )
}
