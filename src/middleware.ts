import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const handleI18n = createMiddleware(routing)

export async function middleware(request: NextRequest) {
    // Skip i18n for API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        return await updateSession(request)
    }

    const response = handleI18n(request)
    return await updateSession(request, response)
}

export const config = {
    matcher: [
        '/',
        '/(es-mx|en)/:path*',
        '/((?!_next|_vercel|.*\\..*).*)'
    ],
}
