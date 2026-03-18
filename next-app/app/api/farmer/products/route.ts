import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    
    // Auth client to verify user
    const authSupabase = createServerClient(
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

    // Get current user to verify they are logged in
    const { data: { user }, error: userError } = await authSupabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Data client with service role to bypass RLS and get all data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Fetch all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .or('status.eq.active,status.is.null')
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return NextResponse.json({ error: 'Database error: ' + productsError.message }, { status: 500 })
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ products: [] })
    }

    // Fetch all dealer profiles separately to handle mapping manually (safest)
    const { data: allProfiles } = await supabase
      .from('dealer_profiles')
      .select('id, user_id, full_name, business_name, phone_number, email, latitude, longitude, address');

    // Also fetch from users table as a secondary fallback
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, full_name, email');

    const profileMap = new Map();
    const userProfileMap = new Map();
    const fallbackUserMap = new Map();
    
    if (allProfiles) {
      allProfiles.forEach(p => {
        profileMap.set(p.id, p);
        userProfileMap.set(p.user_id, p);
      });
    }

    if (allUsers) {
      allUsers.forEach(u => {
        fallbackUserMap.set(u.id, u);
      });
    }

    const transformedProducts = products.map(product => {
      // Find profile by ID or by User ID (dealer_id)
      const profile = (product.profile_id ? profileMap.get(product.profile_id) : null) || 
                      (product.dealer_id ? userProfileMap.get(product.dealer_id) : null);
      
      const fallbackUser = product.dealer_id ? fallbackUserMap.get(product.dealer_id) : null;
      
      // Use profile data as the primary source, then fallback user, then "Agro-Dealer"
      // Prioritize full_name as requested
      const shopName = profile?.full_name || profile?.business_name || fallbackUser?.full_name || 'Agro-Dealer';
      const shopAddress = profile?.address || (product.shops && product.shops.length > 0 ? product.shops[0] : 'Address pending');
      const shopPhone = profile?.phone_number || '';
      const shopEmail = profile?.email || '';

      // Coordinates from profile
      let latitude = profile?.latitude !== null && profile?.latitude !== undefined ? Number(profile.latitude) : null;
      let longitude = profile?.longitude !== null && profile?.longitude !== undefined ? Number(profile.longitude) : null;

      // Fallback coordinates based on address if needed
      if (latitude === null || isNaN(latitude) || longitude === null || isNaN(longitude)) {
        const addr = (shopAddress || '').toLowerCase();
        if (addr.includes('nakuru')) { latitude = -0.2833; longitude = 35.8733; }
        else if (addr.includes('westlands')) { latitude = -1.2675; longitude = 36.8089; }
        else if (addr.includes('nairobi')) { latitude = -1.286389; longitude = 36.817223; }
      }
        
      return {
        ...product,
        dealer_user_id: product.dealer_id,
        supplier_name: shopName,
        contact_phone: shopPhone,
        contact_location: shopAddress, 
        contact_email: shopEmail, 
        latitude: latitude,
        longitude: longitude
      }
    });

    return NextResponse.json({ products: transformedProducts })
    
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
