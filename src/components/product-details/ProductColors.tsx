import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";

export default function ProductColors({
  product,
  id,
}: {
  product: any;
  id: string;
}) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Colors</CardTitle>
        <Link
          href={`/products/${id}/colors`}
          className="flex items-center text-blue-600"
        >
          <Edit className="w-4 h-4 mr-1" /> Edit
        </Link>
      </CardHeader>
      <CardContent className="flex gap-2">
        {product?.product_colors?.map((c: any, i: number) => (
          <Badge key={i} variant="outline">
            {c.color?.name ?? c.colorId}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}
