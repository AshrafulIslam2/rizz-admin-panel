export interface FaqItem {
    question: string;
    answer: string;
}

export interface CreateProductFaqsPayload {
    productId: number;
    faqs: FaqItem[];
}

const productFaqsApi = {
    /**
     * Bulk create/update product FAQs
     */
    async bulk(payload: CreateProductFaqsPayload): Promise<any> {
        const response = await fetch("http://localhost:3008/product-faqs/bulk", {
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
            console.error("productFaqs.bulk failed:", { status: response.status, body, message });
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

export default productFaqsApi;
