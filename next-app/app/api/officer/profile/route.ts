// app/api/officer/profile/route.ts
import { createClient } from '@/components/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('=== GET /api/officer/profile started ===');
  
  try {
    const supabase = await createClient();
    console.log('Supabase client created');
    
    // Get current user
    console.log('Attempting to get user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('User result:', { 
      userExists: !!user, 
      userId: user?.id,
      userEmail: user?.email,
      userError: userError ? userError.message : null
    });
    
    if (userError) {
      console.error('User error details:', userError);
      return NextResponse.json({ error: `Authentication error: ${userError.message}` }, { status: 401 });
    }
    
    if (!user) {
      console.log('No user found - unauthorized');
      return NextResponse.json({ error: 'Unauthorized - No user session' }, { status: 401 });
    }

    // Get profile
    console.log('Fetching profile for user:', user.id);
    const { data: profile, error } = await supabase
      .from('market_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.log('Profile query error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // PGRST116 means no rows found - that's okay, just return null profile
      if (error.code === 'PGRST116') {
        console.log('No profile found for user');
        return NextResponse.json({ profile: null });
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Profile found:', profile ? 'yes' : 'no');
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Unexpected error in GET /api/officer/profile:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log('=== POST /api/officer/profile started ===');
  
  try {
    const supabase = await createClient();
    console.log('Supabase client created');
    
    const body = await request.json();
    console.log('Request body received:', body);

    // Get current user
    console.log('Attempting to get user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('User result:', { 
      userExists: !!user, 
      userId: user?.id,
      userEmail: user?.email,
      userError: userError ? userError.message : null
    });
    
    if (userError) {
      console.error('User error details:', userError);
      return NextResponse.json({ error: `Authentication error: ${userError.message}` }, { status: 401 });
    }
    
    if (!user) {
      console.log('No user found - unauthorized');
      return NextResponse.json({ error: 'Unauthorized - No user session' }, { status: 401 });
    }

    // Check if profile already exists
    console.log('Checking for existing profile...');
    const { data: existingProfile, error: checkError } = await supabase
      .from('market_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    console.log('Existing profile:', existingProfile ? 'found' : 'not found');

    if (existingProfile) {
      // Update existing profile
      console.log('Updating existing profile...');
      const { data: updatedProfile, error: updateError } = await supabase
        .from('market_profiles')
        .update({ 
          ...body, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      console.log('Profile updated successfully');
      return NextResponse.json({ 
        profile: updatedProfile, 
        message: 'Profile updated successfully' 
      });
    } else {
      // Create new profile
      console.log('Creating new profile...');
      const { data: newProfile, error: insertError } = await supabase
        .from('market_profiles')
        .insert([{ 
          ...body, 
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      console.log('Profile created successfully');
      return NextResponse.json({ 
        profile: newProfile, 
        message: 'Profile created successfully' 
      });
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/officer/profile:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}