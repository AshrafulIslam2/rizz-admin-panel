// API utilities for colors

export interface CreateColorDto {
    name: string;
    hexCode?: string;
}

export interface Color {
    id: number;
    name: string;
    hexCode?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductColor {
    productId: number;
    colorId: number;
    createdAt: string;
    updatedAt: string;
    color: Color;
}

export interface BulkAddColorsToProductDto {
    productId: number;
    selectedColors: number[];
}

export const colorsApi = {
    async findAll(): Promise<Color[]> {
        const response = await fetch('http://localhost:3008/colors/', {
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

    async create(data: CreateColorDto): Promise<Color> {
        const response = await fetch('http://localhost:3008/colors/', {
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

    async getProductColors(productId: number): Promise<ProductColor[]> {
        const response = await fetch(`http://localhost:3008/product-colors/product/${productId}`, {
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