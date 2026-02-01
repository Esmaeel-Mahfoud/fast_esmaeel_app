import {Account, Avatars, Client, Databases, Functions, ID, Query, Storage} from "react-native-appwrite";
import { CreateUserParams, GetMenuParams, SignInParams } from "@/type";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    platform: "com.jsm.fastfood",
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    databaseId: "693e9cf30020f6edaf14",
    bucketId: "69453bb90018256b987e",
    userCollectionId: "user",
    categoriesCollectionId: "categoris",
    menuCollectionId: "menu",
    customizationCollectionId: "customization",
    menuCustomizationCollectionId: "menu_customizations",
    orderCollectionId: "orders",
    pushFunctionUrl: "https://cloud.appwrite.io/v1/functions/696c013100255095f687/executions",
    orderNotificationFunctionId:"696c013100255095f687"
};

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);
export const functions = new Functions(client);

//
// 🔐 SIGN IN (مع تنظيف session قديمة إن وجدت)
//
export const signIn = async ({ email, password }: SignInParams) => {
    try {
        // 🔥 الحل السحري
        try {
            await account.deleteSession("current");
        } catch (_) {
            // ما في session؟ ممتاز، كمّل
        }

        return await account.createEmailPasswordSession(email, password);
    } catch (e: any) {
        throw new Error(e.message || "Failed to sign in");
    }
};

//
// 🆕 CREATE USER + AUTO SIGN IN
//
export const createUser = async ({ email, password, name }: CreateUserParams) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            name
        );

        if (!newAccount) throw new Error("Account creation failed");

        // ✅ Auto sign-in (آمن الآن)
        await signIn({ email, password });

        const avatarUrl = avatars.getInitialsURL(name);

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                email,
                name,
                accountId: newAccount.$id,
                avatar: avatarUrl,
            }
        );

        return newAccount;
    } catch (e: any) {
        throw new Error(e.message || "Failed to create user");
    }
};

//
// 👤 CURRENT USER
//
export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw new Error("No active account");

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        );

        if (!currentUser.documents.length) throw new Error("User not found");

        return currentUser.documents[0];
    } catch (e: any) {
        throw new Error(e.message || "Failed to get current user");
    }
};

//
// 🍔 MENU
//
export const getMenu = async ({ category, query }: GetMenuParams) => {
    try {
        const queries: any[] = [];

        if (category) queries.push(Query.equal("categories", category));
        if (query) queries.push(Query.equal("name", query));

        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries
        );

        return menus.documents;
    } catch (e: any) {
        throw new Error(e.message || "Failed to fetch menu");
    }
};

//
// 🗂️ CATEGORIES
//
export const getCategories = async () => {
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId
        );

        return categories.documents;
    } catch (e: any) {
        throw new Error(e.message || "Failed to fetch categories");
    }
};
