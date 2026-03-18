// lib/actions/auth.ts
'use server'

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type UserRole = 'farmer' | 'dealer' | 'officer'

// Server-side signup function
export async function signUp(formData: {
  email: string
  password: string
  fullName: string
  role: UserRole
}) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName,
        role: formData.role
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, user: data.user }
}

// Server-side signin function
export async function signIn(formData: {
  email: string
  password: string
}) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    return { error: error.message }
  }

  // Update last login in users table
  if (data.user) {
    try {
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id)
    } catch (dbError) {
      console.error('Failed to update last login:', dbError)
      // Continue anyway - this is not critical
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// Server-side signout function
export async function signOut() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

// Get current user with profile
export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get user profile
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !userProfile) {
    console.error('Error fetching user profile:', profileError)
    return null
  }

  let roleProfile = null
  
  // Get role-specific profile
  try {
    switch (userProfile.role) {
      case 'farmer':
        const { data: farmerData } = await supabase
          .from('farmers')
          .select('*')
          .eq('user_id', user.id)
          .single()
        roleProfile = farmerData
        break
      
      case 'dealer':
        const { data: dealerData } = await supabase
          .from('dealers')
          .select('*')
          .eq('user_id', user.id)
          .single()
        roleProfile = dealerData
        break
      
      case 'officer':
        const { data: officerData } = await supabase
          .from('officers')
          .select('*')
          .eq('user_id', user.id)
          .single()
        roleProfile = officerData
        break
    }
  } catch (roleError) {
    console.error('Error fetching role profile:', roleError)
    // Continue without role profile
  }

  return {
    ...userProfile,
    role_profile: roleProfile
  }
}

// Check if email exists
export async function checkEmailExists(email: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .maybeSingle() // Use maybeSingle instead of single for better error handling

  return { 
    exists: !!data, 
    error: error ? error.message : null 
  }
}

// Reset password
export async function resetPassword(email: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

// Update user profile
export async function updateProfile(userId: string, updates: {
  full_name?: string
  phone?: string
  location?: string
}) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, user: data }
}

// Update role-specific profile
export async function updateRoleProfile(
  userId: string, 
  role: UserRole, 
  updates: any
) {
  const supabase = await createClient()
  
  let tableName: string
  switch (role) {
    case 'farmer': tableName = 'farmers'; break
    case 'dealer': tableName = 'dealers'; break
    case 'officer': tableName = 'officers'; break
    default: return { error: 'Invalid role' }
  }

  const { data, error } = await supabase
    .from(tableName)
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, data }
}