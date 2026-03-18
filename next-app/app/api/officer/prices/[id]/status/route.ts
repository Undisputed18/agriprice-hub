// app/api/officer/prices/[id]/status/route.ts
import { createClient } from '@/components/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('========== STATUS API ==========');
  
  try {
    const { id } = await params;
    console.log('ID:', id);
    const body = await request.json();
    console.log('Body:', body);
    
    const { status } = body;
    console.log('Status:', status);

    // Validate status
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status required (approved, rejected, pending)' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get current user (but don't use it for update)
    const { data: { user } } = await supabase.auth.getUser();
    console.log('User:', user?.id);

    // CRITICAL: ONLY update the status field
    // Do NOT include reviewed_by, reviewed_at, or any other fields
    const { data, error } = await supabase
      .from('price_submissions')
      .update({ 
        status: status 
        // NO OTHER FIELDS HERE!
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Price not found' },
        { status: 404 }
      );
    }

    console.log('Success:', data[0]);
    return NextResponse.json({
      success: true,
      data: data[0]
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}