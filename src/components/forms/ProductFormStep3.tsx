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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, FolderTree, Tag } from "lucide-react";
import {
  createProductStep3Schema,
  CreateProductStep3FormData,
  categorySchema,
} from "@/types/validation";
import type { Category } from "@/types/product";

interface ProductFormStep3Props {
  initialData?: CreateProductStep3FormData;
  onComplete: (data: CreateProductStep3FormData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Mock categories data - in real app, this would come from an API
const mockCategories: Category[] = [
  {
    id: 1,
    name: "Electronics",
    parentId: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Smartphones",
    parentId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "Laptops",
    parentId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: "Clothing",
    parentId: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    name: "Men's Clothing",
    parentId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    name: "Women's Clothing",
    parentId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7,
    name: "Home & Garden",
    parentId: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function ProductFormStep3({
  initialData,
  onComplete,
  onNext,
  onPrevious,
}: ProductFormStep3Props) {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateProductStep3FormData>({
    resolver: zodResolver(createProductStep3Schema),
    defaultValues: {
      selectedCategories: initialData?.selectedCategories || [],
      newCategory: undefined,
    },
  });

  const newCategoryForm = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      parentId: undefined,
    },
  });

  // Group categories by hierarchy
  const rootCategories = categories.filter((cat) => !cat.parentId);
  const getSubCategories = (parentId: number) =>
    categories.filter((cat) => cat.parentId === parentId);

  const getCategoryPath = (category: Category): string => {
    if (!category.parentId) return category.name;
    const parent = categories.find((cat) => cat.id === category.parentId);
    return parent
      ? `${getCategoryPath(parent)} > ${category.name}`
      : category.name;
  };

  const handleCreateCategory = async (data: {
    name: string;
    parentId?: number;
  }) => {
    setIsLoading(true);
    try {
      // In real app, this would be an API call
      const newCategory: Category = {
        id: Math.max(...categories.map((c) => c.id)) + 1,
        name: data.name,
        parentId: data.parentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setCategories((prev) => [...prev, newCategory]);
      setIsCreateDialogOpen(false);
      newCategoryForm.reset();

      // Auto-select the new category
      const currentSelected = form.getValues("selectedCategories");
      form.setValue("selectedCategories", [...currentSelected, newCategory.id]);
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: number, checked: boolean) => {
    const currentSelected = form.getValues("selectedCategories");
    if (checked) {
      form.setValue("selectedCategories", [...currentSelected, categoryId]);
    } else {
      form.setValue(
        "selectedCategories",
        currentSelected.filter((id) => id !== categoryId)
      );
    }
  };

  const onSubmit = (data: CreateProductStep3FormData) => {
    onComplete(data);
    onNext();
  };

  const selectedCategories = form.watch("selectedCategories");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderTree className="h-5 w-5" />
          Category Selection
        </CardTitle>
        <CardDescription>
          Choose categories for your product. You can select multiple categories
          and create new ones if needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Create New Category Dialog */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Available Categories</h3>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                      Add a new category to organize your products. You can
                      create top-level categories or subcategories.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...newCategoryForm}>
                    <form className="space-y-4">
                      <FormField
                        control={newCategoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter category name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={newCategoryForm.control}
                        name="parentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent Category (Optional)</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(
                                  value ? parseInt(value) : undefined
                                )
                              }
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select parent category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">
                                  No Parent (Top Level)
                                </SelectItem>
                                {categories.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id.toString()}
                                  >
                                    {getCategoryPath(category)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Leave empty to create a top-level category
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={newCategoryForm.handleSubmit(
                        handleCreateCategory
                      )}
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Create Category"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Category Selection */}
            <FormField
              control={form.control}
              name="selectedCategories"
              render={() => (
                <FormItem>
                  <FormLabel>Select Categories</FormLabel>
                  <FormDescription>
                    Choose one or more categories that best describe your
                    product
                  </FormDescription>

                  {categories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">
                        No categories available
                      </p>
                      <p className="mb-4">
                        Create your first category to get started
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Category
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Root Categories */}
                      {rootCategories.map((rootCategory) => (
                        <div key={rootCategory.id} className="space-y-2">
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <Checkbox
                              id={`category-${rootCategory.id}`}
                              checked={selectedCategories.includes(
                                rootCategory.id
                              )}
                              onCheckedChange={(checked) =>
                                handleCategoryToggle(
                                  rootCategory.id,
                                  checked as boolean
                                )
                              }
                            />
                            <label
                              htmlFor={`category-${rootCategory.id}`}
                              className="font-medium flex-1 cursor-pointer"
                            >
                              {rootCategory.name}
                            </label>
                          </div>

                          {/* Subcategories */}
                          {getSubCategories(rootCategory.id).map(
                            (subCategory) => (
                              <div
                                key={subCategory.id}
                                className="ml-6 flex items-center space-x-2 p-2 border rounded-md bg-muted/50"
                              >
                                <Checkbox
                                  id={`category-${subCategory.id}`}
                                  checked={selectedCategories.includes(
                                    subCategory.id
                                  )}
                                  onCheckedChange={(checked) =>
                                    handleCategoryToggle(
                                      subCategory.id,
                                      checked as boolean
                                    )
                                  }
                                />
                                <label
                                  htmlFor={`category-${subCategory.id}`}
                                  className="text-sm flex-1 cursor-pointer"
                                >
                                  {subCategory.name}
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Categories Preview */}
            {selectedCategories.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Selected Categories:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((categoryId) => {
                    const category = categories.find(
                      (cat) => cat.id === categoryId
                    );
                    return category ? (
                      <Badge key={categoryId} variant="secondary">
                        {getCategoryPath(category)}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPrevious}>
                Previous: Sizes
              </Button>
              <Button type="submit" disabled={selectedCategories.length === 0}>
                Next: Select Colors
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
