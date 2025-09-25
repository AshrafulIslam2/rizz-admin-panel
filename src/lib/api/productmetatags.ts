export interface CreateProductMetatagDto {
    productId: number;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
    priority?: number;
    changefreq?: string;
}

const productMetatagsApi = {
    /**
     * Create or update product metatags
     */
    async create(payload: CreateProductMetatagDto): Promise<any> {
        const response = await fetch("http://localhost:3008/product-metatags", {
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
            console.error("productMetatags.create failed:", { status: response.status, body, message });
            throw new Error(message);
        }

        if (!text) return { message: "OK" };
        try {
            return JSON.parse(text);
        } catch (e) {
            return { message: String(text) };
        }
    },
};

export default productMetatagsApi;
