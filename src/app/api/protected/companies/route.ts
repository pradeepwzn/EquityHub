import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/protected/companies - Get all companies for a user
export async function GET(request: NextRequest) {
  try {
    // For session-based auth, we'll get user ID from query params
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    console.log('GET /api/protected/companies - Fetching companies for user:', userId);

    // Fetch companies from database
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
    }

    console.log('GET /api/protected/companies - Companies fetched successfully:', companies?.length || 0);
    return NextResponse.json({ companies: companies || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/protected/companies - Create a new company
export async function POST(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const body = await request.json();
    const { name, total_shares, valuation, esop_pool } = body;

    if (!name || !total_shares) {
      return NextResponse.json({ error: 'Name and total shares are required' }, { status: 400 });
    }

    console.log('POST /api/protected/companies - Creating company for user:', userId);

    // Create company in database
    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        name,
        user_id: userId,
        total_shares,
        valuation: valuation || null,
        esop_pool: esop_pool || 0,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
    }

    console.log('POST /api/protected/companies - Company created successfully:', company.id);
    return NextResponse.json({ company });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/protected/companies - Update a company
export async function PUT(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, total_shares, valuation, esop_pool, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    console.log('PUT /api/protected/companies - Updating company:', id);

    // Update company in database
    const { data: company, error } = await supabase
      .from('companies')
      .update({
        name,
        total_shares,
        valuation,
        esop_pool,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId) // Ensure user owns the company
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
    }

    if (!company) {
      return NextResponse.json({ error: 'Company not found or access denied' }, { status: 404 });
    }

    console.log('PUT /api/protected/companies - Company updated successfully:', company.id);
    return NextResponse.json({ company });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/protected/companies - Delete a company
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const companyId = request.nextUrl.searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    console.log('DELETE /api/protected/companies - Deleting company:', companyId);

    // Delete company from database
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId)
      .eq('user_id', userId); // Ensure user owns the company

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
    }

    console.log('DELETE /api/protected/companies - Company deleted successfully:', companyId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}