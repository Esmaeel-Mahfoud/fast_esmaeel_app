import { SplashScreen, Stack } from "expo-router";
import "./globals.css";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import useAuthStore from "@/store/auth.store";
import { configureNotifications } from "@/lib/notifications";
import { savePushTokenForCurrentUser } from "@/lib/savePushToken";
import Constants from "expo-constants";

/* ---------- Notifications handler (لا يتغير) ---------- */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { fetchAuthenticatedUser } = useAuthStore();
  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    "QuickSand-Bold": require("../assets/fonts/Quicksand-Bold.ttf"),
    "QuickSand-Medium": require("../assets/fonts/Quicksand-Medium.ttf"),
    "QuickSand-Regular": require("../assets/fonts/Quicksand-Regular.ttf"),
    "QuickSand-SemiBold": require("../assets/fonts/Quicksand-SemiBold.ttf"),
    "QuickSand-Light": require("../assets/fonts/Quicksand-Light.ttf"),
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  /* ---------- المرحلة الحرجة (تأثر على الواجهة) ---------- */
  useEffect(() => {
    const prepare = async () => {
      try {
        await Promise.all([
          fetchAuthenticatedUser(),
          new Promise((res) => {
            if (fontsLoaded) res(true);
          }),
        ]);
      } finally {
        await SplashScreen.hideAsync();
        setAppReady(true);
      }
    };

    if (fontsLoaded) prepare();
  }, [fontsLoaded]);

  /* ---------- المرحلة الثانوية (خلف الكواليس) ---------- */
  useEffect(() => {
    if (!appReady) return;

    const initNotifications = async () => {
      try {
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            sound: "default",
          });
        }

        const { status } = await Notifications.getPermissionsAsync();
        let finalStatus = status;

        if (status !== "granted") {
          const res = await Notifications.requestPermissionsAsync();
          finalStatus = res.status;
        }

        if (finalStatus === "granted") {
          const projectId =
              Constants.expoConfig?.extra?.eas?.projectId ||
              Constants.easConfig?.projectId;

          const token = (
              await Notifications.getExpoPushTokenAsync({ projectId })
          ).data;

          if (token) {
            await savePushTokenForCurrentUser();
          }
        }

        configureNotifications();
      } catch (e) {
        console.log("❌ Notifications init error:", e);
      }
    };

    initNotifications();
  }, [appReady]);

  if (!appReady) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
