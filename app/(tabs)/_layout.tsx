import {View, Text} from 'react-native'
import React from 'react'
import {Navigator} from "expo-router";
import {Redirect,Slot} from "expo-router";

export default function _Layout() {
    const isAuthenticated= false;

    if(!isAuthenticated) return <Redirect href="/sign-in"/>
    return <Slot />
}
