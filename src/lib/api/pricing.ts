// API utilities for pricing rules

export interface PricingTierDto {
    min_quantity: number;
    max_quantity: number;
    unit_price: number;
    discount_percentage?: number;
}

export interface VariantPricingRuleDto {
    colorId: number;
    sizeId: number;
    pricingTiers: PricingTierDto[];
}

export interface BulkCreatePricingRulesDto {
    variantPricingRules: VariantPricingRuleDto[];
}

export interface PricingRuleResponse {
    id: number;
    productId: number;
    colorId: number;
    sizeId: number;
    min_quantity: number;
    max_quantity: number;
    unit_price: number;
    discount_percentage?: number;
    createdAt: string;
    updatedAt: string;
}

export const pricingApi = {
    async bulkCreatePricingRules(productId: number, data: BulkCreatePricingRulesDto): Promise<PricingRuleResponse[]> {
        const response = await fetch(`http://localhost:3008/product-pricing/product/${productId}/rules/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },
};