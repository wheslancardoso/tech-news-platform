import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Detect Expo Go BEFORE importing expo-notifications
const isExpoGo = Constants.appOwnership === "expo";

// Only load expo-notifications in production/dev builds — NOT in Expo Go
let N: typeof import("expo-notifications") | null = null;

if (!isExpoGo) {
    try {
        N = require("expo-notifications");
        N!.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    } catch {
        N = null;
    }
}

export async function registerForPushNotifications(): Promise<string | null> {
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
    if (!N) return;
    try {
        await N.scheduleNotificationAsync({
            content: { title, body, sound: true, data: { type: "new_edition" } },
            trigger: null,
        });
    } catch { }
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
    } catch { }
}
