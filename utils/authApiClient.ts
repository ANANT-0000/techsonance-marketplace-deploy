import { loginFailure, loginSuccess } from "@/lib/features/auth/authSlice";
import axios from "axios";
import { UserProfile, UserRole, VendorRegisterFormData } from "./Types";
import { ADMIN_AUTH_URL, CUSTOMER_BASE_URL, VENDOR_AUTH_URL } from "@/constants";


export const vendorLogin = async (data: { email: string, password: string }, dispatch: any) => {
    try {
        const response = await fetch(`${VENDOR_AUTH_URL}/login-vendor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: data.email,
                password: data.password
            }),
            credentials: 'include'
        });
        const result = await response.json();
        console.log(result);
        if (response.status === 201) {
            const payload: { user: UserProfile, token: string, role: UserRole } = {
                user: result.data,
                token: result.data.token,
                role: result.data.user_role as UserRole
            };
            dispatch(loginSuccess(payload));
            return { user: result.data, status: true, message: "Login successful" };
        }
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Login failed";
        dispatch(loginFailure(errorMessage));
        return { status: false, message: errorMessage };
    }
}
export const vendorRegister = async (data: VendorRegisterFormData) => {
    console.log("data", data);
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        const response = await fetch(`${VENDOR_AUTH_URL}/register-vendor`, {
            method: 'POST',
            body: data as any,
        });
        const result = await response.json();
        console.log(result);
        if (response.status === 201) {
            return { status: true, message: "Registration successful", data: result };
        }
    } catch (error: unknown) {
        console.log('Registration failed. Please try again.', error);
        return { status: false, message: "Registration failed. Please try again.", error };
    }
}

export const adminLogin = async (data: { admin_id: string, password: string }) => {

    try {
        const response = await fetch(`${ADMIN_AUTH_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: data.admin_id,
                password: data.password
            }),
            credentials: 'include'
        });
        const result = await response.json();
        console.log(result);
        if (response.status !== 200) {
            const errorMessage = result.message || "Login failed";
            console.log(errorMessage);
            return { status: false, message: errorMessage };
        }
        const payload: { user: UserProfile, token: string, role: UserRole } = {
            user: result.data,
            token: result.data.token,
            role: result.data.user_role as UserRole
        };
        console.log(payload);
        return { status: true, message: "Login successful", data: payload };
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Login failed";
        console.log(errorMessage, err);
        return { status: false, message: errorMessage };
    }
}

export const CustomerLogin = async (data: { email: string, password: string }) => {
    try {
        const response = await fetch(`${CUSTOMER_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: data.email,
                password: data.password
            }),
            credentials: 'include'
        });

        const result = await response.json();
        console.log(result);
        if (response.status !== 200) {
            const errorMessage = result.message || "Login failed";
            console.log(errorMessage);
            return { status: false, message: errorMessage };
        }
        const payload: { user: UserProfile, token: string, role: UserRole } = {
            user: result.data,
            token: result.data.token,
            role: result.data.user_role as UserRole
        };
        console.log(payload);
        return { status: true, message: "Login successful", data: payload };
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Login failed";
        console.log(errorMessage, err);
        return { status: false, message: errorMessage };
    }
}
export const CustomerRegister = async (data: { first_name: string | null; last_name: string | null; email: string | null; password: string | null; password_confirm: string | null }) => {
    try {
        const response = await fetch(`${CUSTOMER_BASE_URL}/register`, {
            method: 'POST',
            headers: {

                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_role: 'customer',
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password: data.password,
                password_confirm: data.password_confirm,
            }),
            credentials: 'include'
        });
        const result = await response.json();
        console.log(result);
        if (response.status === 201) {
            return { status: true, message: "Registration successful", data: result };
        }

    } catch (error: unknown) {
        console.log('Registration failed. Please try again.', error);
        return { status: false, message: "Registration failed. Please try again.", error };
    }
}