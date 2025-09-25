
export interface YouTubeOauthStatus {
    connected: boolean;
    channelName: string | null;
    channelId: string | null;
    message: string;
}

export const youtubeUploadApi = {
    async getOauthStatus(): Promise<YouTubeOauthStatus> {
        const response = await fetch("http://localhost:3008/youtube/oauth/status", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            // Try to extract message from JSON body, fallback to statusText
            const errorBody = await response.json().catch(() => null);
            const message = errorBody?.message || response.statusText || `HTTP error! status: ${response.status}`;
            throw new Error(message);
        }

        // We expect the backend to return the exact shape above.
        const data = await response.json();
        return data as YouTubeOauthStatus;
    },
    async disconnect(): Promise<{ message?: string }> {
        // Include credentials in case the backend relies on cookies/sessions
        const response = await fetch("http://localhost:3008/youtube/oauth/disconnect", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            credentials: 'include',
        });

        // Try to parse body (JSON or text) for better error messages
        const text = await response.text().catch(() => "");
        let body: any = null;
        try {
            body = text ? JSON.parse(text) : null;
        } catch (e) {
            body = text;
        }

        if (!response.ok) {
            const message = body?.message || body || response.statusText || `HTTP error! status: ${response.status}`;
            console.error("youtubeupload.disconnect failed:", { status: response.status, body, message });
            throw new Error(message);
        }

        // If no JSON body, return a default message
        if (!text) return { message: "Disconnected" };
        try {
            return JSON.parse(text);
        } catch (e) {
            return { message: String(text) };
        }
    },
};

export default youtubeUploadApi;
