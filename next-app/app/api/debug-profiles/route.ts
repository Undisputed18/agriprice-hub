import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: profiles, error: pError } = await supabase
      .from('dealer_profiles')
      .select('*')
    
    const { data: products, error: prError } = await supabase
      .from('products')
      .select('*')

    const { data: users, error: uError } = await supabase
      .from('users')
      .select('*')

    return NextResponse.json({ profiles, products, users })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}
