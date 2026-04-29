import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { FavoritesProvider } from "../context/FavoritesContext";
import { ThemeProvider } from "../context/ThemeContext";
import { ReadProvider } from "../context/ReadContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

function OnboardingGate({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(false);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        const checkNavigation = async () => {
            const value = await AsyncStorage.getItem("onboarding_complete");
            const needsOnboarding = value !== "true";
            const inOnboarding = segments[0] === "onboarding";

            if (needsOnboarding && !inOnboarding) {
                router.replace("/onboarding");
            } else if (!needsOnboarding && inOnboarding) {
                // If they finished onboarding but are still on the onboarding screen, send them home
                router.replace("/(tabs)");
            }

            if (!isReady) setIsReady(true);
        };

        checkNavigation();
    }, [segments, isReady]);

    if (!isReady) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0D0D0D" }}>
                <ActivityIndicator size="large" color="#00F0FF" />
            </View>
        );
    }

    return <>{children}</>;
}

export default function Layout() {
    return (
        <ThemeProvider>
            <ReadProvider>
                <FavoritesProvider>
                    <OnboardingGate>
                        <Slot />
                    </OnboardingGate>
                </FavoritesProvider>
            </ReadProvider>
        </ThemeProvider>
    );
}
