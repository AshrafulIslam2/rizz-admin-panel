// API utilities for products
import { CreateProductStep1FormData } from "@/types/validation";

export interface CreateProductDto {
    title: string;
    subtitle?: string;
    description?: string;
    basePrice: number;
    discountedPrice?: number;
    sku: string;
    discountPercentage?: number;
    material?: string;
    dimensions?: string;
    capacity?: string;
    stock?: number;
    weight?: string;
    published: boolean;
}

export interface ProductResponse {
    id: number;
    title: string;
    createdAt: string;
    // Add other fields as needed
}

export interface Product {
    id: number;
    title: string;
    subtitle?: string;
    description?: string;
    basePrice: number;
    discountedPrice?: number;
    isFeatured: boolean;
    isNewArrival: boolean;
    isOnSale: boolean;
    isExclusive: boolean;
    isLimitedEdition: boolean;
    isBestSeller: boolean;
    isTrending: boolean;
    isHot: boolean;
    isPublished: boolean;
    sku: string;
    discountPercentage?: number;
    material?: string;
    dimensions?: string;
    capacity?: string;
    barcode?: string;
    weight?: string;
    published: boolean;
    createdAt: string;
    updatedAt: string;
    // Relations can be included when needed
    product_colors?: any[];
    product_pricing?: any[];
    product_size?: any[];
    product_feature?: any[];
    product_categories?: any[];
    medias?: any[];
    product_tags?: any[];
}

export interface BulkAddSizesToProductDto {
    productId: number;
    sizes: {
        sizeId: number;
        // quantity?: number;
    }[];
}

export interface AddCategoryToProductDto {
    productId: number;
    categoryId: number;
}

export interface BulkAddCategoriesToProductDto {
    productId: number;
    selectedCategories: number[];
}

export interface BulkAddColorsToProductDto {
    productId: number;
    colors: ColorAssignmentDto[];
}

export interface ColorAssignmentDto {
    colorId: number;
    // Add other properties if needed (like quantity, etc.)
}

export interface ProductImageDto {
    product_id: number;
    image_url: string;
    alt: string;
}

export interface BulkAddProductImagesDto {
    images: ProductImageDto[];
}

export const productApi = {
    async findAll(): Promise<Product[]> {
        const response = await fetch('http://localhost:3008/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    async create(data: CreateProductDto): Promise<ProductResponse> {
        const response = await fetch('http://localhost:3008/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    async bulkAddSizesToProduct(data: BulkAddSizesToProductDto): Promise<void> {
        const response = await fetch('http://localhost:3008/product-sizes/bulk-add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    async addCategoryToProduct(data: AddCategoryToProductDto): Promise<any> {
        const response = await fetch('http://localhost:3008/product-categories/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    async bulkAddCategoriesToProduct(data: BulkAddCategoriesToProductDto): Promise<any> {
        const response = await fetch('http://localhost:3008/product-categories/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    async bulkAddColorsToProduct(data: BulkAddColorsToProductDto): Promise<any> {
        const response = await fetch('http://localhost:3008/product-colors/bulk-add-colors-to-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    async bulkAddProductImages(data: BulkAddProductImagesDto): Promise<any> {
        console.log("bulkAddProductImages API called with data:", data);
        console.log("Making request to:", 'http://localhost:3008/product-images/bulk-simple-wrapped');

        const response = await fetch('http://localhost:3008/product-images/bulk-simple-wrapped', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        console.log("API response status:", response.status);
        console.log("API response ok:", response.ok);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API error response:", errorData);
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API success response:", result);
        return result;
    }
};

// Transform form data to API DTO
export function transformStep1ToDto(formData: CreateProductStep1FormData): CreateProductDto {
    return {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        basePrice: formData.basePrice,
        discountedPrice: formData.discountedPrice,
        sku: formData.sku,
        discountPercentage: formData.discountPercentage,
        material: formData.material,
        dimensions: formData.dimensions,
        capacity: formData.capacity,
        // stock: formData.stock,
        weight: formData.weight,
        published: formData.published,
    };
}

// Transform images to database format
export function transformImagesToDto(images: any[], productId: number): BulkAddProductImagesDto {
    console.log("transformImagesToDto called with:", { images, productId });

    const cloudinaryImages = images.filter(image => {
        const isCloudinaryUrl = image.url && !image.url.startsWith("blob:");
        console.log("Image filter check:", {
            url: image.url,
            isCloudinaryUrl,
            startsWithBlob: image.url?.startsWith("blob:")
        });
        return isCloudinaryUrl;
    });

    console.log("Filtered cloudinary images:", cloudinaryImages);

    const result = {
        images: cloudinaryImages.map(image => {
            // Ensure Cloudinary URLs use https:// instead of http://
            let imageUrl = image.url;
            if (imageUrl.startsWith('http://res.cloudinary.com/')) {
                imageUrl = imageUrl.replace('http://', 'https://');
                console.log("Converted HTTP to HTTPS:", { original: image.url, converted: imageUrl });
            }

            return {
                product_id: productId,
                image_url: imageUrl,
                alt: image.alt || `Product image`
            };
        })
    };

    console.log("Final transform result:", result);
    return result;
}