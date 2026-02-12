import { Slot } from "expo-router";
import { FavoritesProvider } from "../context/FavoritesContext";

export default function Layout() {
    return (
        <FavoritesProvider>
            <Slot />
        </FavoritesProvider>
    );
}
