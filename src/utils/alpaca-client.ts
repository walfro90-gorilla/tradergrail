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

export interface Position {
    symbol: string
    qty: number
    avgEntryPrice: number
    currentPrice: number
    marketValue: number
    unrealizedPL: number
    unrealizedPLPercent: number
    side: 'long' | 'short'
}

export interface Order {
    id: string
    symbol: string
    qty: number
    side: 'buy' | 'sell'
    type: 'market' | 'limit' | 'stop' | 'stop_limit'
    status: string
    filledQty: number
    filledAvgPrice: number | null
    limitPrice: number | null
    stopPrice: number | null
    submittedAt: Date
    filledAt: Date | null
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

        return result.slice(-limit)
    } catch (error) {
        console.error(`Failed to get historical bars for ${symbol}:`, error)
        return []
    }
}

/**
 * Execute a market order
 */
export async function executeMarketOrder(
    symbol: string,
    qty: number,
    side: 'buy' | 'sell'
): Promise<Order> {
    try {
        const order = await alpaca.createOrder({
            symbol,
            qty,
            side,
            type: 'market',
            time_in_force: 'day'
        })

        return {
            id: order.id,
            symbol: order.symbol,
            qty: parseFloat(order.qty),
            side: order.side as 'buy' | 'sell',
            type: order.type as any,
            status: order.status,
            filledQty: parseFloat(order.filled_qty || '0'),
            filledAvgPrice: order.filled_avg_price ? parseFloat(order.filled_avg_price) : null,
            limitPrice: order.limit_price ? parseFloat(order.limit_price) : null,
            stopPrice: order.stop_price ? parseFloat(order.stop_price) : null,
            submittedAt: new Date(order.submitted_at),
            filledAt: order.filled_at ? new Date(order.filled_at) : null
        }
    } catch (error: any) {
        console.error('Failed to execute market order:', error)
        throw new Error(error.message || 'Failed to execute order')
    }
}

/**
 * Execute a limit order
 */
export async function executeLimitOrder(
    symbol: string,
    qty: number,
    side: 'buy' | 'sell',
    limitPrice: number
): Promise<Order> {
    try {
        const order = await alpaca.createOrder({
            symbol,
            qty,
            side,
            type: 'limit',
            time_in_force: 'day',
            limit_price: limitPrice
        })

        return {
            id: order.id,
            symbol: order.symbol,
            qty: parseFloat(order.qty),
            side: order.side as 'buy' | 'sell',
            type: order.type as any,
            status: order.status,
            filledQty: parseFloat(order.filled_qty || '0'),
            filledAvgPrice: order.filled_avg_price ? parseFloat(order.filled_avg_price) : null,
            limitPrice: order.limit_price ? parseFloat(order.limit_price) : null,
            stopPrice: order.stop_price ? parseFloat(order.stop_price) : null,
            submittedAt: new Date(order.submitted_at),
            filledAt: order.filled_at ? new Date(order.filled_at) : null
        }
    } catch (error: any) {
        console.error('Failed to execute limit order:', error)
        throw new Error(error.message || 'Failed to execute order')
    }
}

/**
 * Get all open positions
 */
export async function getPositions(): Promise<Position[]> {
    try {
        const positions = await alpaca.getPositions()

        return positions.map((pos: any) => ({
            symbol: pos.symbol,
            qty: parseFloat(pos.qty),
            avgEntryPrice: parseFloat(pos.avg_entry_price),
            currentPrice: parseFloat(pos.current_price),
            marketValue: parseFloat(pos.market_value),
            unrealizedPL: parseFloat(pos.unrealized_pl),
            unrealizedPLPercent: parseFloat(pos.unrealized_plpc) * 100,
            side: pos.side
        }))
    } catch (error) {
        console.error('Failed to get positions:', error)
        return []
    }
}

/**
 * Get all orders (open and closed)
 */
export async function getOrders(status: 'open' | 'closed' | 'all' = 'open'): Promise<Order[]> {
    try {
        const orders = await alpaca.getOrders({ status })

        return orders.map((order: any) => ({
            id: order.id,
            symbol: order.symbol,
            qty: parseFloat(order.qty),
            side: order.side,
            type: order.type,
            status: order.status,
            filledQty: parseFloat(order.filled_qty || '0'),
            filledAvgPrice: order.filled_avg_price ? parseFloat(order.filled_avg_price) : null,
            limitPrice: order.limit_price ? parseFloat(order.limit_price) : null,
            stopPrice: order.stop_price ? parseFloat(order.stop_price) : null,
            submittedAt: new Date(order.submitted_at),
            filledAt: order.filled_at ? new Date(order.filled_at) : null
        }))
    } catch (error) {
        console.error('Failed to get orders:', error)
        return []
    }
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId: string): Promise<boolean> {
    try {
        await alpaca.cancelOrder(orderId)
        return true
    } catch (error) {
        console.error('Failed to cancel order:', error)
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
            portfolioValue: parseFloat(account.portfolio_value),
            daytradeCount: parseInt(account.daytrade_count),
            patternDayTrader: account.pattern_day_trader
        }
    } catch (error) {
        console.error('Failed to get account info:', error)
        return null
    }
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
 * Get market clock info
 */
export async function getMarketClock() {
    try {
        const clock = await alpaca.getClock()
        return {
            isOpen: clock.is_open,
            nextOpen: new Date(clock.next_open),
            nextClose: new Date(clock.next_close)
        }
    } catch (error) {
        console.error('Failed to get market clock:', error)
        return null
    }
}
