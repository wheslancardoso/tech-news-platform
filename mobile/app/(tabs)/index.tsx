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

            {/* Brutalist Header */}
            <View style={{
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 16,
                backgroundColor: colors.bgHeader,
                borderBottomWidth: 2,
                borderBottomColor: colors.border,
            }}>
                <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    activeOpacity={0.7}
                    style={{ marginBottom: 16 }}
                >
                    <Text style={{
                        fontWeight: "900",
                        fontSize: 28,
                        color: colors.text,
                        letterSpacing: -1.5,
                        textTransform: "uppercase",
                    }}>FRESH NEWS</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
                        <View style={{
                            width: 8,
                            height: 8,
                            backgroundColor: colors.accent,
                        }} />
                        <Text style={{
                            fontSize: 11,
                            color: colors.textMuted,
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: 2,
                        }}>Curadoria diária de tech</Text>
                    </View>
                </TouchableOpacity>

                {/* Brutalist Search Bar */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.searchBg,
                    paddingHorizontal: 12,
                    borderWidth: 2,
                    borderColor: colors.searchBorder,
                    borderRadius: 0,
                }}>
                    <Search size={16} color={colors.textMuted} strokeWidth={1.5} />
                    <TextInput
                        placeholder="Buscar por edição ou tema..."
                        placeholderTextColor={colors.textMuted}
                        value={search}
                        onChangeText={setSearch}
                        style={{
                            flex: 1,
                            height: 44,
                            fontSize: 14,
                            color: colors.text,
                            marginLeft: 10,
                        }}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch("")} style={{ padding: 4 }}>
                            <X size={16} color={colors.textMuted} strokeWidth={1.5} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={{ marginTop: 12, color: colors.textMuted, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Carregando edições...</Text>
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
                                backgroundColor: colors.bgMuted,
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 16,
                                borderWidth: 2,
                                borderColor: colors.border,
                            }}>
                                <Newspaper size={28} color={colors.textMuted} strokeWidth={1.5} />
                            </View>
                            <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>
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
