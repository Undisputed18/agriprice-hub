import { createClient } from '@/components/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch all dealer profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('dealer_profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching dealer profiles:', profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    // Map profiles to the expected supplier format
    const suppliers = profiles.map(profile => ({
      id: profile.id,
      name: profile.business_name || profile.full_name || 'Unnamed Supplier',
      mainProduct: 'Agricultural Supplies', // Fallback or can be fetched from products
      price: 'Contact for pricing',
      location: profile.address?.split(',')[0] || 'Unknown',
      rating: 4.5, // Mock rating
      reviews: 0,
      phone: profile.phone_number || 'No contact',
      verified: true,
      products: [], // Can be populated if you have a products join
      latitude: profile.latitude,
      longitude: profile.longitude,
      address: profile.address || 'No address provided',
    }));

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Suppliers API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
