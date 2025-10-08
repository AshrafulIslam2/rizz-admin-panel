// API utilities for orders

export interface ProductImage {
    id: number;
    productId: number;
    url: string;
    alt: string;
    position: number;
    level: string;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    basePrice: number;
    discountedPrice: number;
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
    discountPercentage: number;
    material: string;
    dimensions: string;
    capacity: string;
    barcode: string | null;
    weight: string;
    published: boolean;
    createdAt: string;
    updatedAt: string;
    product_image: ProductImage[];
}

export interface Color {
    id: number;
    name: string;
    hexCode: string;
    createdAt: string;
    updatedAt: string;
}

export interface Size {
    id: number;
    value: string;
    system: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiOrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
    colorId: number;
    sizeId: number;
    createdAt: string;
    updatedAt: string;
    product?: Product;
    color?: Color;
    size?: Size;
}

export interface ApiShipping {
    id: number;
    orderId: number;
    fullName: string;
    address1: string;
    email: string;
    deliveryArea: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiUser {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiOrder {
    id: number;
    orderCode: string;
    userId: number;
    status: string;
    total: number;
    deliveryCharge: number;
    createdAt: string;
    updatedAt: string;
    items: ApiOrderItem[];
    shipping: ApiShipping;
    user: ApiUser;
}

// Legacy interfaces for backwards compatibility
export interface OrderCustomer {
    name: string;
    email: string;
    phone: string;
}

export interface OrderShippingAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface OrderItem {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
    image?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    date: string;
    status: string;
    customer: OrderCustomer;
    shippingAddress: OrderShippingAddress;
    paymentMethod: string;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
}

export interface OrderListItem {
    id: string;
    orderNumber: string;
    customer: string;
    phone: string;
    productId: string;
    productName: string;
    date: string;
    total: number;
    status: string;
    items: number;
}

export const ordersApi = {
    /**
     * Get all orders
     */
    async getAllOrders(): Promise<ApiOrder[]> {
        const response = await fetch('http://localhost:3008/orders', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Get a single order by ID
     */
    async getOrderById(orderId: string): Promise<ApiOrder> {
        const response = await fetch(`http://localhost:3008/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Update order status
     */
    async updateOrderStatus(orderId: number, status: string): Promise<ApiOrder> {
        const response = await fetch(`http://localhost:3008/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Update order customer/shipping information
     */
    async updateOrderShipping(
        orderId: number,
        data: {
            fullName?: string;
            phone?: string;
            email?: string;
        }
    ): Promise<ApiOrder> {
        const response = await fetch(`http://localhost:3008/orders/shipping/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Update order shipping address with delivery area and charge
     */
    async updateOrderShippingAddress(
        orderId: number,
        data: {
            address1?: string;
            deliveryArea?: string;
            deliveryCharge?: number;
        }
    ): Promise<ApiOrder> {
        const response = await fetch(`http://localhost:3008/orders/shipping/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Update order items
     */
    async updateOrderItems(orderId: string, items: OrderItem[]): Promise<Order> {
        const response = await fetch(`http://localhost:3008/orders/${orderId}/items`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Update order item quantity
     */
    async updateOrderItemQuantity(
        itemId: number,
        quantity: number
    ): Promise<any> {
        const response = await fetch(`http://localhost:3008/orders/items/${itemId}/quantity`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Delete an order
     */
    async deleteOrder(orderId: string): Promise<void> {
        const response = await fetch(`http://localhost:3008/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
    },
};
