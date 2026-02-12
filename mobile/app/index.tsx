import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { NewsCard } from "../components/NewsCard";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { useRouter, Stack } from "expo-router";
import { Newspaper } from "lucide-react-native";

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
    const { session, signOut } = useAuth();
    const isAdmin = !!session;
    const router = useRouter();

    const fetchNewsletters = async () => {
        try {
            let query = supabase
                .from("newsletters")
                .select("id, edition_number, title, created_at, summary_intro, status")
                .order("edition_number", { ascending: false });

            if (!isAdmin) {
                query = query.eq("status", "published");
            }

            query = query.limit(20);

            const { data, error } = await query;

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
    }, [isAdmin]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNewsletters();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }} edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 16,
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
                <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => isAdmin ? signOut() : router.push("/login")}
                >
                    {isAdmin ? "Sair" : "Login"}
                </Button>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color="#0f172a" />
                    <Text style={{ marginTop: 12, color: "#94a3b8", fontSize: 14 }}>Carregando edições...</Text>
                </View>
            ) : (
                <FlatList
                    data={newsletters}
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
                                isAdmin={isAdmin}
                                isFirst={index === 0}
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
                            <Text style={{ color: "#64748b", fontSize: 16, fontWeight: "600" }}>Nenhuma edição ainda</Text>
                            <Text style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>Volte amanhã para a primeira edição!</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
