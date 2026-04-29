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
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.tabBar,
                    borderTopWidth: 2,
                    borderTopColor: colors.tabBorder,
                    height: Platform.OS === "ios" ? 88 : 64,
                    paddingBottom: Platform.OS === "ios" ? 28 : 8,
                    paddingTop: 8,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "800",
                    marginTop: 4,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Feed",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={focused ? {
                            backgroundColor: "rgba(0,240,255,0.08)",
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            borderRadius: 0,
                            borderWidth: 1,
                            borderColor: "rgba(0,240,255,0.2)",
                        } : undefined}>
                            <Home size={20} color={color} strokeWidth={1.5} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: "Salvos",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={focused ? {
                            backgroundColor: "rgba(255,0,0,0.08)",
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            borderRadius: 0,
                            borderWidth: 1,
                            borderColor: "rgba(255,0,0,0.2)",
                        } : undefined}>
                            <Heart
                                size={20}
                                color={focused ? "#FF0000" : color}
                                fill={focused ? "#FF0000" : "none"}
                                strokeWidth={1.5}
                            />
                        </View>
                    ),
                    tabBarActiveTintColor: "#FF0000",
                }}
            />
        </Tabs>
    );
}
