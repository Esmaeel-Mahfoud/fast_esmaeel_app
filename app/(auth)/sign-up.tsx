import {View, Text, Button, Alert} from 'react-native'
import React, {useState} from 'react'
import {Link, router} from "expo-router"
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import {createUser} from "@/lib/appwrite";
import * as Sentry from "@sentry/react-native";

const SignUp = () => {


    const[isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({name:'',email:'',password:''});

    const submit = async () => {
        const {name, email, password} = form;

        if(!name || !email || !password) return Alert.alert('Error', 'Please enter a valid email & password');

        setIsSubmitting(true);
        try {
            //Call appwrite sign up function

            await createUser({ email, password, name })


            router.replace('/');
        }catch(error:any){
            Alert.alert('Error',error.message);
            Sentry.captureEvent(error)
        }finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className="gap-10 bg-white rounded-lg p-5 mt-5">
            <CustomInput
                placeholder="enter your full name"
                value={form.name}
                onChangeText={(text)=> setForm((prev)=>({...prev, name:text}))}
                label="Full name"

            />
            <CustomInput
                placeholder="enter your email"
                value={form.email}
                onChangeText={(text)=> setForm((prev)=>({...prev, email:text}))}
                label="Email"
                keyboardType="email-address"
            />
            <CustomInput
                placeholder="enter your password"
                value={form.password}
                onChangeText={(text)=> setForm((prev)=>({...prev, password:text}))}
                label="Password"
                secureTextEntry={true}
            />
            <CustomButton
                title="Sign up"
                isLoading={isSubmitting}
                onPress={submit}

            />

            <View className="flex-center justify-center flex-row gap-2  ">
                <Text className="base-regular text-gray-100" >
                    Already have an account?
                </Text>
                <Link href="/sign-in" className="base-bold text-primary" >
                    Sign in
                </Link>

            </View>

        </View>
    )
}
export default SignUp
