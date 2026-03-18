// app/api/officer/prices/[id]/route.ts
import { createClient } from '@/components/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('========== PUT API ==========');
    console.log('Updating price with ID:', id);
    
    const body = await request.json();
    console.log('Update data:', body);

    // Validate required fields
    if (!body.commodity || !body.price || !body.unit || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // First check if the price exists
    const { data: existing, error: checkError } = await supabase
      .from('price_submissions')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      console.log('Price not found:', id);
      return NextResponse.json(
        { error: 'Price not found' },
        { status: 404 }
      );
    }
    
    // Update ONLY the fields that exist in your database
    const { data, error } = await supabase
      .from('price_submissions')
      .update({
        commodity: body.commodity,
        price: parseFloat(body.price),
        unit: body.unit,
        submitted_date: body.date,
        notes: body.notes || null
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating price:', error);
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

    console.log('Price updated successfully:', data[0]);
    return NextResponse.json({ 
      success: true, 
      data: data[0] 
    });

  } catch (error) {
    console.error('Error in PUT price:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('========== DELETE API ==========');
  
  try {
    const { id } = await params;
    console.log('1. Deleting price with ID:', id);
    
    if (!id) {
      console.log('❌ ID is missing');
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    console.log('2. Supabase client created');

    // First check if the price exists and get its data
    console.log('3. Checking if price exists...');
    const { data: existing, error: checkError } = await supabase
      .from('price_submissions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking price:', checkError);
      return NextResponse.json(
        { error: checkError.message },
        { status: 500 }
      );
    }

    if (!existing) {
      console.log('❌ Price not found with ID:', id);
      return NextResponse.json(
        { error: 'Price not found' },
        { status: 404 }
      );
    }

    console.log('4. Found price to delete:', existing.id);

    // Delete the price
    console.log('5. Attempting to delete...');
    const { error: deleteError } = await supabase
      .from('price_submissions')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Error deleting price:', deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    console.log('6. ✅ Price deleted successfully:', id);
    console.log('=====================================');

    return NextResponse.json({ 
      success: true,
      message: 'Price deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('❌ Error in DELETE price:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}