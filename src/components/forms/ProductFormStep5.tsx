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
import { Plus, Trash2, DollarSign, Package, Calculator } from "lucide-react";
import {
  createProductStep5Schema,
  CreateProductStep5FormData,
} from "@/types/validation";

interface ProductFormStep5Props {
  initialData?: CreateProductStep5FormData;
  onComplete: (data: CreateProductStep5FormData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface PricingTier {
  min_quantity: number;
  max_quantity: number;
  unit_price: number;
  discount_percentage?: number;
}

export function ProductFormStep5({
  initialData,
  onComplete,
  onNext,
  onPrevious,
}: ProductFormStep5Props) {
  const form = useForm<CreateProductStep5FormData>({
    resolver: zodResolver(createProductStep5Schema),
    defaultValues: {
      pricing: initialData?.pricing || [
        {
          min_quantity: 1,
          max_quantity: 2,
          unit_price: 0,
          discount_percentage: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pricing",
  });

  const watchedPricing = form.watch("pricing");

  // Calculate total price for each tier
  const calculateTierPrice = (tier: PricingTier, quantity: number): number => {
    const basePrice = tier.unit_price * quantity;
    const discount = tier.discount_percentage || 0;
    return basePrice * (1 - discount / 100);
  };

  // Get the next suggested min quantity
  const getNextMinQuantity = (): number => {
    if (watchedPricing.length === 0) return 1;
    const lastTier = watchedPricing[watchedPricing.length - 1];
    return (lastTier.max_quantity || 0) + 1;
  };

  // Add new pricing tier
  const addPricingTier = () => {
    const nextMin = getNextMinQuantity();
    append({
      min_quantity: nextMin,
      max_quantity: nextMin + 4, // Default 5-unit range
      unit_price: 0,
      discount_percentage: 0,
    });
  };

  // Validate quantity ranges don't overlap
  const validateQuantityRanges = (): boolean => {
    const sortedTiers = [...watchedPricing].sort(
      (a, b) => a.min_quantity - b.min_quantity
    );

    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const current = sortedTiers[i];
      const next = sortedTiers[i + 1];

      if (current.max_quantity >= next.min_quantity) {
        return false;
      }
    }
    return true;
  };

  // Get pricing tier for a specific quantity
  const getPricingForQuantity = (quantity: number) => {
    return watchedPricing.find(
      (tier) => quantity >= tier.min_quantity && quantity <= tier.max_quantity
    );
  };

  const handleFormSubmit = (data: CreateProductStep5FormData) => {
    if (!validateQuantityRanges()) {
      form.setError("pricing", {
        type: "manual",
        message:
          "Quantity ranges cannot overlap. Please adjust your pricing tiers.",
      });
      return;
    }

    onComplete(data);
    onNext();
  };

  // Calculate savings for bulk purchases
  const calculateSavings = (tier: PricingTier): string => {
    if (!tier.discount_percentage || tier.discount_percentage === 0)
      return "No discount";
    return `${tier.discount_percentage}% off (Save $${(
      (tier.unit_price * tier.discount_percentage) /
      100
    ).toFixed(2)} per unit)`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pricing Configuration
        </CardTitle>
        <CardDescription>
          Set quantity-based pricing tiers. Create different price points for
          different purchase quantities to encourage bulk orders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            {/* Pricing Tiers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Pricing Tiers</h3>
                  <p className="text-sm text-muted-foreground">
                    Define quantity ranges and their corresponding prices
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPricingTier}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tier
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No pricing tiers</p>
                  <p className="mb-4">
                    Add your first pricing tier to get started
                  </p>
                  <Button onClick={addPricingTier}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Tier
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Tier {index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name={`pricing.${index}.min_quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Min Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="1"
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
                          name={`pricing.${index}.max_quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="2"
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
                          name={`pricing.${index}.unit_price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Price ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
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
                          name={`pricing.${index}.discount_percentage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="0"
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
                      {watchedPricing[index] &&
                        watchedPricing[index].unit_price > 0 && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Calculator className="h-4 w-4" />
                              <span className="font-medium">Tier Summary</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Quantity Range:
                                </span>
                                <br />
                                <span className="font-medium">
                                  {watchedPricing[index].min_quantity} -{" "}
                                  {watchedPricing[index].max_quantity} units
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Unit Price:
                                </span>
                                <br />
                                <span className="font-medium">
                                  ${watchedPricing[index].unit_price.toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Savings:
                                </span>
                                <br />
                                <span className="font-medium text-green-600">
                                  {calculateSavings(watchedPricing[index])}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                    </Card>
                  ))}
                </div>
              )}

              <FormMessage>
                {form.formState.errors.pricing?.message}
              </FormMessage>
            </div>

            {/* Pricing Preview Table */}
            {watchedPricing.length > 0 &&
              watchedPricing.some((tier) => tier.unit_price > 0) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pricing Preview</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quantity Range</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Example (Min Qty)</TableHead>
                        <TableHead>Example (Max Qty)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {watchedPricing
                        .filter((tier) => tier.unit_price > 0)
                        .sort((a, b) => a.min_quantity - b.min_quantity)
                        .map((tier, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {tier.min_quantity} - {tier.max_quantity} units
                            </TableCell>
                            <TableCell>${tier.unit_price.toFixed(2)}</TableCell>
                            <TableCell>
                              {tier.discount_percentage ? (
                                <Badge variant="secondary">
                                  {tier.discount_percentage}% off
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">
                                  No discount
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>
                                  {tier.min_quantity} × $
                                  {tier.unit_price.toFixed(2)} ={" "}
                                </div>
                                <div className="font-medium">
                                  $
                                  {calculateTierPrice(
                                    tier,
                                    tier.min_quantity
                                  ).toFixed(2)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>
                                  {tier.max_quantity} × $
                                  {tier.unit_price.toFixed(2)} ={" "}
                                </div>
                                <div className="font-medium">
                                  $
                                  {calculateTierPrice(
                                    tier,
                                    tier.max_quantity
                                  ).toFixed(2)}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPrevious}>
                Previous: Colors
              </Button>
              <Button
                type="submit"
                disabled={
                  fields.length === 0 ||
                  !watchedPricing.some((tier) => tier.unit_price > 0)
                }
              >
                Next: Upload Images
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
