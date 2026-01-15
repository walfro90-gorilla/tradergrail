import { NextRequest, NextResponse } from 'next/server'
import { analyzeMarketWithGemini } from '@/utils/ai-analyst'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { symbol, currentPrice, context } = await request.json()

        if (!symbol || !currentPrice) {
            return NextResponse.json(
                { error: 'Missing required fields: symbol, currentPrice' },
                { status: 400 }
            )
        }

        // Call Gemini for analysis
        const analysis = await analyzeMarketWithGemini(symbol, currentPrice, context)

        // Store the analysis in Supabase
        const { error: insertError } = await supabase
            .from('ai_analysis')
            .insert({
                user_id: user.id,
                symbol,
                price_at_analysis: currentPrice,
                sentiment: analysis.sentiment,
                confidence: analysis.confidence,
                summary: analysis.summary,
                reasoning: analysis.reasoning,
                sources: analysis.sources,
                metadata: { context }
            })

        if (insertError) {
            console.error('Failed to store analysis:', insertError)
            // Continue anyway, don't fail the request
        }

        return NextResponse.json({
            success: true,
            analysis
        })
    } catch (error: any) {
        console.error('Analysis API error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to analyze market' },
            { status: 500 }
        )
    }
}
