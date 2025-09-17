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
        quantity?: number;
    }[];
}

export interface AddCategoryToProductDto {
    productId: number;
    categoryId: number;
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