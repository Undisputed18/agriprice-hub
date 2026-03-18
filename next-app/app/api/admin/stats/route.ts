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

    // Parallel execution for better performance
    const [
      totalUsersRes,
      farmerCountRes,
      dealerCountRes,
      officerCountRes,
      pendingOfficerPricesRes,
      pendingDealerPricesRes
    ] = await Promise.all([
      // Total users
      supabase.from('users').select('*', { count: 'exact', head: true }),
      // Farmers
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'farmer'),
      // Dealers
      supabase.from('users').select('*', { count: 'exact', head: true }).or('role.eq.dealer,role.eq.agro-dealer'),
      // Officers
      supabase.from('users').select('*', { count: 'exact', head: true }).or('role.eq.officer,role.eq.market officer'),
      // Pending Officer Submissions
      supabase.from('price_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      // Pending Dealer Submissions (products with status 'pending')
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    return NextResponse.json({
      totalUsers: totalUsersRes.count || 0,
      farmerCount: farmerCountRes.count || 0,
      dealerCount: dealerCountRes.count || 0,
      officerCount: officerCountRes.count || 0,
      pendingPrices: (pendingOfficerPricesRes.count || 0) + (pendingDealerPricesRes.count || 0)
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
