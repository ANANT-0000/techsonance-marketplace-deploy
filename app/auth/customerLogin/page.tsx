'use client';
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CUSTOMER_LOGIN_POSTER } from "@/constants/common";
import { loginFailure, loginStart, loginSuccess } from "@/lib/features/auth/authSlice";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { loginSchema } from "@/utils/validation";
import { CustomerLogin } from "@/utils/authApiClient";
interface LoginFormData {
    email: string;
    password: string;
}
export default function CustomerLoginPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
        }
    });

    const onSubmit = async (data: LoginFormData) => {
        setServerError(null);
        dispatch(loginStart());

        try {
            const response = await CustomerLogin(data);

            dispatch(loginSuccess(response.data));
            if (response.status === true) {
                router.push('/');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || "Login failed";
            dispatch(loginFailure(message));
            setServerError(message);
        }
    };

    return (
        <main className="flex justify-center items-center h-[100vh] ">
            {/* Poster Image */}
            <img
                src={CUSTOMER_LOGIN_POSTER}
                alt="Login poster"
                className="hidden md:block lg:h-[380px] lg:w-[380px] md:h-[300px] md:w-[300px] rounded-l-[4rem] object-cover"
            />

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex  flex-col rounded-xl md:rounded-l-none md:rounded-r-[4rem] px-12 py-8 justify-center w-[400px] h-[460px] shadow-lg shadow-gray-200"
            >
                <h1 className="lg:text-[1.5rem] md:text-[1.2rem] font-bold text-center my-1 text-gray-800">Welcome</h1>
                <p className="text-[.75rem] text-slate-500 mb-6 text-center">Welcome back! Find great products.</p>

                <div className="flex flex-col gap-5 mb-6">
                    {/* Email Field */}
                    <div className="flex flex-col text-[.8rem] gap-1.5">
                        <label htmlFor="email" className="font-semibold text-gray-700">Email</label>
                        <input
                            {...register("email")}
                            type="text"
                            placeholder="Enter your email"
                            className={`border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 transition-all ${errors.email ? "border-red-400 focus:ring-red-100" : "border-gray-300 focus:ring-blue-100"
                                }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-[.7rem]">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="flex flex-col text-[.8rem] gap-1.5">
                        <div className="flex justify-between items-center">
                            <label htmlFor="password" className="font-semibold text-gray-700">Password</label>
                            <Link href="/forgot-password" className="text-blue-600 hover:underline text-[.7rem]">
                                Forgot Password?
                            </Link>
                        </div>
                        <input
                            {...register("password")}
                            type="password"
                            placeholder="••••••••"
                            className={`border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 transition-all ${errors.password ? "border-red-400 focus:ring-red-100" : "border-gray-300 focus:ring-blue-100"
                                }`}
                        />
                        {errors.password ? (
                            <p className="text-red-500 text-[.7rem]">{errors.password.message}</p>
                        ) : (
                            <p className="text-slate-400 text-[.65rem]">Min. 8 characters with mix of symbols.</p>
                        )}
                    </div>
                </div>

                {serverError && (
                    <p className="text-red-500 text-center text-[.75rem] font-medium mb-4 bg-red-50 py-1 rounded">
                        {serverError}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-[.9rem] font-bold text-center text-white py-2.5 rounded-xl mb-4 disabled:opacity-50 transition-colors"
                >
                    {isSubmitting ? "Logging in..." : "Login"}
                </button>

                <p className="w-full flex justify-center text-center items-center text-[.7rem] text-slate-600">
                    Don&apos;t have an account?
                    <Link href="/auth/customerRegister" className="ml-1 text-blue-600 font-bold hover:underline">
                        Create account
                    </Link>
                </p>
            </form>
        </main>
    );
}