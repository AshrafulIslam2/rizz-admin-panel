import { z } from "zod"

export const createProductStep1Schema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    basePrice: z.number().positive("Base price must be positive"),
    discountedPrice: z.number().positive("Discounted price must be positive").optional(),
    sku: z.string().min(1, "SKU is required"),
    discountPercentage: z.number().min(0, "Discount percentage must be 0 or greater").max(100, "Discount percentage cannot exceed 100").optional(),
    material: z.string().optional(),
    dimensions: z.string().optional(),
    capacity: z.string().optional(),
    // stock: z.number().min(0, "Stock must be 0 or greater").optional(),
    // barcode: z.string().optional(),
    weight: z.string().optional(),
    published: z.boolean(),
})

export const sizeSchema = z.object({
    value: z.string().min(1, "Size value is required"),
    system: z.string().optional(),
})

export const selectedSizeWithQuantitySchema = z.object({
    sizeId: z.number(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
})

export const createProductStep2Schema = z.object({
    selectedSizes: z.array(z.number()).min(1, "At least one size must be selected"),
    sizeQuantities: z.array(selectedSizeWithQuantitySchema).min(1, "Quantities required for all selected sizes"),
    newSize: sizeSchema.optional(),
})

export const categorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
    parentId: z.number().optional().nullable(),
})

export const createProductStep3Schema = z.object({
    selectedCategories: z.array(z.number()).min(1, "At least one category must be selected"),
    newCategory: categorySchema.optional(),
})

export const colorSchema = z.object({
    name: z.string().min(1, "Color name is required"),
    hexCode: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color code").optional(),
})

export const createProductStep4Schema = z.object({
    selectedColors: z.array(z.number()).min(1, "At least one color must be selected"),
    newColor: colorSchema.optional(),
})

export const pricingSchema = z.object({
    min_quantity: z.number().min(1, "Minimum quantity must be at least 1"),
    max_quantity: z.number().min(1, "Maximum quantity must be at least 1"),
    unit_price: z.number().positive("Unit price must be positive"),
    discount_percentage: z.number().min(0, "Discount percentage must be 0 or greater").max(100, "Discount percentage cannot exceed 100").optional(),
}).refine((data) => data.max_quantity >= data.min_quantity, {
    message: "Maximum quantity must be greater than or equal to minimum quantity",
    path: ["max_quantity"],
})

export const variantPricingSchema = z.object({
    colorId: z.number().positive("Color is required"),
    sizeId: z.number().positive("Size is required"),
    pricingTiers: z.array(pricingSchema).min(1, "At least one pricing tier must be added"),
})

export const createProductStep5Schema = z.object({
    // Keep old pricing for backward compatibility or simple products
    pricing: z.array(pricingSchema).optional(),
    // New variant-based pricing
    variantPricing: z.array(variantPricingSchema).optional(),
}).refine((data) => {
    // At least one pricing method must be provided
    return (data.pricing && data.pricing.length > 0) || (data.variantPricing && data.variantPricing.length > 0);
}, {
    message: "Either simple pricing or variant pricing must be provided",
    path: ["pricing"],
})

export const imageSchema = z.object({
    url: z.string().url("Invalid image URL"),
    alt: z.string().optional(),
    isPrimary: z.boolean(),
})

export const createProductStep6Schema = z.object({
    images: z.array(imageSchema).min(1, "At least one product image is required"),
})

export const videoSchema = z.object({
    url: z.string().url("Invalid video URL"),
    title: z.string().min(1, "Video title is required"),
    isMain: z.boolean(),
})

export const createProductStep7Schema = z.object({
    mainVideo: videoSchema,
    cuttingVideo: videoSchema,
    stitchingVideo: videoSchema,
    assemblyVideo: videoSchema,
    finishingVideo: videoSchema,
})

export const featureSchema = z.object({
    title: z.string().min(1, "Feature title is required"),
    description: z.string().min(1, "Feature description is required"),
})

export const createProductStep8Schema = z.object({
    features: z.array(featureSchema).min(1, "At least one feature must be added"),
})

export const createProductStep9Schema = z.object({
    metaTitle: z.string().min(1, "Meta title is required").max(60, "Meta title should not exceed 60 characters"),
    metaDescription: z.string().min(1, "Meta description is required").max(160, "Meta description should not exceed 160 characters"),
    metaKeywords: z.string().optional(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    ogImage: z.string().url("Invalid OG image URL").optional(),
    canonicalUrl: z.string().url("Invalid canonical URL").optional(),
    robotsIndex: z.boolean(),
    robotsFollow: z.boolean(),
    priority: z.number().min(0).max(1).optional(),
    changefreq: z.enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]).optional(),
})

export const faqSchema = z.object({
    question: z.string().min(1, "Question is required"),
    answer: z.string().min(1, "Answer is required"),
})

export const createProductStep10Schema = z.object({
    faqs: z.array(faqSchema).min(1, "At least one FAQ must be added"),
})

export const completeProductFormSchema = z.object({
    step1: createProductStep1Schema,
    step2: createProductStep2Schema,
    step3: createProductStep3Schema,
    step4: createProductStep4Schema,
    step5: createProductStep5Schema,
    step6: createProductStep6Schema,
    step7: createProductStep7Schema,
    step8: createProductStep8Schema,
    step9: createProductStep9Schema,
    step10: createProductStep10Schema,
})

export type CreateProductStep1FormData = z.infer<typeof createProductStep1Schema>
export type CreateProductStep2FormData = z.infer<typeof createProductStep2Schema>
export type CreateProductStep3FormData = z.infer<typeof createProductStep3Schema>
export type CreateProductStep4FormData = z.infer<typeof createProductStep4Schema>
export type CreateProductStep5FormData = z.infer<typeof createProductStep5Schema>
export type CreateProductStep6FormData = z.infer<typeof createProductStep6Schema>
export type CreateProductStep7FormData = z.infer<typeof createProductStep7Schema>
export type CreateProductStep8FormData = z.infer<typeof createProductStep8Schema>
export type CreateProductStep9FormData = z.infer<typeof createProductStep9Schema>
export type CreateProductStep10FormData = z.infer<typeof createProductStep10Schema>
export type CompleteProductFormData = z.infer<typeof completeProductFormSchema>