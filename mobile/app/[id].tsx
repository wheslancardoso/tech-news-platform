import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Share, Linking } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Share2, ExternalLink, Calendar, Hash, Heart, Zap } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFavorites } from "../context/FavoritesContext";
import { useTheme } from "../context/ThemeContext";
import { useRead } from "../context/ReadContext";

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

// Assign category accent color
function getCategoryColor(index: number, colors: any): string {
    const accents = [colors.categoryIA, colors.categorySEC, colors.categoryDEV];
    return accents[index % 3];
}

export default function NewsletterDetail() {
    const { id } = useLocalSearchParams();
    const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { colors, isDark } = useTheme();
    const { markAsRead } = useRead();
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
                markAsRead(id as string);
            }
            setLoading(false);
        }
        fetchNewsletter();
    }, [id]);

    const handleShare = async () => {
        if (!newsletter) return;
        try {
            await Share.share({
                message: `Confira a edição #${newsletter.edition_number} do Fresh News: ${newsletter.title}`,
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
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }} edges={["top"]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={{ marginTop: 12, color: colors.textMuted, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Carregando edição...</Text>
            </SafeAreaView>
        );
    }

    if (!newsletter) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 20 }} edges={["top"]}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={{ color: colors.textSecondary, fontSize: 16, marginBottom: 16 }}>Newsletter não encontrada.</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 0 }}
                >
                    <Text style={{ color: "#0D0D0D", fontWeight: "800" }}>VOLTAR</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const { content_json } = newsletter;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Brutalist Header */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingVertical: 14,
                backgroundColor: colors.bgHeader,
                borderBottomWidth: 2,
                borderBottomColor: colors.border,
            }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ flexDirection: "row", alignItems: "center", padding: 6, marginLeft: -6 }}
                >
                    <ArrowLeft size={20} color={colors.text} strokeWidth={1.5} />
                    <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: "800", color: colors.text, textTransform: "uppercase", letterSpacing: 1 }}>Voltar</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <TouchableOpacity
                        onPress={() => id && toggleFavorite(id as string)}
                        style={{ padding: 8 }}
                    >
                        <Heart size={20} color={active ? "#FF0000" : colors.textMuted} fill={active ? "#FF0000" : "none"} strokeWidth={1.5} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShare} style={{ padding: 8 }}>
                        <Share2 size={20} color={colors.textMuted} strokeWidth={1.5} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
                {/* Hero Section — Brutalist */}
                <View style={{
                    backgroundColor: colors.bgCard,
                    paddingHorizontal: 20,
                    paddingTop: 32,
                    paddingBottom: 32,
                    borderBottomWidth: 2,
                    borderBottomColor: colors.border,
                }}>
                    <View style={{ flexDirection: "row", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            backgroundColor: colors.bgMuted,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 0,
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}>
                            <Hash size={11} color={colors.textMuted} strokeWidth={1.5} />
                            <Text style={{ fontSize: 11, fontWeight: "800", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                Edição {newsletter.edition_number}
                            </Text>
                        </View>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            backgroundColor: colors.bgMuted,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 0,
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}>
                            <Calendar size={11} color={colors.textMuted} strokeWidth={1.5} />
                            <Text style={{ fontSize: 11, fontWeight: "800", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                {format(new Date(newsletter.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                            </Text>
                        </View>
                    </View>
                    <Text style={{
                        fontSize: 28,
                        fontWeight: "900",
                        color: colors.text,
                        lineHeight: 34,
                        letterSpacing: -1,
                        marginBottom: 16,
                    }}>
                        {newsletter.title}
                    </Text>
                    <Text style={{ fontSize: 15, lineHeight: 24, color: colors.textMuted }}>
                        {content_json.intro}
                    </Text>
                </View>

                {/* Quick Takes — Brutalist */}
                {content_json.quickTakes && content_json.quickTakes.length > 0 && (
                    <View style={{
                        marginHorizontal: 16,
                        marginTop: 20,
                        backgroundColor: colors.bgMuted,
                        borderRadius: 0,
                        padding: 18,
                        borderWidth: 2,
                        borderColor: colors.border,
                        borderLeftWidth: 4,
                        borderLeftColor: colors.accent,
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 }}>
                            <Zap size={14} color={colors.accent} fill={colors.accent} strokeWidth={1.5} />
                            <Text style={{
                                fontSize: 11,
                                fontWeight: "900",
                                color: colors.accent,
                                textTransform: "uppercase",
                                letterSpacing: 2,
                            }}>
                                Destaques Rápidos
                            </Text>
                        </View>
                        {content_json.quickTakes.map((take, index) => (
                            <View key={index} style={{ flexDirection: "row", marginBottom: 10, paddingRight: 8 }}>
                                <Text style={{ fontSize: 14, marginRight: 8, color: colors.accent }}>▸</Text>
                                <Text style={{ fontSize: 14, lineHeight: 22, color: colors.textSecondary, flex: 1 }}>
                                    {take}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Categories — Brutalist */}
                {content_json.categories.map((category, catIndex) => {
                    const catColor = getCategoryColor(catIndex, colors);
                    return (
                        <View key={catIndex} style={{ marginTop: 28, paddingHorizontal: 16 }}>
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 16,
                                paddingBottom: 12,
                                borderBottomWidth: 2,
                                borderBottomColor: colors.border,
                            }}>
                                <View style={{ width: 4, height: 20, backgroundColor: catColor, marginRight: 10 }} />
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: "900",
                                    color: colors.text,
                                    letterSpacing: 0.5,
                                    textTransform: "uppercase",
                                }}>
                                    {category.name}
                                </Text>
                            </View>
                            {category.items.map((item, itemIndex) => (
                                <View key={itemIndex} style={{
                                    marginBottom: 12,
                                    borderRadius: 0,
                                    backgroundColor: colors.bgCard,
                                    padding: 16,
                                    borderWidth: 2,
                                    borderColor: colors.border,
                                    borderTopWidth: 3,
                                    borderTopColor: catColor,
                                }}>
                                    <Text style={{
                                        fontSize: 16,
                                        fontWeight: "800",
                                        color: colors.text,
                                        lineHeight: 22,
                                        marginBottom: 10,
                                        letterSpacing: -0.3,
                                    }}>
                                        {item.headline.replace(/^[^\w]+/, '')}
                                    </Text>
                                    <Text style={{ fontSize: 14, lineHeight: 23, color: colors.textSecondary, marginBottom: 16 }}>
                                        {item.story}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => openLink(item.link)}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            alignSelf: "flex-start",
                                            backgroundColor: colors.bgMuted,
                                            paddingHorizontal: 14,
                                            paddingVertical: 10,
                                            borderRadius: 0,
                                            borderWidth: 2,
                                            borderColor: colors.border,
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: "800",
                                            color: catColor,
                                            marginRight: 6,
                                            textTransform: "uppercase",
                                            letterSpacing: 0.5,
                                        }}>
                                            Ler fonte
                                        </Text>
                                        <ExternalLink size={13} color={catColor} strokeWidth={1.5} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    );
                })}

                {/* Footer — Editorial Rule */}
                <View style={{
                    marginTop: 32,
                    marginHorizontal: 16,
                    alignItems: "center",
                    paddingTop: 24,
                    borderTopWidth: 2,
                    borderTopColor: colors.border,
                }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 }}>Gostou da edição?</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 6, opacity: 0.5, letterSpacing: 1 }}>FRESH NEWS APP v1.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
