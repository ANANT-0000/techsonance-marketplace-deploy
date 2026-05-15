import { loginFailure, loginSuccess } from "@/lib/features/auth/authSlice";
import axios from "axios";
import { VendorUser, UserRole, VendorRegisterFormData, User } from "./Types";
import { ADMIN_AUTH_URL, CUSTOMER_AUTH_URL, CUSTOMER_BASE_URL, VENDOR_AUTH_URL, BASE_API_URL } from "@/constants";
import { CustomerRegisterSchemaType } from "./validation";
import { getCompanyDomain } from "@/lib/get-domain";

const AxiosAPI = axios.create({
    baseURL: BASE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'company-domain':await getCompanyDomain() 
    },
});

export const vendorLogin = async (data: { email: string; password: string }, dispatch: any) => {
    try {
        const response = await AxiosAPI.post(`${VENDOR_AUTH_URL}/login-vendor`, {
            email: data.email,
            password: data.password
        });

        const result = response.data;
        console.log("result", result);
        console.log("response",response)

        const payload: { user: VendorUser; access_token: string; role: UserRole; refresh_token: string } = {
            user: result.data.user,
            access_token: result.data.access_token,
            role: result.data.role as UserRole,
            refresh_token: result.data.refresh_token
        };

        return { user: payload, status: 200, message: "Login successful" };
    } catch (err: any) {
        console.log("Error:", err);
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
    const domain = await getCompanyDomain()
    console.log("domain", domain);
    if (!domain) {
        return { status: false, message: "Domain not found", data: null }
    }
    try {
        const response = await AxiosAPI.post(`${CUSTOMER_AUTH_URL}/login-user`, {
            email: data.email,
            password: data.password
        }, {
            headers: {
                'company-domain': domain
            }
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

        return { status: 200, message: "Login successful", data: payload };
    } catch (err: any) {
        if (err.response && err.response.status === 423) {
            console.log("Account deactivated (423) caught!");
            return {
                status: err.response.status,
                message: "This Account is deactivated",
                data: err.response.data?.message
            };
        }

        // 2. Handle all other errors (400, 401, 500, network issues, etc.)
        const errorMessage = err.response?.data?.message || err.message || "Login failed";
        console.log("error from login", errorMessage, "\n from err", err.message);

        return {
            status: false,
            message: errorMessage,
            data: {
                status: err.response?.data // Note: changed from err.data to err.response?.data
            }
        };
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
        const response = await AxiosAPI.post(`${CUSTOMER_AUTH_URL}/register-user`, {
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


export const requestPasswordResetOTP = async (email: string) => {
    const domain = await getCompanyDomain();

    const response = await AxiosAPI.post(`${BASE_API_URL}/v1/auth/request-password-reset`, {
        email: email
    }, {
        headers: {
            'company-domain': domain,
        },
    });

    if (!response.status) throw new Error('Failed to request OTP');
    return response.data
};

export const resetPasswordWithOTP = async (email: string, otp: string, newPassword: string) => {
    const domain = await getCompanyDomain();

    const response = await fetch(`${BASE_API_URL}/v1/auth/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'company-domain': domain,
        },
        body: JSON.stringify({ email, otp, newPassword }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
    }
    return response.json();
};