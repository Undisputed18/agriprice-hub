import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  console.log('📨 Signup API called')
  
  try {
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    // Validate required fields
    const requiredFields = ['email', 'password', 'fullName', 'role']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields)
      return NextResponse.json({ 
        error: 'All fields are required',
        missing: missingFields
      }, { status: 400 })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      console.error('❌ Invalid email format')
      return NextResponse.json({ 
        error: 'Invalid email format'
      }, { status: 400 })
    }
    
    // Validate password length
    if (body.password.length < 6) {
      console.error('❌ Password too short')
      return NextResponse.json({ 
        error: 'Password must be at least 6 characters'
      }, { status: 400 })
    }
    
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Supabase URL exists:', !!supabaseUrl)
    console.log('Supabase Key exists:', !!supabaseKey)
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing environment variables')
      return NextResponse.json({ 
        error: 'Server configuration error. Check .env.local file.',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      }, { status: 500 })
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('✅ Supabase client created')
    
    // Step 1: Sign up user in Supabase Auth
    console.log('Step 1: Creating auth user for:', body.email)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          full_name: body.fullName,
          role: body.role
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`
      }
    })

    if (authError) {
      console.error('❌ Auth signup error:', authError.message)
      console.error('Full error:', authError)
      
      // Check if it's a duplicate email error
      if (authError.message.includes('already registered') || authError.code === 'user_already_exists') {
        return NextResponse.json({ 
          error: 'Email already registered',
          suggestion: 'Try logging in instead'
        }, { status: 400 })
      }
      
      return NextResponse.json({ 
        error: 'Failed to create account',
        details: authError.message,
        code: authError.code
      }, { status: 400 })
    }

    console.log('✅ Auth user created successfully')
    console.log('User ID:', authData.user?.id)
    console.log('Email confirmed:', authData.user?.email_confirmed_at ? 'Yes' : 'No')
    
    // Step 2: Create user profile in public.users table (if needed)
    // This is optional now that the trigger is removed
    if (authData.user?.id) {
      try {
        console.log('Step 2: Creating public profile...')
        
        // Check if public.users table exists
        const { error: tableCheckError } = await supabase
          .from('users')
          .select('id')
          .limit(1)
          
        if (tableCheckError && tableCheckError.code === '42P01') {
          console.log('⚠️ public.users table does not exist. Skipping profile creation.')
        } else {
          // Create user profile in public.users table
          const { error: profileError } = await supabase
            .from('users')
            .upsert({
              id: authData.user.id,
              email: body.email,
              full_name: body.fullName,
              role: body.role,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            })
          
          if (profileError) {
            console.warn('⚠️ Could not create public profile (non-critical):', profileError.message)
          } else {
            console.log('✅ Public profile created/updated')
          }
        }
      } catch (profileErr) {
        console.warn('⚠️ Profile creation skipped or failed:', profileErr)
        // This is non-critical - auth user is already created
      }
    }
    
    // Step 3: Prepare response
    const response = {
      success: true,
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        fullName: body.fullName,
        role: body.role
      },
      session: authData.session ? {
        accessToken: authData.session.access_token,
        expiresAt: authData.session.expires_at
      } : null,
      requiresEmailVerification: !authData.user?.email_confirmed_at && !authData.session,
      message: authData.user?.email_confirmed_at || authData.session 
        ? 'Account created successfully! You are now logged in.'
        : 'Account created! Please check your email to verify your account.'
    }
    
    console.log('✅ Signup process completed successfully')
    
    // Return response with user data
    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
    
  } catch (error: any) {
    console.error('❌ Unexpected server error:', error)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      suggestion: 'Please try again or contact support if the issue persists.'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}

export async function OPTIONS(request: Request) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}