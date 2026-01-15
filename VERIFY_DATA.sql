-- VERIFICACIÓN: Ejecuta estas queries en Supabase SQL Editor

-- 1. Ver si hay datos en market_snapshots
SELECT 
  symbol, 
  price, 
  change_percent,
  fetched_at,
  timestamp
FROM market_snapshots
ORDER BY fetched_at DESC
LIMIT 10;

-- 2. Verificar símbolos activos
SELECT * FROM market_tickers WHERE is_active = true;

-- 3. Probar la función get_latest_quote directamente
SELECT * FROM get_latest_quote('AAPL', 60);
