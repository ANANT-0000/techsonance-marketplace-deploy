import { loginFailure, loginSuccess } from "@/lib/features/auth/authSlice";
import axios from "axios";
import { VendorUser, UserRole, VendorRegisterFormData, User } from "./Types";
import { ADMIN_AUTH_URL, CUSTOMER_AUTH_URL, CUSTOMER_BASE_URL, VENDOR_AUTH_URL } from "@/constants";
import { CustomerRegisterSchemaType } from "./validation";


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
        if (response.status === 200) {
            const payload: { user: VendorUser, token: string, role: UserRole } = {
                user: result.data.user,
                token: result.data.token,
                role: result.data.user.role as UserRole
            };
            return { user: payload, status: 200, message: "Login successful" };
        }
        return { status: result.status, message: result.message || result.error || "Login failed" };
    } catch (err: any) {
        console.log(err)
        const errorMessage = err.response?.data?.message || err.message || "Login failed";
        dispatch(loginFailure(errorMessage));
        return { status: 400, message: errorMessage };
    }
}
export const vendorRegister = async (data: FormData) => {
    console.log("data", data);
    try {
        // const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        const response = await fetch(`${VENDOR_AUTH_URL}/register-vendor`, {
            method: 'POST',
            body: data as any,
        });
        const result = await response.json();
        console.log(result);
        if (response.status === 201) {
            return { status: 201, message: "Registration successful", data: result };
        }
    } catch (error: unknown) {
        console.log('Registration failed. Please try again.', error);
        return { status: 400, message: "Registration failed. Please try again.", error };
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
        const payload: { user: User, token: string, role: UserRole } = {
            user: result.data.user,
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
        const response = await fetch(`${CUSTOMER_AUTH_URL}/login-user`, {
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
            return { status: false, message: errorMessage, data: result };
        }
        const payload: { user: User, role: UserRole, token: string } = {
            user: result.data.user,
            role: result.data.role as UserRole.Customer,
            token: result.data.token
        };
        console.log(payload);
        return { status: true, message: "Login successful", data: payload };
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Login failed";
        console.log(errorMessage, err);
        return { status: false, message: errorMessage, data: err };
    }
}
export const CustomerRegister = async (data: CustomerRegisterSchemaType, companyId: string) => {
    const customerData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
    }
    console.log('registering customer:', customerData);
    try {
        const response = await fetch(`${CUSTOMER_AUTH_URL}/register-user/${companyId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customer_data: customerData
            }),
            credentials: 'include'
        });
        const result = await response.json();
        console.log(result);
        if (response.status === 201) {
            return { status: response.status, message: "Registration successful", data: result };
        }

    } catch (error: unknown) {
        console.log('Registration failed. Please try again.', error);
        return { status: false, message: "Registration failed. Please try again. error: " + (error as Error).message, data: [] };
    }
}