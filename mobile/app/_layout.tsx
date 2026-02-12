import { useState, useEffect } from "react";
import { Slot } from "expo-router";
import { FavoritesProvider } from "../context/FavoritesContext";
import { ThemeProvider } from "../context/ThemeContext";
import { ReadProvider } from "../context/ReadContext";
import { Onboarding } from "../components/Onboarding";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

export default function Layout() {
    const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

    useEffect(() => {
        AsyncStorage.getItem("onboarding_complete").then((value) => {
            setShowOnboarding(value !== "true");
        });
    }, []);

    // Loading state while checking onboarding
    if (showOnboarding === null) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa" }}>
                <ActivityIndicator size="large" color="#0f172a" />
            </View>
        );
    }

    if (showOnboarding) {
        return <Onboarding onComplete={() => setShowOnboarding(false)} />;
    }

    return (
        <ThemeProvider>
            <ReadProvider>
                <FavoritesProvider>
                    <Slot />
                </FavoritesProvider>
            </ReadProvider>
        </ThemeProvider>
    );
}
