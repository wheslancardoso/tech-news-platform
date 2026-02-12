import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";

type AuthContextType = {
    session: string | null;
    isLoading: boolean;
    signIn: (password: string) => Promise<void>;
    signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    isLoading: false,
    signIn: async () => { },
    signOut: () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const rootSegment = useSegments()[0];
    const router = useRouter();

    useEffect(() => {
        const loadSession = async () => {
            const storedSession = await AsyncStorage.getItem("admin_session");
            setSession(storedSession);
            setIsLoading(false);
        };
        loadSession();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = rootSegment === "(auth)";

        if (!session && !inAuthGroup) {
            // Redirect to login if not authenticated and not in auth group
            // router.replace("/login"); 
            // Actually, for a news app, maybe we don't force login?
            // User requested "mobile version of THIS project". The web project has public pages and restricted admin pages.
            // So checking session should only block admin features, not the whole app.
            // But for now, let's just provide the context. The routing logic will be handled in layouts or protected routes.
        }
    }, [session, isLoading, rootSegment]);

    const signIn = async (password: string) => {
        // 1. Try to hit the Next.js API if configured
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        let isValid = false;

        if (apiUrl) {
            try {
                const response = await fetch(`${apiUrl}/api/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password }),
                });
                const data = await response.json();
                if (data.success) isValid = true;
            } catch (e) {
                console.error("Login API error:", e);
                // Fallback or error handling
                alert("Erro ao conectar com servidor");
                return;
            }
        } else {
            // Fallback: Check strictly against a local env var (less secure but works for standalone)
            if (password === process.env.EXPO_PUBLIC_ADMIN_PASSWORD) {
                isValid = true;
            }
        }

        if (isValid) {
            await AsyncStorage.setItem("admin_session", "true");
            setSession("true");
            router.replace("/");
        } else {
            alert("Senha incorreta");
        }
    };

    const signOut = async () => {
        await AsyncStorage.removeItem("admin_session");
        setSession(null);
        router.replace("/login");
    };

    return (
        <AuthContext.Provider value={{ session, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
