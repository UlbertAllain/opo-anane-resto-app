// middleware.ts
import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Update session Supabase (refresh token jika perlu)
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Match semua request kecuali static files dan _next
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}