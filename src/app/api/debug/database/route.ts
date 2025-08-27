import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock data since we don't have a real database connection
    const mockData = {
      companies: [
        {
          id: 'company-1',
          name: 'Tech Startup Inc',
          user_id: 'user-1',
          total_shares: 1000000,
          valuation: 5000000,
          esop_pool: 100000,
          status: 'active',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 'company-2',
          name: 'Innovation Labs',
          user_id: 'user-1',
          total_shares: 2000000,
          valuation: 10000000,
          esop_pool: 200000,
          status: 'active',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ],
      founders: [
        {
          id: 'founder-1',
          company_id: 'company-1',
          name: 'John Doe',
          initial_ownership: 80,
          current_ownership: 60,
          shares: 800000,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 'founder-2',
          company_id: 'company-1',
          name: 'Jane Smith',
          initial_ownership: 20,
          current_ownership: 15,
          shares: 200000,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ],
      funding_rounds: [
        {
          id: 'round-1',
          company_id: 'company-1',
          name: 'Seed Round',
          investment_amount: 1000000,
          pre_money_valuation: 4000000,
          post_money_valuation: 5000000,
          shares_issued: 200000,
          price_per_share: 5,
          order: 1,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ],
      users: [
        {
          id: 'user-1',
          username: 'Demo User',
          email: 'demo@example.com',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: mockData,
      counts: {
        companies: mockData.companies.length,
        founders: mockData.founders.length,
        fundingRounds: mockData.funding_rounds.length,
        users: mockData.users.length,
      },
      message: 'Mock data returned (no real database connection)'
    });

  } catch (error) {
    console.error('Database debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to return mock data'
    }, { status: 500 });
  }
}
