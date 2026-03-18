// app/api/officer/prices/submit/route.ts
import { createClient } from '@/components/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate required fields
    const requiredFields = ['market_profile_id', 'commodity', 'price', 'unit', 'submitted_date'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Prepare the data object
    const submissionData: any = {
      market_profile_id: body.market_profile_id,
      submitted_by_id: user.id, // Store who submitted this price
      commodity: body.commodity,
      price: body.price,
      unit: body.unit,
      submitted_date: body.submitted_date,
      status: 'pending',
      notes: body.notes || null
    };

    // Insert price submission
    const { data, error } = await supabase
      .from('price_submissions')
      .insert([submissionData])
      .select()
      .single();

    if (error) {
      console.error('Error inserting price:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Price submitted successfully',
      submission: data 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error in POST /api/officer/prices/submit:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}