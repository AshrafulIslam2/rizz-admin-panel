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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Palette, Circle } from "lucide-react";
import {
  createProductStep4Schema,
  CreateProductStep4FormData,
  colorSchema,
} from "@/types/validation";
import type { Color } from "@/types/product";

interface ProductFormStep4Props {
  initialData?: CreateProductStep4FormData;
  onComplete: (data: CreateProductStep4FormData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Mock colors data - in real app, this would come from an API
const mockColors: Color[] = [
  {
    id: 1,
    name: "Red",
    hexCode: "#FF0000",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Blue",
    hexCode: "#0000FF",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "Green",
    hexCode: "#00FF00",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: "Black",
    hexCode: "#000000",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    name: "White",
    hexCode: "#FFFFFF",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    name: "Yellow",
    hexCode: "#FFFF00",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7,
    name: "Purple",
    hexCode: "#800080",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 8,
    name: "Orange",
    hexCode: "#FFA500",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 9,
    name: "Pink",
    hexCode: "#FFC0CB",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 10,
    name: "Gray",
    hexCode: "#808080",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 11,
    name: "Brown",
    hexCode: "#A52A2A",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 12,
    name: "Navy",
    hexCode: "#000080",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Predefined color suggestions for quick creation
const colorSuggestions = [
  { name: "Crimson", hexCode: "#DC143C" },
  { name: "Emerald", hexCode: "#50C878" },
  { name: "Royal Blue", hexCode: "#4169E1" },
  { name: "Gold", hexCode: "#FFD700" },
  { name: "Silver", hexCode: "#C0C0C0" },
  { name: "Rose Gold", hexCode: "#E8B4B8" },
  { name: "Mint", hexCode: "#98FB98" },
  { name: "Coral", hexCode: "#FF7F50" },
];

export function ProductFormStep4({
  initialData,
  onComplete,
  onNext,
  onPrevious,
}: ProductFormStep4Props) {
  const [colors, setColors] = useState<Color[]>(mockColors);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHexCode, setSelectedHexCode] = useState("#FF0000");

  const form = useForm<CreateProductStep4FormData>({
    resolver: zodResolver(createProductStep4Schema),
    defaultValues: {
      selectedColors: initialData?.selectedColors || [],
      newColor: undefined,
    },
  });

  const newColorForm = useForm({
    resolver: zodResolver(colorSchema),
    defaultValues: {
      name: "",
      hexCode: "",
    },
  });

  const getContrastColor = (hexCode?: string): string => {
    if (!hexCode) return "#000000";
    const hex = hexCode.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  const handleCreateColor = async (data: {
    name: string;
    hexCode?: string;
  }) => {
    setIsLoading(true);
    try {
      // In real app, this would be an API call
      const newColor: Color = {
        id: Math.max(...colors.map((c) => c.id)) + 1,
        name: data.name,
        hexCode: data.hexCode || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setColors((prev) => [...prev, newColor]);
      setIsCreateDialogOpen(false);
      newColorForm.reset();

      // Auto-select the new color
      const currentSelected = form.getValues("selectedColors");
      form.setValue("selectedColors", [...currentSelected, newColor.id]);
    } catch (error) {
      console.error("Failed to create color:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorToggle = (colorId: number, checked: boolean) => {
    const currentSelected = form.getValues("selectedColors");
    if (checked) {
      form.setValue("selectedColors", [...currentSelected, colorId]);
    } else {
      form.setValue(
        "selectedColors",
        currentSelected.filter((id) => id !== colorId)
      );
    }
  };

  const handleQuickColorSelect = (suggestion: {
    name: string;
    hexCode: string;
  }) => {
    newColorForm.setValue("name", suggestion.name);
    newColorForm.setValue("hexCode", suggestion.hexCode);
    setSelectedHexCode(suggestion.hexCode);
  };

  const onSubmit = (data: CreateProductStep4FormData) => {
    onComplete(data);
    onNext();
  };

  const selectedColors = form.watch("selectedColors");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Color Selection
        </CardTitle>
        <CardDescription>
          Choose colors for your product. You can select multiple colors and
          create new ones with custom hex codes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Create New Color Dialog */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Available Colors</h3>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Color
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Color</DialogTitle>
                    <DialogDescription>
                      Add a new color with an optional hex code for precise
                      color matching.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...newColorForm}>
                    <form className="space-y-4">
                      <FormField
                        control={newColorForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter color name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={newColorForm.control}
                        name="hexCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hex Code (Optional)</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input
                                  placeholder="#FF0000"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    setSelectedHexCode(
                                      e.target.value || "#FF0000"
                                    );
                                  }}
                                />
                              </FormControl>
                              <div
                                className="w-10 h-10 rounded border-2 border-gray-300 flex-shrink-0"
                                style={{
                                  backgroundColor:
                                    field.value || selectedHexCode,
                                }}
                              />
                            </div>
                            <FormDescription>
                              Provide a hex code for accurate color
                              representation
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Quick Color Suggestions */}
                      <div className="space-y-2">
                        <FormLabel>Quick Suggestions</FormLabel>
                        <div className="grid grid-cols-4 gap-2">
                          {colorSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.name}
                              type="button"
                              onClick={() => handleQuickColorSelect(suggestion)}
                              className="p-2 rounded border text-xs text-center hover:bg-gray-50 transition-colors"
                              style={{
                                backgroundColor: suggestion.hexCode,
                                color: getContrastColor(suggestion.hexCode),
                              }}
                            >
                              {suggestion.name}
                            </button>
                          ))}
                        </div>
                      </div>
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
                      onClick={newColorForm.handleSubmit(handleCreateColor)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Create Color"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Color Selection */}
            <FormField
              control={form.control}
              name="selectedColors"
              render={() => (
                <FormItem>
                  <FormLabel>Select Colors</FormLabel>
                  <FormDescription>
                    Choose one or more colors for your product
                  </FormDescription>

                  {colors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">
                        No colors available
                      </p>
                      <p className="mb-4">
                        Create your first color to get started
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Color
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {colors.map((color) => (
                        <div
                          key={color.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Checkbox
                            id={`color-${color.id}`}
                            checked={selectedColors.includes(color.id)}
                            onCheckedChange={(checked) =>
                              handleColorToggle(color.id, checked as boolean)
                            }
                          />
                          <div className="flex items-center space-x-2 flex-1">
                            {color.hexCode ? (
                              <div
                                className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"
                                style={{ backgroundColor: color.hexCode }}
                              />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-400" />
                            )}
                            <label
                              htmlFor={`color-${color.id}`}
                              className="text-sm font-medium cursor-pointer flex-1"
                            >
                              {color.name}
                              {color.hexCode && (
                                <span className="block text-xs text-gray-500 font-mono">
                                  {color.hexCode}
                                </span>
                              )}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Colors Preview */}
            {selectedColors.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Selected Colors:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedColors.map((colorId) => {
                    const color = colors.find((c) => c.id === colorId);
                    return color ? (
                      <Badge
                        key={colorId}
                        variant="secondary"
                        className="flex items-center gap-2 px-3 py-1"
                      >
                        {color.hexCode ? (
                          <div
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.hexCode }}
                          />
                        ) : (
                          <Circle className="w-3 h-3" />
                        )}
                        {color.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPrevious}>
                Previous: Categories
              </Button>
              <Button type="submit" disabled={selectedColors.length === 0}>
                Next: Configure Pricing
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
