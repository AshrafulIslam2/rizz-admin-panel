"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Star, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProductFeature {
  id: number;
  productId: number;
  feature_title: string;
  feature_desc: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductFeaturesProps {
  product: {
    product_feature?: ProductFeature[];
  } | null;
  id: string;
}

export default function ProductFeatures({ product, id }: ProductFeaturesProps) {
  const features = product?.product_feature || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Product Features ({features.length})
        </CardTitle>
        <Link href={`/products/${id}/features`}>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit Features
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {features.length > 0 ? (
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={feature.id}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-base">
                      {feature.feature_title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.feature_desc}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className="text-xs">
                        ID: {feature.id}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        Updated:{" "}
                        {new Date(feature.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {index < features.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500 mb-4">
              No features added for this product yet.
            </p>
            <Link href={`/products/${id}/features`}>
              <Button variant="default">
                <Star className="w-4 h-4 mr-2" />
                Add Product Features
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
