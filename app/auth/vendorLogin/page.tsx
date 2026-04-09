'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { loginSchema, passwordValidationSchema } from "@/utils/validation";
import { vendorLogin } from "@/utils/authApiClient";
import { RootState } from "@/lib/store";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { use, useEffect, useState } from "react";
import { loginEnd, loginFailure, loginStart } from "@/lib/features/auth/authSlice";

import { LoaderSpinner } from "@/components/common/LoaderSpinner";


interface LoginFormData {
    email: string;
    password: string;
}

export default function VendorLoginPage() {
    const router = useRouter();
    const { loading, error } = useAppSelector((state: RootState) => state.auth);
    const [loadingState, setLoadingState] = useState(false);
    const {
        reset,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" }
    });
    const dispatch = useAppDispatch();
    console.log("loading", loadingState)
    useEffect(() => {
        const storedData = typeof window !== 'undefined' ? localStorage.getItem("auth") : null;
        const auth = storedData ? JSON.parse(storedData) : null;
        if (auth && auth?.isAuthenticated && auth?.user?.user_role
            === "vendor") {
            setLoadingState(true);
            dispatch(loginStart());
            console.log("Already logged in as vendor.");
            router.replace(`/vendor/${auth.user.vendor_id}`);
            setLoadingState(false);
            dispatch(loginEnd());
        }
    }, []);
    const onSubmit = async (data: LoginFormData) => {
        dispatch(loginStart());
        setLoadingState(true);
        const result = await vendorLogin(data, dispatch);
        console.log(result);
        if (result?.status === 200 ) {
            reset();
            console.log(result.user);
            router.push(`/vendor/${result.user.vendor_id}`);
            dispatch(loginEnd());
            setLoadingState(false);
        } else {
            result?.status === 401 && console.log(result?.message);
            dispatch(loginFailure(result?.message || "Login failed"));
            setLoadingState(false);
        }

    };
    console.log("loading", loadingState)

    return (
        <main className={`flex font-[roboto] justify-center items-center   h-[100vh] gap-16 `}>
            {
                loadingState && <LoaderSpinner />
            }
            <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col border rounded-2xl px-9 h-[620px] w-[540px] justify-center ${loadingState ? 'pointer-events-none opacity-50' : ''}`}>
                <h1 className="font-bold lg:text-[2rem] md:text-[1.5rem]">Manage your Store</h1>
                <p className="font-bold text-[1rem] text-slate-600 mb-8">Welcome back! Please enter your details.</p>
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-col text-[1rem] gap-2">
                        <label htmlFor="email" className="font-bold">Business Email Address</label>
                        <input
                            type="text"
                            placeholder="Enter your business email"
                            className="border-2 border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            {...register("email")}
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
                            {...register("password")}
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
                    disabled={isSubmitting || loadingState}
                    className="cursor-pointer bg-blue-500 text-center text-white font-bold py-2 rounded-xl mb-4 disabled:opacity-50"
                >
                    {loadingState || isSubmitting ? "Logging in..." : "Log in to Dashboard"}
                </button>
                <p className="text-center text-balance text-slate-500">
                    Don&apos;t have a Business account?
                    <Link href="/auth/vendorRegister" className="cursor-pointer text-blue-500 underline ml-1">Create Business account</Link>
                </p>
            </form>
        </main>
    );
}
