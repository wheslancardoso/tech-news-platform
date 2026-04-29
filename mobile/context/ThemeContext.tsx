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
    // Brutalist category accents
    categoryIA: string;
    categorySEC: string;
    categoryDEV: string;
    primaryCyan: string;
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
    categoryIA: "#0f172a",
    categorySEC: "#0f172a",
    categoryDEV: "#0f172a",
    primaryCyan: "#0f172a",
};

// Neo-Broadsheet Brutalist Dark Theme — Stitch Design System
const darkColors: ThemeColors = {
    bg: "#0D0D0D",
    bgCard: "#111111",
    bgMuted: "#1A1A1A",
    bgHeader: "#0D0D0D",
    text: "#E5E2E1",
    textSecondary: "#A1A1AA",
    textMuted: "#849495",
    border: "#1A1A1A",
    accent: "#00F0FF",
    accentLight: "#0D3B3E",
    hero: "#111111",
    heroText: "#E5E2E1",
    heroMuted: "#849495",
    searchBg: "#111111",
    searchBorder: "#1A1A1A",
    tabBar: "#111111",
    tabBorder: "#1A1A1A",
    // Chameleon category accent colors
    categoryIA: "#00F0FF",
    categorySEC: "#00FF41",
    categoryDEV: "#FF0000",
    primaryCyan: "#00F0FF",
};

interface ThemeContextType {
    mode: ThemeMode;
    colors: ThemeColors;
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: "dark",
    colors: darkColors,
    isDark: true,
    toggleTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>("dark");

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
