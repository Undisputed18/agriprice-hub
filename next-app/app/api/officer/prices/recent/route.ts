import { createClient } from '@/components/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's market profile
    const { data: profile } = await supabase
      .from('market_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ prices: [] });
    }

    // Get recent price submissions with market data
    const { data: submissions, error } = await supabase
      .from('price_submissions')
      .select(`
        *,
        market_profiles:market_profile_id (
          market_name,
          location
        )
      `)
      .eq('market_profile_id', profile.id)
      .order('submitted_date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching recent prices:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format the prices
    const prices = (submissions || []).map(sub => ({
      id: sub.id,
      commodity: sub.commodity,
      price: sub.price,
      unit: sub.unit,
      submitted_date: sub.submitted_date,
      status: sub.status,
      market: sub.market_profiles?.market_name || 'Unknown',
      location: sub.market_profiles?.location || 'Unknown'
    }));

    return NextResponse.json({ prices });

  } catch (error) {
    console.error('Error in recent prices API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}