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

// Assign accent color based on edition number to simulate category theming
function getAccentColor(edition: number, colors: any): string {
    const accents = [colors.categoryIA, colors.categorySEC, colors.categoryDEV];
    return accents[edition % 3];
}

export function NewsCard({ id, edition, title, date, intro, status = "published", isFirst = false }: NewsCardProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const { colors, isDark } = useTheme();
    const { isRead } = useRead();
    const active = isFavorite(id);
    const read = isRead(id);
    const dateObj = new Date(date);
    const accentColor = getAccentColor(edition, colors);

    return (
        <Link href={`/${id}`} asChild>
            <TouchableOpacity
                activeOpacity={0.85}
                style={{
                    marginBottom: 4,
                    borderRadius: 0,
                    backgroundColor: colors.bgCard,
                    borderWidth: 2,
                    borderColor: colors.border,
                    borderTopWidth: 4,
                    borderTopColor: accentColor,
                    overflow: "hidden",
                    opacity: read && !isFirst ? 0.7 : 1,
                }}
            >
                <View style={{ padding: 18 }}>
                    {/* Top Row */}
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Clock size={12} color={colors.textMuted} strokeWidth={1.5} />
                            <Text style={{
                                fontSize: 11,
                                fontWeight: "700",
                                textTransform: "uppercase",
                                letterSpacing: 1,
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
                                    gap: 4,
                                    backgroundColor: "rgba(0,255,65,0.1)",
                                    paddingHorizontal: 8,
                                    paddingVertical: 3,
                                    borderRadius: 0,
                                    borderWidth: 1,
                                    borderColor: "rgba(0,255,65,0.3)",
                                }}>
                                    <CheckCircle size={10} color="#00FF41" strokeWidth={1.5} />
                                    <Text style={{ fontSize: 9, fontWeight: "800", color: "#00FF41", textTransform: "uppercase", letterSpacing: 1 }}>LIDA</Text>
                                </View>
                            )}
                            <View style={{
                                backgroundColor: colors.bgMuted,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 0,
                                borderWidth: 1,
                                borderColor: colors.border,
                            }}>
                                <Text style={{
                                    fontSize: 10,
                                    fontWeight: "800",
                                    color: colors.textMuted,
                                    letterSpacing: 0.5,
                                }}>
                                    #{edition}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(id);
                                }}
                                style={{ padding: 4 }}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Heart
                                    size={18}
                                    color={active ? "#FF0000" : colors.textMuted}
                                    fill={active ? "#FF0000" : "none"}
                                    strokeWidth={1.5}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Title — Heavy brutalist weight */}
                    <Text style={{
                        fontSize: isFirst ? 24 : 18,
                        fontWeight: "900",
                        color: colors.text,
                        lineHeight: isFirst ? 30 : 24,
                        marginBottom: 8,
                        letterSpacing: -0.5,
                    }}>
                        {title}
                    </Text>

                    {/* Intro */}
                    <Text
                        numberOfLines={isFirst ? 3 : 2}
                        style={{
                            fontSize: 14,
                            lineHeight: 22,
                            color: colors.textSecondary,
                            marginBottom: 16,
                        }}
                    >
                        {intro || "Sem descrição disponível."}
                    </Text>

                    {/* CTA — Cyan accent */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                        paddingTop: 14,
                    }}>
                        <Text style={{
                            fontSize: 12,
                            fontWeight: "800",
                            color: accentColor,
                            marginRight: 6,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                        }}>
                            {read ? "Ler novamente" : "Ler edição completa"}
                        </Text>
                        <ArrowRight size={14} color={accentColor} strokeWidth={2} />
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );
}
