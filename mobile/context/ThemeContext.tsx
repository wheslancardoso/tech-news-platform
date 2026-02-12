import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark";

interface ThemeColors {
    bg: string;
    bgCard: string;
    bgMuted: string;
    bgHeader: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    accent: string;
    accentLight: string;
    hero: string;
    heroText: string;
    heroMuted: string;
    searchBg: string;
    searchBorder: string;
    tabBar: string;
    tabBorder: string;
}

const lightColors: ThemeColors = {
    bg: "#fafafa",
    bgCard: "#ffffff",
    bgMuted: "#f1f5f9",
    bgHeader: "#ffffff",
    text: "#0f172a",
    textSecondary: "#64748b",
    textMuted: "#94a3b8",
    border: "#f1f5f9",
    accent: "#0f172a",
    accentLight: "#f1f5f9",
    hero: "#0f172a",
    heroText: "#ffffff",
    heroMuted: "#94a3b8",
    searchBg: "#f8fafc",
    searchBorder: "#f1f5f9",
    tabBar: "#ffffff",
    tabBorder: "#f1f5f9",
};

const darkColors: ThemeColors = {
    bg: "#0a0a0a",
    bgCard: "#171717",
    bgMuted: "#1e1e1e",
    bgHeader: "#111111",
    text: "#fafafa",
    textSecondary: "#a1a1aa",
    textMuted: "#71717a",
    border: "#262626",
    accent: "#fafafa",
    accentLight: "#262626",
    hero: "#171717",
    heroText: "#fafafa",
    heroMuted: "#a1a1aa",
    searchBg: "#1e1e1e",
    searchBorder: "#262626",
    tabBar: "#111111",
    tabBorder: "#1e1e1e",
};

interface ThemeContextType {
    mode: ThemeMode;
    colors: ThemeColors;
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: "light",
    colors: lightColors,
    isDark: false,
    toggleTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>("light");

    useEffect(() => {
        AsyncStorage.getItem("theme").then((stored) => {
            if (stored === "dark" || stored === "light") {
                setMode(stored);
            }
        });
    }, []);

    const toggleTheme = async () => {
        const newMode = mode === "light" ? "dark" : "light";
        setMode(newMode);
        await AsyncStorage.setItem("theme", newMode);
    };

    const colors = mode === "dark" ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ mode, colors, isDark: mode === "dark", toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
