import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProductCategories({ product }: { product: any }) {
  if (!product?.product_categories?.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        {product.product_categories.map((cat: any, i: number) => (
          <Badge key={i} variant="secondary">
            {cat.category?.name}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}
