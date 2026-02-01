import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { databases, appwriteConfig, account } from '@/lib/appwrite';
import { Query } from "react-native-appwrite";

export type Order = {
    $id: string;
    items: any[] | string;
    total_price: number;
    address: string;
    notes?: string;
    userEmail: string;
    receiverId: string;
    status: 'pending' | 'on_the_way' | 'done';
    assignedStaffId?: string | null;
    $createdAt: string;
};

type Props = {
    order: Order;
    onRefresh: () => void;
};

const normalizeAssignedStaffId = (value: any): string | null => {
    if (value === null) return null;
    if (value === undefined) return null;
    if (value === 'null') return null;
    if (value === '') return null;
    return value;
};

const OrderCard = ({ order, onRefresh }: Props) => {
    const [customerName, setCustomerName] = useState<string>('...');
    const [loading, setLoading] = useState<boolean>(false);

    console.log("🟡 render OrderCard:", {
        orderId: order.$id,
        status: order.status,
        assignedStaffId: order.assignedStaffId,
        normalized: normalizeAssignedStaffId(order.assignedStaffId),
    });

    // ======================
    // تحميل اسم الزبون
    // ======================
    useEffect(() => {
        const loadCustomer = async () => {
            try {
                const res = await databases.listDocuments(
                    appwriteConfig.databaseId,
                    appwriteConfig.userCollectionId,
                    [Query.equal('email', order.userEmail)]
                );

                if (res.documents.length > 0) {
                    setCustomerName(res.documents[0].name);
                } else {
                    setCustomerName('زبون غير معروف');
                }
            } catch (e) {
                console.log("❌ loadCustomer error:", e);
                setCustomerName('خطأ');
            }
        };

        loadCustomer();
    }, [order.userEmail]);

    // ======================
    // تغيير حالة الطلب
    // ======================
    const handleStatusChange = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const authUser = await account.get();
            console.log("🧑‍💼 authUser:", authUser.$id);

            const currentOrder = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.orderCollectionId,
                order.$id
            );

            const assignedStaffId = normalizeAssignedStaffId(
                currentOrder.assignedStaffId
            );

            console.log("📦 order from DB:", {
                status: currentOrder.status,
                assignedStaffId: currentOrder.assignedStaffId,
                normalizedAssigned: assignedStaffId,
            });

            // ❌ الطلب محجوز لموظف آخر
            if (assignedStaffId && assignedStaffId !== authUser.$id) {
                Alert.alert(
                    "الطلب قيد المعالجة",
                    "موظف آخر بدأ بتنفيذ هذا الطلب"
                );
                onRefresh();
                return;
            }

            let nextStatus: Order['status'] | null = null;
            const updatePayload: any = {};

            // 🟢 أول حجز
            if (currentOrder.status === 'pending') {
                nextStatus = 'on_the_way';
                updatePayload.assignedStaffId = authUser.$id;
                // نترك receiverId كما هو "all" ليبقى ظاهراً للجميع
            }

            // 🟢 إنهاء الطلب (فقط نفس الموظف)
            else if (
                currentOrder.status === 'on_the_way' &&
                assignedStaffId === authUser.$id
            ) {
                nextStatus = 'done';
            }

            if (!nextStatus) {
                console.log("⚠️ invalid transition");
                return;
            }

            updatePayload.status = nextStatus;

            console.log("📝 updatePayload:", updatePayload);

            const updatedOrder = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.orderCollectionId,
                order.$id,
                updatePayload
            );

            console.log("✅ updatedOrder:", {
                status: updatedOrder.status,
                assignedStaffId: updatedOrder.assignedStaffId,
            });

            onRefresh();
        } catch (error) {
            console.log("🔥 STATUS UPDATE ERROR:", error);
        } finally {
            setLoading(false);
        }
    };

    // ======================
    // حذف الطلب
    // ======================
    const handleDelete = async () => {
        if (loading) return;
        setLoading(true);

        try {
            await databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.orderCollectionId,
                order.$id
            );
            onRefresh();
        } catch (e) {
            console.log("❌ DELETE ERROR:", e);
        } finally {
            setLoading(false);
        }
    };

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        account.get().then(user => setCurrentUserId(user.$id)).catch(() => {});
    }, []);

    const assignedStaffId = normalizeAssignedStaffId(order.assignedStaffId);
    const isTakenByOther = !!(assignedStaffId && currentUserId && assignedStaffId !== currentUserId);

    const statusLabel =
        order.status === 'pending'
            ? 'بدء التحضير'
            : order.status === 'on_the_way'
                ? (isTakenByOther ? 'قيد التنفيذ من قبل موظف آخر' : 'تم التنفيذ')
                : 'منتهي';

    let parsedItems: any[] = [];
    try {
        if (Array.isArray(order.items)) parsedItems = order.items;
        else parsedItems = JSON.parse(order.items);
    } catch {
        parsedItems = [];
    }

    return (
        <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-end mb-2">
                <TouchableOpacity
                    onPress={handleDelete}
                    disabled={loading}
                    className="bg-red-500 px-3 py-1 rounded-lg"
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text className="text-white text-xs font-bold">
                            حذف
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <Text className="text-lg font-bold mb-1">{customerName}</Text>
            <Text className="text-xs text-gray-400 mb-2">
                {new Date(order.$createdAt).toLocaleString()}
            </Text>

            <Text className="text-gray-600 mb-1">📍 {order.address}</Text>
            {order.notes && (
                <Text className="text-gray-600 mb-1">📝 {order.notes}</Text>
            )}

            <Text className="text-gray-500 mb-3">✉️ {order.userEmail}</Text>

            <View className="mb-3">
                {parsedItems.length === 0 ? (
                    <Text className="text-gray-400 text-sm">
                        لا يوجد عناصر
                    </Text>
                ) : (
                    parsedItems.map((item: any, index: number) => (
                        <Text key={index} className="text-sm">
                            • {item.name} × {item.quantity}
                        </Text>
                    ))
                )}
            </View>

            <Text className="font-bold text-base mb-4">
                💰 {order.total_price} ل.س
            </Text>

            {order.status !== 'done' ? (
                <TouchableOpacity
                    onPress={handleStatusChange}
                    disabled={!!(loading || isTakenByOther)}
                    className={`py-3 rounded-xl ${isTakenByOther ? 'bg-gray-300' : 'bg-black'}`}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white text-center font-bold">
                            {statusLabel}
                        </Text>
                    )}
                </TouchableOpacity>
            ) : (
                <Text className="text-center text-green-600 font-bold">
                    ✅ تم الانتهاء
                </Text>
            )}
        </View>
    );
};

export default OrderCard;