import { NextRequest, NextResponse } from 'next/server';

// Mock company data for testing
const mockCompanies = [
  {
    id: 'company-1',
    name: 'TechStart Inc',
    user_id: 'demo-user-123',
    total_shares: 1000000,
    valuation: 5000000,
    esop_pool: 10,
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'company-2',
    name: 'Innovation Labs',
    user_id: 'demo-user-123',
    total_shares: 2000000,
    valuation: 8000000,
    esop_pool: 15,
    status: 'active',
    created_at: '2024-02-20T14:30:00Z',
    updated_at: '2024-02-20T14:30:00Z'
  },
  {
    id: 'company-3',
    name: 'Future Solutions',
    user_id: 'demo-user-123',
    total_shares: 1500000,
    valuation: 3000000,
    esop_pool: 12,
    status: 'planning',
    created_at: '2024-03-10T09:15:00Z',
    updated_at: '2024-03-10T09:15:00Z'
  }
];

// GET /api/companies - Get all companies or companies for a specific user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let companies;
    
    if (userId) {
      // Get companies for a specific user
      companies = mockCompanies.filter(company => company.user_id === userId);
    } else {
      // Get all companies
      companies = mockCompanies;
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ 
      success: true, 
      data: companies,
      count: companies.length 
    });
  } catch (error) {
    console.error('API Error - GET /api/companies:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch companies' 
      },
      { status: 500 }
    );
  }
}
