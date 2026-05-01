import { loginFailure, loginSuccess } from "@/lib/features/auth/authSlice";
import axios from "axios";
import { VendorUser, UserRole, VendorRegisterFormData, User } from "./Types";
import { ADMIN_AUTH_URL, CUSTOMER_AUTH_URL, CUSTOMER_BASE_URL, VENDOR_AUTH_URL, BASE_API_URL } from "@/constants";
import { CustomerRegisterSchemaType } from "./validation";

export const AxiosAPI = axios.create({
    baseURL: BASE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const vendorLogin = async (data: { email: string; password: string }, dispatch: any) => {
    try {
        const response = await AxiosAPI.post(`${VENDOR_AUTH_URL}/login-vendor`, {
            email: data.email,
            password: data.password
        });

        const result = response.data;
        console.log(result);

        const payload: { user: VendorUser; access_token: string; role: UserRole; refresh_token: string } = {
            user: result.data.user,
            access_token: result.data.access_token,
            role: result.data.role as UserRole,
            refresh_token: result.data.refresh_token
        };

        return { user: payload, status: 200, message: "Login successful" };
    } catch (err: any) {
        console.log(err);
        const errorMessage = err.response?.data?.message || err.message || "Login failed";
        dispatch(loginFailure(errorMessage));
        return { status: err.response?.status || 400, message: errorMessage };
    }
}

export const vendorRegister = async (data: FormData) => {
    console.log("data", data);
    try {
        // Override the default JSON header specifically for this multipart/form-data request
        const response = await AxiosAPI.post(`${VENDOR_AUTH_URL}/register-vendor`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        const result = response.data;
        console.log(result);

        return { status: 201, message: "Registration successful", data: result };
    } catch (err: any) {
        console.log('Registration failed. Please try again.', err);
        const errorMessage = err.response?.data?.message || err.message || "Registration failed. Please try again.";
        return { status: err.response?.status || 400, message: errorMessage, error: err };
    }
}

export const adminLogin = async (data: { admin_id: string; password: string }) => {
    try {
        const response = await AxiosAPI.post(`${ADMIN_AUTH_URL}/login`, {
            email: data.admin_id,
            password: data.password
        });

        const result = response.data;
        console.log(result);

        const payload: { user: User; access_token: string; role: UserRole; refresh_token: string } = {
            user: result.data.user,
            access_token: result.data.access_token,
            role: result.data.role as UserRole,
            refresh_token: result.data.refresh_token
        };
        console.log(payload);

        return { status: true, message: "Login successful", data: payload };
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Login failed";
        console.log(errorMessage, err);
        return { status: false, message: errorMessage };
    }
}

export const CustomerLogin = async (data: { email: string; password: string }) => {
    try {
        const response = await AxiosAPI.post(`${CUSTOMER_AUTH_URL}/login-user`, {
            email: data.email,
            password: data.password
        });

        const result = response.data;
        console.log(result);

        const payload: { user: User; access_token: string; role: UserRole; refresh_token: string } = {
            user: result.data.user,
            access_token: result.data.access_token,
            role: result.data.role as UserRole,
            refresh_token: result.data.refresh_token
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
    };
    console.log('registering customer:', customerData);

    try {
        const response = await AxiosAPI.post(`${CUSTOMER_AUTH_URL}/register-user/${companyId}`, {
            customer_data: customerData
        });

        const result = response.data;
        console.log(result);

        return { status: response.status, message: "Registration successful", data: result };
    } catch (err: any) {
        console.log('Registration failed. Please try again.', err);
        const errorMessage = err.response?.data?.message || err.message || "Registration failed. Please try again.";
        return { status: false, message: errorMessage, data: [] };
    }
}