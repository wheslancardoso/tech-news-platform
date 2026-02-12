import { View, Text, FlatList, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity } from "react-native";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { NewsCard } from "../../components/NewsCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Newspaper, Search, X } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { AppMenu } from "../../components/AppMenu";
import { registerForPushNotifications, checkAndNotifyNewEdition } from "../../lib/notifications";

type Newsletter = {
    id: string;
    edition_number: number;
    title: string;
    created_at: string;
    summary_intro: string;
    status: "draft" | "published";
};

export default function Home() {
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [menuVisible, setMenuVisible] = useState(false);
    const { colors, isDark } = useTheme();

    const fetchNewsletters = async () => {
        try {
            const { data, error } = await supabase
                .from("newsletters")
                .select("id, edition_number, title, created_at, summary_intro, status")
                .eq("status", "published")
                .order("edition_number", { ascending: false })
                .limit(30);

            if (error) throw error;
            if (data) {
                setNewsletters(data);
                // Check for new editions and notify
                if (data.length > 0) {
                    checkAndNotifyNewEdition(data[0].edition_number);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNewsletters();
        registerForPushNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNewsletters();
    };

    const filteredNewsletters = useMemo(() => {
        if (!search.trim()) return newsletters;
        const q = search.toLowerCase();
        return newsletters.filter(
            (n) =>
                n.title.toLowerCase().includes(q) ||
                (n.summary_intro && n.summary_intro.toLowerCase().includes(q)) ||
                `#${n.edition_number}`.includes(q)
        );
    }, [newsletters, search]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />
            <AppMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

            {/* Header */}
            <View style={{
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 12,
                backgroundColor: colors.bgHeader,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
            }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <TouchableOpacity
                        onPress={() => setMenuVisible(true)}
                        activeOpacity={0.7}
                        style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                    >
                        <View style={{
                            height: 36,
                            width: 36,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 18,
                            backgroundColor: colors.accent,
                            shadowColor: colors.accent,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 4,
                            elevation: 3,
                        }}>
                            <Text style={{ color: isDark ? "#0a0a0a" : "#ffffff", fontWeight: "800", fontSize: 12 }}>TN</Text>
                        </View>
                        <View>
                            <Text style={{ fontWeight: "800", fontSize: 20, color: colors.text, letterSpacing: -0.8 }}>Tech News</Text>
                            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "500" }}>Curadoria diária de tech</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.searchBg,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: colors.searchBorder,
                }}>
                    <Search size={18} color={colors.textMuted} />
                    <TextInput
                        placeholder="Buscar por edição ou tema..."
                        placeholderTextColor={colors.textMuted}
                        value={search}
                        onChangeText={setSearch}
                        style={{
                            flex: 1,
                            height: 42,
                            fontSize: 14,
                            color: colors.text,
                            marginLeft: 8,
                        }}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch("")} style={{ padding: 4 }}>
                            <X size={16} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={{ marginTop: 12, color: colors.textMuted, fontSize: 14 }}>Carregando edições...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredNewsletters}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <View style={{ paddingHorizontal: 16 }}>
                            <NewsCard
                                id={item.id}
                                edition={item.edition_number}
                                title={item.title}
                                date={item.created_at}
                                intro={item.summary_intro}
                                status={item.status}
                                isFirst={index === 0 && !search}
                            />
                        </View>
                    )}
                    contentContainerStyle={{ paddingVertical: 16, gap: 12 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
                    ListEmptyComponent={
                        <View style={{ alignItems: "center", paddingVertical: 60 }}>
                            <View style={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: colors.bgMuted,
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 16,
                            }}>
                                <Newspaper size={28} color={colors.textMuted} />
                            </View>
                            <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: "600" }}>
                                {search ? "Nenhum resultado" : "Nenhuma edição ainda"}
                            </Text>
                            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
                                {search ? `Sem resultados para "${search}"` : "Volte amanhã para a primeira edição!"}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
