import { createClient } from '@/components/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get total count of all submissions
    const { count: totalCount, error: countError } = await supabase
      .from('price_submissions')
      .select('*', { count: 'exact', head: true });
    
    // Get count of approved submissions
    const { count: approvedCount, error: approvedError } = await supabase
      .from('price_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
    
    // Get sample of submissions
    const { data: samples, error: samplesError } = await supabase
      .from('price_submissions')
      .select(`
        *,
        market_profiles:market_profile_id (
          market_name,
          location
        )
      `)
      .limit(5);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get user's market profile if any
    const { data: profile } = await supabase
      .from('market_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    
    return NextResponse.json({
      success: true,
      debug: {
        totalSubmissions: totalCount || 0,
        approvedSubmissions: approvedCount || 0,
        currentUser: {
          id: user?.id,
          email: user?.email,
          hasProfile: !!profile
        },
        userProfile: profile,
        samples: samples || [],
        errors: {
          count: countError?.message,
          approved: approvedError?.message,
          samples: samplesError?.message
        }
      }
    });
    
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}