import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { NewsCard } from "../components/NewsCard";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { useRouter, Stack } from "expo-router";

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

            query = query.limit(10);

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
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
                <View className="flex-row items-center gap-2">
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-black">
                        <Text className="text-xs font-bold text-white">TN</Text>
                    </View>
                    <Text className="text-xl font-bold text-foreground tracking-tighter">Tech News</Text>
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
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : (
                <FlatList
                    data={newsletters}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View className="px-4">
                            <NewsCard
                                id={item.id}
                                edition={item.edition_number}
                                title={item.title}
                                date={item.created_at}
                                intro={item.summary_intro}
                                status={item.status}
                                isAdmin={isAdmin}
                            />
                        </View>
                    )}
                    contentContainerStyle={{ paddingVertical: 16, gap: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View className="items-center py-10">
                            <Text className="text-muted-foreground">Nenhuma edição encontrada.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
