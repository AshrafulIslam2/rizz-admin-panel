import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";

export default function ProductFeatures({
  product,
  id,
}: {
  product: any;
  id: string;
}) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Features</CardTitle>
        <Link
          href={`/products/${id}/features`}
          className="flex items-center text-blue-600"
        >
          <Edit className="w-4 h-4 mr-1" /> Edit
        </Link>
      </CardHeader>
      <CardContent>
        {product?.product_feature && product.product_feature.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {product.product_feature.map((f: any, i: number) => (
              <Badge key={i} variant="secondary">
                {f.name}
                {f.value ? `: ${f.value}` : ""}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              No features added for this product.
            </p>
            <Link
              href={`/products/${id}/features`}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Add product feature
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
