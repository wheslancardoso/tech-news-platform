import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotifications(): Promise<string | null> {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            console.log("Push notification permission not granted");
            return null;
        }

        // For Android, set notification channel
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "Tech News",
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#0f172a",
            });
        }

        // Get Expo push token (works with Expo Go)
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        await AsyncStorage.setItem("pushToken", token);
        console.log("Push token:", token);
        return token;
    } catch (error) {
        console.log("Error getting push token:", error);
        return null;
    }
}

// Schedule a local notification (useful for testing)
export async function sendLocalNotification(title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
            data: { type: "new_edition" },
        },
        trigger: null, // immediate
    });
}

// Check for new editions and notify (can be called periodically)
export async function checkAndNotifyNewEdition(latestEditionNumber: number) {
    const lastSeenStr = await AsyncStorage.getItem("lastSeenEdition");
    const lastSeen = lastSeenStr ? parseInt(lastSeenStr, 10) : 0;

    if (latestEditionNumber > lastSeen) {
        await AsyncStorage.setItem("lastSeenEdition", String(latestEditionNumber));

        // Only notify if we've seen at least one edition before (not first launch)
        if (lastSeen > 0) {
            await sendLocalNotification(
                "🚀 Nova edição disponível!",
                `A edição #${latestEditionNumber} do Tech News acabou de ser publicada. Confira!`
            );
        }
    }
}
