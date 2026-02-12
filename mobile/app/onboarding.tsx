import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions, FlatList, Platform } from "react-native";
import { Newspaper, Heart, Moon, Bell, ArrowRight } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const slides = [
    {
        icon: (color: string) => <Newspaper size={40} color={color} />,
        iconBg: "#eef2ff",
        iconColor: "#6366f1",
        title: "Bem-vindo ao\nTech News",
        description: "Receba uma curadoria diária das notícias mais importantes do mundo da tecnologia.",
    },
    {
        icon: (color: string) => <Heart size={40} color={color} fill={color} />,
        iconBg: "#fef2f2",
        iconColor: "#ef4444",
        title: "Salve seus\nFavoritos",
        description: "Marque as edições mais interessantes com ❤️ e acesse quando quiser na aba Favoritos.",
    },
    {
        icon: (color: string) => <Moon size={40} color={color} />,
        iconBg: "#f0f9ff",
        iconColor: "#0ea5e9",
        title: "Modo Escuro\nIncluído",
        description: "Toque na logo TN no header para acessar as configurações e ativar o tema escuro.",
    },
    {
        icon: (color: string) => <Bell size={40} color={color} />,
        iconBg: "#fffbeb",
        iconColor: "#f59e0b",
        title: "Fique por\nDentro",
        description: "Receba notificações quando uma nova edição for publicada. Nunca perca uma novidade!",
    },
];

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const router = useRouter();

    const completeOnboarding = async () => {
        await AsyncStorage.setItem("onboarding_complete", "true");
        router.replace("/(tabs)");
    };

    const handleNext = async () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
            setCurrentIndex(currentIndex + 1);
        } else {
            await completeOnboarding();
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }} edges={["top", "bottom"]}>
            {/* Skip button */}
            <View style={{ alignItems: "flex-end", paddingHorizontal: 20, paddingTop: 12 }}>
                <TouchableOpacity onPress={completeOnboarding} style={{ padding: 8 }}>
                    <Text style={{ fontSize: 14, color: "#94a3b8", fontWeight: "600" }}>Pular</Text>
                </TouchableOpacity>
            </View>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                keyExtractor={(_, i) => String(i)}
                renderItem={({ item }) => (
                    <View style={{
                        width,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 40,
                        paddingBottom: 60,
                    }}>
                        <View style={{
                            width: 100,
                            height: 100,
                            borderRadius: 30,
                            backgroundColor: item.iconBg,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 40,
                            shadowColor: item.iconColor,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 12,
                            elevation: 5,
                        }}>
                            {item.icon(item.iconColor)}
                        </View>
                        <Text style={{
                            fontSize: 32,
                            fontWeight: "800",
                            color: "#0f172a",
                            textAlign: "center",
                            letterSpacing: -1,
                            lineHeight: 40,
                            marginBottom: 16,
                        }}>
                            {item.title}
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            lineHeight: 24,
                            color: "#64748b",
                            textAlign: "center",
                        }}>
                            {item.description}
                        </Text>
                    </View>
                )}
            />

            {/* Bottom */}
            <View style={{ paddingHorizontal: 24, paddingBottom: Platform.OS === "ios" ? 16 : 24 }}>
                {/* Dots */}
                <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 24, gap: 8 }}>
                    {slides.map((_, i) => (
                        <View
                            key={i}
                            style={{
                                width: currentIndex === i ? 24 : 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: currentIndex === i ? "#0f172a" : "#e2e8f0",
                            }}
                        />
                    ))}
                </View>

                {/* Button */}
                <TouchableOpacity
                    onPress={handleNext}
                    activeOpacity={0.8}
                    style={{
                        height: 56,
                        backgroundColor: "#0f172a",
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        gap: 8,
                        shadowColor: "#0f172a",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                >
                    <Text style={{ color: "#ffffff", fontSize: 17, fontWeight: "700" }}>
                        {currentIndex === slides.length - 1 ? "Começar" : "Próximo"}
                    </Text>
                    <ArrowRight size={20} color="#ffffff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
