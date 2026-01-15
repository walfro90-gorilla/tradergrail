'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown } from 'lucide-react'
import TradeModal from './TradeModal'

interface TradingButtonsProps {
    symbol: string
    currentPrice: number
    onTradeExecuted?: () => void
}

export default function TradingButtons({ symbol, currentPrice, onTradeExecuted }: TradingButtonsProps) {
    const [showModal, setShowModal] = useState(false)
    const [side, setSide] = useState<'buy' | 'sell'>('buy')

    const handleOpenModal = (tradeSide: 'buy' | 'sell') => {
        setSide(tradeSide)
        setShowModal(true)
    }

    return (
        <>
            <div className="flex gap-2">
                <Button
                    onClick={() => handleOpenModal('buy')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold h-10"
                >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Buy
                </Button>
                <Button
                    onClick={() => handleOpenModal('sell')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold h-10"
                >
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Sell
                </Button>
            </div>

            {showModal && (
                <TradeModal
                    symbol={symbol}
                    currentPrice={currentPrice}
                    onClose={() => setShowModal(false)}
                    onTradeExecuted={onTradeExecuted}
                />
            )}
        </>
    )
}
