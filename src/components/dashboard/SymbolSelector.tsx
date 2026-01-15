'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, ChevronDown } from 'lucide-react'

interface Symbol {
    symbol: string
    name: string
    color: string
}

const AVAILABLE_SYMBOLS: Symbol[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', color: '#3b82f6' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', color: '#10b981' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', color: '#ef4444' },
    { symbol: 'AMD', name: 'AMD, Inc.', color: '#f59e0b' },
    { symbol: 'META', name: 'Meta Platforms', color: '#06b6d4' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', color: '#facc15' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', color: '#8b5cf6' },
    { symbol: 'AMZN', name: 'Amazon.com', color: '#fb923c' }
]

interface SymbolSelectorProps {
    currentSymbol: string
    onSymbolChange: (symbol: string) => void
}

export default function SymbolSelector({ currentSymbol, onSymbolChange }: SymbolSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)

    const current = AVAILABLE_SYMBOLS.find(s => s.symbol === currentSymbol) || AVAILABLE_SYMBOLS[0]

    return (
        <div className="relative">
            <Button
                variant="ghost"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg"
            >
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: current.color }}
                />
                <div className="text-left">
                    <div className="text-sm font-bold text-white">{current.symbol}</div>
                    <div className="text-xs text-gray-400">{current.name}</div>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute top-full mt-2 left-0 z-20 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                        {AVAILABLE_SYMBOLS.map((symbol) => (
                            <button
                                key={symbol.symbol}
                                onClick={() => {
                                    onSymbolChange(symbol.symbol)
                                    setIsOpen(false)
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 transition-colors ${symbol.symbol === currentSymbol ? 'bg-gray-700/30' : ''
                                    }`}
                            >
                                <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: symbol.color }}
                                />
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-bold text-white">{symbol.symbol}</div>
                                    <div className="text-xs text-gray-400">{symbol.name}</div>
                                </div>
                                {symbol.symbol === currentSymbol && (
                                    <Check className="h-4 w-4 text-green-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export { AVAILABLE_SYMBOLS }
export type { Symbol }
