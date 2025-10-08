"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon, Maximize2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductImage {
  id: number;
  url: string;
  alt: string;
  level: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductImagesProps {
  product: {
    product_image?: ProductImage[];
  } | null;
}

export default function ProductImages({ product }: ProductImagesProps) {
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const images = product?.product_image || [];
  const sortedImages = [...images].sort((a, b) => a.position - b.position);

  const thumbnailImage = sortedImages.find((img) => img.level === "thumbnail");
  console.log("🚀 ~ ProductImages ~ thumbnailImage:", thumbnailImage);
  const galleryImages = sortedImages.filter((img) => img.level === "gallery");
  console.log("🚀 ~ ProductImages ~ galleryImages:", galleryImages);

  const handleImageClick = (image: ProductImage) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "thumbnail":
        return "bg-blue-500";
      case "gallery":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  if (images.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Product Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No images available for this product</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Product Images ({images.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Thumbnail Image */}
          {thumbnailImage && (
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                Thumbnail Image
                <Badge className={getLevelColor("thumbnail")}>
                  {thumbnailImage.level}
                </Badge>
              </h3>
              <div className="relative group">
                <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden border-2 border-blue-200 bg-gray-100">
                  <Image
                    src={thumbnailImage.url}
                    alt={thumbnailImage.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 448px"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleImageClick(thumbnailImage)}
                    >
                      <Maximize2 className="w-4 h-4 mr-2" />
                      View Full Size
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <p>Alt: {thumbnailImage.alt}</p>
                  <p>Position: {thumbnailImage.position}</p>
                  <p>
                    Uploaded:{" "}
                    {new Date(thumbnailImage.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gallery Images */}
          {galleryImages.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                Gallery Images ({galleryImages.length})
                <Badge className={getLevelColor("gallery")}>gallery</Badge>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-gray-100">
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          #{image.position}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-black/15 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleImageClick(image)}
                        >
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <p className="truncate">{image.alt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Summary */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Image Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Total Images</p>
                <p className="text-lg font-semibold">{images.length}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Thumbnail</p>
                <p className="text-lg font-semibold">
                  {thumbnailImage ? 1 : 0}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Gallery</p>
                <p className="text-lg font-semibold">{galleryImages.length}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Last Updated</p>
                <p className="text-xs font-semibold">
                  {new Date(
                    Math.max(
                      ...images.map((img) => new Date(img.updatedAt).getTime())
                    )
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Size Image Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.alt || "Product Image"}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getLevelColor(selectedImage?.level || "")}>
                  {selectedImage?.level}
                </Badge>
                <span className="text-xs">
                  Position: {selectedImage?.position}
                </span>
                <span className="text-xs">ID: {selectedImage?.id}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  fill
                  className="object-contain"
                  sizes="896px"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Image URL</p>
                  <p className="font-mono text-xs break-all">
                    {selectedImage.url}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Alt Text</p>
                  <p className="font-medium">{selectedImage.alt}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created At</p>
                  <p className="font-medium">
                    {new Date(selectedImage.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Updated At</p>
                  <p className="font-medium">
                    {new Date(selectedImage.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
