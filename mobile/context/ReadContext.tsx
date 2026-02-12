import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ReadContextType = {
    readItems: string[];
    markAsRead: (id: string) => void;
    isRead: (id: string) => boolean;
};

const ReadContext = createContext<ReadContextType>({
    readItems: [],
    markAsRead: () => { },
    isRead: () => false,
});

export const useRead = () => useContext(ReadContext);

export function ReadProvider({ children }: { children: React.ReactNode }) {
    const [readItems, setReadItems] = useState<string[]>([]);

    useEffect(() => {
        AsyncStorage.getItem("readItems").then((stored) => {
            if (stored) setReadItems(JSON.parse(stored));
        });
    }, []);

    const markAsRead = async (id: string) => {
        if (readItems.includes(id)) return;
        const updated = [...readItems, id];
        setReadItems(updated);
        await AsyncStorage.setItem("readItems", JSON.stringify(updated));
    };

    const isRead = (id: string) => readItems.includes(id);

    return (
        <ReadContext.Provider value={{ readItems, markAsRead, isRead }}>
            {children}
        </ReadContext.Provider>
    );
}
