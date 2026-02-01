import { Models } from "react-native-appwrite";
import React from "react";

// Use Partial and any to allow maximum flexibility with Appwrite's dynamic documents
export interface MenuItem extends Partial<Models.Document> {
    name?: string;
    price?: number;
    image_url?: string;
    description?: string;
    calories?: number;
    protein?: number;
    rating?: number;
    type?: string;
    [key: string]: any;
}

export interface Category extends Partial<Models.Document> {
    name?: string;
    description?: string;
    [key: string]: any;
}

export interface User extends Partial<Models.Document> {
    name?: string;
    email?: string;
    avatar?: string;
    [key: string]: any;
}

export interface CartCustomization {
    id: string;
    name: string;
    price: number;
    type: string;
}

export interface CartItemType {
    id: string;
    name: string;
    price: number;
    image_url: string;
    quantity: number;
    customizations?: CartCustomization[];
}

export interface CartStore {
    items: any[];
    addItem: (item: any) => void;
    removeItem: (id: string, customizations: CartCustomization[]) => void;
    increaseQty: (id: string, customizations: CartCustomization[]) => void;
    decreaseQty: (id: string, customizations: CartCustomization[]) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export interface CreateUserParams {
    email: string;
    password: string;
    name: string;
}

export interface SignInParams {
    email: string;
    password: string;
}

export interface GetMenuParams {
    category?: string;
    query?: string;
    limit?: number;
    [key: string]: any;
}