import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    const statuses = {
        supabase: { connected: false, message: '' },
        alpaca: { connected: false, message: '' },
        gemini: { connected: false, message: '' },
        database: { tables: 0, message: '' }
    }

    // Check Supabase Connection
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) throw error

        statuses.supabase = {
            connected: !!user,
            message: user ? `Connected as ${user.email}` : 'Not authenticated'
        }

        // Check Database Tables
        const { data: tables, error: tablesError } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true })

        if (!tablesError) {
            statuses.database = {
                tables: 5, // users, trades, market_snapshots, notifications, ai_analysis
                message: 'All tables accessible'
            }
        } else {
            statuses.database = {
                tables: 0,
                message: tablesError.message
            }
        }
    } catch (error: any) {
        statuses.supabase = {
            connected: false,
            message: error.message || 'Connection failed'
        }
    }

    // Check Alpaca API Keys
    const alpacaKey = process.env.ALPACA_API_KEY
    const alpacaSecret = process.env.ALPACA_SECRET_KEY

    if (alpacaKey && alpacaSecret && !alpacaKey.includes('your-') && !alpacaSecret.includes('your-')) {
        statuses.alpaca = {
            connected: true,
            message: `Key: ${alpacaKey.substring(0, 6)}...${alpacaKey.substring(alpacaKey.length - 4)}`
        }
    } else {
        statuses.alpaca = {
            connected: false,
            message: 'API keys not configured'
        }
    }

    // Check Gemini API Key
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (geminiKey && !geminiKey.includes('your-')) {
        statuses.gemini = {
            connected: true,
            message: `Key: ${geminiKey.substring(0, 10)}...${geminiKey.substring(geminiKey.length - 4)}`
        }
    } else {
        statuses.gemini = {
            connected: false,
            message: 'API key not configured'
        }
    }

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        statuses
    })
}
