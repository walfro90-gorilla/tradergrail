@echo off
echo ========================================
echo TraderGrail - Edge Function Deployment
echo ========================================
echo.

echo Checking Supabase CLI installation...
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Supabase CLI not installed!
    echo.
    echo Install it with: npm install -g supabase
    echo Or download from: https://supabase.com/docs/guides/cli
    pause
    exit /b 1
)

echo Supabase CLI found!
echo.

echo Step 1: Linking to your Supabase project...
echo (You'll need your project ref from https://supabase.com/dashboard/project/_/settings/general)
echo.
supabase link --project-ref YOUR_PROJECT_REF

echo.
echo Step 2: Setting up secrets...
echo.
supabase secrets set ALPACA_API_KEY=YOUR_ALPACA_KEY
supabase secrets set ALPACA_SECRET_KEY=YOUR_ALPACA_SECRET

echo.
echo Step 3: Deploying Edge Function...
echo.
supabase functions deploy update-market-data --no-verify-jwt

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Test the function manually (see TEST.md)
echo 2. Set up cron job in Supabase dashboard
echo.
pause
