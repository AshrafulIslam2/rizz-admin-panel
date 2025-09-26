import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ProductVideos({ product }: { product: any }) {
  if (!product?.product_video?.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Videos</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 grid-cols-3">
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
  );
}
