import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/protected/scenarios?companyId=xxx&userId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const userId = searchParams.get('userId');

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      );
    }

    // Verify the company belongs to the user
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .eq('user_id', userId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { success: false, error: 'Company not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch scenarios for the company
    const { data: scenarios, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scenarios:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch scenarios' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: scenarios || []
    });

  } catch (error) {
    console.error('Scenarios API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/protected/scenarios?userId=xxx
export async function POST(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { companyId, name, config } = body;

    if (!companyId || !name || !config) {
      return NextResponse.json(
        { success: false, error: 'Company ID, name, and config are required' },
        { status: 400 }
      );
    }

    // Verify the company belongs to the user
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .eq('user_id', userId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { success: false, error: 'Company not found or access denied' },
        { status: 404 }
      );
    }

    // Create the scenario
    const { data: scenario, error } = await supabase
      .from('scenarios')
      .insert({
        company_id: companyId,
        name,
        config
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating scenario:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create scenario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: scenario
    });

  } catch (error) {
    console.error('Create scenario API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}