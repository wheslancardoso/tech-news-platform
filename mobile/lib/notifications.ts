import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Lazy-load expo-notifications to avoid crash in Expo Go on Android
let Notifications: typeof import("expo-notifications") | null = null;

function getNotifications() {
    if (!Notifications) {
        try {
            Notifications = require("expo-notifications");
        } catch {
            return null;
        }
    }
    return Notifications;
}

// Try to configure notification handler (fails silently in Expo Go)
try {
    const N = getNotifications();
    if (N) {
        N.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    }
} catch {
    // Silently fail in Expo Go
}

const isExpoGo = Constants.appOwnership === "expo";

export async function registerForPushNotifications(): Promise<string | null> {
    // Skip entirely in Expo Go — push tokens don't work
    if (isExpoGo) {
        console.log("Notifications: skipped in Expo Go. Will work in production build.");
        return null;
    }

    const N = getNotifications();
    if (!N) return null;

    try {
        const { status: existingStatus } = await N.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await N.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") return null;

        if (Platform.OS === "android") {
            await N.setNotificationChannelAsync("default", {
                name: "Tech News",
                importance: N.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#0f172a",
            });
        }

        const token = (await N.getExpoPushTokenAsync()).data;
        await AsyncStorage.setItem("pushToken", token);
        return token;
    } catch {
        return null;
    }
}

export async function sendLocalNotification(title: string, body: string) {
    if (isExpoGo) return;
    const N = getNotifications();
    if (!N) return;

    try {
        await N.scheduleNotificationAsync({
            content: { title, body, sound: true, data: { type: "new_edition" } },
            trigger: null,
        });
    } catch {
        // Silently fail
    }
}

export async function checkAndNotifyNewEdition(latestEditionNumber: number) {
    try {
        const lastSeenStr = await AsyncStorage.getItem("lastSeenEdition");
        const lastSeen = lastSeenStr ? parseInt(lastSeenStr, 10) : 0;

        if (latestEditionNumber > lastSeen) {
            await AsyncStorage.setItem("lastSeenEdition", String(latestEditionNumber));
            if (lastSeen > 0) {
                await sendLocalNotification(
                    "🚀 Nova edição disponível!",
                    `A edição #${latestEditionNumber} do Tech News acabou de ser publicada. Confira!`
                );
            }
        }
    } catch {
        // Silently fail
    }
}
