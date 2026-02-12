import { Tabs } from "expo-router";
import { Home, Heart } from "lucide-react-native";
import { View, Platform } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function TabsLayout() {
    const { colors, isDark } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: isDark ? "#fafafa" : "#0f172a",
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.tabBar,
                    borderTopWidth: 1,
                    borderTopColor: colors.tabBorder,
                    height: Platform.OS === "ios" ? 88 : 64,
                    paddingBottom: Platform.OS === "ios" ? 28 : 8,
                    paddingTop: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: isDark ? 0.3 : 0.04,
                    shadowRadius: 8,
                    elevation: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                    marginTop: 2,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={focused ? {
                            backgroundColor: isDark ? "#262626" : "#f1f5f9",
                            borderRadius: 20,
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                        } : undefined}>
                            <Home size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: "Favoritos",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={focused ? {
                            backgroundColor: isDark ? "#2a1515" : "#fef2f2",
                            borderRadius: 20,
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                        } : undefined}>
                            <Heart
                                size={22}
                                color={focused ? "#ef4444" : color}
                                fill={focused ? "#ef4444" : "none"}
                            />
                        </View>
                    ),
                    tabBarActiveTintColor: "#ef4444",
                }}
            />
        </Tabs>
    );
}
