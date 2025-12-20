import { useEffect, useState } from "react";
import axios from "axios";
import { axiosInstance } from "../api/axiosInstance";

export function useAxios<T>(url: string, initialData: T) {
    const [data, setData] = useState<T>(initialData);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const res = await axiosInstance.get(url, {
                    signal: controller.signal,
                });
                setData(res.data);
            } catch (e: any) {
                // ✅ Abort(요청 취소)는 에러로 처리하지 않음
                if (
                    axios.isCancel(e) ||
                    e?.name === "CanceledError" ||
                    e?.name === "AbortError"
                ) {
                    return;
                }
                setError(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        return () => {
            controller.abort();
        };
    }, [url]);

    return { data, error, isLoading, setData };
}
