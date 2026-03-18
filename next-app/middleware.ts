// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  const protectedRoutes = [
    '/dashboard', 
    '/profile', 
    '/settings',
    '/officerdashboard',
    '/price-submission',
    '/market-reports',
    '/price-management',
    '/agrodealer-dashboard',
    '/agrodealer/inventory',
    '/agrodealer/shops',
    '/agrodealer/profile',
    '/farmer/dashboard',
    '/farmer/market-trends',
    '/farmer/suppliers',
    '/farmer/alerts'
  ]
  
  // API protected routes
  const apiProtectedRoutes = [
    '/api/officer',
    '/api/farmer',
    '/api/agrodealer'
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  ) || apiProtectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Auth routes
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    // Redirect to login if trying to access protected route without auth
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Handle auto-redirection from login/signup if already logged in
  if (isAuthRoute && user) {
    const role = user.user_metadata?.role || 'farmer'
    if (role === 'officer') {
      return NextResponse.redirect(new URL('/officerdashboard', request.url))
    } else if (role === 'farmer') {
      return NextResponse.redirect(new URL('/farmer/dashboard', request.url))
    } else if (role === 'dealer') {
      return NextResponse.redirect(new URL('/agrodealer-dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     * - auth/callback (auth callback route)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth/callback).*)',
  ],
}
