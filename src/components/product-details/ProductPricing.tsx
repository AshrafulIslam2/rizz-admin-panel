import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ProductPricing({ product }: { product: any }) {
  if (!product?.product_pricing?.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {product.product_pricing.map((p: any) => (
          <div key={p.id} className="border rounded p-2">
            <div>
              <strong>Price:</strong> {p.unit_price}
            </div>
            <div>
              Quantity: {p.min_quantity} - {p.max_quantity}
            </div>
            <div>Rule: {p.rule_type}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
