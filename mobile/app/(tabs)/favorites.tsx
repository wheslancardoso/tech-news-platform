import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { NewsCard } from "../../components/NewsCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useFocusEffect } from "expo-router";
import { Heart, HeartOff } from "lucide-react-native";
import { useFavorites } from "../../context/FavoritesContext";

type Newsletter = {
    id: string;
    edition_number: number;
    title: string;
    created_at: string;
    summary_intro: string;
    status: "draft" | "published";
};

export default function Favorites() {
    const { favorites } = useFavorites();
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        if (favorites.length === 0) {
            setNewsletters([]);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("newsletters")
                .select("id, edition_number, title, created_at, summary_intro, status")
                .in("id", favorites)
                .order("edition_number", { ascending: false });

            if (error) throw error;
            if (data) setNewsletters(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch every time the tab comes into focus or favorites change
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchFavorites();
        }, [favorites])
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }} edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={{
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 16,
                backgroundColor: "#ffffff",
                borderBottomWidth: 1,
                borderBottomColor: "#f1f5f9",
            }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{
                        height: 36,
                        width: 36,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 18,
                        backgroundColor: "#fef2f2",
                    }}>
                        <Heart size={18} color="#ef4444" fill="#ef4444" />
                    </View>
                    <View>
                        <Text style={{ fontWeight: "800", fontSize: 20, color: "#0f172a", letterSpacing: -0.8 }}>Favoritos</Text>
                        <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: "500" }}>
                            {favorites.length} {favorites.length === 1 ? "edição salva" : "edições salvas"}
                        </Text>
                    </View>
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color="#ef4444" />
                </View>
            ) : (
                <FlatList
                    data={newsletters}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={{ paddingHorizontal: 16 }}>
                            <NewsCard
                                id={item.id}
                                edition={item.edition_number}
                                title={item.title}
                                date={item.created_at}
                                intro={item.summary_intro}
                                status={item.status}
                            />
                        </View>
                    )}
                    contentContainerStyle={{ paddingVertical: 16, gap: 12 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: "center", paddingVertical: 80 }}>
                            <View style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                backgroundColor: "#fef2f2",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 20,
                            }}>
                                <HeartOff size={32} color="#fca5a5" />
                            </View>
                            <Text style={{ color: "#64748b", fontSize: 17, fontWeight: "700", marginBottom: 6 }}>
                                Nenhum favorito ainda
                            </Text>
                            <Text style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", paddingHorizontal: 40, lineHeight: 20 }}>
                                Toque no ❤️ nas edições para salvá-las aqui.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
