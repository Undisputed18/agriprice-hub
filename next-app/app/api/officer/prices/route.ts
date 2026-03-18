import { createClient } from '@/components/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = user.user_metadata?.role || 'farmer';
    const isFarmer = userRole === 'farmer';
    
    const market = searchParams.get('market') || 'all';
    const region = searchParams.get('region') || 'all';
    const commodity = searchParams.get('commodity') || 'all';
    const status = searchParams.get('status') || 'all';
    const includeAll = searchParams.get('includeAll') === 'true' || isFarmer;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '500');
    const offset = (page - 1) * limit;

    // FIRST: Get all market profiles to use as a lookup table (for fallback)
    const { data: allMarketProfiles } = await supabase
      .from('market_profiles')
      .select('id, market_name, location, market_type');
    
    const profilesMap: Record<string, any> = {};
    if (allMarketProfiles) {
      allMarketProfiles.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
    }

    // Build query for price submissions with join to market_profiles
    // Using left join (market_profiles(*)) instead of inner join to ensure we get all records
    let query = supabase
      .from('price_submissions')
      .select('*, market_profiles(*)', { count: 'exact' });

    // Apply filters
    if (commodity !== 'all') {
      query = query.eq('commodity', commodity.toLowerCase());
    }
    
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('submitted_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('submitted_date', endDate);
    }

    // Get the submissions with join data
    let { data: submissions, error, count } = await query
      .order('submitted_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching submissions from Supabase:', error);
      return NextResponse.json({ error: 'Database error: ' + error.message, details: error }, { status: 500 });
    }

    // Format the data
    const prices = (submissions || []).map((sub: any) => {
      // Extract profile data - handle array if returned by join
      const profileData = Array.isArray(sub.market_profiles) ? sub.market_profiles[0] : sub.market_profiles;
      
      // Prioritize profile data, then fallback to lookup map, then direct submission data
      const profile = profileData || (sub.market_profile_id ? profilesMap[sub.market_profile_id] : null);
      
      const marketName = profile?.market_name || sub.market || '';
      const marketLocation = profile?.location || sub.market_location || '';
      const marketType = profile?.market_type || 'Retail';

      return {
        id: sub.id,
        commodity: sub.commodity || 'Unknown',
        price: sub.price || 0,
        price_formatted: sub.price ? `KES ${sub.price.toLocaleString()}` : 'KES 0',
        unit: sub.unit || 'unit',
        market: marketName.trim(),
        market_location: marketLocation.trim(),
        market_type: marketType,
        submitted_date: sub.submitted_date,
        status: sub.status || 'pending',
        notes: sub.notes || '',
        market_profile_id: sub.market_profile_id,
        submitted_by_name: sub.submitted_by_name || 'Market Officer'
      };
    });

    // Client-side filtering for market/region if needed
    let filteredPrices = prices;
    
    if (market !== 'all') {
      const marketFilter = market.toLowerCase().replace(/-/g, ' ');
      filteredPrices = filteredPrices.filter(p => 
        p.market.toLowerCase().includes(marketFilter)
      );
    }
    
    if (region !== 'all') {
      const regionFilter = region.toLowerCase().replace(/-/g, ' ');
      filteredPrices = filteredPrices.filter(p => 
        p.market_location.toLowerCase().includes(regionFilter)
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        prices: filteredPrices,
        pagination: {
          page,
          limit,
          total: count || filteredPrices.length,
          totalPages: Math.ceil((count || filteredPrices.length) / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in prices API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
