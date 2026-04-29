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
                message: "Confira o Fresh News — curadoria diária das principais notícias de tecnologia! 🚀",
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
            icon: isDark ? <Sun size={20} color="#00F0FF" strokeWidth={1.5} /> : <Moon size={20} color="#00F0FF" strokeWidth={1.5} />,
            label: isDark ? "MODO CLARO" : "MODO ESCURO",
            sublabel: isDark ? "Trocar para o tema claro" : "Trocar para o tema escuro",
            onPress: () => { toggleTheme(); onClose(); },
            accentColor: "#00F0FF",
        },
        {
            icon: <Share2 size={20} color="#00FF41" strokeWidth={1.5} />,
            label: "COMPARTILHAR",
            sublabel: "Envie para um amigo",
            onPress: handleShareApp,
            accentColor: "#00FF41",
        },
        {
            icon: <Star size={20} color="#FF0000" strokeWidth={1.5} />,
            label: "AVALIAR APP",
            sublabel: "Deixe sua avaliação na loja",
            onPress: handleRateApp,
            accentColor: "#FF0000",
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
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity activeOpacity={1} onPress={() => { }}>
                    <View style={{
                        backgroundColor: "#111111",
                        borderTopWidth: 2,
                        borderTopColor: "#1A1A1A",
                        paddingTop: 16,
                        paddingBottom: Platform.OS === "ios" ? 40 : 24,
                        paddingHorizontal: 20,
                    }}>
                        {/* Handle — Sharp */}
                        <View style={{
                            width: 40,
                            height: 3,
                            backgroundColor: "#1A1A1A",
                            alignSelf: "center",
                            marginBottom: 20,
                        }} />

                        {/* Header */}
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 20,
                            paddingBottom: 16,
                            borderBottomWidth: 2,
                            borderBottomColor: "#1A1A1A",
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <View style={{
                                    width: 4,
                                    height: 22,
                                    backgroundColor: "#00F0FF",
                                }} />
                                <Text style={{
                                    fontWeight: "900",
                                    fontSize: 16,
                                    color: "#E5E2E1",
                                    textTransform: "uppercase",
                                    letterSpacing: 1,
                                }}>Configurações</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                                <X size={20} color="#849495" strokeWidth={1.5} />
                            </TouchableOpacity>
                        </View>

                        {/* Menu Items — Brutalist */}
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
                                    borderBottomColor: "#1A1A1A",
                                }}
                            >
                                <View style={{
                                    width: 44,
                                    height: 44,
                                    backgroundColor: "#1A1A1A",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: 14,
                                    borderWidth: 1,
                                    borderColor: "#2A2A2A",
                                }}>
                                    {item.icon}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: "800",
                                        color: "#E5E2E1",
                                        letterSpacing: 0.5,
                                    }}>{item.label}</Text>
                                    <Text style={{ fontSize: 11, color: "#849495", marginTop: 2 }}>{item.sublabel}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}

                        {/* App Info */}
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 20,
                            paddingTop: 16,
                            borderTopWidth: 1,
                            borderTopColor: "#1A1A1A",
                            gap: 6,
                        }}>
                            <Info size={12} color="#849495" strokeWidth={1.5} />
                            <Text style={{ fontSize: 10, color: "#849495", textTransform: "uppercase", letterSpacing: 1 }}>
                                Fresh News v1.0 • {favorites.length} favorito{favorites.length !== 1 ? "s" : ""}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
