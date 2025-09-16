# Pricing Configuration Implementation

## Overview

The ProductFormStep5 component implements a comprehensive quantity-based pricing system that allows users to create dynamic pricing tiers based on purchase quantities. This enables bulk pricing strategies and encourages larger orders.

## Features

### 1. Dynamic Pricing Tiers

- **Unlimited Tiers**: Users can add as many pricing tiers as needed
- **Quantity Ranges**: Define min/max quantities for each tier
- **Flexible Pricing**: Set different unit prices for different quantity ranges
- **Bulk Discounts**: Optional discount percentages for volume purchases

### 2. Tier Management

- **Add Tiers**: Dynamically add new pricing tiers
- **Remove Tiers**: Delete unwanted tiers (minimum 1 required)
- **Smart Suggestions**: Automatically suggests next quantity range
- **Range Validation**: Prevents overlapping quantity ranges

### 3. Visual Feedback

- **Real-time Preview**: Live pricing table showing all tiers
- **Calculation Examples**: Shows pricing for min/max quantities
- **Tier Summaries**: Clear breakdown of each tier's settings
- **Savings Display**: Highlights bulk discount benefits

### 4. Form Validation

- **Required Fields**: Ensures all necessary pricing data is provided
- **Range Validation**: Prevents quantity overlap between tiers
- **Price Validation**: Ensures positive unit prices
- **Discount Limits**: Validates discount percentages (0-100%)

## Pricing Structure Example

### Example Configuration:

1. **Tier 1**: 1-2 units at $10.00 each (No discount)
2. **Tier 2**: 3-5 units at $9.50 each (5% bulk discount)
3. **Tier 3**: 6-10 units at $9.00 each (10% bulk discount)
4. **Tier 4**: 11+ units at $8.50 each (15% bulk discount)

### Pricing Results:

- **1 unit**: $10.00 total
- **2 units**: $20.00 total
- **3 units**: $28.50 total (Save $1.50)
- **5 units**: $47.50 total (Save $2.50)
- **10 units**: $90.00 total (Save $10.00)

## Data Structure

```typescript
interface PricingTier {
  min_quantity: number;
  max_quantity: number;
  unit_price: number;
  discount_percentage?: number;
}

interface CreateProductStep5FormData {
  pricing: PricingTier[];
}
```

## Form Validation Schema

```typescript
export const pricingSchema = z
  .object({
    min_quantity: z.number().min(1, "Minimum quantity must be at least 1"),
    max_quantity: z.number().min(1, "Maximum quantity must be at least 1"),
    unit_price: z.number().positive("Unit price must be positive"),
    discount_percentage: z.number().min(0).max(100).optional(),
  })
  .refine((data) => data.max_quantity >= data.min_quantity, {
    message:
      "Maximum quantity must be greater than or equal to minimum quantity",
    path: ["max_quantity"],
  });

export const createProductStep5Schema = z.object({
  pricing: z
    .array(pricingSchema)
    .min(1, "At least one pricing tier must be added"),
});
```

## Key Features

### 1. Smart Tier Addition

- **Auto-increment**: New tiers automatically start where the previous tier ended
- **Default Range**: Suggests 5-unit ranges for new tiers
- **Gap Prevention**: Ensures no gaps between pricing tiers

### 2. Calculation Engine

- **Real-time Calculations**: Updates pricing examples as users type
- **Discount Application**: Automatically calculates discounted prices
- **Savings Display**: Shows actual dollar savings for bulk purchases

### 3. Validation System

- **Overlap Detection**: Prevents quantity range conflicts
- **Data Integrity**: Ensures all required fields are completed
- **User Feedback**: Clear error messages for validation issues

### 4. User Experience

- **Visual Hierarchy**: Clear tier organization and numbering
- **Responsive Design**: Works on all screen sizes
- **Intuitive Controls**: Easy-to-use add/remove tier buttons
- **Live Preview**: Immediate feedback on pricing changes

## Pricing Strategies Supported

### 1. Volume Discounts

```
1-5 units: $10.00 each
6-15 units: $9.50 each (5% discount)
16+ units: $9.00 each (10% discount)
```

### 2. Tiered Pricing

```
1 unit: $15.00 each
2-3 units: $14.00 each
4-10 units: $13.00 each
11+ units: $12.00 each
```

### 3. Bulk Incentives

```
1-2 units: $20.00 each (No discount)
3-9 units: $18.00 each (10% discount)
10+ units: $15.00 each (25% discount)
```

## Technical Implementation

### 1. Form Management

- **React Hook Form**: Professional form state management
- **Field Arrays**: Dynamic pricing tier management
- **Validation**: Zod schema validation with custom rules

### 2. Real-time Calculations

```typescript
const calculateTierPrice = (tier: PricingTier, quantity: number): number => {
  const basePrice = tier.unit_price * quantity;
  const discount = tier.discount_percentage || 0;
  return basePrice * (1 - discount / 100);
};
```

### 3. Range Validation

```typescript
const validateQuantityRanges = (): boolean => {
  const sortedTiers = [...watchedPricing].sort(
    (a, b) => a.min_quantity - b.min_quantity
  );

  for (let i = 0; i < sortedTiers.length - 1; i++) {
    const current = sortedTiers[i];
    const next = sortedTiers[i + 1];

    if (current.max_quantity >= next.min_quantity) {
      return false;
    }
  }
  return true;
};
```

## Empty State Handling

- **No Tiers**: Helpful guidance when no pricing tiers exist
- **Default Tier**: Automatically creates first tier (1-2 units)
- **Clear Instructions**: Explains how to add and configure tiers

## Pricing Preview Table

- **Comprehensive Overview**: Shows all tiers in a clear table
- **Example Calculations**: Demonstrates pricing for min/max quantities
- **Discount Highlighting**: Clearly shows savings for bulk purchases
- **Sortable Display**: Orders tiers by quantity for clarity

## Future Enhancements

1. **Currency Support**: Multi-currency pricing options
2. **Seasonal Pricing**: Time-based pricing adjustments
3. **Customer-specific Pricing**: Different tiers for different customer types
4. **Bulk Import**: CSV import for complex pricing structures
5. **Price Templates**: Saved pricing configurations for reuse
6. **Competitor Analysis**: Price comparison tools
7. **Dynamic Pricing**: AI-powered pricing suggestions
8. **A/B Testing**: Split testing for pricing strategies

## API Integration Points

When connecting to a real backend:

1. `POST /api/products/:id/pricing` - Create pricing tiers
2. `GET /api/products/:id/pricing` - Fetch existing pricing
3. `PUT /api/products/:id/pricing/:tierId` - Update pricing tier
4. `DELETE /api/products/:id/pricing/:tierId` - Remove pricing tier

## Business Benefits

1. **Increased Revenue**: Encourages larger order quantities
2. **Customer Retention**: Rewards bulk purchases with discounts
3. **Inventory Management**: Moves inventory faster with bulk incentives
4. **Competitive Advantage**: Flexible pricing strategies
5. **Profit Optimization**: Balanced pricing for different order sizes
