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
import {
  productApi,
  BulkAddProductImagesDto,
  transformImagesToDto,
} from "@/lib/api/products";

interface ProductFormStep6Props {
  initialData?: CreateProductStep6FormData;
  productId: number;
  onComplete: (data: CreateProductStep6FormData, productId: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function ProductFormStep6({
  initialData,
  productId,
  onComplete,
  onNext,
  onPrevious,
}: ProductFormStep6Props) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadMessages, setUploadMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyUploadedImages, setNewlyUploadedImages] = useState<string[]>([]);

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

  // Cloudinary upload function
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "rizz_leather");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dlpjxswlf/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

  // Handle file selection with Cloudinary upload
  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || uploading) return;

      setUploading(true);
      setUploadMessages([]);

      // Validate files
      const validFiles: File[] = [];
      const errors: string[] = [];

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) {
          errors.push(`${file.name}: Not a valid image file`);
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          errors.push(`${file.name}: File too large (max 10MB)`);
          return;
        }
        validFiles.push(file);
      });

      if (errors.length > 0) {
        setUploadMessages(errors);
      }

      if (validFiles.length === 0) {
        setUploading(false);
        return;
      }

      try {
        const uploadPromises = validFiles.map(async (file, index) => {
          const fileKey = `${file.name}-${Date.now()}-${index}`;
          setUploadProgress((prev) => ({ ...prev, [fileKey]: 0 }));

          try {
            // Create preview while uploading
            const preview = URL.createObjectURL(file);

            // Start upload
            setUploadProgress((prev) => ({ ...prev, [fileKey]: 50 }));
            const cloudinaryUrl = await uploadToCloudinary(file);

            // Clean up preview
            URL.revokeObjectURL(preview);

            setUploadProgress((prev) => ({ ...prev, [fileKey]: 100 }));

            return {
              url: cloudinaryUrl,
              alt: `Product image ${watchedImages.length + index + 1}`,
              isPrimary: watchedImages.length === 0 && index === 0,
            };
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
            setUploadProgress((prev) => ({ ...prev, [fileKey]: -1 })); // -1 indicates error
            throw error;
          }
        });

        const uploadedImages = await Promise.all(uploadPromises);

        uploadedImages.forEach((image) => {
          append(image);
          // Track newly uploaded images
          setNewlyUploadedImages((prev) => [...prev, image.url]);
        });

        setUploadMessages([
          `Successfully uploaded ${uploadedImages.length} image(s) to Cloudinary!`,
        ]);

        // Clear upload progress after successful upload
        setTimeout(() => {
          setUploadProgress({});
          setUploadMessages([]);
        }, 3000);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadMessages(["Some images failed to upload. Please try again."]);
      } finally {
        setUploading(false);
        setIsUploadDialogOpen(false);
      }
    },
    [append, watchedImages.length, uploading]
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

    // Remove from newly uploaded tracking if it exists
    setNewlyUploadedImages((prev) =>
      prev.filter((url) => url !== imageToRemove.url)
    );

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

  const handleFormSubmit = async (data: CreateProductStep6FormData) => {
    try {
      setIsSubmitting(true);

      console.log("Form submission started with data:", data);
      console.log("Product ID:", productId);

      // Check if there are any newly uploaded images to save
      if (data.images && data.images.length > 0) {
        console.log("Found images:", data.images);

        // Filter only newly uploaded images (not previously saved)
        const newImages = data.images.filter(
          (image) =>
            newlyUploadedImages.includes(image.url) &&
            !image.url.startsWith("blob:")
        );

        console.log("Newly uploaded images to save:", newImages);
        console.log("All newly uploaded URLs:", newlyUploadedImages);

        if (newImages.length > 0) {
          // Transform only new images to DTO
          const bulkImageData = {
            images: newImages.map((image) => ({
              product_id: productId,
              image_url: image.url.startsWith("http://res.cloudinary.com/")
                ? image.url.replace("http://", "https://")
                : image.url,
              alt: image.alt || `Product image`,
            })),
          };

          console.log(
            "Making API call to save new product images:",
            bulkImageData
          );

          try {
            // Save new images to database
            const result = await productApi.bulkAddProductImages(bulkImageData);
            console.log("API call successful, result:", result);
            console.log("Successfully saved new product images to database");

            // Clear newly uploaded images tracking after successful save
            setNewlyUploadedImages([]);
          } catch (apiError) {
            console.error("API call failed:", apiError);
            throw apiError;
          }
        } else {
          console.log(
            "No new images to save - all images were previously uploaded"
          );
        }
      } else {
        console.log("No images to save - data.images is empty or undefined");
      }

      // Continue with the original flow
      onComplete(data, productId);
      onNext();
    } catch (error) {
      console.error("Error saving product images:", error);
      alert("Failed to save product images. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
                      {/* Upload Messages */}
                      {uploadMessages.length > 0 && (
                        <div className="space-y-2">
                          {uploadMessages.map((message, index) => (
                            <div
                              key={index}
                              className={`p-2 rounded text-sm ${
                                message.includes("Successfully")
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {message}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload Progress */}
                      {uploading && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4 animate-pulse" />
                            <span className="text-sm font-medium">
                              Uploading to Cloudinary...
                            </span>
                          </div>
                          {Object.entries(uploadProgress).map(
                            ([fileKey, progress]) => (
                              <div key={fileKey} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="truncate">
                                    {fileKey.split("-")[0]}
                                  </span>
                                  <span>
                                    {progress === -1
                                      ? "Failed"
                                      : progress === 100
                                      ? "Complete"
                                      : `${progress}%`}
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      progress === -1
                                        ? "bg-red-500"
                                        : progress === 100
                                        ? "bg-green-500"
                                        : "bg-blue-500"
                                    }`}
                                    style={{
                                      width: `${
                                        progress === -1 ? 100 : progress
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {/* Drag and Drop Area */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          uploading
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        } ${
                          dragActive
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-primary/50"
                        }`}
                        onDragEnter={!uploading ? handleDragEnter : undefined}
                        onDragLeave={!uploading ? handleDragLeave : undefined}
                        onDragOver={!uploading ? handleDragEvents : undefined}
                        onDrop={!uploading ? handleDrop : undefined}
                        onClick={
                          !uploading
                            ? () =>
                                document.getElementById("image-upload")?.click()
                            : undefined
                        }
                      >
                        <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <div className="space-y-2">
                          <p className="text-lg font-medium">
                            {uploading
                              ? "Uploading..."
                              : "Drop images here or click to browse"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Support for JPG, PNG, WebP up to 10MB each
                          </p>
                          {uploading && (
                            <p className="text-xs text-blue-600">
                              Images are being uploaded to Cloudinary...
                            </p>
                          )}
                        </div>
                      </div>

                      {/* File Input */}
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => handleFileSelect(e.target.files)}
                      />

                      {/* Quick Upload Button */}
                      <Button
                        type="button"
                        className="w-full"
                        disabled={uploading}
                        onClick={() =>
                          document.getElementById("image-upload")?.click()
                        }
                      >
                        {uploading ? (
                          <>
                            <Upload className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Images
                          </>
                        )}
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

                          {/* Cloudinary URL Display */}
                          <div className="p-2 bg-muted/50 rounded border">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground">
                                Cloudinary URL:
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-5 px-1 text-xs"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    watchedImages[index]?.url || ""
                                  );
                                  // You could add a toast notification here
                                }}
                              >
                                Copy
                              </Button>
                            </div>
                            <div className="mt-1">
                              <input
                                type="text"
                                value={watchedImages[index]?.url || ""}
                                readOnly
                                className="w-full text-xs bg-transparent border-none p-0 text-blue-600 hover:text-blue-800 cursor-pointer"
                                onClick={(e) => {
                                  e.currentTarget.select();
                                  navigator.clipboard.writeText(
                                    watchedImages[index]?.url || ""
                                  );
                                }}
                                title="Click to copy URL"
                              />
                            </div>
                          </div>

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

              {/* Submission Status */}
              {isSubmitting && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Saving product images to database...
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Please wait while we save your Cloudinary images to the
                    product database.
                  </p>
                </div>
              )}
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
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isSubmitting}
              >
                Previous: Pricing
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Saving Images...
                  </>
                ) : (
                  "Next: Videos"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
