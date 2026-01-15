# Guía de Automatización - TraderGrail Edge Functions

## 🎯 Instrucciones Simplificadas

### Opción A: Instalación Manual de Supabase CLI (Recomendado para Windows)

1. **Descargar Supabase CLI:**
   - Ve a: https://github.com/supabase/cli/releases
   - Descarga: `supabase_windows_amd64.zip` (última versión)
   - Extrae el archivo `supabase.exe` a una carpeta (ej: `C:\supabase\`)

2. **Agregar al PATH:**
   - Presiona `Win + R`, escribe `sysdm.cpl` y presiona Enter
   - Ve a "Advanced" → "Environment Variables"
   - En "System variables", selecciona "Path" → "Edit"
   - Clic en "New", agrega `C:\supabase` (o donde guardaste el .exe)
   - Clic "OK" en todas las ventanas

3. **Verificar instalación:**
   ```powershell
   # Abre una NUEVA terminal PowerShell
   supabase --version
   ```

---

### Paso 2: Login a Supabase

```powershell
# Esto abrirá tu navegador para autenticarte
supabase login
```

Sigue las instrucciones en el navegador.

---

### Paso 3: Link a tu proyecto

```powershell
cd C:\Users\walfr\Documents\codes\trader-master

# Reemplaza con tu Project ID (de Supabase Dashboard → Settings → General)
supabase link --project-ref bxwsmdlqwtvsuixmpsit
```

Te pedirá tu **Database Password**. Es la contraseña que usaste al crear el proyecto.

---

### Paso 4: Configurar Secrets en Supabase

```powershell
# Configurar Alpaca Keys como secrets
supabase secrets set ALPACA_API_KEY=PKW4EEPNACLIRDLB6XHD3YJCBA
supabase secrets set ALPACA_SECRET_KEY=Ca8vKzt2cUxJD3GWoQ6xvgGNWaHfvodNzDLetcyepeZ1
```

---

### Paso 5: Deploy Edge Function

```powershell
cd supabase\functions
supabase functions deploy update-market-data --no-verify-jwt
```

Deberías ver:
```
Deploying Function update-market-data
✅ Deployed successfully
URL: https://bxwsmdlqwtvsuixmpsit.supabase.co/functions/v1/update-market-data
```

---

### Paso 6: Probar la función manualmente

```powershell
# Prueba 1: Desde PowerShell
$headers = @{
    "Authorization" = "Bearer eyJ..."  # Tu ANON_KEY de Supabase
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "https://bxwsmdlqwtvsuixmpsit.supabase.co/functions/v1/update-market-data" `
    -Method POST `
    -Headers $headers
```

**Alternativa más simple: Usar Supabase Dashboard**
1. Ve a: Edge Functions → update-market-data
2. Haz clic en "Invoke"
3. Debería ejecutarse y ver respuesta JSON

---

### Paso 7: Configurar Cron Job (Actualización Automática)

Ve a **Supabase SQL Editor** y ejecuta:

```sql
-- Habilitar pg_cron (solo si estás en plan Pro)
-- Si estás en plan Free, salta al Plan B abajo
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Job cada minuto
SELECT cron.schedule(
  'update-market-data',
  '*/1 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://bxwsmdlqwtvsuixmpsit.supabase.co/functions/v1/update-market-data',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer TU_ANON_KEY_AQUI'
    )
  );
  $$
);
```

**⚠️ Reemplaza:**
- La URL con tu Project URL
- `TU_ANON_KEY_AQUI` con tu Anon Key real

---

## 🆓 Plan B: Si estás en Supabase Free (sin pg_cron)

### Opción 1: Cron-Job.org (Gratis, Externo)

1. Ve a: https://cron-job.org/en/
2. Regístrate gratis
3. Crea un nuevo cron job:
   - **URL**: `https://bxwsmdlqwtvsuixmpsit.supabase.co/functions/v1/update-market-data`
   - **Schedule**: Every 1 minute
   - **HTTP Method**: POST
   - **Headers**: 
     - `Authorization: Bearer TU_ANON_KEY`
     - `Content-Type: application/json`

### Opción 2: Vercel Cron (Gratis con Vercel deployment)

Si desplegaste en Vercel, agrega en `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/update-market-data",
    "schedule": "* * * * *"
  }]
}
```

Y crea `src/app/api/cron/update-market-data/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  const response = await fetch(
    'https://bxwsmdlqwtvsuixmpsit.supabase.co/functions/v1/update-market-data',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )
  
  const data = await response.json()
  return NextResponse.json(data)
}
```

---

## ✅ Verificar que Todo Funciona

### SQL Query para verificar:

```sql
-- Ver últimos datos insertados
SELECT symbol, price, bid, ask, fetched_at
FROM market_snapshots
ORDER BY fetched_at DESC
LIMIT 10;

-- Ver estadísticas
SELECT 
  symbol, 
  fetch_count, 
  error_count, 
  last_fetched_at,
  EXTRACT(EPOCH FROM (now() - last_fetched_at)) as seconds_since_update
FROM market_tickers;
```

Deberías ver datos actualizándose cada minuto.

---

## 🎯 Resumen de Credenciales Necesarias

Para completar el deployment, necesitas:

1. ✅ **Supabase Project ID**: `bxwsmdlqwtvsuixmpsit` (ya lo tienes)
2. ✅ **Supabase Anon Key**: `sb_publishable_s3YoSg6332r08-F8glCwFg_p3y2MyTE` (ya lo tienes)
3. ✅ **Alpaca API Key**: `PKW4EEPNACLIRDLB6XHD3YJCBA` (ya lo tienes)
4. ✅ **Alpaca Secret**: `Ca8vKzt2cUxJD3GWoQ6xvgGNWaHfvodNzDLetcyepeZ1` (ya lo tienes)
5. ❓ **Database Password**: La necesitas para `supabase link`

---

## 💡 ¿No recuerdas tu Database Password?

1. Ve a: Supabase Dashboard → Settings → Database
2. Haz clic en "Reset Database Password"
3. Guarda la nueva contraseña

---

## 🚨 Troubleshooting

### "command not found: supabase"
→ Reinicia tu terminal después de instalar
→ Verifica que agregaste al PATH correctamente

### "Invalid credentials"
→ Verifica que hiciste `supabase login` primero
→ Asegúrate de estar en el directorio correcto

### "Function deployment failed"
→ Verifica que el archivo `index.ts` esté en `supabase/functions/update-market-data/`
→ Revisa los logs con: `supabase functions logs update-market-data`

---

¿Listo? Empieza por la **Opción A: Instalación Manual** y avísame cuando llegues al Paso 3 (link).
