import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { FavoritesProvider } from "../context/FavoritesContext";
import { ThemeProvider } from "../context/ThemeContext";
import { ReadProvider } from "../context/ReadContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

function OnboardingGate({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(false);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        AsyncStorage.getItem("onboarding_complete").then((value) => {
            setNeedsOnboarding(value !== "true");
            setIsReady(true);
        });
    }, []);

    useEffect(() => {
        if (!isReady) return;

        const inOnboarding = segments[0] === "onboarding";

        if (needsOnboarding && !inOnboarding) {
            router.replace("/onboarding");
        }
    }, [isReady, needsOnboarding, segments]);

    if (!isReady) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa" }}>
                <ActivityIndicator size="large" color="#0f172a" />
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
