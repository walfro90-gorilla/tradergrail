# Manual Market Data Update Test

## Este script te permite probar la actualización manual de datos

Para probar la Edge Function localmente (después de desplegarla):

```bash
# 1. Obtener la URL de tu proyecto Supabase
# https://YOUR_PROJECT_REF.supabase.co

# 2. Llamar manualmente a la función
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/update-market-data \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Alternativa: Trigger manual desde SQL

Puedes ejecutar esto en Supabase SQL Editor para probar:

```sql
-- Simular que los datos están viejos (para forzar actualización)
UPDATE market_tickers 
SET last_fetched_at = now() - interval '2 minutes'
WHERE symbol = 'AAPL';

-- Ahora cuando la Edge Function corra, actualizará AAPL
```

## Verificar que funcionó

```sql
-- Ver últimos snapshots insertados
SELECT symbol, price, bid, ask, timestamp, fetched_at
FROM market_snapshots
WHERE symbol = 'AAPL'
ORDER BY fetched_at DESC
LIMIT 5;

-- Ver cuántas veces se ha actualizado cada símbolo
SELECT symbol, fetch_count, error_count, last_fetched_at
FROM market_tickers;
```
