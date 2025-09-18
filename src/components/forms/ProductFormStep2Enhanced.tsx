"use client";

import { useState, useEffect } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import {
  createProductStep2Schema,
  CreateProductStep2FormData,
} from "@/types/validation";
import { Size } from "@/types/product";
import { sizesApi, CreateSizeDto } from "@/lib/api/sizes";
import { productApi, BulkAddSizesToProductDto } from "@/lib/api/products";

// Mock data for existing sizes
const mockSizes: Size[] = [
  {
    id: 1,
    value: "XS",
    system: "US",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    value: "S",
    system: "US",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    value: "M",
    system: "US",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    value: "L",
    system: "US",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    value: "XL",
    system: "US",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    value: "XXL",
    system: "US",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7,
    value: "38",
    system: "EU",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 8,
    value: "40",
    system: "EU",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 9,
    value: "42",
    system: "EU",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 10,
    value: "44",
    system: "EU",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

interface ProductFormStep2Props {
  initialData?: CreateProductStep2FormData;
  productId: number;
  onComplete: (data: CreateProductStep2FormData, productId: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function ProductFormStep2Enhanced({
  initialData,
  productId,
  onComplete,
  onNext,
  onPrevious,
}: ProductFormStep2Props) {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>(
    initialData?.selectedSizes || []
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSize, setIsCreatingSize] = useState(false);

  const form = useForm<CreateProductStep2FormData>({
    resolver: zodResolver(createProductStep2Schema),
    defaultValues: {
      selectedSizes: initialData?.selectedSizes || [],
      newSize: initialData?.newSize,
    },
  });

  const newSizeForm = useForm<CreateSizeDto>({
    defaultValues: {
      value: "",
      system: "",
    },
  });

  // Load sizes from API on component mount
  useEffect(() => {
    const loadSizes = async () => {
      try {
        setIsLoading(true);
        const sizesData = await sizesApi.getAll();
        // Transform API response to match Size interface
        const transformedSizes: Size[] = sizesData.map((size) => ({
          id: size.id,
          value: size.value,
          system: size.system,
          createdAt: new Date(size.createdAt),
          updatedAt: new Date(size.updatedAt),
        }));
        setSizes(transformedSizes);
      } catch (error) {
        console.error("Error loading sizes:", error);
        alert(
          `Error loading sizes: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSizes();
  }, []);

  const handleSizeToggle = (sizeId: number) => {
    const updatedSizes = selectedSizes.includes(sizeId)
      ? selectedSizes.filter((id) => id !== sizeId)
      : [...selectedSizes, sizeId];

    setSelectedSizes(updatedSizes);
    form.setValue("selectedSizes", updatedSizes, { shouldDirty: true });
  };

  const handleCreateSize = async (data: CreateSizeDto) => {
    try {
      setIsCreatingSize(true);

      // Call API to create size
      const newSizeResponse = await sizesApi.create(data);

      // Transform response to Size interface
      const newSize: Size = {
        id: newSizeResponse.id,
        value: newSizeResponse.value,
        system: newSizeResponse.system,
        createdAt: new Date(newSizeResponse.createdAt),
        updatedAt: new Date(newSizeResponse.updatedAt),
      };

      // Add to local state
      setSizes((prev) => [...prev, newSize]);
      const updatedSelectedSizes = [...selectedSizes, newSize.id];
      setSelectedSizes(updatedSelectedSizes);
      form.setValue("selectedSizes", updatedSelectedSizes, {
        shouldDirty: true,
      });

      newSizeForm.reset();
      setIsCreateDialogOpen(false);

      console.log("Size created successfully:", newSizeResponse);
    } catch (error) {
      console.error("Error creating size:", error);
      alert(
        `Error creating size: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsCreatingSize(false);
    }
  };

  const removeSizeFromSelection = (sizeId: number) => {
    const updatedSizes = selectedSizes.filter((id) => id !== sizeId);
    setSelectedSizes(updatedSizes);
    form.setValue("selectedSizes", updatedSizes, { shouldDirty: true });
  };

  const onSubmit = async (data: CreateProductStep2FormData) => {
    try {
      setIsLoading(true);

      // Only make API calls if form is dirty (user has selected sizes) and sizes are selected
      if (form.formState.isDirty && selectedSizes.length > 0) {
        // Prepare the bulk add data (only size IDs, no quantities)
        const bulkAddData: BulkAddSizesToProductDto = {
          productId: productId,
          sizes: selectedSizes.map((sizeId) => ({
            sizeId: sizeId,
          })),
        };

        // Call the bulk-add API
        await productApi.bulkAddSizesToProduct(bulkAddData);

        console.log("Product sizes added successfully:", bulkAddData);
      }

      // Complete step and move to next
      onComplete(data, productId);
      onNext();
    } catch (error) {
      console.error("Error adding product sizes:", error);
      alert(
        `Error adding product sizes: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    // Allow proceeding if no sizes are selected (skip step) or if sizes are selected
    return true; // Always valid since we removed quantity requirements
  };

  const groupedSizes = sizes.reduce((acc, size) => {
    const system = size.system || "Other";
    if (!acc[system]) acc[system] = [];
    acc[system].push(size);
    return acc;
  }, {} as Record<string, Size[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Size Selection</CardTitle>
        <CardDescription>
          Choose available sizes for this product or create new ones
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p>Loading sizes...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Selected Sizes Display */}
              {selectedSizes.length > 0 && (
                <div className="space-y-2">
                  <FormLabel>Selected Sizes</FormLabel>
                  <div className="flex gap-2 flex-wrap">
                    {selectedSizes.map((sizeId) => {
                      const size = sizes.find((s) => s.id === sizeId);
                      if (!size) return null;
                      return (
                        <Badge
                          key={sizeId}
                          variant="default"
                          className="flex items-center gap-2"
                        >
                          {size.value} {size.system && `(${size.system})`}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeSizeFromSelection(sizeId)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Available Sizes</FormLabel>
                  <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Size
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Size</DialogTitle>
                        <DialogDescription>
                          Add a new size option for your products
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <FormLabel>Size Value *</FormLabel>
                            <Input
                              {...newSizeForm.register("value", {
                                required: true,
                              })}
                              placeholder="e.g., M, 42, 10.5"
                            />
                          </div>
                          <div>
                            <FormLabel>Size System</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                newSizeForm.setValue("system", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select system" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="US">US</SelectItem>
                                <SelectItem value="EU">EU</SelectItem>
                                <SelectItem value="UK">UK</SelectItem>
                                <SelectItem value="Generic">Generic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateDialogOpen(false)}
                            disabled={isCreatingSize}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            disabled={isCreatingSize}
                            onClick={() => {
                              const formData = newSizeForm.getValues();
                              if (formData.value) {
                                handleCreateSize(formData);
                              }
                            }}
                          >
                            {isCreatingSize ? "Creating..." : "Create Size"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Size Grid by System */}
                <div className="space-y-4">
                  {Object.keys(groupedSizes).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>
                        No sizes available. Create your first size to get
                        started.
                      </p>
                    </div>
                  ) : (
                    Object.entries(groupedSizes).map(
                      ([system, systemSizes]) => (
                        <div key={system} className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            {system} Sizes
                          </h4>
                          <div className="grid grid-cols-6 gap-2">
                            {systemSizes.map((size) => (
                              <div
                                key={size.id}
                                className={`
                              border rounded-md p-3 text-center cursor-pointer transition-colors
                              ${
                                selectedSizes.includes(size.id)
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted hover:border-muted-foreground"
                              }
                            `}
                                onClick={() => handleSizeToggle(size.id)}
                              >
                                <div className="text-sm font-medium">
                                  {size.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="selectedSizes"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onPrevious}>
                  Previous
                </Button>
                <Button type="submit" disabled={!isFormValid() || isLoading}>
                  {isLoading
                    ? form.formState.isDirty && selectedSizes.length > 0
                      ? "Adding Sizes..."
                      : "Processing..."
                    : `${
                        form.formState.isDirty && selectedSizes.length > 0
                          ? "Save & "
                          : ""
                      }Next: Select Categories`}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
