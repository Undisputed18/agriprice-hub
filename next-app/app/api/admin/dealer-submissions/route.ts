import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Service role key missing' }, { status: 500 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        cookies: {
          get: () => undefined,
        },
      }
    )

    // Fetch products from products table where status might be 'pending' 
    // or just fetch all to show history
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        dealer_profiles!profile_id (
          full_name,
          business_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dealer products:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data for the frontend
    const transformedSubmissions = (products || []).map(p => {
      const profile = Array.isArray(p.dealer_profiles) ? p.dealer_profiles[0] : p.dealer_profiles;
      
      return {
        id: p.id,
        product: p.name,
        market: p.shops?.[0] || 'Main Shop',
        oldPrice: p.original_price || p.price,
        newPrice: p.price,
        submittedBy: profile?.business_name || profile?.full_name || 'Agro-Dealer',
        status: p.status || 'pending',
        date: p.created_at
      };
    });

    return NextResponse.json({ submissions: transformedSubmissions })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
