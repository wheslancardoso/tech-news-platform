import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, Heart, Clock } from "lucide-react-native";
import { useFavorites } from "../context/FavoritesContext";

interface NewsCardProps {
    id: string;
    edition: number;
    title: string;
    date: string;
    intro?: string;
    status?: "draft" | "published";
    isFirst?: boolean;
}

export function NewsCard({ id, edition, title, date, intro, status = "published", isFirst = false }: NewsCardProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const active = isFavorite(id);
    const dateObj = new Date(date);

    return (
        <Link href={`/${id}`} asChild>
            <TouchableOpacity
                activeOpacity={0.7}
                style={{
                    marginBottom: 4,
                    borderRadius: 16,
                    backgroundColor: isFirst ? "#0f172a" : "#ffffff",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isFirst ? 0.15 : 0.06,
                    shadowRadius: isFirst ? 8 : 4,
                    elevation: isFirst ? 4 : 2,
                    overflow: "hidden",
                }}
            >
                <View style={{ padding: 18 }}>
                    {/* Top Row: Date + Badges */}
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Clock size={12} color={isFirst ? "#94a3b8" : "#94a3b8"} />
                            <Text style={{
                                fontSize: 12,
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                color: isFirst ? "#94a3b8" : "#94a3b8",
                            }}>
                                {format(dateObj, "d MMM", { locale: ptBR })}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>

                            <View style={{
                                backgroundColor: isFirst ? "#1e293b" : "#f1f5f9",
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 8,
                            }}>
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: "700",
                                    color: isFirst ? "#cbd5e1" : "#64748b",
                                }}>
                                    #{edition}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(id);
                                }}
                                style={{
                                    padding: 4,
                                    borderRadius: 20,
                                }}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Heart
                                    size={18}
                                    color={active ? "#ef4444" : (isFirst ? "#475569" : "#94a3b8")}
                                    fill={active ? "#ef4444" : "none"}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={{
                        fontSize: isFirst ? 22 : 18,
                        fontWeight: "800",
                        color: isFirst ? "#ffffff" : "#0f172a",
                        lineHeight: isFirst ? 28 : 24,
                        marginBottom: 8,
                        letterSpacing: -0.3,
                    }}>
                        {title}
                    </Text>

                    {/* Intro */}
                    <Text
                        numberOfLines={isFirst ? 3 : 2}
                        style={{
                            fontSize: 14,
                            lineHeight: 21,
                            color: isFirst ? "#94a3b8" : "#64748b",
                            marginBottom: 16,
                        }}
                    >
                        {intro || "Sem descrição disponível."}
                    </Text>

                    {/* CTA */}
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={{
                            fontSize: 13,
                            fontWeight: "700",
                            color: isFirst ? "#38bdf8" : "#0f172a",
                            marginRight: 4,
                        }}>
                            Ler edição completa
                        </Text>
                        <ArrowRight size={14} color={isFirst ? "#38bdf8" : "#0f172a"} />
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );
}
