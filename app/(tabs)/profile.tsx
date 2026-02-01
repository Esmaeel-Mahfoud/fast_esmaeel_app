import {Image, Text, View} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import CustomButton from "@/components/CustomButton";
import StaffOrders from "@/components/StaffOrders";
import { account } from "@/lib/appwrite";
import { receivers } from "@/constans/receivers";
import {router} from "expo-router";
import useAuthStore from "@/store/auth.store";
import { StyleSheet } from 'react-native';


const Profile = () => {
    const [isStaff, setIsStaff] = useState(false);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuthStore();
    useEffect(() => {
        const initProfile = async () => {
            try {
                const user = await account.get();

                // ✅ بعد التأكد أن المستخدم مسجّل دخول


                setIsStaff(receivers.includes(user.$id));
            } catch (e) {
                console.log("Profile error:", e);
                setIsStaff(false);
            } finally {
                setLoading(false);
            }
        };

        initProfile();
    }, []);

    if (loading) return null;

    return (
        <SafeAreaView className="flex-1 bg-white p-4">
            {isStaff ? (
                <View>
                    <StaffOrders />
                    {/*<CustomButton*/}
                    {/*    title="تسجيل خروج"*/}
                    {/*    onPress={async () => {*/}
                    {/*        await logout();*/}
                    {/*        router.replace("/(auth)/sign-in");*/}
                    {/*    }}*/}
                    {/*/>*/}
                </View>
            ) : (
                <View style={styles.container}>
                    <Image
                        source={require('@/assets/images/icon.png')}
                        style={styles.icon}
                    />
                    <CustomButton
                        title="تسجيل خروج"
                        onPress={async () => {
                            await logout();
                            router.replace("/(auth)/sign-in");
                        }}
                    />

                        <Text style={styles.bottomText1}>للتواصل مع المطعم على الرقم :0996451131</Text>
                        <Text style={styles.bottomText}>-developed by esmaeel mahfoud-</Text>



                </View>
            )}
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center", // عمودي
        alignItems: "center",     // أفقي
    },
    icon: {
        width: 200,                 // عرض مناسب للصورة
        height: 200,                // ارتفاع متناسب
        marginBottom: 20,           // مسافة بين الصورة والزر
        borderRadius: 50,           // إذا بدك صورة دائرية
        resizeMode: 'contain',      // تحافظ على نسبة العرض/الارتفاع
    },


    bottomText1: {
        color: '#555',      // لون خفيف
        fontSize: 14,       // حجم مناسب
        textAlign: 'center',
        lineHeight: 20, // مسافة بين الأسطر
        marginTop:20
    },
    bottomText: {
        color: '#555',      // لون خفيف
        fontSize: 14,       // حجم مناسب
        textAlign: 'center',
        lineHeight: 20, // مسافة بين الأسطر
        marginTop:20
    }

});

export default Profile;
