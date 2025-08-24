import { NextRequest, NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/jwt-utils';
import { supabase } from '@/lib/supabase';

// PUT /api/protected/scenarios/[id]
export const PUT = createProtectedRoute(async (request: NextRequest, userId: string, params: { id: string }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, config } = body;

    if (!name && !config) {
      return NextResponse.json(
        { success: false, error: 'Name or config is required for update' },
        { status: 400 }
      );
    }

    // Verify the scenario belongs to a company owned by the user
    const { data: scenario, error: fetchError } = await supabase
      .from('scenarios')
      .select(`
        *,
        companies!inner(user_id)
      `)
      .eq('id', id)
      .eq('companies.user_id', userId)
      .single();

    if (fetchError || !scenario) {
      return NextResponse.json(
        { success: false, error: 'Scenario not found or access denied' },
        { status: 404 }
      );
    }

    // Update the scenario
    const updateData: any = {};
    if (name) updateData.name = name;
    if (config) updateData.config = config;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedScenario, error } = await supabase
      .from('scenarios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating scenario:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update scenario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedScenario
    });

  } catch (error) {
    console.error('Update scenario API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/protected/scenarios/[id]
export const DELETE = createProtectedRoute(async (request: NextRequest, userId: string, params: { id: string }) => {
  try {
    const { id } = params;

    // Verify the scenario belongs to a company owned by the user
    const { data: scenario, error: fetchError } = await supabase
      .from('scenarios')
      .select(`
        *,
        companies!inner(user_id)
      `)
      .eq('id', id)
      .eq('companies.user_id', userId)
      .single();

    if (fetchError || !scenario) {
      return NextResponse.json(
        { success: false, error: 'Scenario not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the scenario
    const { error } = await supabase
      .from('scenarios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting scenario:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete scenario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Scenario deleted successfully'
    });

  } catch (error) {
    console.error('Delete scenario API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
