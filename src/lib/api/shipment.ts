export interface DeliveryArea {
    id: number;
    name?: string;
    areaName?: string;
    charge: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateDeliveryAreaDto {
    name: string;
    charge: number;
    isActive?: boolean;
}

export interface UpdateDeliveryAreaDto {
    name?: string;
    charge?: number;
    isActive?: boolean;
}

const BASE_URL = "http://localhost:3008";

const shipmentApi = {
    /**
     * Get all delivery areas
     */
    async getAllDeliveryAreas(): Promise<DeliveryArea[]> {
        const response = await fetch(`${BASE_URL}/shipment/delivery-areas`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const text = await response.text().catch(() => "");
            const message = text || response.statusText || `HTTP error! status: ${response.status}`;
            console.error("shipmentApi.getAllDeliveryAreas failed:", { status: response.status, message });
            throw new Error(message);
        }

        return response.json();
    },

    /**
     * Get active delivery areas only
     */
    async getActiveDeliveryAreas(): Promise<DeliveryArea[]> {
        const response = await fetch(`${BASE_URL}/shipment/delivery-areas/active`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const text = await response.text().catch(() => "");
            const message = text || response.statusText || `HTTP error! status: ${response.status}`;
            console.error("shipmentApi.getActiveDeliveryAreas failed:", { status: response.status, message });
            throw new Error(message);
        }

        return response.json();
    },

    /**
     * Get specific delivery area by ID
     */
    async getDeliveryAreaById(id: number): Promise<DeliveryArea> {
        const response = await fetch(`${BASE_URL}/shipment/delivery-areas/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const text = await response.text().catch(() => "");
            const message = text || response.statusText || `HTTP error! status: ${response.status}`;
            console.error("shipmentApi.getDeliveryAreaById failed:", { status: response.status, message });
            throw new Error(message);
        }

        return response.json();
    },

    /**
     * Create new delivery area
     */
    async createDeliveryArea(payload: CreateDeliveryAreaDto): Promise<DeliveryArea> {
        const response = await fetch(`${BASE_URL}/shipment/delivery-areas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify(payload),
        });

        const text = await response.text().catch(() => "");
        let body: any = null;
        try {
            body = text ? JSON.parse(text) : null;
        } catch (e) {
            body = text;
        }

        if (!response.ok) {
            const message = body?.message || body || response.statusText || `HTTP error! status: ${response.status}`;
            console.error("shipmentApi.createDeliveryArea failed:", { status: response.status, body, message });
            throw new Error(message);
        }

        return body;
    },

    /**
     * Update delivery area by ID
     */
    async updateDeliveryArea(id: number, payload: UpdateDeliveryAreaDto): Promise<DeliveryArea> {
        const response = await fetch(`${BASE_URL}/shipment/delivery-areas/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify(payload),
        });

        const text = await response.text().catch(() => "");
        let body: any = null;
        try {
            body = text ? JSON.parse(text) : null;
        } catch (e) {
            body = text;
        }

        if (!response.ok) {
            const message = body?.message || body || response.statusText || `HTTP error! status: ${response.status}`;
            console.error("shipmentApi.updateDeliveryArea failed:", { status: response.status, body, message });
            throw new Error(message);
        }

        return body;
    },

    /**
     * Delete delivery area by ID
     */
    async deleteDeliveryArea(id: number): Promise<void> {
        const response = await fetch(`${BASE_URL}/shipment/delivery-areas/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const text = await response.text().catch(() => "");
            const message = text || response.statusText || `HTTP error! status: ${response.status}`;
            console.error("shipmentApi.deleteDeliveryArea failed:", { status: response.status, message });
            throw new Error(message);
        }
    },

    /**
     * Toggle delivery area status (active/inactive)
     */
    async toggleDeliveryAreaStatus(id: number): Promise<DeliveryArea> {
        const response = await fetch(`${BASE_URL}/shipment/delivery-areas/${id}/toggle`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            credentials: 'include',
        });

        const text = await response.text().catch(() => "");
        let body: any = null;
        try {
            body = text ? JSON.parse(text) : null;
        } catch (e) {
            body = text;
        }

        if (!response.ok) {
            const message = body?.message || body || response.statusText || `HTTP error! status: ${response.status}`;
            console.error("shipmentApi.toggleDeliveryAreaStatus failed:", { status: response.status, body, message });
            throw new Error(message);
        }

        return body;
    },
};

export default shipmentApi;
