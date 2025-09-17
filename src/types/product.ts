export interface CreateProductDto {
    title: string;
    subtitle?: string;
    description?: string;
    basePrice: number;
    discountedPrice?: number;
    sku: string;
    discountPercentage?: number;
    material?: string;
    design?: string;
    capacity?: string;
    stock?: number;
    barcode?: string;
    weight?: string;
    published?: boolean;
}

export interface Size {
    id: number;
    value: string; // e.g., "42", "M", "10.5"
    system?: string; // e.g., "EU", "US", "UK"
    createdAt: Date;
    updatedAt: Date;
}

export interface Category {
    id: number;
    name: string;
    parentId?: number | null;
    parent?: Category;
    children?: Category[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryDto {
    name: string;
    parentId?: number | null;
}

export interface Color {
    id: number;
    name: string;
    hexCode?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateColorDto {
    name: string;
    hexCode?: string;
}

export interface ProductPricing {
    id: number;
    productId: number;
    min_quantity: number;
    max_quantity: number;
    unit_price: number;
    discount_percentage?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Product extends CreateProductDto {
    id: number;
    sizes?: Size[];
    categories?: Category[];
    colors?: Color[];
    pricing?: ProductPricing[];
    createdAt: Date;
    updatedAt: Date;
}

// Form types for multi-step form
export interface ProductFormStep1 extends CreateProductDto { }

export interface ProductFormStep2 {
    selectedSizes: number[];
    newSize?: Omit<Size, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface ProductFormStep3 {
    selectedCategories: number[];
    newCategory?: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'children'>;
}

export interface ProductFormStep4 {
    selectedColors: number[];
    newColor?: Omit<Color, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface ProductFormStep5 {
    pricing: Omit<ProductPricing, 'id' | 'productId' | 'createdAt' | 'updatedAt'>[];
}

export interface CompleteProductForm {
    step1: ProductFormStep1;
    step2: ProductFormStep2;
    step3: ProductFormStep3;
    step4: ProductFormStep4;
    step5: ProductFormStep5;
}

export type ProductFormStep = 1 | 2 | 3 | 4 | 5;