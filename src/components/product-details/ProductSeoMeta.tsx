import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ProductSeoMeta({ product }: { product: any }) {
  if (!product?.product_metatag) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Metadata</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        <div>
          <strong>Meta Title:</strong> {product.product_metatag.metaTitle}
        </div>
        <div>
          <strong>Meta Description:</strong>{" "}
          {product.product_metatag.metaDescription}
        </div>
        <div>
          <strong>Keywords:</strong> {product.product_metatag.metaKeywords}
        </div>
      </CardContent>
    </Card>
  );
}
