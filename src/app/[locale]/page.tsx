'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { motion } from 'framer-motion'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import { TrendingUp, Shield, BarChart3, Zap } from 'lucide-react'

export default function HomePage() {
  const t = useTranslations('Index')
  const tAuth = useTranslations('Auth')

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 z-20">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          TraderGrail
        </div>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <Link href="/login">
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              Log in
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 relative flex flex-col items-center justify-center px-4 pt-20">
        {/* Animated Background Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8">
            <Zap className="h-3 w-3 fill-current" />
            <span>Autonomous Trading AI v2.0</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent leading-none">
            {t('title')}
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-10 leading-relaxed font-light">
            {t('description')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-14 px-10 text-lg bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-transform hover:scale-105">
                {tAuth('loginWithGoogle')}
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-gray-800 bg-gray-900/50 hover:bg-gray-800 rounded-full transition-all">
              Watch Demo
            </Button>
          </div>
        </motion.div>

        {/* Features Scroll Section Mockup */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mt-32 w-full px-6"
        >
          <div className="p-8 rounded-3xl bg-gray-900/40 border border-gray-800 backdrop-blur-sm group hover:border-blue-500/30 transition-all">
            <TrendingUp className="h-10 w-10 text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-3 text-white">Smart Engine</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Advanced algorithms processing 1TB+ of market data daily to find high-probability opportunities.</p>
          </div>
          <div className="p-8 rounded-3xl bg-gray-900/40 border border-gray-800 backdrop-blur-sm group hover:border-purple-500/30 transition-all">
            <BarChart3 className="h-10 w-10 text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-3 text-white">Live Insights</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Real-time visualization of market dynamics, liquidity pools, and order flow imbalances.</p>
          </div>
          <div className="p-8 rounded-3xl bg-gray-900/40 border border-gray-800 backdrop-blur-sm group hover:border-pink-500/30 transition-all">
            <Shield className="h-10 w-10 text-pink-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-3 text-white">Risk Firewall</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Multi-layer protection system that stops bleeding automatically when market regimes shift.</p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-10 px-8 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
        <div>© 2026 TraderGrail Intelligence Inc.</div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Documentation</a>
        </div>
      </footer>
    </div>
  )
}
