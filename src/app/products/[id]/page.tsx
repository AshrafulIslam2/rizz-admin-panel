import React from "react";
import ProductInfo from "@/components/product-details/ProductInfo";
import ProductImages from "@/components/product-details/ProductImages";
import ProductColors from "@/components/product-details/ProductColors";
import ProductFeatures from "@/components/product-details/ProductFeatures";
import ProductSizes from "@/components/product-details/ProductSizes";
import ProductPricing from "@/components/product-details/ProductPricing";
import ProductInventory from "@/components/product-details/ProductInventory";
import ProductVideos from "@/components/product-details/ProductVideos";
import ProductCategories from "@/components/product-details/ProductCategories";
import ProductFaqs from "@/components/product-details/ProductFaqs";
import ProductSeoMeta from "@/components/product-details/ProductSeoMeta";
import { json } from "zod";

type Props = {
  params: { id: string };
};

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  let product: any = null;
  try {
    product = await fetchProduct(id);
  } catch (e: any) {
    return (
      <div className="space-y-6">
        <ProductInfo product={null} id={id} />
        <div className="text-destructive">
          Could not load product: {String(e.message)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-96">
        {JSON.stringify(product, null, 2)}
      </pre>
      <ProductInfo product={product} id={id} />
      <ProductImages product={product} />
      <ProductColors product={product} id={id} />
      <ProductFeatures product={product} id={id} />
      <ProductSizes product={product} id={id} />
      <ProductPricing product={product} />
      <ProductInventory product={product} />
      <ProductVideos product={product} />
      <ProductCategories product={product} />
      <ProductFaqs product={product} />
      <ProductSeoMeta product={product} />
    </div>
  );
}

async function fetchProduct(id: string) {
  const res = await fetch(`http://localhost:3008/products/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch product ${id}: ${res.status}`);
  }
  return await res.json();
}
