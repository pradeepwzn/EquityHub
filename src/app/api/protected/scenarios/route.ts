import { NextRequest, NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/jwt-utils';
import { supabase } from '@/lib/supabase';

// GET /api/protected/scenarios?companyId=xxx
export const GET = createProtectedRoute(async (request: NextRequest, userId: string) => {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
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
});

// POST /api/protected/scenarios
export const POST = createProtectedRoute(async (request: NextRequest, userId: string) => {
  try {
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
});
