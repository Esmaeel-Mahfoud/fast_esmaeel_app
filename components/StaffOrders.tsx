import { View, FlatList, RefreshControl, Text } from "react-native";
import { useEffect, useState } from "react";
import { databases, account, appwriteConfig } from "@/lib/appwrite";
import { Query } from "react-native-appwrite";
import OrderCard from "@/components/OrderCard";
import {Order} from "@/types/order";
import useAuthStore from "@/store/auth.store";
import CustomButton from "@/components/CustomButton";
import {router} from "expo-router";

const StaffOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const { logout } = useAuthStore();
    const fetchOrders = async () => {
        try {
            const authUser = await account.get();

            const res = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.orderCollectionId,
                [] // جلب جميع الطلبات لضمان ظهورها للموظفين
            );

            setOrders(res.documents as unknown as Order[]);
        } catch (e) {
            console.log("Fetch orders error:", e);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <FlatList
            data={orders}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
                <OrderCard order={item} onRefresh={fetchOrders} />
            )}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />
            }
            ListHeaderComponent={
                <CustomButton
                    title="تسجيل خروج"
                    onPress={async () => {
                        await logout();
                        router.replace("/(auth)/sign-in");
                    }}
                />
            }
            ListEmptyComponent={
                <Text className="text-center mt-10 text-gray-400">
                    No orders yet
                </Text>
            }
            contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
        />
    );
};

export default StaffOrders;