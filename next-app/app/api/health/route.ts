// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/components/lib/supabase/server';

export async function GET() {
  try {
    // Test environment variables
    const env = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    }
    
    // Test Supabase connection
    const supabase = await createClient()
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env,
      supabase: {
        connected: !error,
        error: error?.message,
        data: data ? 'Connected successfully' : 'No data returned'
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
