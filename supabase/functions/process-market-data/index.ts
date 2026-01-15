
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"

console.log("Hello from Functions!")

serve(async (req) => {
    try {
        const { name } = await req.json()
        const data = {
            message: `Hello ${name}! This is your Trading Brain Edge Function.`,
        }

        // Example: Process market data here or call external Python API
        // const supabase = createClient(
        //   Deno.env.get('SUPABASE_URL') ?? '',
        //   Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        // )

        return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
        })
    }
})
