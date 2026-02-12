import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Share, Linking } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Share2, ExternalLink, Calendar, Hash, Heart, Zap } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFavorites } from "../context/FavoritesContext";

type NewsletterItem = {
    headline: string;
    story: string;
    link: string;
};

type Category = {
    name: string;
    items: NewsletterItem[];
};

type NewsletterContent = {
    title: string;
    intro: string;
    quickTakes: string[];
    categories: Category[];
};

type Newsletter = {
    id: string;
    edition_number: number;
    title: string;
    created_at: string;
    content_json: NewsletterContent;
};

export default function NewsletterDetail() {
    const { id } = useLocalSearchParams();
    const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { isFavorite, toggleFavorite } = useFavorites();
    const active = id ? isFavorite(id as string) : false;

    useEffect(() => {
        async function fetchNewsletter() {
            if (!id) return;

            const { data, error } = await supabase
                .from("newsletters")
                .select("*")
                .eq("id", id)
                .single();

            if (!error && data) {
                setNewsletter(data);
            }
            setLoading(false);
        }

        fetchNewsletter();
    }, [id]);

    const handleShare = async () => {
        if (!newsletter) return;
        try {
            await Share.share({
                message: `Confira a edição #${newsletter.edition_number} do Tech News: ${newsletter.title}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const openLink = (url: string) => {
        Linking.openURL(url).catch((err) => console.error("Could not load page", err));
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa", alignItems: "center", justifyContent: "center" }} edges={["top"]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#0f172a" />
                <Text style={{ marginTop: 12, color: "#94a3b8", fontSize: 14 }}>Carregando edição...</Text>
            </SafeAreaView>
        );
    }

    if (!newsletter) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa", alignItems: "center", justifyContent: "center", padding: 20 }} edges={["top"]}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={{ color: "#64748b", fontSize: 16, marginBottom: 16 }}>Newsletter não encontrada.</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                        backgroundColor: "#0f172a",
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        borderRadius: 12,
                    }}
                >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Voltar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const { content_json } = newsletter;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }} edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: "#ffffff",
                borderBottomWidth: 1,
                borderBottomColor: "#f1f5f9",
            }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ flexDirection: "row", alignItems: "center", padding: 6, marginLeft: -6, borderRadius: 20 }}
                >
                    <ArrowLeft size={22} color="#0f172a" />
                    <Text style={{ marginLeft: 6, fontSize: 15, fontWeight: "600", color: "#0f172a" }}>Voltar</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <TouchableOpacity
                        onPress={() => id && toggleFavorite(id as string)}
                        style={{ padding: 8, borderRadius: 20 }}
                    >
                        <Heart
                            size={22}
                            color={active ? "#ef4444" : "#64748b"}
                            fill={active ? "#ef4444" : "none"}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShare} style={{ padding: 8, borderRadius: 20 }}>
                        <Share2 size={22} color="#64748b" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 50 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <View style={{
                    backgroundColor: "#0f172a",
                    paddingHorizontal: 20,
                    paddingTop: 28,
                    paddingBottom: 32,
                }}>
                    {/* Badges */}
                    <View style={{ flexDirection: "row", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 5,
                            backgroundColor: "rgba(255,255,255,0.1)",
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 20,
                        }}>
                            <Hash size={12} color="#94a3b8" />
                            <Text style={{ fontSize: 12, fontWeight: "700", color: "#94a3b8" }}>
                                Edição {newsletter.edition_number}
                            </Text>
                        </View>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 5,
                            backgroundColor: "rgba(255,255,255,0.1)",
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 20,
                        }}>
                            <Calendar size={12} color="#94a3b8" />
                            <Text style={{ fontSize: 12, fontWeight: "700", color: "#94a3b8" }}>
                                {format(new Date(newsletter.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                            </Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={{
                        fontSize: 26,
                        fontWeight: "800",
                        color: "#ffffff",
                        lineHeight: 34,
                        letterSpacing: -0.5,
                        marginBottom: 14,
                    }}>
                        {newsletter.title}
                    </Text>

                    {/* Intro */}
                    <Text style={{
                        fontSize: 15,
                        lineHeight: 24,
                        color: "#94a3b8",
                    }}>
                        {content_json.intro}
                    </Text>
                </View>

                {/* Quick Takes */}
                {content_json.quickTakes && content_json.quickTakes.length > 0 && (
                    <View style={{
                        marginHorizontal: 16,
                        marginTop: 20,
                        backgroundColor: "#fffbeb",
                        borderRadius: 16,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: "#fef3c7",
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
                            <Zap size={16} color="#f59e0b" fill="#f59e0b" />
                            <Text style={{ fontSize: 13, fontWeight: "800", color: "#92400e", textTransform: "uppercase", letterSpacing: 1 }}>
                                Destaques Rápidos
                            </Text>
                        </View>
                        {content_json.quickTakes.map((take, index) => (
                            <View key={index} style={{ flexDirection: "row", marginBottom: 8, paddingRight: 8 }}>
                                <Text style={{ fontSize: 14, color: "#92400e", marginRight: 6 }}>⚡</Text>
                                <Text style={{ fontSize: 14, lineHeight: 21, color: "#78350f", flex: 1 }}>
                                    {take}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Categories */}
                {content_json.categories.map((category, catIndex) => (
                    <View key={catIndex} style={{ marginTop: 28, paddingHorizontal: 16 }}>
                        {/* Category Header */}
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 14,
                        }}>
                            <View style={{
                                width: 4,
                                height: 24,
                                backgroundColor: "#0f172a",
                                borderRadius: 2,
                                marginRight: 10,
                            }} />
                            <Text style={{
                                fontSize: 18,
                                fontWeight: "800",
                                color: "#0f172a",
                                letterSpacing: -0.3,
                            }}>
                                {category.name}
                            </Text>
                        </View>

                        {/* Items */}
                        {category.items.map((item, itemIndex) => (
                            <View key={itemIndex} style={{
                                marginBottom: 12,
                                borderRadius: 14,
                                backgroundColor: "#ffffff",
                                padding: 16,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.04,
                                shadowRadius: 3,
                                elevation: 1,
                                borderWidth: 1,
                                borderColor: "#f1f5f9",
                            }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: "700",
                                    color: "#0f172a",
                                    lineHeight: 22,
                                    marginBottom: 8,
                                }}>
                                    {item.headline.replace(/^[^\w]+/, '')}
                                </Text>
                                <Text style={{
                                    fontSize: 14,
                                    lineHeight: 22,
                                    color: "#64748b",
                                    marginBottom: 14,
                                }}>
                                    {item.story}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => openLink(item.link)}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        alignSelf: "flex-start",
                                        backgroundColor: "#f8fafc",
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: "#e2e8f0",
                                    }}
                                >
                                    <Text style={{ fontSize: 13, fontWeight: "600", color: "#0f172a", marginRight: 5 }}>
                                        Ler fonte original
                                    </Text>
                                    <ExternalLink size={13} color="#0f172a" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ))}

                {/* Footer */}
                <View style={{
                    marginTop: 32,
                    marginHorizontal: 16,
                    alignItems: "center",
                    paddingTop: 24,
                    borderTopWidth: 1,
                    borderTopColor: "#f1f5f9",
                }}>
                    <Text style={{ color: "#94a3b8", fontSize: 13, fontWeight: "600" }}>Gostou da edição?</Text>
                    <Text style={{ color: "#cbd5e1", fontSize: 11, marginTop: 4 }}>Tech News App v1.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
