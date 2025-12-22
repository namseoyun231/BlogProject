import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type User = {
    email: string;
    username: string;
};

type AuthState = {
    user: User | null;
    accessToken: string | null;

    setAuth: (user: User, accessToken: string) => void;
    clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,

            setAuth: (user, accessToken) => set({ user, accessToken }),
            clearAuth: () => set({ user: null, accessToken: null }),
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => sessionStorage), // ✅ PDF 예시
        }
    )
);
