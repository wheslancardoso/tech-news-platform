import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";

export default function Login() {
    const { signIn } = useAuth();
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!password) {
            Alert.alert("Erro", "Por favor, insira a senha.");
            return;
        }

        setIsLoading(true);
        try {
            await signIn(password);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }} edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: "#ffffff",
                borderBottomWidth: 1,
                borderBottomColor: "#f1f5f9",
            }}>
                <TouchableOpacity
                    onPress={() => router.replace("/")}
                    style={{ flexDirection: "row", alignItems: "center", padding: 6, marginLeft: -6, borderRadius: 20 }}
                >
                    <ArrowLeft size={22} color="#0f172a" />
                    <Text style={{ marginLeft: 6, fontSize: 15, fontWeight: "600", color: "#0f172a" }}>Voltar</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={{ alignItems: "center" }}>
                        {/* Icon */}
                        <View style={{
                            width: 72,
                            height: 72,
                            borderRadius: 36,
                            backgroundColor: "#0f172a",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 24,
                            shadowColor: "#0f172a",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 5,
                        }}>
                            <Lock size={30} color="#ffffff" />
                        </View>

                        {/* Title */}
                        <Text style={{
                            fontSize: 24,
                            fontWeight: "800",
                            color: "#0f172a",
                            letterSpacing: -0.5,
                            marginBottom: 8,
                        }}>
                            Área Restrita
                        </Text>
                        <Text style={{
                            fontSize: 15,
                            color: "#64748b",
                            textAlign: "center",
                            marginBottom: 36,
                            lineHeight: 22,
                        }}>
                            Apenas para editores autorizados.
                        </Text>

                        {/* Password Input */}
                        <View style={{
                            width: "100%",
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#ffffff",
                            borderRadius: 14,
                            borderWidth: 1.5,
                            borderColor: "#e2e8f0",
                            paddingHorizontal: 16,
                            marginBottom: 16,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.03,
                            shadowRadius: 3,
                            elevation: 1,
                        }}>
                            <Lock size={18} color="#94a3b8" />
                            <TextInput
                                placeholder="Senha de acesso"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                autoCapitalize="none"
                                onSubmitEditing={handleLogin}
                                style={{
                                    flex: 1,
                                    height: 52,
                                    fontSize: 16,
                                    color: "#0f172a",
                                    marginLeft: 12,
                                }}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={{ padding: 4 }}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} color="#94a3b8" />
                                ) : (
                                    <Eye size={20} color="#94a3b8" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.8}
                            style={{
                                width: "100%",
                                height: 52,
                                backgroundColor: "#0f172a",
                                borderRadius: 14,
                                alignItems: "center",
                                justifyContent: "center",
                                shadowColor: "#0f172a",
                                shadowOffset: { width: 0, height: 3 },
                                shadowOpacity: 0.2,
                                shadowRadius: 6,
                                elevation: 4,
                                opacity: isLoading ? 0.6 : 1,
                            }}
                        >
                            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>
                                {isLoading ? "Verificando..." : "Acessar Painel"}
                            </Text>
                        </TouchableOpacity>

                        {/* Footer */}
                        <TouchableOpacity
                            onPress={() => router.replace("/")}
                            style={{ marginTop: 24, padding: 8 }}
                        >
                            <Text style={{ color: "#94a3b8", fontSize: 14 }}>Voltar para Home</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
