// app/api/officer/prices/filters/route.ts
import { createClient } from '@/components/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all markets
    const { data: markets } = await supabase
      .from('market_profiles')
      .select('market_name, location')
      .order('market_name');

    // Get all commodities from ALL submissions (not just approved)
    const { data: commodities } = await supabase
      .from('price_submissions')
      .select('commodity');
      // REMOVED: .eq('status', 'approved')

    const uniqueCommodities = commodities 
      ? [...new Set(commodities.map(c => c.commodity))]
      : [];

    return NextResponse.json({
      success: true,
      data: {
        markets: (markets || []).map(m => ({
          value: m.market_name,
          label: m.market_name,
          location: m.location
        })),
        commodities: uniqueCommodities.map(c => ({
          value: c,
          label: c.charAt(0).toUpperCase() + c.slice(1)
        }))
      }
    });

  } catch (error) {
    console.error('Error in filters API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}