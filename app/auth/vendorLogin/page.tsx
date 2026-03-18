'use client';

import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import { loginFailure, loginStart, loginSuccess } from "@/Redux store/features/auth/authSlice";
import { passwordValidationSchema } from "@/utils/validation";
import { VENDOR_AUTH_URL } from "@/constants/common";
import { UserRole } from "@/utils/Types";

interface LoginFormData {
    email: string;
    password: string;
}

export default function VendorLoginPage() {
    const { loading, error } = useSelector((state: any) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();

    const {
        reset,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        defaultValues: { email: "", password: "" }
    });

    const onSubmit = async (data: LoginFormData) => {
        dispatch(loginStart());
        try {
            const response = await axios.post(`${VENDOR_AUTH_URL}/login-vendor`, {
                email: data.email,
                password: data.password
            });
            if (response.status === 201) {
                dispatch(loginSuccess({
                    user: response.data.user,
                    token: response.data.token,
                    role: UserRole.Vendor
                }));
                reset();
                router.push("/vendor");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Login failed";
            dispatch(loginFailure(errorMessage));
        }
    };

    return (
        <main className="flex font-[roboto] justify-center items-center border h-[100vh] gap-16">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col border rounded-2xl px-9 h-[620px] w-[540px] justify-center">
                <h1 className="font-bold lg:text-[2rem] md:text-[1.5rem]">Manage your Store</h1>
                <p className="font-bold text-[1rem] text-slate-600 mb-8">Welcome back! Please enter your details.</p>
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-col text-[1rem] gap-2">
                        <label htmlFor="email" className="font-bold">Business Email Address</label>
                        <input
                            type="text"
                            placeholder="Enter your business email"
                            className="border-2 border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                        />
                        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
                    </div>
                    <div className="flex flex-col text-[1rem] gap-2">
                        <span>
                            <label htmlFor="password" className="font-bold">Password</label>
                            <a href="#" className="text-sm underline text-blue-500 float-right">Forgot Password?</a>
                        </span>
                        <input
                            type="password"
                            placeholder="Password"
                            className="border-2 border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            {...register("password", {
                                required: "Password is required",
                                validate: (val) => passwordValidationSchema.safeParse(val).success || "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
                            })}
                        />
                        {errors.password ? (
                            <p className="text-red-600 text-[.8rem]">{errors.password.message}</p>
                        ) : (
                            <p className="text-slate-500 text-[.8rem]">Must be at least 8 characters.</p>
                        )}
                    </div>
                </div>
                {error && <p className="text-red-600 text-center font-bold mb-4">{error}</p>}
                <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="bg-blue-500 text-center text-white font-bold py-2 rounded-xl mb-4 disabled:opacity-50"
                >
                    {loading || isSubmitting ? "Logging in..." : "Log in to Dashboard"}
                </button>
                <p className="text-center text-balance text-slate-500">
                    Don&apos;t have a Business account?
                    <Link href="/auth/vendorRegister" className="text-blue-500 underline ml-1">Create Business account</Link>
                </p>
            </form>
        </main>
    );
}
