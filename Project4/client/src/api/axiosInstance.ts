import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const axiosInstance = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
        config.headers = config.headers ?? {};
        config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
    refreshQueue.push(cb);
}
function onRefreshed(token: string | null) {
    refreshQueue.forEach((cb) => cb(token));
    refreshQueue = [];
}

axiosInstance.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        if ((error.response?.status === 401 || error.response?.status === 403) && !original?._retry) {
            original._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh((token) => {
                        if (!token) return reject(error);
                        original.headers["Authorization"] = `Bearer ${token}`;
                        resolve(axiosInstance(original));
                    });
                });
            }

            isRefreshing = true;

            try {
                const { data } = await axiosInstance.post("/token");
                const { user, accessToken } = data;

                useAuthStore.getState().setAuth(user, accessToken);
                onRefreshed(accessToken);

                original.headers["Authorization"] = `Bearer ${accessToken}`;
                return axiosInstance(original);
            } catch (e) {
                useAuthStore.getState().clearAuth();
                onRefreshed(null);
                return Promise.reject(e);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
