// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // ==========================================
  // 1. JIKA USER BELUM LOGIN (CUSTOMER)
  // ==========================================
  if (!user) {
    // Daftar halaman yang boleh diakses tanpa login (Customer Flow & Auth)
       // Daftar halaman yang boleh diakses tanpa login (Customer Flow & Auth)
    const isPublicRoute = 
      pathname === '/' || 
      pathname.startsWith('/menu') || 
      pathname.startsWith('/detail') || // <--- TAMBAHKAN INI
      pathname.startsWith('/cart') || 
      pathname.startsWith('/info') || 
      pathname.startsWith('/track') || 
      pathname.startsWith('/login') || 
      pathname.startsWith('/register')
    
    // Next.js internal routes harus diizinkan
    const isInternalRoute = pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')

    // Jika bukan halaman public dan bukan internal route, TOLAK (redirect ke login)
    if (!isPublicRoute && !isInternalRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } 
  
  // ==========================================
  // 2. JIKA USER SUDAH LOGIN (STAFF)
  // ==========================================
  else {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'customer'

    // Jika staff mencoba akses halaman auth, lempar ke dashboard masing-masing
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
      if (role === 'chef') return NextResponse.redirect(new URL('/kitchen', request.url))
      if (role === 'cashier') return NextResponse.redirect(new URL('/cashier', request.url))
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Role-based protection (Sama seperti sebelumnya)
    if (role === 'customer') {
      if (pathname.startsWith('/admin') || pathname.startsWith('/kitchen') || pathname.startsWith('/cashier')) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    if (role === 'chef') {
      if (!pathname.startsWith('/kitchen')) {
        return NextResponse.redirect(new URL('/kitchen', request.url))
      }
    }

    if (role === 'cashier') {
      if (!pathname.startsWith('/cashier')) {
        return NextResponse.redirect(new URL('/cashier', request.url))
      }
    }

    if (role === 'admin') {
      // Admin tidak boleh akses alur customer (/, /menu, /cart), langsung lempar ke /admin
      if (pathname === '/' || pathname.startsWith('/menu') || pathname.startsWith('/cart') || pathname.startsWith('/track')) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }
  }

  return supabaseResponse
}