import { toast } from "sonner";

export const fetchInstance = async ({ url, data = {}, method = "GET", headers = {} }) => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_APP_BASE_URL;

    const finalHeaders = { "Content-Type": "application/json", ...headers };
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

    return fetch(baseUrl + url, {
        method,
        headers: finalHeaders,
        body: method !== "GET" ? JSON.stringify(data) : undefined,
    }).then(async (res) => {
        const result = await res.json();
        if (!res.ok) {
            toast.error(result?.message)
            error.status = res.status;
            throw error;
        }
        return result;
    });
};
