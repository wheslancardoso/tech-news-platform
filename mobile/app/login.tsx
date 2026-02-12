import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Stack, useRouter } from "expo-router";
import { Lock } from "lucide-react-native";

export default function Login() {
    const { signIn } = useAuth();
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!password) {
            Alert.alert("Erro", "Por favor, insira a senha.");
            return;
        }

        setIsLoading(true);
        try {
            await signIn(password);
            // O redirect acontece no AuthContext ou aqui
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                className="bg-background px-6"
                keyboardShouldPersistTaps="handled"
            >
                <View className="items-center justify-center space-y-8">
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <Lock className="text-foreground" size={32} color="#475569" />
                    </View>

                    <View className="items-center space-y-2">
                        <Text className="text-2xl font-bold text-foreground">Área Restrita</Text>
                        <Text className="text-center text-muted-foreground">
                            Apenas para editores autorizados.
                        </Text>
                    </View>

                    <View className="w-full space-y-4">
                        <Input
                            placeholder="Senha de acesso"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            autoCapitalize="none"
                            onSubmitEditing={handleLogin}
                        />

                        <Button onPress={handleLogin} isLoading={isLoading}>
                            Acessar Painel
                        </Button>

                        <TouchableOpacity onPress={() => router.replace("/")} className="items-center mt-4">
                            <Text className="text-muted-foreground">Voltar para Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}
