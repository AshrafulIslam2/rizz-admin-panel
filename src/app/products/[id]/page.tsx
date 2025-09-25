import React from "react";
import Link from "next/link";
import DeleteProductButton from "@/components/DeleteProductButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Star, FileVideo, HelpCircle, Edit } from "lucide-react";

type Props = {
  params: { id: string };
};

async function fetchProduct(id: string) {
  // Assumption: backend exposes product at /products/:id
  const res = await fetch(`http://localhost:3008/products/${id}`, {
    cache: "no-store",
  });
  const data = await res.json();
  console.log("🚀 ~ fetchProduct ~ res:", data);
  if (!res.ok) {
    throw new Error(`Failed to fetch product ${id}: ${res.status}`);
  }
  return data;
}

function renderVideoEntry(video: any) {
  const iframeUrl = video?.iframeUrl ?? video?.iframe ?? video?.url;
  if (!iframeUrl) return null;
  // Render a safe iframe using the stored iframe URL
  return (
    <div className="mb-4">
      <div className="aspect-video">
        <iframe
          src={iframeUrl}
          title={video?.title || "product-video"}
          width="560"
          height="315"
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-72"
        />
      </div>
    </div>
  );
}

// Client component for deleting a product

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  let product: any = null;
  try {
    product = await fetchProduct(id);
  } catch (e: any) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product not found</CardTitle>
          <CardDescription>
            Could not load product: {String(e.message)}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6" />
              <CardTitle>{product?.title ?? `Product #${id}`}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/products/${id}/edit`}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Edit
              </Link>
              <DeleteProductButton id={id} />
            </div>
          </div>
          <CardDescription>
            {product?.subtitle ?? product?.description ?? ""}
          </CardDescription>

          {/* Key product metadata shown near the title */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="space-y-1">
              <div>
                <strong>Base price:</strong>{" "}
                {product?.basePrice != null ? product.basePrice : "—"}
              </div>
              <div>
                <strong>Price:</strong>{" "}
                {product?.discountedPrice != null
                  ? product.discountedPrice
                  : product?.basePrice ?? "—"}
              </div>
              <div>
                <strong>Discount %:</strong>{" "}
                {product?.discountPercentage != null
                  ? product.discountPercentage + "%"
                  : "—"}
              </div>
              <div>
                <strong>Barcode:</strong> {product?.barcode ?? "—"}
              </div>
            </div>

            <div className="space-y-1">
              <div>
                <strong>Capacity:</strong> {product?.capacity ?? "—"}
              </div>
              <div>
                <strong>Dimensions:</strong> {product?.dimensions ?? "—"}
              </div>
              <div>
                <strong>Material:</strong> {product?.material ?? "—"}
              </div>
              <div>
                <strong>Created:</strong>{" "}
                {product?.createdAt
                  ? new Date(product.createdAt).toLocaleString()
                  : "—"}
              </div>
            </div>
          </div>

          {/* Status badges */}
          <div className="mt-2 flex flex-wrap gap-2">
            {product?.isBestSeller && (
              <Badge variant="secondary">Best Seller</Badge>
            )}
            {product?.isExclusive && (
              <Badge variant="secondary">Exclusive</Badge>
            )}
            {product?.isFeatured && <Badge variant="secondary">Featured</Badge>}
            {product?.isHot && <Badge variant="secondary">Hot</Badge>}
            {product?.isLimitedEdition && (
              <Badge variant="secondary">Limited Edition</Badge>
            )}
            {product?.isNewArrival && (
              <Badge variant="secondary">New Arrival</Badge>
            )}
            {product?.isOnSale && <Badge variant="secondary">On Sale</Badge>}
            {product?.isPublished && (
              <Badge variant="secondary">Published</Badge>
            )}
            {product?.isTrending && <Badge variant="secondary">Trending</Badge>}
          </div>
        </CardHeader>
      </Card>

      {/* Product Images */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Images</CardTitle>
          <Link
            href={`/products/${id}/images`}
            className="flex items-center text-blue-600"
          >
            <Edit className="w-4 h-4 mr-1" /> Edit
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {product?.product_image?.map((img: any, i: number) => (
              <img
                key={i}
                src={img.url}
                alt={img.alt || product.title || `image-${i}`}
                className="w-full h-40 object-cover rounded"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Colors */}
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

      {/* Product Features */}
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

      {/* Product Sizes */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Sizes</CardTitle>
          <Link
            href={`/products/${id}/sizes`}
            className="flex items-center text-blue-600"
          >
            <Edit className="w-4 h-4 mr-1" /> Edit
          </Link>
        </CardHeader>
        <CardContent className="flex gap-2">
          {product?.product_size?.map((s: any, i: number) => (
            <Badge key={i} variant="outline">
              {s.size?.value ?? s.sizeId}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* Pricing */}
      {product?.product_pricing?.length > 0 && (
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
      )}

      {/* Inventory */}
      {product?.product_quantity?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {product.product_quantity.map((q: any) => (
              <div key={q.id} className="border rounded p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="font-medium">Color</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className="w-6 h-6 rounded"
                        style={{ background: q?.color?.hexCode ?? "#eee" }}
                      />
                      <div>
                        <div>{q?.color?.name ?? q.colorId}</div>
                        <div className="text-xs text-muted-foreground">
                          {q?.color?.hexCode ?? ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium">Size</div>
                    <div className="mt-2">
                      <div>{q?.size?.value ?? q.sizeId}</div>
                      <div className="text-xs text-muted-foreground">
                        {q?.size?.system ?? ""}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium">Stock & Meta</div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div>Available: {q.available_quantity}</div>
                      <div>Reserved: {q.reserved_quantity}</div>
                      <div>Min threshold: {q.minimum_threshold}</div>
                      {q.maximum_capacity != null && (
                        <div>Maximum capacity: {q.maximum_capacity}</div>
                      )}
                      <div>Active: {q.is_active ? "Yes" : "No"}</div>
                      {q.notes && <div>Notes: {q.notes}</div>}
                      <div className="text-xs text-muted-foreground">
                        Created:{" "}
                        {q.createdAt
                          ? new Date(q.createdAt).toLocaleString()
                          : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated:{" "}
                        {q.updatedAt
                          ? new Date(q.updatedAt).toLocaleString()
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Videos */}
      {product?.product_video?.length > 0 && (
        <Card className="">
          <CardHeader>
            <CardTitle>Videos</CardTitle>
          </CardHeader>
          <CardContent className=" grid gap-2 grid-cols-3">
            {product.product_video.map((v: any, i: number) => (
              <div key={i} className="mb-4">
                <h5 className="font-medium">{v.videoType}</h5>
                <iframe
                  src={v.iframeUrl}
                  className="w-full h-64 rounded"
                  allowFullScreen
                ></iframe>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {product?.product_categories?.length > 0 && (
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
      )}

      {/* FAQs */}
      {product?.product_faq?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> FAQs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {product.product_faq.map((f: any, i: number) => (
              <div key={i}>
                <div className="font-semibold">{f.question}</div>
                <div className="text-sm text-muted-foreground">{f.answer}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* SEO Meta */}
      {product?.product_metatag && (
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
      )}
    </div>
  );
}
