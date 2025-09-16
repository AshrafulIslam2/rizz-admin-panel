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
    id: string;
    title: string;
    createdAt: string;
    // Add other fields as needed
}

export const productApi = {
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
        stock: formData.stock,
        weight: formData.weight,
        published: formData.published,
    };
}