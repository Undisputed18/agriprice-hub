// app/api/dealer/products/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
   
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
   
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch products belonging to this dealer using dealer_id (auth.uid())
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('dealer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ products: [] })
    }

    // Fetch the dealer's profile
    const { data: profile } = await supabase
      .from('dealer_profiles')
      .select('full_name, phone_number, business_name')
      .eq('user_id', user.id)
      .maybeSingle()

    // Transform the data to match your frontend interface
    const productsWithContact = products.map(product => {
      return {
        ...product,
        supplier_name: profile?.full_name || profile?.business_name || 'Agro-Dealer',
        contact_phone: profile?.phone_number || '',
        contact_email: user.email,
      };
    })

    return NextResponse.json({ products: productsWithContact })
   
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const body = await request.json()
   
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
   
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First get the dealer's profile id
    const { data: profile } = await supabase
      .from('dealer_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Dealer profile not found' }, { status: 404 })
    }

    // Insert product with both dealer_id (user's auth.id) and profile_id (dealer_profile's uuid)
    // This is safer to avoid RLS violations if policies are based on either.
    const { data, error } = await supabase
      .from('products')
      .insert({
        dealer_id: user.id,      // Ensure auth context ID is present
        profile_id: profile.id,  // Ensure link to profile table is present
        name: body.name,
        description: body.description || '',
        category: body.category,
        price: body.price,
        original_price: body.original_price || null,
        stock: body.stock,
        unit: body.unit,
        images: body.images || [],
        shops: body.shops || ['Main Shop'],
        status: body.status || 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product: data })
   
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}