import { NextRequest, NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/jwt-utils';
import { supabase } from '@/lib/supabase';

// Example protected API route that requires authentication
export const GET = createProtectedRoute(async (request: NextRequest, userId: string) => {
  try {
    // Fetch user profile from database
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error('Unexpected error in user profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Example of updating user profile
export const PUT = createProtectedRoute(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json();
    const { username, email } = body;

    // Validate input
    if (!username || !email) {
      return NextResponse.json(
        { error: 'Username and email are required' },
        { status: 400 }
      );
    }

    // Update user profile
    const { data: updatedProfile, error } = await supabase
      .from('users')
      .update({
        username,
        email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Unexpected error in user profile update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
