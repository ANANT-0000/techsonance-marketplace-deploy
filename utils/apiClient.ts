import { loginFailure, loginSuccess } from "@/Redux store/features/auth/authSlice";
import axios from "axios";
import { UserProfile, UserRole, VendorRegisterFormData } from "./Types";
import { ADMIN_AUTH_URL, BASE_API_URL, VENDOR_AUTH_URL } from "@/constants/constants";
import { useDispatch } from "react-redux";
import { authToken } from "./authToken";

export const vendorLogin = async (data: { email: string, password: string }) => {
    const dispatch = useDispatch();
    try {
        const response = await axios.post(`${VENDOR_AUTH_URL}/login-vendor`, {
            email: data.email,
            password: data.password
        },
            { withCredentials: true });
        if (response.status === 201) {
            const payload: { user: UserProfile, token: string, role: UserRole } = {
                user: response.data.user,
                token: response.data.token,
                role: response.data.user_role as UserRole
            };
            dispatch(loginSuccess(payload));
            return { status: true, message: "Login successful" };
        }
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Login failed";
        dispatch(loginFailure(errorMessage));
        return { status: false, message: errorMessage };
    }
}
export const vendorRegister = async (data: VendorRegisterFormData) => {

    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        const response = await axios.post(`${VENDOR_AUTH_URL}/register-vendor`, {
            user_role: "vendor",
            store_name: data.store_name,
            phone_number: data.phone_number,
            store_owner_first_name: data.store_owner_first_name,
            store_owner_last_name: data.store_owner_last_name,
            category: data.category,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            hash_password: data.password,
            country_code: data.country_code,
        }, {
            withCredentials: true,
        });
        console.log(response.data);
        if (response.status === 201) {
            return { status: true, message: "Registration successful", data: response.data };
        }
    } catch (error: unknown) {
        console.log('Registration failed. Please try again.', error);
        return { status: false, message: "Registration failed. Please try again.", error };
    }
}

export const adminLogin = async (data: { admin_id: string, password: string }) => {

    try {
        const response = await axios.post(`${ADMIN_AUTH_URL}/login`, {
            email: data.admin_id,
            password: data.password
        }, { withCredentials: true });
        if (response.status !== 201) {
            const errorMessage = response.data?.message || "Login failed";
            console.log(errorMessage);
            return { status: false, message: errorMessage };
        }
        const payload: { user: UserProfile, token: string, role: UserRole } = {
            user: response.data.user,
            token: response.data.token,
            role: response.data.user_role as UserRole
        };
        return { status: true, message: "Login successful", data: payload };
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Login failed";
        console.log(errorMessage, err);
        return { status: false, message: errorMessage };
    }
}


export const fetchRoles = async () => {
    const response = await fetch(`${BASE_API_URL}roles/all`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${authToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch roles');
    }
    return response.json();
};
export const fetchPermissions = async () => {
    const response = await fetch(`${BASE_API_URL}permissions`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${authToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch permissions');
    }
    return response.json();
};
export const createRole = async (role: string) => {
    const response = await fetch(`${BASE_API_URL}roles/create`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${authToken()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
    });
    console.log(response);
    if (!response.ok) {
        throw new Error('Failed to create role');
    }
    return response.json();
};

export const createPermission = async (permissionName: string) => {
    const response = await fetch(`${BASE_API_URL}permissions/create`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${authToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissionName }),
    });
    if (!response.ok) {
        throw new Error('Failed to create permission');
    }
    return response.json();
}