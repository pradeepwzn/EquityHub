# Scenario Update & Recalculation Feature

## Overview

The Scenario Update & Recalculation feature automatically recalculates valuations, ownership percentages, and exit value projections whenever funding rounds are added, updated, or removed. This provides real-time insights into how each investment decision affects the company's cap table and stakeholder value.

## Key Features

### 1. Automatic Recalculation

- **Trigger**: "Update & Recalculate" button in Funding Rounds tab
- **Scope**: Complete scenario recalculation including all stakeholders
- **Real-time**: Immediate updates to ownership and valuation data

### 2. Current Valuation Calculation

- **Post-funding round valuation**: Based on latest investment round
- **ESOP adjustments**: Incorporates new ESOP pool additions
- **Secondary sales**: Accounts for founder share transfers
- **Share price**: Calculated based on current valuation and total shares

### 3. Ownership Breakdown

- **Founders**: Individual ownership percentages and values
- **Investors**: Round-by-round ownership and returns
- **ESOP Pool**: Current pool size and value
- **Available Shares**: Unallocated shares and their value

### 4. Exit Value Projections

- **Hypothetical exit scenarios**: User-defined exit valuations
- **Stakeholder returns**: Individual monetary returns for each party
- **Return multiples**: Investment performance metrics

## Implementation Details

### Enhanced Types

#### ExitResults Interface

```typescript
export interface ExitResults {
  exitValue: number;
  founderReturns: number[];
  investorReturns: number[];
  totalFounderValue: number;
  totalInvestorValue: number;
  // Enhanced fields
  ownershipBreakdown: OwnershipBreakdown;
  currentValuation: number;
  totalSharesOutstanding: number;
  sharePrice: number;
}
```

#### OwnershipBreakdown Interface

```typescript
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
```

### Store Functions

#### calculateCurrentValuation

Calculates the current company valuation after all funding rounds and adjustments:

```typescript
calculateCurrentValuation: (
  company: Company,
  founders: Founder[],
  fundingRounds: FundingRound[]
) => {
  let totalShares = company.total_shares;
  let currentValuation = company.valuation || 0;

  // Process ESOP pool
  const esopShares = Math.floor((totalShares * (company.esop_pool || 0)) / 100);
  totalShares += esopShares;

  // Process funding rounds
  fundingRounds.forEach((round) => {
    if (round.round_type === "Priced Round") {
      totalShares += round.shares_issued || 0;
      if (round.post_money_valuation > currentValuation) {
        currentValuation = round.post_money_valuation;
      }
    }

    // Handle ESOP adjustments
    if (round.esop_adjustment?.add_new_pool) {
      totalShares += round.esop_adjustment.pool_size;
    }
  });

  const sharePrice = totalShares > 0 ? currentValuation / totalShares : 0;

  return {
    currentValuation,
    totalSharesOutstanding: totalShares,
    sharePrice,
  };
};
```

#### calculateOwnershipBreakdown

Calculates detailed ownership breakdown for all stakeholders:

```typescript
calculateOwnershipBreakdown: (
  company: Company,
  founders: Founder[],
  fundingRounds: FundingRound[],
  currentValuation: number
) => {
  // Calculate founder ownership
  const founderBreakdown = founders.map((founder) => ({
    name: founder.name,
    shares: founder.shares,
    ownershipPercent: (founder.shares / totalShares) * 100,
    currentValue: (founder.shares / totalShares) * currentValuation,
    exitValue: (founder.shares / totalShares) * currentValuation,
  }));

  // Calculate investor ownership
  const investorBreakdown = fundingRounds
    .filter((round) => round.round_type === "Priced Round")
    .map((round) => ({
      roundName: round.name,
      shares: round.shares_issued || 0,
      ownershipPercent: ((round.shares_issued || 0) / totalShares) * 100,
      investmentAmount: round.investment_amount,
      currentValue:
        ((round.shares_issued || 0) / totalShares) * currentValuation,
      exitValue: ((round.shares_issued || 0) / totalShares) * currentValuation,
      returnMultiple:
        (((round.shares_issued || 0) / totalShares) * currentValuation) /
        round.investment_amount,
    }));

  // Calculate ESOP and available shares
  // ... additional calculations

  return {
    founders: founderBreakdown,
    investors: investorBreakdown,
    esop: esopBreakdown,
    available: availableBreakdown,
  };
};
```

### UI Components

#### FundingRoundsTab Enhancements

- **Update & Recalculate Button**: Prominent button to trigger recalculation
- **Ownership Summary**: Comprehensive breakdown of current ownership
- **Real-time Updates**: Immediate display of calculation results

#### Ownership Display

- **Founders Section**: Individual founder details with shares and values
- **Investors Section**: Round-by-round investor information
- **ESOP Pool**: Current ESOP allocation and value
- **Available Shares**: Unallocated shares and their potential value

#### Summary Statistics

- **Current Valuation**: Post-funding round company value
- **Total Shares**: Outstanding shares after all rounds
- **Share Price**: Calculated price per share
- **Founder Value**: Total value of founder holdings

