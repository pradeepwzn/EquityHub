import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/users - Get all users (for simple authentication)
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/users - Fetching all users');
    
    // Check if Supabase is configured
    if (!supabase) {
      console.log('GET /api/users - Supabase not configured, returning mock data');
      const mockUsers = [
        {
          id: '1',
          email: 'admin@example.com',
          username: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'user@example.com',
          username: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          email: 'demo@example.com',
          username: 'demo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      return NextResponse.json({ users: mockUsers });
    }

    // Fetch users from database
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    console.log('GET /api/users - Users fetched successfully:', users?.length || 0);
    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

