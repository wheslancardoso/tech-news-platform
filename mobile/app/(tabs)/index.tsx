import { View, Text, FlatList, ActivityIndicator, RefreshControl, TextInput } from "react-native";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { NewsCard } from "../../components/NewsCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Newspaper, Search, X } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

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

    const fetchNewsletters = async () => {
        try {
            const { data, error } = await supabase
                .from("newsletters")
                .select("id, edition_number, title, created_at, summary_intro, status")
                .eq("status", "published")
                .order("edition_number", { ascending: false })
                .limit(30);

            if (error) throw error;
            if (data) setNewsletters(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNewsletters();
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
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }} edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={{
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 12,
                backgroundColor: "#ffffff",
                borderBottomWidth: 1,
                borderBottomColor: "#f1f5f9",
            }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <View style={{
                            height: 36,
                            width: 36,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 18,
                            backgroundColor: "#0f172a",
                            shadowColor: "#0f172a",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 4,
                            elevation: 3,
                        }}>
                            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>TN</Text>
                        </View>
                        <View>
                            <Text style={{ fontWeight: "800", fontSize: 20, color: "#0f172a", letterSpacing: -0.8 }}>Tech News</Text>
                            <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: "500" }}>Curadoria diária de tech</Text>
                        </View>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f8fafc",
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: "#f1f5f9",
                }}>
                    <Search size={18} color="#94a3b8" />
                    <TextInput
                        placeholder="Buscar por edição ou tema..."
                        placeholderTextColor="#94a3b8"
                        value={search}
                        onChangeText={setSearch}
                        style={{
                            flex: 1,
                            height: 42,
                            fontSize: 14,
                            color: "#0f172a",
                            marginLeft: 8,
                        }}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch("")} style={{ padding: 4 }}>
                            <X size={16} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color="#0f172a" />
                    <Text style={{ marginTop: 12, color: "#94a3b8", fontSize: 14 }}>Carregando edições...</Text>
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
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f172a" />}
                    ListEmptyComponent={
                        <View style={{ alignItems: "center", paddingVertical: 60 }}>
                            <View style={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: "#f1f5f9",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 16,
                            }}>
                                <Newspaper size={28} color="#94a3b8" />
                            </View>
                            <Text style={{ color: "#64748b", fontSize: 16, fontWeight: "600" }}>
                                {search ? "Nenhum resultado" : "Nenhuma edição ainda"}
                            </Text>
                            <Text style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
                                {search ? `Sem resultados para "${search}"` : "Volte amanhã para a primeira edição!"}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
