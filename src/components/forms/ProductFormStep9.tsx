"use client";

import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Globe,
  Eye,
  EyeOff,
  Link,
  Image,
  BarChart,
  Target,
} from "lucide-react";
import {
  createProductStep9Schema,
  CreateProductStep9FormData,
} from "@/types/validation";
import productMetatagsApi from "@/lib/api/productmetatags";
import { useState } from "react";

interface ProductFormStep9Props {
  initialData?: CreateProductStep9FormData;
  productId: number;
  onComplete: (data: CreateProductStep9FormData, productId: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function ProductFormStep9({
  initialData,
  productId,
  onComplete,
  onNext,
  onPrevious,
}: ProductFormStep9Props) {
  const form = useForm<CreateProductStep9FormData>({
    resolver: zodResolver(createProductStep9Schema),
    defaultValues: {
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
      metaKeywords: initialData?.metaKeywords || "",
      ogTitle: initialData?.ogTitle || "",
      ogDescription: initialData?.ogDescription || "",
      ogImage: initialData?.ogImage || "",
      canonicalUrl: initialData?.canonicalUrl || "",
      robotsIndex: initialData?.robotsIndex ?? true,
      robotsFollow: initialData?.robotsFollow ?? true,
      priority: initialData?.priority || 0.5,
      changefreq: initialData?.changefreq || "weekly",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFormSubmit = async (data: CreateProductStep9FormData) => {
    console.log("🚀 ~ handleFormSubmit ~ data:", data);
    const modifiedData = { productId, ...data };
    console.log("🚀 ~ handleFormSubmit ~ modifiedData:", modifiedData);
    try {
      // Only call bulk API if the form is dirty

      console.log("Calling productMetatagsApi.create with", modifiedData);
      await productMetatagsApi.create(modifiedData as any);

      onComplete(modifiedData, productId);
      onNext();
    } catch (e: any) {
      console.error("Failed to save features:", e);
      setSubmitError(e?.message || "Failed to save features");
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedMetaTitle = form.watch("metaTitle");
  const watchedMetaDescription = form.watch("metaDescription");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-6 h-6" />
          SEO & Meta Tags
        </CardTitle>
        <CardDescription>
          Optimize your product for search engines and social media sharing.
          Good SEO helps customers find your product online.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            {/* Basic Meta Tags */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5" />
                <h3 className="font-medium">Basic Meta Tags</h3>
              </div>

              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter meta title for search engines..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {watchedMetaTitle.length}/60 characters. This appears as
                      the clickable headline in search results.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a compelling description that appears in search results..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {watchedMetaDescription.length}/160 characters. This
                      appears below the title in search results.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Keywords (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="keyword1, keyword2, keyword3..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated keywords related to your product
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Open Graph Tags */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5" />
                <h3 className="font-medium">Social Media (Open Graph)</h3>
              </div>

              <FormField
                control={form.control}
                name="ogTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Media Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Title for social media shares (optional)..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to use meta title. This appears when shared on
                      social media.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ogDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Media Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description for social media shares (optional)..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to use meta description
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ogImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Media Image</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/social-image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Image that appears when shared on social media (1200x630px
                      recommended)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Technical SEO */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart className="w-5 h-5" />
                <h3 className="font-medium">Technical SEO</h3>
              </div>

              <FormField
                control={form.control}
                name="canonicalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canonical URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://yoursite.com/products/product-name"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The preferred URL for this product to avoid duplicate
                      content issues
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="robotsIndex"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Allow Search Engine Indexing
                        </FormLabel>
                        <FormDescription>
                          Let search engines index this product
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="robotsFollow"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2">
                          <Link className="w-4 h-4" />
                          Allow Following Links
                        </FormLabel>
                        <FormDescription>
                          Let search engines follow links on this page
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sitemap Priority</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          placeholder="0.5"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        0.0 to 1.0 (0.5 is neutral priority)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="changefreq"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Update Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="always">Always</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often this product information changes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* SEO Tips */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5" />
                <h3 className="font-medium">SEO Best Practices</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Meta Title Tips:
                  </h4>
                  <ul className="space-y-1">
                    <li>• Include your main keyword</li>
                    <li>• Keep under 60 characters</li>
                    <li>• Make it compelling and clickable</li>
                    <li>• Include brand name at the end</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Description Tips:
                  </h4>
                  <ul className="space-y-1">
                    <li>• Summarize key benefits</li>
                    <li>• Include call-to-action</li>
                    <li>• Use natural language</li>
                    <li>• Stay under 160 characters</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPrevious}>
                Previous: Features
              </Button>
              <Button type="submit">Next: FAQ</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
