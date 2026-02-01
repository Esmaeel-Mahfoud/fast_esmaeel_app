import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { databases, account } from "@/lib/appwrite";
import {Query} from "react-native-appwrite";


export async function savePushTokenForCurrentUser(token: string) {
    try {
        // 1️⃣ السماحية
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
            console.log("❌ Push permission not granted");
            return;
        }

        // 2️⃣ projectId
        const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ||
            Constants.easConfig?.projectId;

        if (!projectId) {
            console.log("❌ Missing EAS projectId");
            return;
        }

        // 3️⃣ token
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        const token = tokenData.data;

        if (!token) {
            console.log("❌ Failed to get Expo push token");
            return;
        }

        console.log("🔔 Got Expo push token:", token);

        // 4️⃣ user auth
        const user = await account.get();
        if (!user?.$id) {
            console.log("❌ No authenticated user");
            return;
        }

        // 5️⃣ Appwrite IDs
        const databaseId =
            Constants.expoConfig?.extra?.EXPO_PUBLIC_DATABASE_ID;

        const usersCollectionId =
            Constants.expoConfig?.extra?.EXPO_PUBLIC_USERS_COLLECTION_ID;

        if (!databaseId || !usersCollectionId) {
            console.log("❌ Missing Appwrite IDs in extra:", {
                databaseId,
                usersCollectionId,
            });
            return;
        }

        // 6️⃣ جيب document تبع المستخدم عن طريق accountId
        const list = await databases.listDocuments(
            databaseId,
            usersCollectionId,
            [Query.equal("accountId", user.$id)]
        );

        if (list.total === 0) {
            console.log("❌ No user document found for accountId:", user.$id);
            return;
        }

        const userDoc = list.documents[0];

        // 7️⃣ حدّث document الصح
        await databases.updateDocument(
            databaseId,
            usersCollectionId,
            userDoc.$id, // ✅ الـ ID الصح
            { expoPushToken: token }
        );

        console.log("💾 Push token saved to Appwrite");
    } catch (err) {
        console.log("❌ Error saving push token:", err);
    }
}
