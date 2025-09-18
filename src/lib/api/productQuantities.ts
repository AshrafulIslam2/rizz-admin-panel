// Product Quantities API

export interface BulkCreateProductQuantitiesDto {
    variantQuantities: {
        colorId: number;
        sizeId: number;
        available_quantity: number;
        minimum_threshold: number;
        maximum_capacity: number;
    }[];
}

export interface ProductQuantityResponse {
    id: number;
    productId: number;
    colorId: number;
    sizeId: number;
    available_quantity: number;
    minimum_threshold: number;
    maximum_capacity: number;
    createdAt: string;
    updatedAt: string;
}

export class ProductQuantitiesApi {
    private baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3008";

    async bulkCreateProductQuantities(
        productId: number,
        data: BulkCreateProductQuantitiesDto
    ): Promise<ProductQuantityResponse[]> {
        const response = await fetch(`${this.baseUrl}/product-quantities/product/${productId}/bulk`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async getProductQuantities(productId: number): Promise<ProductQuantityResponse[]> {
        const response = await fetch(`${this.baseUrl}/product-quantities/product/${productId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async updateProductQuantity(
        quantityId: number,
        data: Partial<Omit<ProductQuantityResponse, 'id' | 'productId' | 'createdAt' | 'updatedAt'>>
    ): Promise<ProductQuantityResponse> {
        const response = await fetch(`${this.baseUrl}/product-quantities/${quantityId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async deleteProductQuantity(quantityId: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/product-quantities/${quantityId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
    }
}

export const productQuantitiesApi = new ProductQuantitiesApi();