## Usage Workflow

### 1. Add Funding Round

1. Navigate to Funding Rounds tab
2. Fill in round details (name, type, investment, valuation)
3. Configure advanced options (SAFE terms, ESOP, secondary sales)
4. Click "Add Funding Round"

### 2. Update & Recalculate

1. After adding/modifying funding rounds
2. Click "Update & Recalculate Scenario" button
3. System automatically recalculates:
   - Current valuation
   - Ownership percentages
   - Share prices
   - Exit projections

### 3. Review Results

1. View updated ownership breakdown
2. Check current valuation and share price
3. Analyze stakeholder value changes
4. Review exit scenario projections

## Calculation Logic

### Valuation Updates

- **Pre-money valuation**: Company value before investment
- **Post-money valuation**: Company value after investment
- **Current valuation**: Highest post-money valuation from all rounds

### Share Calculations

- **Total shares**: Base shares + ESOP + issued shares
- **Price per share**: Current valuation / total shares
- **Dilution**: Automatic calculation of ownership percentage changes

### Ownership Percentages

- **Founders**: (Founder shares / Total shares) × 100
- **Investors**: (Round shares / Total shares) × 100
- **ESOP**: (ESOP shares / Total shares) × 100
- **Available**: (Available shares / Total shares) × 100

## Benefits

### For Users

- **Real-time Insights**: Immediate understanding of funding round impact
- **Accurate Modeling**: Precise ownership and valuation calculations
- **Better Decision Making**: Clear view of stakeholder value changes
- **Professional Analysis**: Industry-standard calculation methods

### For Investors

- **Dilution Tracking**: Clear view of ownership changes
- **Return Projections**: Investment performance metrics
- **Valuation Updates**: Current company value after rounds
- **Cap Table Management**: Comprehensive ownership overview

### For Founders

- **Ownership Clarity**: Real-time view of remaining ownership
- **Value Tracking**: Current value of founder shares
- **Exit Planning**: Projected returns at different valuations
- **Strategic Decisions**: Impact of funding decisions on ownership

## Technical Implementation

### Performance Optimizations

- **Memoized Calculations**: Prevents unnecessary recalculations
- **Efficient Updates**: Only recalculates when needed
- **Optimized Rendering**: Minimal re-renders during updates

### Data Flow

1. **User Action**: Add/update funding round
2. **Store Update**: Update funding rounds array
3. **Calculation Trigger**: Manual or automatic recalculation
4. **Result Update**: Update exit results and ownership data
5. **UI Update**: Display new calculations and breakdowns

### Error Handling

- **Validation**: Input validation for all fields
- **Calculation Safety**: Safe division and mathematical operations
- **User Feedback**: Clear error messages and success notifications

## Future Enhancements

### Planned Features

- **Automatic Recalculation**: Real-time updates without button click
- **Historical Tracking**: Track ownership changes over time
- **Scenario Comparison**: Compare different funding scenarios
- **Export Functionality**: Export cap table and projections

### Advanced Calculations

- **Anti-dilution**: Price-based anti-dilution protection
- **Liquidation Preferences**: Multiple preference tiers
- **Convertible Notes**: Additional convertible instruments
- **Complex ESOP**: Vesting schedules and cliff calculations

## Troubleshooting

### Common Issues

#### Calculation Errors

- **Division by Zero**: Ensure total shares > 0
- **Negative Values**: Validate all input fields
- **Type Mismatches**: Check data types in funding round data

#### Display Issues

- **Missing Data**: Verify all required fields are populated
- **Formatting Errors**: Check number formatting functions
- **Component Rendering**: Ensure proper prop passing

#### Performance Issues

- **Slow Calculations**: Check for infinite loops or heavy operations
- **Memory Leaks**: Verify proper cleanup of event listeners
- **Re-render Issues**: Check component memoization

### Debug Tools

- **Console Logging**: Detailed calculation logs
- **State Inspection**: React DevTools for state debugging
- **Data Validation**: Verify data structure and types
- **Performance Profiling**: React Profiler for performance analysis

## Support and Maintenance

### Code Quality

- **TypeScript**: Full type safety for all calculations
- **Unit Tests**: Comprehensive test coverage for math functions
- **Documentation**: Inline code documentation and examples
- **Code Review**: Peer review for all calculation logic

### Maintenance

- **Regular Updates**: Keep calculation logic current
- **Bug Fixes**: Prompt resolution of calculation issues
- **Performance Monitoring**: Track calculation performance
- **User Feedback**: Incorporate user suggestions and improvements

## Conclusion

The Scenario Update & Recalculation feature provides a robust, real-time calculation engine for startup valuation and ownership modeling. It enables users to make informed decisions about funding rounds while maintaining accurate, up-to-date information about stakeholder value and company valuation.

This feature transforms the Startup Value Simulator from a static modeling tool into a dynamic, interactive platform for startup financial planning and analysis.
