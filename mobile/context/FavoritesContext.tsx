import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FavoritesContextType = {
    favorites: string[];
    toggleFavorite: (id: string) => Promise<void>;
    isFavorite: (id: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType>({
    favorites: [],
    toggleFavorite: async () => { },
    isFavorite: () => false,
});

export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        const loadFavorites = async () => {
            const stored = await AsyncStorage.getItem("favorites");
            if (stored) {
                setFavorites(JSON.parse(stored));
            }
        };
        loadFavorites();
    }, []);

    const toggleFavorite = async (id: string) => {
        let newFavorites;
        if (favorites.includes(id)) {
            newFavorites = favorites.filter(favId => favId !== id);
        } else {
            newFavorites = [...favorites, id];
        }
        setFavorites(newFavorites);
        await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites));
    };

    const isFavorite = (id: string) => favorites.includes(id);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}
