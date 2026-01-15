'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Settings as SettingsIcon,
    Bell,
    Search,
    LogOut,
    Database,
    TrendingUp,
    Activity,
    History,
    Wallet,
    CheckCircle,
    XCircle,
    RefreshCw,
    Key,
    Server,
    Sparkles,
    AlertCircle
} from 'lucide-react'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Link } from '@/i18n/routing'
import MarketDataUpdater from '@/components/dashboard/MarketDataUpdater'

interface ServiceStatus {
    connected: boolean
    message: string
    tables?: number
}

interface SystemHealth {
    timestamp: string
    statuses: {
        supabase: ServiceStatus
        alpaca: ServiceStatus
        gemini: ServiceStatus
        database: ServiceStatus
    }
}

export default function SettingsPage() {
    const t = useTranslations('Dashboard')
    const [user, setUser] = useState<User | null>(null)
    const [health, setHealth] = useState<SystemHealth | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [supabase])

    const fetchHealth = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/system/health')
            const data = await response.json()
            setHealth(data)
        } catch (error) {
            console.error('Failed to fetch system health:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchHealth()
        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchHealth, 10000)
        return () => clearInterval(interval)
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    const StatusIndicator = ({ status }: { status: ServiceStatus }) => (
        <div className="flex items-center gap-2">
            {status.connected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
                <XCircle className="h-5 w-5 text-red-500" />
            )}
            <div className="flex-1">
                <p className={`text-sm font-medium ${status.connected ? 'text-green-400' : 'text-red-400'}`}>
                    {status.connected ? 'Connected' : 'Disconnected'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{status.message}</p>
            </div>
        </div>
    )

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
                    <Link href="/trading">
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white">
                            <Activity />
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white">
                        <History />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white">
                        <Wallet />
                    </Button>
                </nav>
                <div className="mt-auto flex flex-col gap-6">
                    <LocaleSwitcher />
                    <Button variant="ghost" size="icon" className="text-blue-500 bg-blue-500/10">
                        <SettingsIcon />
                    </Button>
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
                    <h1 className="text-xl font-bold">System Settings</h1>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchHealth}
                            className="text-gray-400 hover:text-white"
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
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

                {/* Settings Content */}
                <div className="p-8 space-y-6">

                    {/* System Health Overview */}
                    <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <Server className="h-5 w-5 text-blue-400" />
                                        System Health
                                    </CardTitle>
                                    <CardDescription className="text-gray-500 mt-1">
                                        Real-time status of all services
                                    </CardDescription>
                                </div>
                                {health && (
                                    <div className="text-xs text-gray-500">
                                        Last check: {new Date(health.timestamp).toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Supabase Status */}
                            <Card className="bg-gray-800/50 border-gray-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-green-500/20">
                                            <Database className="h-5 w-5 text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Supabase</h3>
                                            <p className="text-xs text-gray-500">Authentication & Database</p>
                                        </div>
                                    </div>
                                    {health ? (
                                        <StatusIndicator status={health.statuses.supabase} />
                                    ) : (
                                        <div className="text-sm text-gray-500">Loading...</div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Alpaca Status */}
                            <Card className="bg-gray-800/50 border-gray-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-blue-500/20">
                                            <TrendingUp className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Alpaca Markets</h3>
                                            <p className="text-xs text-gray-500">Market Data API</p>
                                        </div>
                                    </div>
                                    {health ? (
                                        <StatusIndicator status={health.statuses.alpaca} />
                                    ) : (
                                        <div className="text-sm text-gray-500">Loading...</div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Gemini Status */}
                            <Card className="bg-gray-800/50 border-gray-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-purple-500/20">
                                            <Sparkles className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Gemini AI</h3>
                                            <p className="text-xs text-gray-500">Market Analysis</p>
                                        </div>
                                    </div>
                                    {health ? (
                                        <StatusIndicator status={health.statuses.gemini} />
                                    ) : (
                                        <div className="text-sm text-gray-500">Loading...</div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Database Status */}
                            <Card className="bg-gray-800/50 border-gray-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-yellow-500/20">
                                            <Database className="h-5 w-5 text-yellow-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Database Tables</h3>
                                            <p className="text-xs text-gray-500">PostgreSQL Schema</p>
                                        </div>
                                    </div>
                                    {health ? (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-green-400">
                                                    {health.statuses.database.tables || 0} Tables
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {health.statuses.database.message}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">Loading...</div>
                                    )}
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>

                    {/* User Information */}
                    <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Key className="h-5 w-5 text-blue-400" />
                                Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
                                    <p className="text-sm text-white mt-1">{user?.email || 'Not available'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Account Type</label>
                                    <p className="text-sm text-white mt-1">Free Tier</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">User ID</label>
                                    <p className="text-xs text-gray-400 mt-1 font-mono truncate">{user?.id || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Member Since</label>
                                    <p className="text-sm text-white mt-1">
                                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Market Data Updater */}
                    <MarketDataUpdater />

                    {/* Configuration Guide */}
                    <Card className="bg-gradient-to-br from-blue-900/20 via-gray-900/40 to-purple-900/20 border-blue-500/20 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-blue-400" />
                                Configuration Guide
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                                <h4 className="text-sm font-bold text-white mb-2">📊 Alpaca Markets (Market Data)</h4>
                                <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                                    <li>Go to <a href="https://alpaca.markets" target="_blank" className="text-blue-400 hover:underline">alpaca.markets</a></li>
                                    <li>Create a Paper Trading account (free)</li>
                                    <li>Generate API keys in Dashboard → Account Management</li>
                                    <li>Add keys to <code className="px-1 py-0.5 bg-gray-900 rounded text-blue-300">.env.local</code> file</li>
                                </ol>
                            </div>

                            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                                <h4 className="text-sm font-bold text-white mb-2">🤖 Gemini AI (Market Analysis)</h4>
                                <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                                    <li>Visit <a href="https://aistudio.google.com/apikey" target="_blank" className="text-blue-400 hover:underline">Google AI Studio</a></li>
                                    <li>Sign in with your Google account</li>
                                    <li>Click "Create API Key"</li>
                                    <li>Add key to <code className="px-1 py-0.5 bg-gray-900 rounded text-purple-300">.env.local</code> file</li>
                                </ol>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    )
}
