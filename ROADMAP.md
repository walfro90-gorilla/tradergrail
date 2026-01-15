# 🚀 Próximas Mejoras - TraderGrail

## ✅ Estado Actual del Proyecto

### Lo que funciona perfectamente:
- ✅ Sistema de caché de datos de mercado en Supabase
- ✅ Actualización manual de datos vía botón en Settings
- ✅ Dashboard mostrando datos reales de AAPL
- ✅ Gráfico de área con datos históricos
- ✅ Monitoreo de estado de servicios (Supabase, Alpaca, Gemini)
- ✅ AI Analyst Widget con Gemini

---

## 🎯 Mejoras Planeadas

### **Fase 1: Experiencia de Usuario Mejorada** (15-20 min)

#### 1. Selector de Símbolos en Dashboard ⏳
**Objetivo**: Permitir cambiar entre AAPL, TSLA, GOOGL, MSFT sin recargar

**Componentes a agregar**:
```tsx
// Nuevo: src/components/dashboard/SymbolSelector.tsx
// Ya creado ✅

// Modificar: src/app/[locale]/dashboard/page.tsx
// Agregar:
// - const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
// - Modificar fetch para usar selectedSymbol dinámicamente
// - Agregar <SymbolSelector /> en el header
```

**Benefit**: Navegación rápida entre activos sin salir del Dashboard

---

#### 2. Indicador de Estado del Mercado 🕐
**Objetivo**: Mostrar si el mercado está abierto o cerrado

**Implementación**:
```tsx
// Agregar en Dashboard header:
<MarketStatusBadge />

// Shows:
// 🟢 Market Open  (durante horas de trading)
// 🔴 Market Closed (fuera de horas)
// Con countdown al próximo open/close
```

**API**: Ya tenemos `isMarketOpen()` en `alpaca-client.ts`

---

#### 3. Widget de Performance de Cuenta 📊
**Objetivo**: Mostrar portfolio value, P&L diario

**Implementación**:
```tsx
// Nuevo widget en Dashboard:
<AccountOverview />

// Shows:
// - Portfolio Value: $10,500
// - Cash: $2,300
// - Today's P&L: +$150 (+1.45%)
// - All-Time P&L: +$500 (+5.00%)
```

**API**: Ya tenemos `getAccountInfo()` en `alpaca-client.ts`

---

### **Fase 2: Más Símbolos** (5 min)

#### 4. Agregar Símbolos Populares 📈

**SQL Script**:
```sql
INSERT INTO market_tickers (symbol, exchange, refresh_interval) VALUES
  ('NVDA', 'NASDAQ', 60),   -- NVIDIA
  ('AMD', 'NASDAQ', 60),     -- Advanced Micro Devices
  ('META', 'NASDAQ', 60),    -- Meta Platforms
  ('AMZN', 'NASDAQ', 60),    -- Amazon
  ('NFLX', 'NASDAQ', 60),    -- Netflix
  ('DIS', 'NYSE', 60),       -- Disney
  ('SPY', 'NYSEARCA', 60),   -- S&P 500 ETF
  ('QQQ', 'NASDAQ', 60)      -- NASDAQ 100 ETF
ON CONFLICT (symbol) DO NOTHING;
```

**Benefit**: Más opciones para monitorear y tradear

---

### **Fase 3: Automatización** (30 min)

#### 5. Auto-Update Cada Minuto 🔄

**Opción A: Supabase Cron** (requiere plan Pro)
```sql
SELECT cron.schedule(
  'update-market-data',
  '*/1 * * * *',
  'SELECT net.http_post(...)'
);
```

**Opción B: Next.js API Route + Vercel Cron** (gratis)
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/update-markets",
    "schedule": "* * * * *"
  }]
}
```

**Opción C: External Cron Service** (cron-job.org)
- Más simple
- Ya documentado en QUICK_DEPLOY.md

**Benefit**: Datos siempre frescos sin intervención manual

---

### **Fase 4: Alertas y Notificaciones** (45 min)

#### 6. Sistema de Alertas de Precio 🔔

**Features**:
- Crear alerta: "Notificarme si AAPL baja de $250"
- Crear alerta: "Notificarme si TSLA sube 5%"
- Notificaciones en tiempo real en el Dashboard
- Opcionalmente: Email o Push notifications

**Implementación**:
```sql
-- Nueva tabla
CREATE TABLE price_alerts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  symbol text,
  condition text, -- 'above', 'below', 'change_percent'
  target_value numeric,
  is_active boolean DEFAULT true,
  triggered_at timestamp,
  created_at timestamp DEFAULT now()
);

-- Trigger que verifica alerts cada vez que se inserta en market_snapshots
```

---

### **Fase 5: Trading en Vivo** (1-2 hrs)

#### 7. Ejecutar Trades desde Dashboard 📈

**Features**:
- Botón "Buy" / "Sell" en cada símbolo
- Modal para ingresar: cantidad, precio límite, stop loss
- Confirmar trade con preview
- Ver trades pendientes y ejecutados

**API**: Alpaca ya soporta esto con:
```typescript
alpaca.createOrder({
  symbol: 'AAPL',
  qty: 10,
  side: 'buy',
  type: 'market',
  time_in_force: 'day'
})
```

---

### **Fase 6: Backtesting y Estrategias** (3-5 hrs)

#### 8. Motor de Backtesting 🧪

**Features**:
- Crear estrategia simple (ej: "Comprar cuando MA(50) cruza MA(200)")
- Ejecutar backtest en datos históricos
- Ver resultados: Sharpe Ratio, Max Drawdown, Win Rate
- Comparar estrategias

**Implementación**:
- Usar datos de `market_bars`
- Engine de backtesting en TypeScript
- Visualización de equity curve

---

## 📊 Prioridad Recomendada

| Fase | Tiempo | Valor | Prioridad |
|------|--------|-------|-----------|
| Fase 1 | 20 min | Alto | 🔥🔥🔥 |
| Fase 2 | 5 min | Medio | 🔥🔥 |
| Fase 3 | 30 min | Alto | 🔥🔥🔥 |
| Fase 4 | 45 min | Medio | 🔥 |
| Fase 5 | 2 hrs | Alto | 🔥🔥 |
| Fase 6 | 5 hrs | Bajo | 🔥 |

---

## 🚀 ¿Por dónde empezamos?

**Opción 1: Quick Wins (30 min)**
- ✅ Selector de símbolos
- ✅ Indicador de mercado abierto/cerrado
- ✅ Agregar más símbolos (NVDA, AMD, META, AMZN)

**Opción 2: Automatización Completa (30 min)**
- ✅ Configurar cron job externo (cron-job.org)
- ✅ Datos se actualizan solos cada minuto
- ✅ Nunca más presionar botón manualmente

**Opción 3: Trading en Vivo (2 hrs)**
- ✅ Ejecutar trades desde Dashboard
- ✅ Ver portfolio en tiempo real
- ✅ Sistema completo de trading

---

## 💡 Mi Recomendación

**1. Primero**: Selector de símbolos + Market status (15 min)  
**2. Después**: Automatización (30 min)  
**3. Finalmente**: Trading en vivo cuando estés listo (2 hrs)

¿Con cuál empezamos?
