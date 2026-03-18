import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Check all products
    const { data: products } = await supabase.from('products').select('id, name, profile_id, dealer_id');
    
    // 2. Check all dealer profiles
    const { data: profiles } = await supabase.from('dealer_profiles').select('*');

    return NextResponse.json({
      productCount: products?.length || 0,
      profileCount: profiles?.length || 0,
      products: products?.slice(0, 5),
      profiles: profiles?.slice(0, 5),
      // Check if any product has a profile_id that matches a profile.id
      matches: products?.map(p => ({
        productName: p.name,
        profile_id: p.profile_id,
        dealer_id: p.dealer_id,
        hasProfileMatch: profiles?.some(prof => prof.id === p.profile_id),
        hasUserMatch: profiles?.some(prof => prof.user_id === p.dealer_id),
        profileDetails: profiles?.find(prof => prof.id === p.profile_id || prof.user_id === p.dealer_id)
      })).slice(0, 10)
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}
