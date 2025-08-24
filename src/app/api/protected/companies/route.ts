import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import JWTUtils from '@/lib/jwt-utils';

// GET /api/protected/companies - Get all companies for a user
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Validate token and get user ID
    console.log('GET /api/protected/companies - Received token:', token.substring(0, 20) + '...');
    
    const decoded = JWTUtils.decodeToken(token);
    console.log('GET /api/protected/companies - Decoded token payload:', decoded);
    
    if (!decoded?.sub) {
      console.error('GET /api/protected/companies - Token validation failed - no sub field');
      return NextResponse.json({ error: 'Invalid token - missing user ID' }, { status: 401 });
    }

    const userId = decoded.sub;
    console.log('GET /api/protected/companies - Extracted user ID:', userId);

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

    return NextResponse.json({ companies: companies || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/protected/companies - Create a new company
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/protected/companies - Request received');
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('POST /api/protected/companies - Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.error('POST /api/protected/companies - No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Validate token and get user ID
    console.log('POST /api/protected/companies - Validating token...');
    const decoded = JWTUtils.decodeToken(token);
    console.log('POST /api/protected/companies - Decoded token payload:', decoded);
    
    if (!decoded?.sub) {
      console.error('POST /api/protected/companies - Token validation failed - no sub field');
      return NextResponse.json({ error: 'Invalid token - missing user ID' }, { status: 401 });
    }

    const userId = decoded.sub;
    console.log('POST /api/protected/companies - Extracted user ID:', userId);

    const body = await request.json();
    console.log('POST /api/protected/companies - Request body:', body);

    const { name, total_shares, valuation, esop_pool } = body;

    // Validate required fields
    if (!name || !total_shares) {
      console.error('POST /api/protected/companies - Missing required fields:', { name, total_shares });
      return NextResponse.json({ error: 'Name and total shares are required' }, { status: 400 });
    }

    console.log('POST /api/protected/companies - Creating company in database...');
    
    // Create company in database
    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        name,
        user_id: userId,
        total_shares: parseInt(total_shares),
        valuation: valuation ? parseFloat(valuation) : null,
        esop_pool: esop_pool ? parseInt(esop_pool) : 10,
        status: 'Active'
      })
      .select()
      .single();

    if (error) {
      console.error('POST /api/protected/companies - Database error:', error);
      return NextResponse.json({ error: `Failed to create company: ${error.message}` }, { status: 500 });
    }

    console.log('POST /api/protected/companies - Company created successfully:', company);
    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error('POST /api/protected/companies - API error:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

// PUT /api/protected/companies/[id] - Update a company
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Validate token and get user ID
    const decoded = JWTUtils.decodeToken(token);
    if (!decoded?.sub) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.sub;
    
    const body = await request.json();
    const { id, name, total_shares, valuation, esop_pool } = body;

    if (!id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Update company in database
    const { data: company, error } = await supabase
      .from('companies')
      .update({
        name,
        total_shares: total_shares ? parseInt(total_shares) : undefined,
        valuation: valuation ? parseFloat(valuation) : null,
        esop_pool: esop_pool ? parseInt(esop_pool) : undefined,
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

    return NextResponse.json({ company });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/protected/companies/[id] - Delete a company
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Validate token and get user ID
    const decoded = JWTUtils.decodeToken(token);
    if (!decoded?.sub) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.sub;
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Delete company from database
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user owns the company

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
