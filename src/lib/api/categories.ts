const API_BASE_URL = 'http://localhost:3008';

export interface Category {
    id: number;
    name: string;
    parentId?: number | null;
    createdAt: string;
    updatedAt: string;
    children?: Category[];
}

export interface CreateCategoryDto {
    name: string;
    parentId?: number | null;
}

export const categoriesApi = {
    // Get all categories (flat list)
    findAll: async (): Promise<Category[]> => {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        return response.json();
    },

    // Get categories tree (hierarchical structure)
    findCategoryTree: async (): Promise<Category[]> => {
        const response = await fetch(`${API_BASE_URL}/categories/tree`);
        if (!response.ok) {
            throw new Error('Failed to fetch category tree');
        }
        return response.json();
    },

    // Create a new category
    create: async (data: CreateCategoryDto): Promise<Category> => {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to create category: ${error}`);
        }

        return response.json();
    },
};