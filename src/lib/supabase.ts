import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are set (only in development)
if (process.env.NODE_ENV === 'development') {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables:');
    console.warn('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing');
    console.warn('Please create a .env.local file with these variables.');
  }
}

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing required Supabase environment variables. ' +
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
  // Don't throw error, just warn - this allows the app to start
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          total_shares: number;
          valuation: number | null;
          esop_pool: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          user_id: string;
          total_shares: number;
          valuation?: number | null;
          esop_pool?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
          total_shares?: number;
          valuation?: number | null;
          esop_pool?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      founders: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          initial_ownership: number;
          current_ownership: number;
          shares: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          initial_ownership: number;
          current_ownership: number;
          shares: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          initial_ownership?: number;
          current_ownership?: number;
          shares?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      funding_rounds: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          investment_amount: number;
          pre_money_valuation: number;
          post_money_valuation: number;
          shares_issued: number;
          price_per_share: number;
          order: number;
          esop_allocation_percent?: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          investment_amount: number;
          pre_money_valuation: number;
          post_money_valuation: number;
          shares_issued: number;
          price_per_share: number;
          order: number;
          esop_allocation_percent?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          investment_amount?: number;
          pre_money_valuation?: number;
          post_money_valuation?: number;
          shares_issued?: number;
          price_per_share?: number;
          order?: number;
          esop_allocation_percent?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      scenarios: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          config: {
            founders: Array<{
              name: string;
              initial_ownership: number;
              current_ownership: number;
              shares: number;
            }>;
            funding_rounds: Array<{
              name: string;
              investment_amount: number;
              pre_money_valuation: number;
              post_money_valuation: number;
              shares_issued: number;
              price_per_share: number;
              order: number;
              esop_allocation_percent?: number;
            }>;
            exit_value: number;
            esop_allocation: number;
            total_shares: number;
            company_valuation?: number;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          config: {
            founders: Array<{
              name: string;
              initial_ownership: number;
              current_ownership: number;
              shares: number;
            }>;
            funding_rounds: Array<{
              name: string;
              investment_amount: number;
              pre_money_valuation: number;
              post_money_valuation: number;
              shares_issued: number;
              price_per_share: number;
              order: number;
              esop_allocation_percent?: number;
            }>;
            exit_value: number;
            esop_allocation: number;
            total_shares: number;
            company_valuation?: number;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          config?: {
            founders: Array<{
              name: string;
              initial_ownership: number;
              current_ownership: number;
              shares: number;
            }>;
            funding_rounds: Array<{
              name: string;
              investment_amount: number;
              pre_money_valuation: number;
              post_money_valuation: number;
              shares_issued: number;
              price_per_share: number;
              order: number;
              esop_allocation_percent?: number;
            }>;
            exit_value: number;
            esop_allocation: number;
            total_shares: number;
            company_valuation?: number;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Utility function to test connection (call this when needed, not at module load)
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    } else {
      console.log('Supabase connection test successful');
      return true;
    }
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
}
