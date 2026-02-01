import {
    Modal,
    View,
    Text,
    Image,
    ActivityIndicator,
    Pressable,
    BackHandler, TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite";
import {useCartStore} from "@/store/cart.stor";

type Props = {
    visible: boolean;
    productId: string | null;
    onClose: () => void;
};

export default function ProductDetailsModal({
                                                visible,
                                                productId,
                                                onClose,
                                            }: Props) {
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState<any>(null);
    const { addItem } = useCartStore();
    // جلب البيانات من Appwrite
    useEffect(() => {
        if (!visible || !productId) return;

        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await databases.getDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.menuCollectionId,
                    productId
                );
                setProduct(res);
            } catch (error) {
                console.log("Appwrite error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [visible, productId]);

    // إغلاق المودال بزر الرجوع (Android)
    useEffect(() => {
        if (!visible) return;

        const backAction = () => {
            onClose();
            return true; // نمنع الرجوع الافتراضي
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [visible, onClose]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose} // مهم لأندرويد
        >
            <View className="flex-1 bg-black/60 justify-center items-center">
                <View className="bg-white w-[92%] rounded-2xl p-4">

                    {loading && (
                        <ActivityIndicator size="large" className="color-primary" />
                    )}

                    {!loading && product && (
                        <>
                            {/* الصورة + الاسم */}
                            <View className="flex-row-reverse items-center mb-4">
                                <Image
                                    source={{ uri: product.image_url }}
                                    className="w-24 h-24 rounded-xl ml-4"
                                    resizeMode="contain"
                                />

                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-dark-100">
                                        {product.name}
                                    </Text>
                                </View>
                            </View>

                            {/* الوصف */}
                            <Text className="text-gray-600 mb-6 leading-5">
                                {product.description}
                            </Text>

                            {/* زر Add to Cart (رسم فقط) */}
                            <TouchableOpacity
                                onPress={() =>
                                    addItem({id: product.$id, name: product.name, price: product.price, image_url: product.image_url, customizations: [] })
                                }
                            >
                                <Text className="text-center paragraph-bold text-primary">اضف الى السلة +</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* إغلاق */}
                    <Pressable onPress={onClose} className="mt-4">
                        <Text className="text-center text-gray-400">
                            اغلاق
                        </Text>
                    </Pressable>

                </View>
            </View>
        </Modal>
    );
}
