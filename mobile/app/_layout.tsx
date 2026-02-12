import { Slot } from "expo-router";
import { FavoritesProvider } from "../context/FavoritesContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function Layout() {
    return (
        <ThemeProvider>
            <FavoritesProvider>
                <Slot />
            </FavoritesProvider>
        </ThemeProvider>
    );
}
