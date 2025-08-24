import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get the current user from the request
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // You could decode the JWT here to get the user ID
      // For now, we'll query all data
    }

    // Query all tables to see what data exists
    const [companiesResult, foundersResult, fundingRoundsResult, usersResult] = await Promise.all([
      supabase.from('companies').select('*'),
      supabase.from('founders').select('*'),
      supabase.from('funding_rounds').select('*'),
      supabase.from('users').select('*'),
    ]);

    // Check for errors
    const errors = [];
    if (companiesResult.error) errors.push(`Companies: ${companiesResult.error.message}`);
    if (foundersResult.error) errors.push(`Founders: ${foundersResult.error.message}`);
    if (fundingRoundsResult.error) errors.push(`Funding Rounds: ${fundingRoundsResult.error.message}`);
    if (usersResult.error) errors.push(`Users: ${usersResult.error.message}`);

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        errors,
        message: 'Database query errors occurred'
      }, { status: 500 });
    }

    // Return the data
    return NextResponse.json({
      success: true,
      data: {
        companies: companiesResult.data || [],
        founders: foundersResult.data || [],
        fundingRounds: fundingRoundsResult.data || [],
        users: usersResult.data || [],
      },
      counts: {
        companies: (companiesResult.data || []).length,
        founders: (foundersResult.data || []).length,
        fundingRounds: (fundingRoundsResult.data || []).length,
        users: (usersResult.data || []).length,
      }
    });

  } catch (error) {
    console.error('Database debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to query database'
    }, { status: 500 });
  }
}
