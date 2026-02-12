import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Share, Linking } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Share2, ExternalLink, Calendar, Hash } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";

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
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (!newsletter) {
        return (
            <View className="flex-1 items-center justify-center bg-background px-4">
                <Text className="text-muted-foreground mb-4">Newsletter não encontrada.</Text>
                <Button onPress={() => router.back()}>Voltar</Button>
            </View>
        );
    }

    const { content_json } = newsletter;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header with Back Button and Share */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center p-2 -ml-2 rounded-full active:bg-muted"
                >
                    <ArrowLeft size={24} color="#0f172a" />
                    <Text className="ml-1 text-base font-medium text-foreground">Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleShare} className="p-2 rounded-full active:bg-muted">
                    <Share2 size={24} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Newsletter Header */}
                <View className="mb-8 items-center border-b border-dashed border-border pb-8">
                    <View className="flex-row gap-3 mb-4">
                        <View className="flex-row items-center rounded-full border border-border px-3 py-1">
                            <Hash size={12} color="#64748b" className="mr-1" />
                            <Text className="text-xs font-medium text-muted-foreground">Edição #{newsletter.edition_number}</Text>
                        </View>
                        <View className="flex-row items-center rounded-full border border-border px-3 py-1">
                            <Calendar size={12} color="#64748b" className="mr-1" />
                            <Text className="text-xs font-medium text-muted-foreground">
                                {format(new Date(newsletter.created_at), "d MMM, yyyy", { locale: ptBR })}
                            </Text>
                        </View>
                    </View>

                    <Text className="text-3xl font-extrabold text-center text-foreground leading-tight mb-4">
                        {newsletter.title}
                    </Text>

                    <Text className="text-center text-lg text-muted-foreground leading-relaxed">
                        {content_json.intro}
                    </Text>
                </View>

                {/* Quick Takes */}
                {content_json.quickTakes && content_json.quickTakes.length > 0 && (
                    <View className="mb-8 rounded-xl bg-muted/50 p-5">
                        <Text className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                            Destaques Rápidos
                        </Text>
                        {content_json.quickTakes.map((take, index) => (
                            <Text key={index} className="text-base text-foreground mb-2 leading-snug">
                                ⚡ {take}
                            </Text>
                        ))}
                    </View>
                )}

                {/* Categories and Items */}
                {content_json.categories.map((category, catIndex) => (
                    <View key={catIndex} className="mb-10">
                        <Text className="text-xl font-bold text-primary mb-4 border-l-4 border-primary pl-3">
                            {category.name}
                        </Text>

                        {category.items.map((item, itemIndex) => (
                            <View key={itemIndex} className="mb-6 rounded-lg border border-border bg-card p-4 shadow-sm">
                                <Text className="text-lg font-bold text-foreground mb-2 leading-snug">
                                    {item.headline.replace(/^[^\w]+/, '') /* Remove emoji prefix as it might duplicate categories */}
                                </Text>
                                <Text className="text-base text-muted-foreground leading-relaxed mb-4">
                                    {item.story}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => openLink(item.link)}
                                    className="flex-row items-center self-start"
                                >
                                    <Text className="text-sm font-semibold text-primary mr-1">Ler fonte original</Text>
                                    <ExternalLink size={14} color="hsl(var(--primary))" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ))}

                {/* Footer */}
                <View className="mt-8 items-center pt-8 border-t border-border">
                    <Text className="text-muted-foreground text-sm font-medium">Gostou da edição?</Text>
                    <Text className="text-muted-foreground text-xs mt-1">Tech News App v1.0</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
