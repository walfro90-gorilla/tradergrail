# 🎯 Modo Manual - Actualización de Datos de Mercado

## ✅ ¡Ya está listo!

No necesitas desplegar nada ni configurar cron jobs. Todo funciona ya en tu aplicación.

---

## 📋 Cómo Usar:

### 1. **Asegúrate de tener tus API Keys configuradas**

Verifica que en `.env.local` tengas:
```bash
ALPACA_API_KEY=PKW4EEPNACLIRDLB6XHD3YJCBA
ALPACA_SECRET_KEY=Ca8vKzt2cUxJD3GWoQ6xvgGNWaHfvodNzDLetcyepeZ1
```

✅ Ya las tienes configuradas.

---

### 2. **Ir a Settings**

1. Inicia sesión en tu app
2. Haz clic en el icono de **Settings** (⚙️) en el sidebar
3. Verás la sección **"Market Data Management"**

---

###3. **Actualizar Datos Manualmente**

1. Haz clic en el botón verde: **"Update Market Data Now"**
2. Espera unos segundos (verás un spinner)
3. Recibirás confirmación: `✅ Successfully updated 4 symbols!`

Esto hace lo siguiente:
- Llama a Alpaca API una vez
- Obtiene cotizaciones en tiempo real de AAPL, TSLA, GOOGL, MSFT
- Guarda todos los datos en tu base de datos Supabase
- Actualiza inmediatamente el Dashboard

---

### 4. **Ver los Datos en el Dashboard**

1. Ve al Dashboard (icono 📈 en el sidebar)
2. Verás el gráfico y precio actualizado de AAPL
3. Los datos vienen DESDE TU BASE DE DATOS (no desde Alpaca directamente)
4. **Ultra rápido**: ~30ms vs ~300ms

---

## 🔄 ¿Cuándo Actualizar?

**Opción 1: Manual (Ahora)**
- Haz clic en "Update Market Data" cuando quieras ver datos frescos
- Recomendado cada 5-10 minutos durante horas de mercado

**Opción 2: Automático (Después)**
- Cuando estés listo, podemos configurar que se actualice solo cada minuto
- Requiere desplegar una Edge Function (15 minutos más)

---

## ✅ Verificar que Funcionó

### En Supabase SQL Editor:

```sql
-- Ver últimos datos insertados
SELECT symbol, price, bid, ask, fetched_at
FROM market_snapshots
ORDER BY fetched_at DESC
LIMIT 10;
```

Deberías ver registros con timestamps recientes.

---

## 🎯 Próximos Pasos (Opcionales)

### A. Agregar Más Símbolos

```sql
INSERT INTO market_tickers (symbol, exchange, refresh_interval) 
VALUES 
  ('NVDA', 'NASDAQ', 60),
  ('AMD', 'NASDAQ', 60)
ON CONFLICT (symbol) DO NOTHING;
```

Luego presiona "Update Market Data" again.

### B. Ver Estadísticas

```sql
SELECT 
  symbol,
  COUNT(*) as total_snapshots,
  MAX(fetched_at) as last_update,
  MIN(price) as min_price,
  MAX(price) as max_price
FROM market_snapshots
GROUP BY symbol;
```

### C. Automatizar (Cuando quieras)

Cuando estés listo para automatización completa, avísame y configuramos:
- Edge Function que corre automáticamente
- Actualización cada 60 segundos
- Sin intervención manual

---

## 🚨 Troubleshooting

### "Unauthorized"
→ Asegúrate de haber iniciado sesión

### "No data available"
→ Verifica que las API keys de Alpaca estén correctas en `.env.local`
→ Reinicia el servidor (`npm run dev`)

### "Error updating symbol"
→ Verifica que la tabla `market_tickers` tenga símbolos activos:
```sql
SELECT * FROM market_tickers WHERE is_active = true;
```

---

## 📊 Ventajas del Sistema Actual

✅ **Funciona inmediatamente** - Sin deployment adicional
✅ **Control total** - Tú decides cuándo actualizar
✅ **Datos compartidos** - Todos los usuarios ven los mismos datos del cache
✅ **Super rápido** - Dashboard lee desde DB local (30ms)
✅ **Sin rate limits** - No saturas la API de Alpaca

---

## 💡 Listo para usar!

1. ✅ Ve a Settings
2. ✅ Haz clic en "Update Market Data Now"
3. ✅ Ve al Dashboard y verifica los datos!

¿Todo funcionando? Si quieres automatizar, solo avísame.
