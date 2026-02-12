import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { FavoritesProvider } from "../context/FavoritesContext";

export default function Layout() {
    return (
        <AuthProvider>
            <FavoritesProvider>
                <Slot />
            </FavoritesProvider>
        </AuthProvider>
    );
}
