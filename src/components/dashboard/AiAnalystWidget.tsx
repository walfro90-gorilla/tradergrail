'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface AiAnalystWidgetProps {
    symbol: string
    currentPrice: number
}

export default function AiAnalystWidget({ symbol, currentPrice }: AiAnalystWidgetProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleAnalyze = async () => {
        setIsAnalyzing(true)
        setError(null)

        try {
            const response = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol,
                    currentPrice,
                    context: `Provide a comprehensive market analysis for active trader monitoring.`
                })
            })

            if (!response.ok) {
                throw new Error('Analysis failed')
            }

            const data = await response.json()
            setAnalysis(data.analysis)
        } catch (err: any) {
            setError(err.message || 'Failed to get analysis')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const getSentimentIcon = () => {
        if (!analysis) return null
        switch (analysis.sentiment) {
            case 'bullish':
                return <TrendingUp className="h-5 w-5 text-green-500" />
            case 'bearish':
                return <TrendingDown className="h-5 w-5 text-red-500" />
            default:
                return <Minus className="h-5 w-5 text-gray-500" />
        }
    }

    return (
        <Card className="bg-gradient-to-br from-purple-900/20 via-gray-900/40 to-blue-900/20 border-purple-500/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                            <Sparkles className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-white">AI Market Analyst</CardTitle>
                            <CardDescription className="text-xs text-gray-400">Powered by Gemini + Grounding</CardDescription>
                        </div>
                    </div>
                    {analysis && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-800/50">
                            {getSentimentIcon()}
                            <span className="text-xs font-bold text-white uppercase">{analysis.sentiment}</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {!analysis && !error && (
                    <div className="text-center py-6">
                        <p className="text-sm text-gray-400 mb-4">
                            Get AI-powered market insights with real-time news analysis.
                        </p>
                        <Button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Analyzing Market...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Analyze {symbol}
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-xs text-red-400">{error}</p>
                        <Button
                            onClick={handleAnalyze}
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-red-400 hover:text-red-300"
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {analysis && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Confidence</span>
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                        style={{ width: `${analysis.confidence}%` }}
                                    />
                                </div>
                                <span className="text-white font-bold">{analysis.confidence}%</span>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                            <p className="text-xs text-gray-300 leading-relaxed">{analysis.summary}</p>
                        </div>

                        {analysis.reasoning && analysis.reasoning.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Key Points</h4>
                                <ul className="space-y-1">
                                    {analysis.reasoning.map((point: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                                            <span className="text-purple-400 mt-0.5">•</span>
                                            <span className="flex-1">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {analysis.sources && analysis.sources.length > 0 && (
                            <div className="pt-2 border-t border-gray-800">
                                <h4 className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Sources (Grounding)</h4>
                                <div className="space-y-1">
                                    {analysis.sources.map((source: string, idx: number) => (
                                        <p key={idx} className="text-[10px] text-gray-400 truncate">{source}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleAnalyze}
                            variant="ghost"
                            size="sm"
                            className="w-full text-purple-400 hover:text-purple-300 text-xs"
                        >
                            Refresh Analysis
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
