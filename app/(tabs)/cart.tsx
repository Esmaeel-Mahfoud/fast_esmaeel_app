import {
    View,
    Text,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import CustomHeader from "@/components/CustomHeader";
import CustomButton from "@/components/CustomButton";
import CartItem from "@/components/CartItem";

import { useCartStore } from "@/store/cart.stor";
import { receivers } from "@/constans/receivers";
import { account, appwriteConfig, databases, functions } from "@/lib/appwrite";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DELIVERY_FEE = 40;

const Cart = () => {
    const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore();
    const [address, setAddress] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();
    const insets = useSafeAreaInsets();

    const handleOrderNow = async () => {
        if (items.length === 0) {
            Alert.alert("السلة فارغة", "أضف منتجات قبل الطلب");
            return;
        }

        if (!address.trim()) {
            Alert.alert("العنوان فارغ", "يرجى إدخال عنوان التوصيل");
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            const authUser = await account.get();
            console.log("✅ Authenticated user:", authUser.email);

            const payload = {
                items: JSON.stringify(items),
                total_price: totalPrice + DELIVERY_FEE,
                address,
                notes,
                userEmail: authUser.email,
                status: "pending",
            };

            console.log("📦 Creating single order for all staff");

            const orderDoc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.orderCollectionId,
                "unique()",
                {
                    ...payload,
                    receiverId: "all", // نضع قيمة عامة أو نتركها فارغة لتعني أن الطلب متاح للجميع
                }
            );

            console.log("✅ Order created:", orderDoc.$id);

            // 🔔 إرسال إشعار لجميع الموظفين بأن هناك طلب جديد
            try {
                console.log("🚀 Calling push function for new order notification");
                await functions.createExecution(
                    appwriteConfig.orderNotificationFunctionId,
                    JSON.stringify({
                        orderId: orderDoc.$id,
                        newStatus: "new_order", // حالة خاصة لتعني إشعار الموظفين
                        receivers: receivers, // نرسل قائمة الموظفين للوظيفة البرمجية
                    })
                );
                console.log("✅ Push function executed for new order");
            } catch (fnErr) {
                console.error("❌ Push function error:", fnErr);
            }

            Alert.alert(
                "تم الطلب",
                "سيتم التواصل معك في حال وجود أي استفسار"
            );

            clearCart();
            setAddress("");
            setNotes("");
        } catch (e) {
            console.error("❌ Order error:", e);
            Alert.alert("خطأ", "فشل إرسال الطلب");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="bg-white flex-1">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <KeyboardAwareScrollView
                    keyboardShouldPersistTaps="handled"
                    enableOnAndroid
                    extraScrollHeight={120}
                    contentContainerStyle={{
                        padding: 20,
                        paddingBottom: insets.bottom + 120,
                        flexGrow: 1,
                    }}
                >
                    <CustomHeader title="السلة" />

                    {items.length === 0 && (
                        <Text className="text-center text-gray-300 mt-10">
                            السلة فارغة
                        </Text>
                    )}

                    {items.map((item) => (
                        <CartItem key={item.id} item={item} />
                    ))}

                    {totalItems > 0 && (
                        <View className="mt-6 border border-gray-200 p-5 rounded-2xl">
                            <Text className="text-lg font-bold mb-4">
                                Payment Summary
                            </Text>

                            <View className="flex-row justify-between mb-2">
                                <Text>عدد العناصر</Text>
                                <Text>{totalItems}</Text>
                            </View>

                            <View className="flex-row justify-between mb-2">
                                <Text>المجموع</Text>
                                <Text>{totalPrice} ل.س</Text>
                            </View>

                            <View className="flex-row justify-between mb-4">
                                <Text>التوصيل</Text>
                                <Text>{DELIVERY_FEE} ل.س</Text>
                            </View>
                            <View>
                                <Text>العنوان الحالي</Text>
                                <TextInput
                                    placeholder="العنوان الحالي"
                                    value={address}
                                    onChangeText={setAddress}
                                    className="border border-gray-300 rounded-xl p-3 mb-3"
                                />
                            </View>
                            <View>
                                <Text>ملاحظات</Text>
                            <TextInput
                                placeholder="ملاحظات (اختياري)"
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                className="border border-gray-300 rounded-xl p-3 mb-4"
                            />
                            </View>
                            <View className="flex-row justify-between border-t pt-3">
                                <Text className="font-bold">الإجمالي</Text>
                                <Text className="font-bold">
                                    {totalPrice + DELIVERY_FEE} ل.س
                                </Text>
                            </View>
                        </View>
                    )}

                    {totalItems > 0 && (
                        <View className="mt-6">
                            <CustomButton
                                title={
                                    loading ? "جارٍ إرسال الطلب..." : "اطلب الان"
                                }
                                onPress={handleOrderNow}
                                disabled={loading}
                            />
                        </View>
                    )}
                </KeyboardAwareScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Cart;
