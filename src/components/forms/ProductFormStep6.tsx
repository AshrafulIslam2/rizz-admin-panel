"use client";

import { useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  X,
  Image as ImageIcon,
  Star,
  Plus,
  Camera,
  FileImage,
  Trash2,
} from "lucide-react";
import {
  createProductStep6Schema,
  CreateProductStep6FormData,
} from "@/types/validation";

interface ProductFormStep6Props {
  initialData?: CreateProductStep6FormData;
  onComplete: (data: CreateProductStep6FormData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function ProductFormStep6({
  initialData,
  onComplete,
  onNext,
  onPrevious,
}: ProductFormStep6Props) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<File[]>([]);

  const form = useForm<CreateProductStep6FormData>({
    resolver: zodResolver(createProductStep6Schema),
    defaultValues: {
      images: initialData?.images || [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const watchedImages = form.watch("images");

  // Handle file selection
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newImages: { url: string; alt?: string; isPrimary: boolean }[] = [];
      Array.from(files).forEach((file, index) => {
        if (file.type.startsWith("image/")) {
          const preview = URL.createObjectURL(file);
          newImages.push({
            url: preview, // In real app, this would be uploaded to cloud storage
            alt: `Product image ${watchedImages.length + index + 1}`,
            isPrimary: watchedImages.length === 0 && index === 0, // First image is primary by default
          });
        }
      });

      newImages.forEach((image) => {
        append(image);
      });

      setIsUploadDialogOpen(false);
    },
    [append, watchedImages.length]
  );

  // Handle drag and drop
  const handleDragEvents = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      handleDragEvents(e);
      setDragActive(true);
    },
    [handleDragEvents]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      handleDragEvents(e);
      setDragActive(false);
    },
    [handleDragEvents]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      handleDragEvents(e);
      setDragActive(false);

      const files = e.dataTransfer.files;
      handleFileSelect(files);
    },
    [handleDragEvents, handleFileSelect]
  );

  // Set primary image
  const setPrimaryImage = (index: number) => {
    // Remove primary flag from all images
    watchedImages.forEach((_, i) => {
      update(i, { ...watchedImages[i], isPrimary: false });
    });
    // Set the selected image as primary
    update(index, { ...watchedImages[index], isPrimary: true });
  };

  // Remove image
  const removeImage = (index: number) => {
    const imageToRemove = watchedImages[index];

    // Cleanup preview URL if it's a blob URL (user uploaded file)
    if (imageToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    remove(index);

    // If we removed the primary image and there are still images, make the first one primary
    if (imageToRemove.isPrimary && watchedImages.length > 1) {
      const remainingImages = watchedImages.filter((_, i) => i !== index);
      if (remainingImages.length > 0) {
        // Find the index of the first remaining image and set it as primary
        const newPrimaryIndex = index === 0 ? 0 : 0;
        setTimeout(() => {
          update(newPrimaryIndex, {
            ...remainingImages[newPrimaryIndex],
            isPrimary: true,
          });
        }, 0);
      }
    }
  };

  // Update image alt text
  const updateImageAlt = (index: number, alt: string) => {
    update(index, { ...watchedImages[index], alt });
  };

  const handleFormSubmit = (data: CreateProductStep6FormData) => {
    // In a real app, you would upload images to cloud storage here
    // and replace the blob URLs with actual URLs

    onComplete(data);
    onNext();
  };

  const primaryImage = watchedImages.find((img) => img.isPrimary);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Product Images
        </CardTitle>
        <CardDescription>
          Upload multiple product images. The first image will be set as the
          primary image by default. You can change the primary image and add
          descriptions for better SEO.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            {/* Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Product Images</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload high-quality images to showcase your product
                  </p>
                </div>
                <Dialog
                  open={isUploadDialogOpen}
                  onOpenChange={setIsUploadDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Images
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Product Images</DialogTitle>
                      <DialogDescription>
                        Select multiple images to upload. Supported formats:
                        JPG, PNG, WebP
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      {/* Drag and Drop Area */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                          dragActive
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-primary/50"
                        }`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragEvents}
                        onDrop={handleDrop}
                        onClick={() =>
                          document.getElementById("image-upload")?.click()
                        }
                      >
                        <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <div className="space-y-2">
                          <p className="text-lg font-medium">
                            Drop images here or click to browse
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Support for JPG, PNG, WebP up to 10MB each
                          </p>
                        </div>
                      </div>

                      {/* File Input */}
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files)}
                      />

                      {/* Quick Upload Button */}
                      <Button
                        type="button"
                        className="w-full"
                        onClick={() =>
                          document.getElementById("image-upload")?.click()
                        }
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Images
                      </Button>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsUploadDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Images Display */}
              {fields.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No images uploaded</p>
                  <p className="mb-4">
                    Add your first product image to get started
                  </p>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload First Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Primary Image Preview */}
                  {primaryImage && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">Primary Image</span>
                      </div>
                      <div className="flex gap-4">
                        <div className="relative">
                          <img
                            src={primaryImage.url}
                            alt={primaryImage.alt || "Primary product image"}
                            className="w-24 h-24 object-cover rounded-lg border-2 border-yellow-500"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            This image will be displayed as the main product
                            image in listings and search results.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Images Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="relative group">
                        <div
                          className={`relative rounded-lg overflow-hidden border-2 ${
                            watchedImages[index]?.isPrimary
                              ? "border-yellow-500"
                              : "border-gray-200"
                          }`}
                        >
                          <img
                            src={watchedImages[index]?.url}
                            alt={
                              watchedImages[index]?.alt ||
                              `Product image ${index + 1}`
                            }
                            className="w-full h-32 object-cover"
                          />

                          {/* Primary Badge */}
                          {watchedImages[index]?.isPrimary && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-yellow-500 text-white">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                Primary
                              </Badge>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Image Controls */}
                        <div className="mt-2 space-y-2">
                          <Input
                            placeholder="Image description (optional)"
                            value={watchedImages[index]?.alt || ""}
                            onChange={(e) =>
                              updateImageAlt(index, e.target.value)
                            }
                            className="text-xs"
                          />

                          {!watchedImages[index]?.isPrimary && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => setPrimaryImage(index)}
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Set as Primary
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <FormMessage>{form.formState.errors.images?.message}</FormMessage>
            </div>

            {/* Image Summary */}
            {fields.length > 0 && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Upload Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Images:</span>
                    <br />
                    <span className="font-medium">
                      {fields.length} image{fields.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Primary Image:
                    </span>
                    <br />
                    <span className="font-medium">
                      {primaryImage ? "Set" : "Not set"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      With Descriptions:
                    </span>
                    <br />
                    <span className="font-medium">
                      {
                        watchedImages.filter(
                          (img) => img.alt && img.alt.trim().length > 0
                        ).length
                      }{" "}
                      images
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPrevious}>
                Previous: Pricing
              </Button>
              <Button type="submit" disabled={fields.length === 0}>
                Next: Videos
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
