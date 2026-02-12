import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, Heart, Clock, CheckCircle } from "lucide-react-native";
import { useFavorites } from "../context/FavoritesContext";
import { useTheme } from "../context/ThemeContext";
import { useRead } from "../context/ReadContext";

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
    const { colors, isDark } = useTheme();
    const { isRead } = useRead();
    const active = isFavorite(id);
    const read = isRead(id);
    const dateObj = new Date(date);

    const cardBg = isFirst
        ? (isDark ? "#1e1e1e" : "#0f172a")
        : (isDark ? "#171717" : "#ffffff");

    const isFirstOrDark = isFirst || isDark;

    return (
        <Link href={`/${id}`} asChild>
            <TouchableOpacity
                activeOpacity={0.7}
                style={{
                    marginBottom: 4,
                    borderRadius: 16,
                    backgroundColor: cardBg,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isFirst ? 0.15 : (isDark ? 0.3 : 0.06),
                    shadowRadius: isFirst ? 8 : 4,
                    elevation: isFirst ? 4 : 2,
                    borderWidth: isDark && !isFirst ? 1 : 0,
                    borderColor: colors.border,
                    overflow: "hidden",
                    opacity: read && !isFirst ? 0.75 : 1,
                }}
            >
                <View style={{ padding: 18 }}>
                    {/* Top Row */}
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Clock size={12} color={colors.textMuted} />
                            <Text style={{
                                fontSize: 12,
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                color: colors.textMuted,
                            }}>
                                {format(dateObj, "d MMM", { locale: ptBR })}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            {/* Read Badge */}
                            {read && (
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 3,
                                    backgroundColor: isFirst ? "rgba(34,197,94,0.15)" : (isDark ? "rgba(34,197,94,0.15)" : "#f0fdf4"),
                                    paddingHorizontal: 8,
                                    paddingVertical: 3,
                                    borderRadius: 6,
                                }}>
                                    <CheckCircle size={10} color="#22c55e" />
                                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#22c55e" }}>LIDA</Text>
                                </View>
                            )}
                            <View style={{
                                backgroundColor: isFirst ? "#1e293b" : colors.bgMuted,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 8,
                            }}>
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: "700",
                                    color: isFirstOrDark ? "#94a3b8" : "#64748b",
                                }}>
                                    #{edition}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(id);
                                }}
                                style={{ padding: 4, borderRadius: 20 }}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Heart
                                    size={18}
                                    color={active ? "#ef4444" : colors.textMuted}
                                    fill={active ? "#ef4444" : "none"}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={{
                        fontSize: isFirst ? 22 : 18,
                        fontWeight: "800",
                        color: isFirstOrDark ? "#ffffff" : "#0f172a",
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
                            color: isFirstOrDark ? "#94a3b8" : "#64748b",
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
                            color: isFirst ? "#38bdf8" : (isDark ? "#60a5fa" : "#0f172a"),
                            marginRight: 4,
                        }}>
                            {read ? "Ler novamente" : "Ler edição completa"}
                        </Text>
                        <ArrowRight size={14} color={isFirst ? "#38bdf8" : (isDark ? "#60a5fa" : "#0f172a")} />
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );
}
