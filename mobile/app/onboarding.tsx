import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions, FlatList, Platform } from "react-native";
import { Newspaper, Heart, Moon, Bell, ArrowRight } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const CYAN = "#00F0FF";
const GREEN = "#00FF41";
const RED = "#FF0000";

const slides = [
    {
        icon: (color: string) => <Newspaper size={40} color={color} strokeWidth={1.5} />,
        iconColor: CYAN,
        title: "FRESH\nNEWS",
        description: "Curadoria diária das notícias mais importantes do mundo da tecnologia.",
    },
    {
        icon: (color: string) => <Heart size={40} color={color} fill={color} strokeWidth={1.5} />,
        iconColor: RED,
        title: "SALVE SEUS\nFAVORITOS",
        description: "Marque as edições mais interessantes e acesse quando quiser na aba Salvos.",
    },
    {
        icon: (color: string) => <Moon size={40} color={color} strokeWidth={1.5} />,
        iconColor: CYAN,
        title: "DESIGN\nBRUTALISTA",
        description: "Interface editorial de alto contraste. Informação densa, visual premium.",
    },
    {
        icon: (color: string) => <Bell size={40} color={color} strokeWidth={1.5} />,
        iconColor: GREEN,
        title: "FIQUE POR\nDENTRO",
        description: "Notificações quando uma nova edição for publicada. Nunca perca uma novidade.",
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

    const currentSlide = slides[currentIndex];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#0D0D0D" }} edges={["top", "bottom"]}>
            {/* Skip button */}
            <View style={{ alignItems: "flex-end", paddingHorizontal: 20, paddingTop: 12 }}>
                <TouchableOpacity onPress={completeOnboarding} style={{ padding: 8 }}>
                    <Text style={{
                        fontSize: 12,
                        color: "#849495",
                        fontWeight: "800",
                        textTransform: "uppercase",
                        letterSpacing: 1.5,
                    }}>Pular</Text>
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
                        {/* Sharp icon container */}
                        <View style={{
                            width: 100,
                            height: 100,
                            backgroundColor: "#1A1A1A",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 40,
                            borderWidth: 2,
                            borderColor: "#2A2A2A",
                        }}>
                            {item.icon(item.iconColor)}
                        </View>
                        <Text style={{
                            fontSize: 36,
                            fontWeight: "900",
                            color: "#E5E2E1",
                            textAlign: "center",
                            letterSpacing: -1.5,
                            lineHeight: 42,
                            marginBottom: 16,
                        }}>
                            {item.title}
                        </Text>
                        <Text style={{
                            fontSize: 15,
                            lineHeight: 24,
                            color: "#849495",
                            textAlign: "center",
                        }}>
                            {item.description}
                        </Text>
                    </View>
                )}
            />

            {/* Bottom */}
            <View style={{ paddingHorizontal: 24, paddingBottom: Platform.OS === "ios" ? 16 : 24 }}>
                {/* Sharp square dots */}
                <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 24, gap: 8 }}>
                    {slides.map((_, i) => (
                        <View
                            key={i}
                            style={{
                                width: currentIndex === i ? 24 : 8,
                                height: 8,
                                borderRadius: 0,
                                backgroundColor: currentIndex === i ? currentSlide.iconColor : "#1A1A1A",
                            }}
                        />
                    ))}
                </View>

                {/* Brutalist CTA Button */}
                <TouchableOpacity
                    onPress={handleNext}
                    activeOpacity={0.85}
                    style={{
                        height: 56,
                        backgroundColor: currentSlide.iconColor,
                        borderRadius: 0,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        gap: 8,
                    }}
                >
                    <Text style={{
                        color: "#0D0D0D",
                        fontSize: 15,
                        fontWeight: "900",
                        textTransform: "uppercase",
                        letterSpacing: 2,
                    }}>
                        {currentIndex === slides.length - 1 ? "Começar" : "Próximo"}
                    </Text>
                    <ArrowRight size={18} color="#0D0D0D" strokeWidth={2} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
