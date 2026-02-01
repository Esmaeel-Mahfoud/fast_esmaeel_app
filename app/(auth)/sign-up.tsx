import { View, Text, Alert } from 'react-native';
import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { createUser, getCurrentUser } from '@/lib/appwrite';
import { savePushTokenForCurrentUser } from '@/lib/savePushToken';
import * as Sentry from '@sentry/react-native';
import * as Notifications from 'expo-notifications';

const SignUp = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    const submit = async () => {
        const { name, email, password } = form;
        if (!name || !email || !password)
            return Alert.alert('Error', 'Please enter a valid email & password');

        setIsSubmitting(true);
        try {
            const finalEmail = `${email}@gmail.com`;

            await createUser({ email: finalEmail, password, name });

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

            await getCurrentUser();

            router.replace('/');
        } catch (error: any) {
            Alert.alert('Error', error.message);
            Sentry.captureEvent(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View className="gap-10 bg-white rounded-lg p-5 mt-5">
            <CustomInput
                placeholder="ادخل اسمك الكامل"
                value={form.name}
                onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
                label="الاسم الكامل"
            />
            <CustomInput
                placeholder="ادخل رقمك"
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
            <CustomButton title="انشاء حساب" isLoading={isSubmitting} onPress={submit} />

            <View className="flex-center justify-center flex-row gap-2">
                <Link href="/sign-in" className="base-bold text-primary">تسجيل دخول</Link>
                <Text className="base-regular text-gray-100">لديك حساب مسبقا ؟</Text>

            </View>
        </View>
    );
};

export default SignUp;
