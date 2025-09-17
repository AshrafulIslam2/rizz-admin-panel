// API utilities for sizes
export interface CreateSizeDto {
    value: string; // e.g., "42", "M", "10.5"
    system?: string; // e.g., "EU", "US", "UK"
}

export interface SizeResponse {
    id: number;
    value: string;
    system?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductSize {
    productId: number;
    sizeId: number;
    createdAt: string;
    updatedAt: string;
    size: SizeResponse;
}

export const sizesApi = {
    async getAll(): Promise<SizeResponse[]> {
        const response = await fetch('http://localhost:3008/sizes', {
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

    async create(data: CreateSizeDto): Promise<SizeResponse> {
        const response = await fetch('http://localhost:3008/sizes', {
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

    async getProductSizes(productId: number): Promise<ProductSize[]> {
        const response = await fetch(`http://localhost:3008/product-sizes/product/${productId}`, {
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
    }
};