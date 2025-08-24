export interface Company {
  id: string;
  name: string;
  user_id: string;
  total_shares: number;
  valuation?: number;
  esop_pool?: number;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Founder {
  id: string;
  company_id: string;
  name: string;
  email?: string; // Optional email for founder account matching
  initial_ownership: number;
  current_ownership: number;
  shares: number;
  created_at: string;
  updated_at: string;
}

export interface FundingRound {
  id: string;
  company_id: string;
  name: string;
  investment_amount: number;
  pre_money_valuation: number;
  post_money_valuation: number;
  shares_issued: number;
  price_per_share: number;
  order: number;
  // Enhanced fields
  round_type: 'SAFE' | 'Priced Round';
  valuation_type: 'pre_money' | 'post_money';
  esop_adjustment?: {
    add_new_pool: boolean;
    pool_size: number;
    is_pre_money: boolean;
  };
  founder_secondary_sale?: {
    enabled: boolean;
    shares_sold: number;
    sale_price_per_share: number;
  };
  // SAFE-specific fields
  safe_terms?: {
    valuation_cap: number;
    discount_percentage: number;
    conversion_trigger: 'next_round' | 'exit' | 'ipo';
  };
  esop_allocation_percent?: number;
  created_at: string;
  updated_at: string;
}

export interface ExitResults {
  exitValue: number;
  founderReturns: number[];
  investorReturns: number[];
  totalFounderValue: number;
  totalInvestorValue: number;
  // Enhanced fields for detailed calculations
  ownershipBreakdown: OwnershipBreakdown;
  currentValuation: number;
  totalSharesOutstanding: number;
  sharePrice: number;
}

export interface OwnershipBreakdown {
  founders: Array<{
    name: string;
    shares: number;
    ownershipPercent: number;
    currentValue: number;
    exitValue: number;
  }>;
  investors: Array<{
    roundName: string;
    shares: number;
    ownershipPercent: number;
    investmentAmount: number;
    currentValue: number;
    exitValue: number;
    returnMultiple: number;
  }>;
  esop: {
    shares: number;
    ownershipPercent: number;
    currentValue: number;
    exitValue: number;
  };
  available: {
    shares: number;
    ownershipPercent: number;
    currentValue: number;
    exitValue: number;
  };
}

export interface Scenario {
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
      // Enhanced fields
      round_type: 'SAFE' | 'Priced Round';
      valuation_type: 'pre_money' | 'post_money';
      esop_adjustment?: {
        add_new_pool: boolean;
        pool_size: number;
        is_pre_money: boolean;
      };
      founder_secondary_sale?: {
        enabled: boolean;
        shares_sold: number;
        sale_price_per_share: number;
      };
      safe_terms?: {
        valuation_cap: number;
        discount_percentage: number;
        conversion_trigger: 'next_round' | 'exit' | 'ipo';
      };
      esop_allocation_percent?: number;
    }>;
    exit_value: number;
    esop_allocation: number;
    total_shares: number;
    company_valuation?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ScenarioComparison {
  scenarios: Scenario[];
  comparisonData: {
    [scenarioId: string]: {
      founderReturns: Array<{
        name: string;
        shares: number;
        ownershipPercent: number;
        exitValue: number;
      }>;
      investorReturns: Array<{
        name: string;
        shares: number;
        ownershipPercent: number;
        exitValue: number;
        initialInvestment: number;
        returnMultiple: number;
      }>;
      ownershipBreakdown: {
        founders: number;
        investors: number;
        esop: number;
        available: number;
      };
      totalFounderValue: number;
      totalInvestorValue: number;
      sharePrice: number;
    };
  };
}
