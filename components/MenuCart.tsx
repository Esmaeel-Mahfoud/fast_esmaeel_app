import {MenuItem} from "@/type";
import {appwriteConfig} from "@/lib/appwrite";
import {useCartStore} from "@/store/cart.stor";
import {Image, Platform, Text, TouchableOpacity} from "react-native";

type Props = {
    item: MenuItem;
    onOpen: (id: string) => void;
};

const MenuCart = ({ item: { $id, image_url, name, price }, onOpen }: Props) => {
    const imageUrl = `${image_url}?project=${appwriteConfig.projectId}`;
    const { addItem } = useCartStore();

    return (
        <TouchableOpacity
            className="menu-card"
            style={Platform.OS === 'android' ? { elevation: 10, shadowColor: '#878787' } : {}}
            onPress={() => {  console.log("CARD PRESSED:", $id); onOpen($id); }}
        >
            <Image
                source={{ uri: imageUrl }}
                className="size-32 absolute -top-10"
                resizeMode="contain"
            />

            <Text className="text-center base-bold text-dark-100 mb-2" numberOfLines={1}>
                {name}
            </Text>

            <Text className="body-regular text-gray-200 mb-4">
                {price} ل.س
            </Text>

            <TouchableOpacity
                onPress={() =>
                    addItem({ id: $id, name, price, image_url: imageUrl, customizations: [] })
                }
            >
                <Text className="paragraph-bold text-primary">أضف الى السلة +</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

export default MenuCart;
