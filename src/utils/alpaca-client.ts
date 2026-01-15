import Alpaca from '@alpacahq/alpaca-trade-api'

// Initialize Alpaca client (Paper trading by default)
const alpaca = new Alpaca({
    keyId: process.env.ALPACA_API_KEY!,
    secretKey: process.env.ALPACA_SECRET_KEY!,
    paper: true, // Set to false for live trading
    feed: 'iex' // Use 'sip' for full market data (paid)
})

export interface Quote {
    symbol: string
    price: number
    change: number
    changePercent: number
    volume: number
    timestamp: Date
}

export interface HistoricalBar {
    time: string
    price: number
    open: number
    high: number
    low: number
    close: number
    volume: number
}

/**
 * Get latest quote for a symbol
 */
export async function getLatestQuote(symbol: string): Promise<Quote | null> {
    try {
        const latestTrade = await alpaca.getLatestTrade(symbol)
        const snapshot = await alpaca.getSnapshot(symbol)

        if (!latestTrade || !snapshot) {
            return null
        }

        // Use proper PascalCase properties
        const prevClose = snapshot.PrevDailyBar?.ClosePrice || latestTrade.Price
        const currentPrice = latestTrade.Price
        const change = currentPrice - prevClose
        const changePercent = (change / prevClose) * 100

        return {
            symbol,
            price: currentPrice,
            change,
            changePercent,
            volume: snapshot.DailyBar?.Volume || 0,
            timestamp: new Date(latestTrade.Timestamp)
        }
    } catch (error) {
        console.error(`Failed to get quote for ${symbol}:`, error)
        return null
    }
}

/**
 * Get historical bars (OHLCV data)
 */
export async function getHistoricalBars(
    symbol: string,
    timeframe: '1Min' | '5Min' | '15Min' | '1Hour' | '1Day' = '1Hour',
    limit: number = 24
): Promise<HistoricalBar[]> {
    try {
        const now = new Date()
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago

        const bars = await alpaca.getBarsV2(symbol, {
            start: start.toISOString(),
            end: now.toISOString(),
            timeframe,
            limit,
            feed: 'iex'
        })

        const result: HistoricalBar[] = []

        for await (const bar of bars) {
            result.push({
                time: new Date(bar.Timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }),
                price: bar.ClosePrice,
                open: bar.OpenPrice,
                high: bar.HighPrice,
                low: bar.LowPrice,
                close: bar.ClosePrice,
                volume: bar.Volume
            })
        }

        return result.slice(-limit) // Return only the last 'limit' bars
    } catch (error) {
        console.error(`Failed to get historical bars for ${symbol}:`, error)
        return []
    }
}

/**
 * Get multiple quotes at once
 */
export async function getMultipleQuotes(symbols: string[]): Promise<Record<string, Quote | null>> {
    const quotes: Record<string, Quote | null> = {}

    await Promise.all(
        symbols.map(async (symbol) => {
            quotes[symbol] = await getLatestQuote(symbol)
        })
    )

    return quotes
}

/**
 * Check if market is currently open
 */
export async function isMarketOpen(): Promise<boolean> {
    try {
        const clock = await alpaca.getClock()
        return clock.is_open
    } catch (error) {
        console.error('Failed to get market status:', error)
        return false
    }
}

/**
 * Get account information
 */
export async function getAccountInfo() {
    try {
        const account = await alpaca.getAccount()
        return {
            equity: parseFloat(account.equity),
            cash: parseFloat(account.cash),
            buyingPower: parseFloat(account.buying_power),
            portfolioValue: parseFloat(account.portfolio_value)
        }
    } catch (error) {
        console.error('Failed to get account info:', error)
        return null
    }
}
