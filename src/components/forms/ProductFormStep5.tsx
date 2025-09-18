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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Trash2,
  DollarSign,
  Package,
  Calculator,
  Palette,
  Ruler,
} from "lucide-react";
import {
  createProductStep5Schema,
  CreateProductStep5FormData,
} from "@/types/validation";
import { colorsApi, Color, ProductColor } from "@/lib/api/colors";
import { sizesApi, SizeResponse, ProductSize } from "@/lib/api/sizes";
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

interface VariantPricing {
  colorId: number;
  sizeId: number;
  pricingTiers: PricingTier[];
}

interface VariantQuantity {
  colorId: number;
  sizeId: number;
  available_quantity: number;
  minimum_threshold: number;
  maximum_capacity: number;
}

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

  // Check if form has been modified
  const isDirty =
    form.formState.isDirty ||
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

  // Check if a variant combination already exists
  const variantExists = (colorId: number, sizeId: number): boolean => {
    return (
      watchedVariantPricing?.some(
        (v) => v.colorId === colorId && v.sizeId === sizeId
      ) || false
    );
  };

  // Check if a variant quantity combination already exists
  const variantQuantityExists = (colorId: number, sizeId: number): boolean => {
    return (
      watchedVariantQuantities?.some(
        (v) => v.colorId === colorId && v.sizeId === sizeId
      ) || false
    );
  };

  // Add new variant pricing
  const addVariantPricing = (colorId: number, sizeId: number) => {
    if (!variantExists(colorId, sizeId)) {
      appendVariantPricing({
        colorId,
        sizeId,
        pricingTiers: [
          {
            min_quantity: 1,
            max_quantity: 2,
            unit_price: 0,
            discount_percentage: 0,
          },
        ],
      });
    }
  };

  // Add new variant quantity
  const addVariantQuantity = (colorId: number, sizeId: number) => {
    if (!variantQuantityExists(colorId, sizeId)) {
      appendVariantQuantity({
        colorId,
        sizeId,
        available_quantity: 0,
        minimum_threshold: 0,
        maximum_capacity: 0,
      });
    }
  };

  // Add pricing tier to a specific variant
  const addPricingTierToVariant = (variantIndex: number) => {
    const currentVariant = watchedVariantPricing?.[variantIndex];
    if (!currentVariant) return;

    const lastTier =
      currentVariant.pricingTiers[currentVariant.pricingTiers.length - 1];
    const nextMin = (lastTier?.max_quantity || 0) + 1;

    const currentVariantPricing =
      form.getValues(`variantPricing.${variantIndex}.pricingTiers`) || [];
    form.setValue(`variantPricing.${variantIndex}.pricingTiers`, [
      ...currentVariantPricing,
      {
        min_quantity: nextMin,
        max_quantity: nextMin + 4,
        unit_price: 0,
        discount_percentage: 0,
      },
    ]);
  };

  // Remove pricing tier from a specific variant
  const removePricingTierFromVariant = (
    variantIndex: number,
    tierIndex: number
  ) => {
    const currentTiers =
      form.getValues(`variantPricing.${variantIndex}.pricingTiers`) || [];
    if (currentTiers.length > 1) {
      const newTiers = currentTiers.filter((_, index) => index !== tierIndex);
      form.setValue(`variantPricing.${variantIndex}.pricingTiers`, newTiers);
    }
  };

  // Calculate total price for each tier
  const calculateTierPrice = (tier: PricingTier, quantity: number): number => {
    const basePrice = tier.unit_price * quantity;
    const discount = tier.discount_percentage || 0;
    return basePrice * (1 - discount / 100);
  };

  const handleFormSubmit = async (data: CreateProductStep5FormData) => {
    try {
      setIsSubmitting(true);

      // Transform and submit pricing data if available
      if (data.variantPricing && data.variantPricing.length > 0) {
        const bulkCreateDto: BulkCreatePricingRulesDto = {
          variantPricingRules: data.variantPricing.map((variant) => ({
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

        await pricingApi.bulkCreatePricingRules(productId, bulkCreateDto);
        console.log("Pricing rules created successfully");
      }

      // Transform and submit quantity data if available
      if (data.variantQuantities && data.variantQuantities.length > 0) {
        const bulkQuantitiesDto: BulkCreateProductQuantitiesDto = {
          variantQuantities: data.variantQuantities.map((variant) => ({
            colorId: variant.colorId,
            sizeId: variant.sizeId,
            available_quantity: variant.available_quantity,
            minimum_threshold: variant.minimum_threshold,
            maximum_capacity: variant.maximum_capacity,
          })),
        };

        await productQuantitiesApi.bulkCreateProductQuantities(
          productId,
          bulkQuantitiesDto
        );
        console.log("Product quantities created successfully");
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
                    <h3 className="text-lg font-medium">
                      Variant Combinations
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select color + size combinations to set pricing for
                    </p>
                  </div>
                </div>

                {/* Variant Grid for Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {colors.map((productColor) =>
                    sizes.map((productSize) => (
                      <Card
                        key={`${productColor.color.id}-${productSize.size.id}`}
                        className={`transition-colors ${
                          isSubmitting
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        } ${
                          variantExists(
                            productColor.color.id,
                            productSize.size.id
                          )
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => {
                          if (!isSubmitting) {
                            addVariantPricing(
                              productColor.color.id,
                              productSize.size.id
                            );
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Palette className="h-4 w-4" />
                              <span
                                className="w-4 h-4 rounded-full border"
                                style={{
                                  backgroundColor:
                                    productColor.color.hexCode || "#ccc",
                                }}
                              />
                              <span className="font-medium">
                                {productColor.color.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Ruler className="h-4 w-4" />
                              <span>{productSize.size.value}</span>
                            </div>
                          </div>
                          {variantExists(
                            productColor.color.id,
                            productSize.size.id
                          ) && (
                            <Badge className="mt-2" variant="secondary">
                              Pricing Set
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Variant Pricing Configuration */}
              {variantPricingFields.map((variantField, variantIndex) => {
                const variant = watchedVariantPricing?.[variantIndex];
                if (!variant) return null;

                return (
                  <Card key={variantField.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <h4 className="font-medium text-lg">
                          {getColorName(variant.colorId)} -{" "}
                          {getSizeName(variant.sizeId)}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border"
                            style={{
                              backgroundColor:
                                colors.find(
                                  (c) => c.color.id === variant.colorId
                                )?.color.hexCode || "#ccc",
                            }}
                          />
                          <Badge variant="outline">
                            {getSizeName(variant.sizeId)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => addPricingTierToVariant(variantIndex)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Tier
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => removeVariantPricing(variantIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Pricing Tiers for this variant */}
                    <div className="space-y-4">
                      {variant.pricingTiers?.map((tier, tierIndex) => (
                        <div
                          key={tierIndex}
                          className="border rounded-lg p-4 bg-muted/50"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium">
                              Tier {tierIndex + 1}
                            </h5>
                            {variant.pricingTiers &&
                              variant.pricingTiers.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={isSubmitting}
                                  onClick={() =>
                                    removePricingTierFromVariant(
                                      variantIndex,
                                      tierIndex
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormField
                              control={form.control}
                              name={`variantPricing.${variantIndex}.pricingTiers.${tierIndex}.min_quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Min Quantity</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      placeholder="1"
                                      disabled={isSubmitting}
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseInt(e.target.value) || 1
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`variantPricing.${variantIndex}.pricingTiers.${tierIndex}.max_quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Max Quantity</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      placeholder="2"
                                      disabled={isSubmitting}
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseInt(e.target.value) || 1
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`variantPricing.${variantIndex}.pricingTiers.${tierIndex}.unit_price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Unit Price ($)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="0.00"
                                      disabled={isSubmitting}
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`variantPricing.${variantIndex}.pricingTiers.${tierIndex}.discount_percentage`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Discount (%)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      placeholder="0"
                                      disabled={isSubmitting}
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Optional bulk discount percentage
                                  </FormDescription>
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
                                  Price Summary
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    Range:
                                  </span>
                                  <br />
                                  <span className="font-medium">
                                    {tier.min_quantity} - {tier.max_quantity}{" "}
                                    units
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Unit Price:
                                  </span>
                                  <br />
                                  <span className="font-medium">
                                    ${tier.unit_price.toFixed(2)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Total (Max Qty):
                                  </span>
                                  <br />
                                  <span className="font-medium text-green-600">
                                    $
                                    {calculateTierPrice(
                                      tier,
                                      tier.max_quantity
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Variant Quantities */}
            <div className="space-y-6">
              {/* Quantity Variant Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Variant Quantities</h3>
                    <p className="text-sm text-muted-foreground">
                      Select color + size combinations to set quantity for
                    </p>
                  </div>
                </div>

                {/* Quantity Variant Grid for Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {colors.map((productColor) =>
                    sizes.map((productSize) => (
                      <Card
                        key={`quantity-${productColor.color.id}-${productSize.size.id}`}
                        className={`transition-colors ${
                          isSubmitting
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        } ${
                          variantQuantityExists(
                            productColor.color.id,
                            productSize.size.id
                          )
                            ? "bg-green-50 border-green-500"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => {
                          if (!isSubmitting) {
                            addVariantQuantity(
                              productColor.color.id,
                              productSize.size.id
                            );
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Palette className="h-4 w-4" />
                              <span
                                className="w-4 h-4 rounded-full border"
                                style={{
                                  backgroundColor:
                                    productColor.color.hexCode || "#ccc",
                                }}
                              />
                              <span className="font-medium">
                                {productColor.color.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Ruler className="h-4 w-4" />
                              <span>{productSize.size.value}</span>
                            </div>
                          </div>
                          {variantQuantityExists(
                            productColor.color.id,
                            productSize.size.id
                          ) && (
                            <Badge className="mt-2" variant="secondary">
                              Quantity Set
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Variant Quantity Configuration */}
              {variantQuantityFields.map((quantityField, quantityIndex) => {
                const quantity = watchedVariantQuantities?.[quantityIndex];
                if (!quantity) return null;

                return (
                  <Card key={quantityField.id} className="p-4 bg-green-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <h4 className="font-medium text-lg">
                          {getColorName(quantity.colorId)} -{" "}
                          {getSizeName(quantity.sizeId)}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border"
                            style={{
                              backgroundColor:
                                colors.find(
                                  (c) => c.color.id === quantity.colorId
                                )?.color.hexCode || "#ccc",
                            }}
                          />
                          <Badge variant="outline">
                            {getSizeName(quantity.sizeId)}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => removeVariantQuantity(quantityIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quantity Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`variantQuantities.${quantityIndex}.available_quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="100"
                                disabled={isSubmitting}
                                {...field}
                                value={field.value || ""}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Current stock available for this variant
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`variantQuantities.${quantityIndex}.minimum_threshold`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Threshold</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="10"
                                disabled={isSubmitting}
                                {...field}
                                value={field.value || ""}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
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
                        name={`variantQuantities.${quantityIndex}.maximum_capacity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Capacity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="500"
                                disabled={isSubmitting}
                                {...field}
                                value={field.value || ""}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 1)
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum stock capacity for this variant
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Quantity Summary */}
                    <div className="mt-4 p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4" />
                        <span className="font-medium">Stock Summary</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Available:
                          </span>
                          <br />
                          <span className="font-medium text-green-600">
                            {quantity.available_quantity} units
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Low Stock Alert:
                          </span>
                          <br />
                          <span className="font-medium text-orange-600">
                            {quantity.minimum_threshold} units
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Max Capacity:
                          </span>
                          <br />
                          <span className="font-medium text-blue-600">
                            {quantity.maximum_capacity} units
                          </span>
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
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !isDirty ||
                  ((!watchedVariantPricing?.length ||
                    !watchedVariantPricing.some((v) =>
                      v.pricingTiers?.some((t) => t.unit_price > 0)
                    )) &&
                    (!watchedVariantQuantities?.length ||
                      !watchedVariantQuantities.some(
                        (v) =>
                          v.available_quantity > 0 ||
                          v.minimum_threshold >= 0 ||
                          v.maximum_capacity > 0
                      )))
                }
              >
                {isSubmitting ? (
                  <>
                    <Package className="h-4 w-4 mr-2 animate-spin" />
                    Saving Pricing & Quantities...
                  </>
                ) : (
                  "Next: Upload Images"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
