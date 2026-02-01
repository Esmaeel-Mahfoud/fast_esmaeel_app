import { create } from "zustand";
import { getCurrentUser, account } from "@/lib/appwrite";
import { User } from "@/type";

type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    fetchAuthenticatedUser: () => Promise<void>;
    logout: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    fetchAuthenticatedUser: async () => {
        set({ isLoading: true });

        try {
            const user = await getCurrentUser();


            set({// @ts-ignore
                user: user as User,
                isAuthenticated: true,
            });
        } catch (error) {
            set({
                user: null,
                isAuthenticated: false,
            });
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        try {
            await account.deleteSession("current");
        } catch (error) {
            // السيشن ممكن تكون محذوفة أصلاً، ما في مشكلة
        }

        set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },
}));

export default useAuthStore;
