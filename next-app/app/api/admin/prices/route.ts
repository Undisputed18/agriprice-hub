import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
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

    // Fetch submissions from price_submissions table
    const { data: submissions, error } = await supabase
      .from('price_submissions')
      .select('*, market_profiles(market_name)')
      .order('submitted_date', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data for the frontend
    const transformedSubmissions = (submissions || []).map(sub => ({
      id: sub.id,
      product: sub.commodity,
      market: sub.market_profiles?.market_name || sub.market || 'Unknown',
      oldPrice: sub.previous_price || sub.price * 0.9, // Fallback if previous_price doesn't exist
      newPrice: sub.price,
      submittedBy: sub.submitted_by_name || 'Market Officer',
      status: sub.status,
      date: sub.submitted_date
    }));

    return NextResponse.json({ submissions: transformedSubmissions })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
