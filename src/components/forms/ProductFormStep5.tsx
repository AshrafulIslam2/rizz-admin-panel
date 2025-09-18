"use client";

import { useState, useEffect } from "react";
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
import { Trash2, DollarSign, Package, Calculator, Palette } from "lucide-react";
import {
  createProductStep5Schema,
  CreateProductStep5FormData,
} from "@/types/validation";
import { colorsApi, ProductColor } from "@/lib/api/colors";
import { sizesApi, ProductSize } from "@/lib/api/sizes";
import { pricingApi, BulkCreatePricingRulesDto } from "@/lib/api/pricing";
import {
  productQuantitiesApi,
  BulkCreateProductQuantitiesDto,
} from "@/lib/api/productQuantities";

interface ProductFormStep5Props {
  initialData?: CreateProductStep5FormData;
  productId: number;
  onComplete: (data: CreateProductStep5FormData, productId: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface PricingTier {
  min_quantity: number;
  max_quantity: number;
  unit_price: number;
  discount_percentage?: number;
}

// interface VariantPricing {
//   colorId: number;
//   sizeId: number;
//   pricingTiers: PricingTier[];
// }

// interface VariantQuantity {
// colorId: number;
// sizeId: number;
// available_quantity: number;
// minimum_threshold: number;
// maximum_capacity: number;
// }

export function ProductFormStep5({
  initialData,
  productId,
  onComplete,
  onNext,
  onPrevious,
}: ProductFormStep5Props) {
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateProductStep5FormData>({
    resolver: zodResolver(createProductStep5Schema),
    defaultValues: {
      variantPricing: initialData?.variantPricing || [],
      variantQuantities: initialData?.variantQuantities || [],
    },
  });

  const {
    fields: variantPricingFields,
    append: appendVariantPricing,
    remove: removeVariantPricing,
  } = useFieldArray({
    control: form.control,
    name: "variantPricing",
  });

  const {
    fields: variantQuantityFields,
    append: appendVariantQuantity,
    remove: removeVariantQuantity,
  } = useFieldArray({
    control: form.control,
    name: "variantQuantities",
  });

  // Load colors and sizes for the product
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [colorsResponse, sizesResponse] = await Promise.all([
          colorsApi.getProductColors(productId),
          sizesApi.getProductSizes(productId),
        ]);
        setColors(colorsResponse);
        setSizes(sizesResponse);
      } catch (error) {
        console.error("Error loading colors and sizes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId]);

  const watchedVariantPricing = form.watch("variantPricing");
  const watchedVariantQuantities = form.watch("variantQuantities");

  // Check if form has meaningful data
  const hasMeaningfulData =
    (watchedVariantPricing &&
      watchedVariantPricing.length > 0 &&
      watchedVariantPricing.some((v) =>
        v.pricingTiers?.some((t) => t.unit_price > 0)
      )) ||
    (watchedVariantQuantities &&
      watchedVariantQuantities.length > 0 &&
      watchedVariantQuantities.some(
        (v) =>
          v.available_quantity > 0 ||
          v.minimum_threshold > 0 ||
          v.maximum_capacity > 0
      ));

  // Get color and size names for display
  const getColorName = (colorId: number): string => {
    const productColor = colors.find((c) => c.color.id === colorId);
    return productColor?.color.name || `Color ${colorId}`;
  };

  const getSizeName = (sizeId: number): string => {
    const productSize = sizes.find((s) => s.size.id === sizeId);
    return productSize?.size.value || `Size ${sizeId}`;
  };

  // Check if a color has any variants (any size combinations)
  const colorHasVariants = (colorId: number): boolean => {
    return watchedVariantPricing?.some((v) => v.colorId === colorId) || false;
  };

  // Check if a color has any quantity variants (any size combinations)
  const colorHasQuantities = (colorId: number): boolean => {
    return (
      watchedVariantQuantities?.some((v) => v.colorId === colorId) || false
    );
  };

  // Add new variant pricing for all sizes of a color
  const addVariantPricing = (colorId: number) => {
    if (!colorHasVariants(colorId)) {
      // Add pricing for all sizes of this color
      sizes.forEach((productSize) => {
        appendVariantPricing({
          colorId,
          sizeId: productSize.size.id,
          pricingTiers: [
            {
              min_quantity: 1,
              max_quantity: 5,
              unit_price: 0,
              discount_percentage: 0,
            },
            {
              min_quantity: 6,
              max_quantity: 25,
              unit_price: 0,
              discount_percentage: 0,
            },
            {
              min_quantity: 26,
              max_quantity: 999999,
              unit_price: 0,
              discount_percentage: 0,
            },
          ],
        });
      });
    }
  };

  // Remove all variants of a specific color
  const removeColorVariants = (colorId: number) => {
    const indicesToRemove: number[] = [];
    watchedVariantPricing?.forEach((variant, index) => {
      if (variant.colorId === colorId) {
        indicesToRemove.push(index);
      }
    });
    // Remove in reverse order to maintain correct indices
    indicesToRemove.reverse().forEach((index) => {
      removeVariantPricing(index);
    });
  };

  // Add new variant quantity for all sizes of a color
  const addVariantQuantity = (colorId: number) => {
    if (!colorHasQuantities(colorId)) {
      // Add quantities for all sizes of this color
      sizes.forEach((productSize) => {
        appendVariantQuantity({
          colorId,
          sizeId: productSize.size.id,
          available_quantity: 0,
          minimum_threshold: 0,
          maximum_capacity: 0,
        });
      });
    }
  };

  // Remove all quantity variants of a specific color
  const removeColorQuantities = (colorId: number) => {
    const indicesToRemove: number[] = [];
    watchedVariantQuantities?.forEach((variant, index) => {
      if (variant.colorId === colorId) {
        indicesToRemove.push(index);
      }
    });
    // Remove in reverse order to maintain correct indices
    indicesToRemove.reverse().forEach((index) => {
      removeVariantQuantity(index);
    });
  };

  // Update quantities for all sizes of a color when quantity values change
  const updateColorQuantities = (
    colorId: number,
    field: "available_quantity" | "minimum_threshold" | "maximum_capacity",
    value: number
  ) => {
    watchedVariantQuantities?.forEach((variant, variantIndex) => {
      if (variant.colorId === colorId) {
        form.setValue(
          `variantQuantities.${variantIndex}.${field}` as any,
          value,
          { shouldDirty: value > 0 || field === "minimum_threshold" }
        );
      }
    });
  };

  const handleFormSubmit = async (data: CreateProductStep5FormData) => {
    try {
      setIsSubmitting(true);

      // Check if there are actual meaningful pricing values
      const hasMeaningfulPricing =
        data.variantPricing &&
        data.variantPricing.length > 0 &&
        data.variantPricing.some((variant) =>
          variant.pricingTiers.some((tier) => tier.unit_price > 0)
        );

      // Check if there are actual meaningful quantity values
      const hasMeaningfulQuantities =
        data.variantQuantities &&
        data.variantQuantities.length > 0 &&
        data.variantQuantities.some(
          (variant) =>
            variant.available_quantity > 0 ||
            variant.minimum_threshold > 0 ||
            variant.maximum_capacity > 0
        );

      console.log("Form submission check:", {
        hasMeaningfulPricing,
        hasMeaningfulQuantities,
        formIsDirty: form.formState.isDirty,
        pricingLength: data.variantPricing?.length || 0,
        quantitiesLength: data.variantQuantities?.length || 0,
      });

      // Only make API calls if form is dirty AND there are meaningful values (like ProductFormStep4)
      if (
        form.formState.isDirty &&
        (hasMeaningfulPricing || hasMeaningfulQuantities)
      ) {
        console.log(
          "Form is dirty and has meaningful data, proceeding with API calls"
        );

        // Transform and submit pricing data if available
        if (hasMeaningfulPricing && data.variantPricing) {
          // Filter out any pricing with all zero values
          const validPricing = data.variantPricing.filter((variant) =>
            variant.pricingTiers.some((tier) => tier.unit_price > 0)
          );

          if (validPricing.length > 0) {
            const bulkCreateDto: BulkCreatePricingRulesDto = {
              variantPricingRules: validPricing.map((variant) => ({
                colorId: variant.colorId,
                sizeId: variant.sizeId,
                pricingTiers: variant.pricingTiers.map((tier) => ({
                  min_quantity: tier.min_quantity,
                  max_quantity: tier.max_quantity,
                  unit_price: tier.unit_price,
                  discount_percentage: tier.discount_percentage || 0,
                })),
              })),
            };

            console.log("Submitting pricing rules:", bulkCreateDto);
            await pricingApi.bulkCreatePricingRules(productId, bulkCreateDto);
            console.log("Pricing rules created successfully");
          } else {
            console.log(
              "No valid pricing data after filtering, skipping pricing API"
            );
          }
        }

        // Transform and submit quantity data if available
        if (hasMeaningfulQuantities && data.variantQuantities) {
          // Filter out any quantities with all zero values
          const validQuantities = data.variantQuantities.filter(
            (variant) =>
              variant.available_quantity > 0 ||
              variant.minimum_threshold > 0 ||
              variant.maximum_capacity > 0
          );

          if (validQuantities.length > 0) {
            const bulkQuantitiesDto: BulkCreateProductQuantitiesDto = {
              variantQuantities: validQuantities.map((variant) => ({
                colorId: variant.colorId,
                sizeId: variant.sizeId,
                available_quantity: variant.available_quantity,
                minimum_threshold: variant.minimum_threshold,
                maximum_capacity: variant.maximum_capacity,
              })),
            };

            console.log("Submitting product quantities:", bulkQuantitiesDto);
            await productQuantitiesApi.bulkCreateProductQuantities(
              productId,
              bulkQuantitiesDto
            );
            console.log("Product quantities created successfully");
          } else {
            console.log(
              "No valid quantity data after filtering, skipping quantities API"
            );
          }
        }
      } else {
        if (!form.formState.isDirty) {
          console.log("Form is not dirty, skipping API calls");
        } else if (!hasMeaningfulPricing && !hasMeaningfulQuantities) {
          console.log(
            "No meaningful pricing or quantity data found, skipping API calls"
          );
        } else {
          console.log("Unknown condition, skipping API calls");
        }
      }

      // Continue with the original flow
      onComplete(data, productId);
      onNext();
    } catch (error) {
      console.error("Error creating pricing rules or quantities:", error);
      // You might want to show an error toast or message here
      alert("Failed to save pricing rules and quantities. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Loading colors and sizes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pricing & Quantity Configuration
        </CardTitle>
        <CardDescription>
          Set up pricing and quantities for your product variants. Create
          different price points and stock levels for different color + size
          combinations with quantity-based pricing tiers and inventory
          management.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            {/* Variant Pricing */}
            <div className="space-y-6">
              {/* Variant Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Color-based Pricing</h3>
                    <p className="text-sm text-muted-foreground">
                      Select colors to set pricing tiers. All sizes under a
                      color share the same pricing structure:
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground space-y-1">
                      <div>
                        • <strong>Tier 1:</strong> 1–5 units (Retail pricing)
                      </div>
                      <div>
                        • <strong>Tier 2:</strong> 6–25 units (Wholesale
                        pricing)
                      </div>
                      <div>
                        • <strong>Tier 3:</strong> 26+ units (Bulk pricing)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color-based Variant Grid for Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {colors.map((productColor) => (
                    <Card
                      key={`color-${productColor.color.id}`}
                      className={`transition-colors ${
                        isSubmitting
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      } ${
                        colorHasVariants(productColor.color.id)
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => {
                        if (!isSubmitting) {
                          addVariantPricing(productColor.color.id);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            <span
                              className="w-6 h-6 rounded-full border-2"
                              style={{
                                backgroundColor:
                                  productColor.color.hexCode || "#ccc",
                              }}
                            />
                          </div>
                          <div className="text-center">
                            <span className="font-medium">
                              {productColor.color.name}
                            </span>
                            <div className="text-xs text-muted-foreground mt-1">
                              All sizes:{" "}
                              {sizes.map((s) => s.size.value).join(", ")}
                            </div>
                          </div>
                          {colorHasVariants(productColor.color.id) && (
                            <Badge className="mt-2" variant="secondary">
                              Pricing Set ({sizes.length} sizes)
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Color-based Pricing Configuration */}
              {colors
                .filter((color) => colorHasVariants(color.color.id))
                .map((productColor) => {
                  // Get the first variant of this color to represent the shared pricing
                  const firstVariant = watchedVariantPricing?.find(
                    (v) => v.colorId === productColor.color.id
                  );
                  if (!firstVariant) return null;

                  const colorVariants =
                    watchedVariantPricing?.filter(
                      (v) => v.colorId === productColor.color.id
                    ) || [];
                  const allSizeNames = colorVariants
                    .map((v) => getSizeName(v.sizeId))
                    .join(", ");
                  const firstVariantIndex =
                    watchedVariantPricing?.findIndex(
                      (v) =>
                        v.colorId === productColor.color.id &&
                        v.sizeId === firstVariant.sizeId
                    ) || 0;

                  return (
                    <Card
                      key={`color-pricing-${productColor.color.id}`}
                      className="p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <h4 className="font-medium text-lg">
                            {getColorName(productColor.color.id)} - All Sizes
                          </h4>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-6 h-6 rounded-full border-2"
                              style={{
                                backgroundColor:
                                  productColor.color.hexCode || "#ccc",
                              }}
                            />
                            <Badge variant="outline">
                              Sizes: {allSizeNames}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() =>
                            removeColorVariants(productColor.color.id)
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Color
                        </Button>
                      </div>

                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">
                          <strong>Shared Pricing:</strong> These pricing tiers
                          apply to all {colorVariants.length} size combinations
                          of {getColorName(productColor.color.id)}. The total
                          quantity calculation considers orders across all sizes
                          of this color.
                        </p>
                      </div>

                      {/* Shared Pricing Tiers for this color */}
                      <div className="space-y-4">
                        {firstVariant.pricingTiers?.map((tier, tierIndex) => {
                          const tierLabels = ["Retail", "Wholesale", "Bulk"];
                          const tierLabel =
                            tierLabels[tierIndex] || `Tier ${tierIndex + 1}`;

                          return (
                            <div
                              key={tierIndex}
                              className="border rounded-lg p-4 bg-muted/50"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="font-medium text-lg">
                                  {tierLabel} Pricing ({tier.min_quantity}–
                                  {tier.max_quantity === 999999
                                    ? "∞"
                                    : tier.max_quantity}{" "}
                                  units)
                                </h5>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <FormLabel>Min Quantity</FormLabel>
                                  <Input
                                    type="number"
                                    readOnly
                                    disabled={true}
                                    className="bg-muted"
                                    value={tier.min_quantity}
                                  />
                                </div>

                                <div>
                                  <FormLabel>Max Quantity</FormLabel>
                                  <Input
                                    type="number"
                                    readOnly
                                    disabled={true}
                                    className="bg-muted"
                                    value={
                                      tier.max_quantity === 999999
                                        ? "∞"
                                        : tier.max_quantity
                                    }
                                  />
                                </div>

                                <FormField
                                  control={form.control}
                                  name={
                                    `variantPricing.${firstVariantIndex}.pricingTiers.${tierIndex}.unit_price` as any
                                  }
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Unit Price (Tk)</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          placeholder="0.00"
                                          disabled={isSubmitting}
                                          value={field.value || ""}
                                          onChange={(e) => {
                                            const value =
                                              parseFloat(e.target.value) || 0;
                                            field.onChange(value);
                                            // Mark form as dirty when user enters pricing
                                            if (value > 0) {
                                              form.setValue(field.name, value, {
                                                shouldDirty: true,
                                              });
                                            }
                                            // Update all sizes of this color
                                            colorVariants.forEach((variant) => {
                                              const variantIndex =
                                                watchedVariantPricing?.findIndex(
                                                  (v) =>
                                                    v.colorId ===
                                                      variant.colorId &&
                                                    v.sizeId === variant.sizeId
                                                );
                                              if (
                                                variantIndex !== undefined &&
                                                variantIndex >= 0
                                              ) {
                                                form.setValue(
                                                  `variantPricing.${variantIndex}.pricingTiers.${tierIndex}.unit_price` as any,
                                                  value,
                                                  { shouldDirty: value > 0 }
                                                );
                                              }
                                            });
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Tier Summary */}
                              {tier.unit_price > 0 && (
                                <div className="mt-4 p-3 bg-background rounded-lg border">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Calculator className="h-4 w-4" />
                                    <span className="font-medium">
                                      Price Summary for All Sizes
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Quantity Range:
                                      </span>
                                      <br />
                                      <span className="font-medium">
                                        {tier.min_quantity} -{" "}
                                        {tier.max_quantity === 999999
                                          ? "∞"
                                          : tier.max_quantity}{" "}
                                        units
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Unit Price:
                                      </span>
                                      <br />
                                      <span className="font-medium">
                                        {tier.unit_price.toFixed(2)} Tk
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Applies to Sizes:
                                      </span>
                                      <br />
                                      <span className="font-medium text-blue-600">
                                        {allSizeNames}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
            </div>

            {/* Variant Quantities */}
            <div className="space-y-6">
              {/* Color-based Quantity Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">
                      Color-based Quantities
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select colors to set inventory quantities. All sizes under
                      a color can share the same quantity values:
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground space-y-1">
                      <div>
                        • <strong>Available Quantity:</strong> Current stock for
                        all sizes
                      </div>
                      <div>
                        • <strong>Minimum Threshold:</strong> Low stock alert
                        level
                      </div>
                      <div>
                        • <strong>Maximum Capacity:</strong> Warehouse capacity
                        limit
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color-based Quantity Grid for Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {colors.map((productColor) => (
                    <Card
                      key={`quantity-color-${productColor.color.id}`}
                      className={`transition-colors ${
                        isSubmitting
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      } ${
                        colorHasQuantities(productColor.color.id)
                          ? "bg-green-50 border-green-500"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => {
                        if (!isSubmitting) {
                          addVariantQuantity(productColor.color.id);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span
                              className="w-6 h-6 rounded-full border-2"
                              style={{
                                backgroundColor:
                                  productColor.color.hexCode || "#ccc",
                              }}
                            />
                          </div>
                          <div className="text-center">
                            <span className="font-medium">
                              {productColor.color.name}
                            </span>
                            <div className="text-xs text-muted-foreground mt-1">
                              All sizes:{" "}
                              {sizes.map((s) => s.size.value).join(", ")}
                            </div>
                          </div>
                          {colorHasQuantities(productColor.color.id) && (
                            <Badge className="mt-2" variant="secondary">
                              Quantities Set ({sizes.length} sizes)
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Color-based Quantity Configuration */}
              {colors
                .filter((color) => colorHasQuantities(color.color.id))
                .map((productColor) => {
                  // Get the first variant of this color to represent the shared quantities
                  const firstQuantity = watchedVariantQuantities?.find(
                    (v) => v.colorId === productColor.color.id
                  );
                  if (!firstQuantity) return null;

                  const colorQuantities =
                    watchedVariantQuantities?.filter(
                      (v) => v.colorId === productColor.color.id
                    ) || [];
                  const allSizeNames = colorQuantities
                    .map((v) => getSizeName(v.sizeId))
                    .join(", ");
                  const firstQuantityIndex =
                    watchedVariantQuantities?.findIndex(
                      (v) =>
                        v.colorId === productColor.color.id &&
                        v.sizeId === firstQuantity.sizeId
                    ) || 0;

                  return (
                    <Card
                      key={`color-quantity-${productColor.color.id}`}
                      className="p-4 bg-green-50/30"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <h4 className="font-medium text-lg">
                            {getColorName(productColor.color.id)} - All Sizes
                          </h4>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-6 h-6 rounded-full border-2"
                              style={{
                                backgroundColor:
                                  productColor.color.hexCode || "#ccc",
                              }}
                            />
                            <Badge variant="outline">
                              Sizes: {allSizeNames}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() =>
                            removeColorQuantities(productColor.color.id)
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Color
                        </Button>
                      </div>

                      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700">
                          <strong>Shared Quantities:</strong> These quantity
                          settings can be applied to all{" "}
                          {colorQuantities.length} size combinations of{" "}
                          {getColorName(productColor.color.id)}. You can set the
                          same values for all sizes or customize individually.
                        </p>
                      </div>

                      {/* Shared Quantity Settings */}
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4 bg-muted/50">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-lg">
                              Inventory Settings for All Sizes
                            </h5>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <FormField
                              control={form.control}
                              name={
                                `variantQuantities.${firstQuantityIndex}.available_quantity` as any
                              }
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Available Quantity</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      placeholder="100"
                                      disabled={isSubmitting}
                                      value={field.value || ""}
                                      onChange={(e) => {
                                        const value =
                                          parseInt(e.target.value) || 0;
                                        field.onChange(value);
                                        // Mark form as dirty when user enters meaningful quantity
                                        if (value > 0) {
                                          form.setValue(field.name, value, {
                                            shouldDirty: true,
                                          });
                                        }
                                        // Update all sizes of this color
                                        updateColorQuantities(
                                          productColor.color.id,
                                          "available_quantity",
                                          value
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Current stock available for all sizes
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={
                                `variantQuantities.${firstQuantityIndex}.minimum_threshold` as any
                              }
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Minimum Threshold</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      placeholder="10"
                                      disabled={isSubmitting}
                                      value={field.value || ""}
                                      onChange={(e) => {
                                        const value =
                                          parseInt(e.target.value) || 0;
                                        field.onChange(value);
                                        // Mark form as dirty when user enters meaningful threshold
                                        if (value >= 0) {
                                          form.setValue(field.name, value, {
                                            shouldDirty: true,
                                          });
                                        }
                                        // Update all sizes of this color
                                        updateColorQuantities(
                                          productColor.color.id,
                                          "minimum_threshold",
                                          value
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Alert when stock falls below this level
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={
                                `variantQuantities.${firstQuantityIndex}.maximum_capacity` as any
                              }
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Maximum Capacity</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      placeholder="500"
                                      disabled={isSubmitting}
                                      value={field.value || ""}
                                      onChange={(e) => {
                                        const value =
                                          parseInt(e.target.value) || 1;
                                        field.onChange(value);
                                        // Mark form as dirty when user enters meaningful capacity
                                        if (value > 0) {
                                          form.setValue(field.name, value, {
                                            shouldDirty: true,
                                          });
                                        }
                                        // Update all sizes of this color
                                        updateColorQuantities(
                                          productColor.color.id,
                                          "maximum_capacity",
                                          value
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Maximum stock capacity for all sizes
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Apply to All Sizes Button */}
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isSubmitting}
                              onClick={() => {
                                const values = form.getValues(
                                  `variantQuantities.${firstQuantityIndex}` as any
                                );
                                updateColorQuantities(
                                  productColor.color.id,
                                  "available_quantity",
                                  values.available_quantity
                                );
                                updateColorQuantities(
                                  productColor.color.id,
                                  "minimum_threshold",
                                  values.minimum_threshold
                                );
                                updateColorQuantities(
                                  productColor.color.id,
                                  "maximum_capacity",
                                  values.maximum_capacity
                                );
                              }}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Apply to All {colorQuantities.length} Sizes
                            </Button>
                          </div>

                          {/* Quantity Summary */}
                          <div className="mt-4 p-3 bg-background rounded-lg border">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="h-4 w-4" />
                              <span className="font-medium">
                                Stock Summary for All Sizes
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Available:
                                </span>
                                <br />
                                <span className="font-medium text-green-600">
                                  {firstQuantity.available_quantity} units each
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Low Stock Alert:
                                </span>
                                <br />
                                <span className="font-medium text-orange-600">
                                  {firstQuantity.minimum_threshold} units each
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Max Capacity:
                                </span>
                                <br />
                                <span className="font-medium text-blue-600">
                                  {firstQuantity.maximum_capacity} units each
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Applies to sizes: {allSizeNames}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPrevious}>
                Previous: Colors
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Package className="h-4 w-4 mr-2 animate-spin" />
                    {form.formState.isDirty && hasMeaningfulData
                      ? "Saving Pricing & Quantities..."
                      : "Processing..."}
                  </>
                ) : (
                  `${
                    form.formState.isDirty && hasMeaningfulData ? "Save & " : ""
                  }Next: Upload Images`
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
