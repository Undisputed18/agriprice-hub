// app/api/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/'

  console.log('Auth callback hit:', { code: !!code, next, origin })

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              console.error('Error setting cookies in callback:', error)
            }
          },
        },
      }
    )
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        console.log('Code exchanged successfully, redirecting to:', next)
        return NextResponse.redirect(`${origin}${next}`)
      }
      
      console.error('Error exchanging code for session:', error)
      
      // Handle specific error: otp_expired
      if (error.status === 403 || error.message.includes('expired')) {
        return NextResponse.redirect(`${origin}/login?error=The link has expired or already been used. Please request a new one.`)
      }
    } catch (err) {
      console.error('Unexpected error in auth callback:', err)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user. Please try again.`)
}
