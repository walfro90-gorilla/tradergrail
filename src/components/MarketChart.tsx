'use client'

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { AlertCircle, Loader2 } from 'lucide-react'

interface MarketChartProps {
    data: any[]
    color?: string
    isLoading?: boolean
    error?: string | null
}

export default function MarketChart({ data, color = '#3b82f6', isLoading, error }: MarketChartProps) {
    if (isLoading) {
        return (
            <div className="h-[300px] w-full bg-gray-900/50 rounded-xl p-4 border border-gray-800 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    <p className="text-sm text-gray-400">Loading market data...</p>
                </div>
            </div>
        )
    }

    if (error || !data || data.length === 0) {
        return (
            <div className="h-[300px] w-full bg-gray-900/50 rounded-xl p-4 border border-gray-800 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center max-w-md">
                    <div className="p-3 rounded-full bg-red-500/10">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-300">No Data Available</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {error || 'Unable to load market data. Please check your API configuration.'}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-[300px] w-full bg-gray-900/50 rounded-xl p-4 border border-gray-800">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 0,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        minTickGap={30}
                    />
                    <YAxis
                        hide
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#111827',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#f3f4f6'
                        }}
                        itemStyle={{ color: color }}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
