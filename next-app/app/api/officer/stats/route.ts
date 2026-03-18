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
      // Return default stats if no profile
      return NextResponse.json({
        totalSubmissions: 0,
        recentPrices: 0,
        reportsSubmitted: 0,
        pendingApprovals: 0,
        weeklyChange: {
          submissions: 0,
          prices: 0,
          reports: 0
        }
      });
    }

    // Get total submissions
    const { count: totalSubmissions } = await supabase
      .from('price_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('market_profile_id', profile.id);

    // Get recent prices (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: recentPrices } = await supabase
      .from('price_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('market_profile_id', profile.id)
      .gte('submitted_date', sevenDaysAgo.toISOString().split('T')[0]);

    // Get pending approvals
    const { count: pendingApprovals } = await supabase
      .from('price_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('market_profile_id', profile.id)
      .eq('status', 'pending');

    // Calculate weekly change (compare with previous week)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

    const { count: lastWeek } = await supabase
      .from('price_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('market_profile_id', profile.id)
      .gte('submitted_date', fourteenDaysAgo.toISOString().split('T')[0])
      .lt('submitted_date', eightDaysAgo.toISOString().split('T')[0]);

    // Ensure values are numbers (not null) for calculation
    const safeRecentPrices = recentPrices || 0;
    const safeLastWeek = lastWeek || 0;
    
    const weeklyChange = safeLastWeek > 0
      ? ((safeRecentPrices - safeLastWeek) / safeLastWeek) * 100
      : 0;

    return NextResponse.json({
      totalSubmissions: totalSubmissions || 0,
      recentPrices: safeRecentPrices,
      reportsSubmitted: 0, // You can implement this later
      pendingApprovals: pendingApprovals || 0,
      weeklyChange: {
        submissions: Math.round(weeklyChange),
        prices: Math.round(weeklyChange),
        reports: 0
      }
    });

  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}