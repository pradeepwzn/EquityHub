# Enhanced Funding Rounds Configuration

## Overview

The Startup Value Simulator now includes an enhanced funding rounds configuration system that allows users to model complex investment scenarios with greater accuracy and detail.

## New Features

### 1. Round Type Selection
- **Priced Round**: Traditional equity investment with share issuance
- **SAFE**: Simple Agreement for Future Equity (convertible instrument)

### 2. Valuation Type
- **Pre-Money**: Valuation before investment
- **Post-Money**: Valuation after investment
- Automatic calculation of the other valuation type

### 3. SAFE Agreement Terms
- **Valuation Cap**: Maximum valuation for conversion
- **Discount Percentage**: Discount applied to next round price
- **Conversion Trigger**: When SAFE converts (next round, exit, IPO)

### 4. ESOP Pool Adjustment
- Add new ESOP pool or expand existing
- Choose between pre-money or post-money calculation
- Automatic dilution calculations

### 5. Founder Secondary Sale
- Enable founders to sell shares during rounds
- Specify number of shares and sale price
- Track secondary transactions separately

## Database Schema Changes

### New Columns Added to `funding_rounds` Table

```sql
-- Round type and valuation type
round_type VARCHAR(20) DEFAULT 'Priced Round'
valuation_type VARCHAR(20) DEFAULT 'pre_money'

-- JSON fields for complex data
esop_adjustment JSONB
founder_secondary_sale JSONB
safe_terms JSONB

-- Ordering
order_number INTEGER DEFAULT 0
```

### JSON Field Structures

#### ESOP Adjustment
```json
{
  "add_new_pool": true,
  "pool_size": 1000000,
  "is_pre_money": true
}
```

#### Founder Secondary Sale
```json
{
  "enabled": true,
  "shares_sold": 500000,
  "sale_price_per_share": 2.50
}
```

#### SAFE Terms
```json
{
  "valuation_cap": 10000000,
  "discount_percentage": 20,
  "conversion_trigger": "next_round"
}
```

## Implementation Details

### Frontend Components

#### FundingRoundsTab.tsx
- Enhanced form with conditional fields
- Advanced options toggle for complex configurations
- Real-time validation and calculations
- Responsive grid layout

#### Form Features
- **Basic Information**: Round name, type, investment amount, valuation
- **Advanced Options**: SAFE terms, ESOP adjustments, secondary sales
- **Conditional Rendering**: Fields appear based on selections
- **Validation**: Comprehensive input validation with helpful messages

### Backend Integration

#### Type Definitions
- Updated `FundingRound` interface in `types/index.ts`
- Enhanced `Scenario` config to include new fields
- Backward compatibility maintained

#### Store Updates
- Enhanced `addFundingRound` function
- Automatic calculations for valuations and shares
- Scenario saving with complete data

### Calculations

#### Valuation Calculations
```typescript
if (valuation_type === 'post_money') {
  preMoneyValuation = valuation - investment_amount;
  postMoneyValuation = valuation;
} else {
  preMoneyValuation = valuation;
  postMoneyValuation = valuation + investment_amount;
}
```

#### Share Calculations (Priced Rounds)
```typescript
if (round_type === 'Priced Round') {
  pricePerShare = preMoneyValuation / totalShares;
  sharesIssued = Math.floor(investment_amount / pricePerShare);
}
```

## Usage Instructions

### 1. Adding a Basic Funding Round
1. Navigate to the "Funding Rounds" tab
2. Fill in round name, type, and investment amount
3. Select valuation type and enter valuation
4. Click "Add Funding Round"

### 2. Configuring SAFE Agreements
1. Select "SAFE" as round type
2. Click "Show Advanced Options"
3. Enter valuation cap and discount percentage
4. Select conversion trigger

### 3. Setting Up ESOP Adjustments
1. Enable "Add/Expand ESOP Pool"
2. Enter pool size in shares
3. Choose pre-money or post-money calculation

### 4. Enabling Founder Secondary Sales
1. Enable "Enable Secondary Sale"
2. Specify shares to sell
3. Set sale price per share

## Migration Guide

### Database Migration
1. Run the `enhance-funding-rounds-table.sql` script in your Supabase SQL editor
2. Verify new columns are added successfully
3. Check that existing data has default values

### Code Updates
1. Ensure all new dependencies are installed
2. Update any custom components that use funding round data
3. Test the new functionality thoroughly

## Benefits

### For Users
- **More Accurate Modeling**: Real-world investment structures
- **Flexibility**: Support for various investment instruments
- **Better Planning**: Comprehensive ESOP and secondary sale modeling
- **Professional Features**: Industry-standard terminology and calculations

### For Developers
- **Extensible Architecture**: Easy to add new round types
- **Type Safety**: Comprehensive TypeScript interfaces
- **Performance**: Optimized calculations and rendering
- **Maintainable**: Clean separation of concerns

## Future Enhancements

### Planned Features
- **Convertible Notes**: Additional convertible instrument support
- **Anti-Dilution**: Price-based anti-dilution calculations
- **Liquidation Preferences**: Multiple liquidation preference tiers
- **Drag-Along Rights**: Founder exit scenario modeling

### Integration Opportunities
- **Financial Modeling**: Excel export capabilities
- **Scenario Comparison**: Advanced comparison tools
- **Reporting**: Professional investment deck generation
- **API Access**: External system integration

## Troubleshooting

### Common Issues

#### Form Validation Errors
- Ensure all required fields are filled
- Check that numeric values are within valid ranges
- Verify SAFE terms are complete when SAFE is selected

#### Calculation Discrepancies
- Verify company total shares are set correctly
- Check valuation type selection
- Ensure investment amounts are positive numbers

#### Database Errors
- Run the migration script if new columns are missing
- Check database permissions and RLS policies
- Verify JSON field syntax

### Debug Tools
- Use the Database Debug tab to inspect data
- Check browser console for JavaScript errors
- Verify form state in React DevTools

## Support

For technical support or feature requests:
1. Check the existing documentation
2. Review the database setup guide
3. Use the debug tools in the application
4. Contact the development team

## Version History

- **v2.0.0**: Enhanced funding rounds with SAFE, ESOP, and secondary sales
- **v1.0.0**: Basic funding rounds with simple equity calculations
