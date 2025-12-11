import {View, Text} from 'react-native'
import {SafeAreaView} from "react-native-safe-area-context";
import {Slot} from "expo-router";


export default function _Layout() {
    return (
        <SafeAreaView>
            <Text>Auth _Layout</Text>
            <Slot />
        </SafeAreaView>
    )
}
