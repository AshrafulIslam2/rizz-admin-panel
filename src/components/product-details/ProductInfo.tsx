import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import DeleteProductButton from "@/components/DeleteProductButton";

export default function ProductInfo({
  product,
  id,
}: {
  product: any;
  id: string;
}) {
  if (!product) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product not found</CardTitle>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6" />
              <CardTitle>{product.title ?? `Product #${id}`}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-600 text-white rounded">
                Edit
              </span>

              <DeleteProductButton id={id} />
            </div>
          </div>
          <CardDescription>
            {product.subtitle && (
              <span className="font-semibold">{product.subtitle}</span>
            )}
            {product.description && <span> — {product.description}</span>}
          </CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="space-y-1">
              <div>
                <strong>SKU:</strong> {product.sku ?? "—"}
              </div>
              <div>
                <strong>Base price:</strong>{" "}
                {product.basePrice != null ? product.basePrice : "—"}
              </div>
              <div>
                <strong>Discounted price:</strong>{" "}
                {product.discountedPrice != null
                  ? product.discountedPrice
                  : "—"}
              </div>
              <div>
                <strong>Discount %:</strong>{" "}
                {product.discountPercentage != null
                  ? product.discountPercentage + "%"
                  : "—"}
              </div>
              <div>
                <strong>Barcode:</strong> {product.barcode ?? "—"}
              </div>
              <div>
                <strong>Weight:</strong> {product.weight ?? "—"}
              </div>
            </div>
            <div className="space-y-1">
              <div>
                <strong>Capacity:</strong> {product.capacity ?? "—"}
              </div>
              <div>
                <strong>Dimensions:</strong> {product.dimensions ?? "—"}
              </div>
              <div>
                <strong>Material:</strong> {product.material ?? "—"}
              </div>
              <div>
                <strong>Published:</strong> {product.published ? "Yes" : "No"}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant={product.isFeatured ? "destructive" : "outline"}>
              Featured {product.isFeatured ? "Yes" : "No"}
            </Badge>
            <Badge variant={product.isNewArrival ? "secondary" : "outline"}>
              New Arrival {product.isNewArrival ? "Yes" : "No"}
            </Badge>
            <Badge variant={product.isOnSale ? "secondary" : "outline"}>
              On Sale {product.isOnSale ? "Yes" : "No"}
            </Badge>
            <Badge variant={product.isExclusive ? "secondary" : "outline"}>
              Exclusive {product.isExclusive ? "Yes" : "No"}
            </Badge>
            <Badge variant={product.isLimitedEdition ? "secondary" : "outline"}>
              Limited Edition {product.isLimitedEdition ? "Yes" : "No"}
            </Badge>
            <Badge variant={product.isBestSeller ? "secondary" : "outline"}>
              Best Seller {product.isBestSeller ? "Yes" : "No"}
            </Badge>
            <Badge variant={product.isTrending ? "secondary" : "outline"}>
              Trending {product.isTrending ? "Yes" : "No"}
            </Badge>
            <Badge variant={product.isHot ? "secondary" : "outline"}>
              Hot {product.isHot ? "Yes" : "No"}
            </Badge>
            <Badge variant={product.isPublished ? "secondary" : "outline"}>
              Published {product.isPublished ? "Yes" : "No"}
            </Badge>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
