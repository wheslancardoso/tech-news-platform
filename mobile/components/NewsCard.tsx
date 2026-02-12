import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight } from "lucide-react-native";
import { cn } from "../lib/utils";

interface NewsCardProps {
    id: string;
    edition: number;
    title: string;
    date: string;
    intro?: string;
    status?: "draft" | "published";
    isAdmin?: boolean;
}

export function NewsCard({ id, edition, title, date, intro, status = "published", isAdmin = false }: NewsCardProps) {
    const dateObj = new Date(date);

    return (
        <Link href={`/${id}`} asChild>
            <TouchableOpacity activeOpacity={0.7} className="mb-4 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <View className="p-4">
                    {/* Header */}
                    <View className="mb-3 flex-row items-center justify-between">
                        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {format(dateObj, "d MMM", { locale: ptBR })}
                        </Text>
                        <View className="flex-row items-center gap-2">
                            {status === "draft" && isAdmin && (
                                <View className="h-5 rounded bg-yellow-100 px-2 justify-center">
                                    <Text className="text-[10px] text-yellow-800">Draft</Text>
                                </View>
                            )}
                            <View className="h-5 rounded border border-border px-2 justify-center">
                                <Text className="text-[10px] font-normal text-muted-foreground">#{edition}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Content */}
                    <Text className="mb-2 text-xl font-bold leading-tight text-foreground">
                        {title}
                    </Text>

                    <Text className="mb-4 text-sm leading-relaxed text-muted-foreground" numberOfLines={3}>
                        {intro || "Sem descrição disponível."}
                    </Text>

                    {/* Footer */}
                    <View className="flex-row items-center">
                        <Text className="mr-1 text-xs font-semibold text-primary">Ler edição</Text>
                        <ArrowRight size={12} color="hsl(var(--primary))" />
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );
}
