import { View, Text, Alert } from 'react-native';
import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { signIn } from '@/lib/appwrite';
import useAuthStore from '@/store/auth.store';
import { savePushTokenForCurrentUser } from '@/lib/savePushToken';
import * as Sentry from '@sentry/react-native';
import * as Notifications from 'expo-notifications';

const SignIn = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const { fetchAuthenticatedUser } = useAuthStore();

    const submit = async () => {
        const { email, password } = form;
        if (!email || !password)
            return Alert.alert('Error', 'Please enter a valid email & password');

        setIsSubmitting(true);
        try {
            const finalEmail = `${email}@gmail.com`;
            await signIn({ email: finalEmail, password });

            // ✅ طلب السماحية قبل أخذ التوكن
            let { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                const { status: newStatus } = await Notifications.requestPermissionsAsync();
                status = newStatus;
            }

            let expoPushToken: string | undefined;
            if (status === 'granted') {
                const tokenData = await Notifications.getExpoPushTokenAsync();
                expoPushToken = tokenData.data;
            }

            if (expoPushToken) {
                await savePushTokenForCurrentUser(expoPushToken);
            }

            await fetchAuthenticatedUser();

            router.replace('/');
        } catch (error: any) {
            Alert.alert('Error', error.message);
            Sentry.captureEvent(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // @ts-ignore
    return (
        <View className="gap-10 bg-white rounded-lg p-5 mt-5">
            <CustomInput
                placeholder="ادخل رقم الهاتف"
                value={form.email}
                onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                label="رقم الهاتف"
                keyboardType="numeric"
            />
            <CustomInput
                placeholder="ادخل كلمة السر"
                value={form.password}
                onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
                label="كلمة السر"
                secureTextEntry={true}
            />
            <CustomButton title="تسجيل الدخول" isLoading={isSubmitting} onPress={submit} />

            <View className="flex-center justify-center flex-row gap-2">
                <Link href="/sign-up" className="base-bold text-primary">انشاء حساب</Link>
                <Text className="base-regular text-gray-100">ليس لديك حساب ؟</Text>

            </View>
        </View>
    );
};

export default SignIn;
