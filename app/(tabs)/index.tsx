import {Button, FlatList, Image, Pressable, Text, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {images, offers} from "../../constans";
import {Fragment} from "react";
import cn from 'clsx'
import CartButton from "@/components/CartButton";
import * as Sentry from "@sentry/react-native";
import useAuthStore from "@/store/auth.store";
import { router } from "expo-router";

export default function Index() {
    const {user}= useAuthStore();

    // استخدام الـ IDs المباشرة التي زودني بها المستخدم
    const categoryIds = [
        "6946f0f4002966029b71", // وجبات (أول بطاقة)
        "6946f07c0016fb9b8029", // برغر (ثاني بطاقة)
        "694b0435003b912e653e", // بيتزا (ثالث بطاقة)
        "6946f12600012cb15b21"  // ساندويش (رابع بطاقة)
    ];

    const handlePress = (index: number) => {
        const selectedId = categoryIds[index];
        if (selectedId) {
            router.push({
                pathname: "/search",
                params: { category: selectedId }
            });
        }
    };

    console.log("User:",JSON.stringify(user,null,2));

    return (
        <SafeAreaView className="flex-1 bg-white">

            <FlatList
                data={offers}
                renderItem={({item, index}) => {
                    const isEven = index % 2 === 0;
                    return (
                        <View>
                            <Pressable
                                className={cn("offer-card", isEven ? 'flex-row-reverse' : 'flex-row')}
                                style={{backgroundColor: item.color}}
                                android_ripple={{color:"#fffff22"}}
                                onPress={() => handlePress(index)}
                            >
                                {({pressed}) => (
                                    <Fragment>
                                        <View className={"h-full w-1/2"}>
                                            <Image source={item.image} className={"size-full"} resizeMode={"contain"}/>
                                        </View>
                                        <View className={cn("offer-card__info", isEven ? 'pl-10':'pr-10')}>
                                            <Text className={"h1-bold text-white leading-tight"}>
                                                {item.title}
                                            </Text>
                                            <Image
                                                source={images.arrowRight}
                                                className={"size-10"}
                                                resizeMode="contain"
                                                tintColor="#ffffff"
                                            />

                                        </View>
                                    </Fragment>
                                )}

                            </Pressable>
                        </View>
                    )
                }}
                contentContainerClassName="pb-28 px-5"
                ListHeaderComponent={()=>  <View className="flex-between flex-row w-full my-5 px-5" >
                    <View className="flex-start" >
                        <Text className="small-bold text-primary" >Deliverd to</Text>
                        <TouchableOpacity className="flex-center flex-row gap-x-1 mt-0.5" >
                            <Text className="paragraph-bold text-dark-100" >Salamyah</Text>
                            <Image source={images.arrowDown} className="size-3" resizeMode="contain" />
                        </TouchableOpacity>
                    </View>

                    <CartButton/>
                </View>}

            />

        </SafeAreaView>
    );
}


