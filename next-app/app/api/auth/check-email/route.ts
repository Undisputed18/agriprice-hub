// app/api/auth/check-email/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  console.log('📧 Check email API called')
  
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    console.log('Checking email:', email)
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials')
      return NextResponse.json({ 
        error: 'Server configuration error' 
      }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Check if email exists in users table
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      console.error('Database error:', error)
    }

    console.log('Email exists:', !!data)
    
    return NextResponse.json({ 
      exists: !!data, 
      error: error ? error.message : null 
    })
    
  } catch (error: any) {
    console.error('Check email error:', error)
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}
