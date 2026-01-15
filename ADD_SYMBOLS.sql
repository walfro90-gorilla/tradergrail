-- AGREGAR MÁS SÍMBOLOS POPULARES
INSERT INTO market_tickers (symbol, exchange, refresh_interval) VALUES
  ('NVDA', 'NASDAQ', 60),   -- NVIDIA
  ('AMD', 'NASDAQ', 60),    -- Advanced Micro Devices
  ('META', 'NASDAQ', 60),   -- Meta Platforms
  ('AMZN', 'NASDAQ', 60),   -- Amazon
  ('NFLX', 'NASDAQ', 60),   -- Netflix
  ('SPY', 'NYSEARCA', 60)   -- S&P 500 ETF
ON CONFLICT (symbol) DO NOTHING;

-- VERIFICAR SÍMBOLOS ACTIVOS
SELECT * FROM market_tickers WHERE is_active = true;
