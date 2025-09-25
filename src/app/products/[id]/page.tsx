import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Star, FileVideo, HelpCircle } from "lucide-react";

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
  const iframeHtml = video?.iframe ?? video?.url;
  if (!iframeHtml) return null;
  // If iframe HTML provided, dangerously set innerHTML to render it.
  // NOTE: this trusts the backend; sanitize if needed.
  return (
    <div className="mb-4">
      <div dangerouslySetInnerHTML={{ __html: iframeHtml }} />
    </div>
  );
}

export default async function Page({ params }: Props) {
  const { id } = await params;
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
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Check the product id or backend server.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6" />
            <CardTitle>{product?.title ?? `Product #${id}`}</CardTitle>
          </div>
          <CardDescription>
            {product?.shortDescription ?? product?.description ?? ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {product?.images && product.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {product.images.map((src: string, i: number) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={product.title || `image-${i}`}
                    className="w-full h-40 object-cover rounded"
                  />
                ))}
              </div>
            )}

            {product?.description && (
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}

            {product?.features && product.features.length > 0 && (
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <FileVideo className="w-4 h-4" /> Features
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.features.map((f: any, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {f.name}
                      {f.value ? `: ${f.value}` : ""}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {product?.videos && (
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <FileVideo className="w-4 h-4" /> Videos
                </h4>
                <div className="mt-3">
                  {Array.isArray(product.videos)
                    ? product.videos.map((v: any, i: number) => (
                        <div key={i} className="mb-6">
                          <h5 className="font-medium">{v.title}</h5>
                          {renderVideoEntry(v)}
                        </div>
                      ))
                    : // older shape: mainVideo, cuttingVideo, ...
                      [
                        product.mainVideo,
                        product.cuttingVideo,
                        product.stitchingVideo,
                        product.assemblyVideo,
                        product.finishingVideo,
                      ].map((v: any, i: number) =>
                        v ? (
                          <div key={i} className="mb-6">
                            <h5 className="font-medium">{v.title}</h5>
                            {renderVideoEntry(v)}
                          </div>
                        ) : null
                      )}
                </div>
              </div>
            )}

            {product?.faqs && product.faqs.length > 0 && (
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> FAQs
                </h4>
                <div className="mt-3 space-y-3">
                  {product.faqs.map((f: any, i: number) => (
                    <div key={i}>
                      <div className="font-semibold">{f.question}</div>
                      <div className="text-sm text-muted-foreground">
                        {f.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product?.meta && (
              <div>
                <h4 className="font-medium">SEO</h4>
                <div className="text-sm text-muted-foreground">
                  <div>Meta title: {product.meta.metaTitle}</div>
                  <div>Meta description: {product.meta.metaDescription}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
