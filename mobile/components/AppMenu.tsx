import React from "react";
import { View, Text, TouchableOpacity, Modal, Share, Linking, Platform } from "react-native";
import { Moon, Sun, Share2, Star, Info, X } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useFavorites } from "../context/FavoritesContext";

interface AppMenuProps {
    visible: boolean;
    onClose: () => void;
}

export function AppMenu({ visible, onClose }: AppMenuProps) {
    const { isDark, toggleTheme, colors } = useTheme();
    const { favorites } = useFavorites();

    const handleShareApp = async () => {
        try {
            await Share.share({
                message: "Confira o Tech News — curadoria diária das principais notícias de tecnologia! 🚀",
            });
        } catch (e) {
            console.error(e);
        }
        onClose();
    };

    const handleRateApp = () => {
        const storeUrl = Platform.OS === "ios"
            ? "https://apps.apple.com" // replace with actual app link
            : "https://play.google.com"; // replace with actual app link
        Linking.openURL(storeUrl).catch(() => { });
        onClose();
    };

    const menuItems = [
        {
            icon: isDark ? <Sun size={22} color="#f59e0b" /> : <Moon size={22} color="#6366f1" />,
            label: isDark ? "Modo Claro" : "Modo Escuro",
            sublabel: isDark ? "Trocar para o tema claro" : "Trocar para o tema escuro",
            onPress: () => { toggleTheme(); onClose(); },
            iconBg: isDark ? "#422006" : "#eef2ff",
        },
        {
            icon: <Share2 size={22} color="#0ea5e9" />,
            label: "Compartilhar App",
            sublabel: "Envie para um amigo",
            onPress: handleShareApp,
            iconBg: "#f0f9ff",
        },
        {
            icon: <Star size={22} color="#f59e0b" />,
            label: "Avaliar o App",
            sublabel: "Deixe sua avaliação na loja",
            onPress: handleRateApp,
            iconBg: "#fffbeb",
        },
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity activeOpacity={1} onPress={() => { }}>
                    <View style={{
                        backgroundColor: isDark ? "#171717" : "#ffffff",
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        paddingTop: 12,
                        paddingBottom: Platform.OS === "ios" ? 40 : 24,
                        paddingHorizontal: 20,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 12,
                        elevation: 10,
                    }}>
                        {/* Handle */}
                        <View style={{
                            width: 40,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: isDark ? "#404040" : "#e2e8f0",
                            alignSelf: "center",
                            marginBottom: 16,
                        }} />

                        {/* Header */}
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 20,
                            paddingHorizontal: 4,
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <View style={{
                                    height: 32,
                                    width: 32,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 16,
                                    backgroundColor: colors.accent,
                                }}>
                                    <Text style={{ color: isDark ? "#0a0a0a" : "#ffffff", fontWeight: "800", fontSize: 11 }}>TN</Text>
                                </View>
                                <Text style={{ fontWeight: "700", fontSize: 17, color: colors.text }}>Configurações</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                                <X size={22} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        {/* Menu Items */}
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={item.onPress}
                                activeOpacity={0.7}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingVertical: 14,
                                    paddingHorizontal: 4,
                                    borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                                    borderBottomColor: colors.border,
                                }}
                            >
                                <View style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    backgroundColor: isDark ? "#262626" : item.iconBg,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: 14,
                                }}>
                                    {item.icon}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{item.label}</Text>
                                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{item.sublabel}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}

                        {/* App Info */}
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 20,
                            gap: 6,
                        }}>
                            <Info size={13} color={colors.textMuted} />
                            <Text style={{ fontSize: 12, color: colors.textMuted }}>
                                Tech News v1.0 • {favorites.length} favorito{favorites.length !== 1 ? "s" : ""}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
