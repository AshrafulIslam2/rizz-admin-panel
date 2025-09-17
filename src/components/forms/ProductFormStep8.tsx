"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Star, Shield, Zap, Award, Sparkles } from "lucide-react";
import {
  createProductStep8Schema,
  CreateProductStep8FormData,
} from "@/types/validation";

interface ProductFormStep8Props {
  initialData?: CreateProductStep8FormData;
  productId: number;
  onComplete: (data: CreateProductStep8FormData, productId: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function ProductFormStep8({
  initialData,
  productId,
  onComplete,
  onNext,
  onPrevious,
}: ProductFormStep8Props) {
  const form = useForm<CreateProductStep8FormData>({
    resolver: zodResolver(createProductStep8Schema),
    defaultValues: {
      features: initialData?.features || [
        {
          title: "",
          description: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const handleFormSubmit = (data: CreateProductStep8FormData) => {
    onComplete(data, productId);
    onNext();
  };

  const addFeature = () => {
    append({
      title: "",
      description: "",
    });
  };

  const featureIcons = [
    <Star className="w-5 h-5 text-yellow-500" />,
    <Shield className="w-5 h-5 text-blue-500" />,
    <Zap className="w-5 h-5 text-purple-500" />,
    <Award className="w-5 h-5 text-green-500" />,
    <Sparkles className="w-5 h-5 text-pink-500" />,
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-6 h-6" />
          Product Features
        </CardTitle>
        <CardDescription>
          Highlight the key features and benefits of your product. These help
          customers understand what makes your product special.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Features List</h3>
                  <p className="text-sm text-muted-foreground">
                    Add multiple features to showcase your product's advantages
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFeature}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>

              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No features added yet</p>
                  <p className="text-sm">Click "Add Feature" to get started</p>
                </div>
              )}

              <div className="grid gap-6">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {featureIcons[index % featureIcons.length]}
                        <div>
                          <h4 className="font-medium">Feature {index + 1}</h4>
                          <p className="text-sm text-muted-foreground">
                            Describe a key product feature
                          </p>
                        </div>
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name={`features.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Feature Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Premium Materials, Durable Construction..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`features.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Feature Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Provide a detailed description of this feature and its benefits..."
                                className="resize-none"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Explain how this feature benefits the customer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Feature Guidelines */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-medium">Feature Writing Tips</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Do:</h4>
                  <ul className="space-y-1">
                    <li>• Focus on customer benefits</li>
                    <li>• Use clear, specific language</li>
                    <li>• Highlight unique advantages</li>
                    <li>• Keep descriptions concise</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Examples:
                  </h4>
                  <ul className="space-y-1">
                    <li>• "Waterproof Design" - Protects in all weather</li>
                    <li>• "Quick Setup" - Ready to use in 5 minutes</li>
                    <li>• "Eco-Friendly" - Made from recycled materials</li>
                    <li>• "Lifetime Warranty" - Guaranteed quality</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Features Summary */}
            {fields.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-medium mb-3">Features Summary</h3>
                <div className="flex flex-wrap gap-2">
                  {fields.map((field, index) => {
                    const title = form.watch(`features.${index}.title`);
                    return title ? (
                      <Badge key={field.id} variant="secondary">
                        {title}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPrevious}>
                Previous: Videos
              </Button>
              <Button type="submit" disabled={fields.length === 0}>
                Next: SEO & Meta Tags
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
