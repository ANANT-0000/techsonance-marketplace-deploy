'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { passwordValidationSchema } from "@/utils/validation";
import axios from "axios";
import { CUSTOMER_BASE_URL, CUSTOMER_REGISTRATION_POSTER } from "@/constants/common";
import Image from "next/image";
import { CUSTOMER_REGISTRATION_FIELDS } from "@/constants/dynamicFields";



interface FormData {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    password: string | null;
    password_confirm: string | null;
}

export default function CustomerRegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        first_name: null,
        last_name: null,
        email: null,
        password: null,
        password_confirm: null,
    });
    const [error, setError] = useState<string | null>(null);
    const [passwordMatchError, setPasswordMatchError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (!name || value === null) return;
        if (name === 'password') {
            passwordValidationSchema.safeParse(value).success
                ? setPasswordMatchError(null)
                : setPasswordMatchError("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character");
        }
        if (name === 'password_confirm') {
            if (formData.password !== value || formData.password == null) {
                setPasswordMatchError("Passwords do not match");
                return;
            }
            setPasswordMatchError(null);
        }
        setFormData({ ...formData, [name]: value });
    };

    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.password || !formData.password_confirm) {
            setPasswordMatchError("Passwords must be filled");
            return;
        }
        try {
            const response = await axios.post(`${CUSTOMER_BASE_URL}/register`, {
                user_role: 'customer',
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
                password_confirm: formData.password_confirm,
            });
            if (response.status === 200) {
                router.push('/auth/customerLogin');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <main className="relative flex justify-center items-center p-4  h-full mx-auto">

            <form onSubmit={submitHandler} className="relative flex bg-white z-20 flex-col  rounded-2xl px-12 py-6 justify-center  lg:min-w-md md:min-w-md lg:max-w-lg md:max-w-md">
                <h1 className="lg:text-[1.5rem] md:text-[1rem] text-center">Create an account</h1>
                <p className="text-[.7rem] text-slate-600 mb-4 text-center">Join to Find great products.</p>
                <div className="flex flex-col gap-4 mb-4">
                    {CUSTOMER_REGISTRATION_FIELDS.map((field, index) => (
                        <div key={index} className="flex flex-col gap-1">
                            <label htmlFor={field.id} className="text-sm font-medium">{field.label}</label>
                            <input
                                type={field.type}
                                name={field.id}
                                placeholder={field.placeholder}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    ))}
                </div>
                {error && <p className="text-red-500 text-sm mb-4 w-md">{error}</p>}
                {passwordMatchError && <p className="text-red-500 text-sm mb-4 w-md">{passwordMatchError}</p>}
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300">Register</button>
                {/* <p className="w-full flex justify-center text-center items-center text-sm text-slate-800 ">
                    By creating an account, you agree to our &ensp;<Link href="/terms" className=" text-blue-500 underline ">Terms of Service</Link>
                    and
                    <Link href="/privacy" className=" text-blue-500 underline">Privacy Policy</Link>
                </p> */}
                <p className="mt-2 w-full flex justify-center text-center items-center text-md text-slate-800">
                    Already have an account?
                    <Link href="/auth/customerLogin" className="ml-1 text-blue-500 underline ">Log in</Link>
                </p>
            </form>
            <Image src={CUSTOMER_REGISTRATION_POSTER} height={1200} width={1200} alt="" className="hidden lg:block  absolute  left-0 lg:relative  xl:relative  lg:h-[455px] lg:w-[455px] md:h-[300px] md:w-[300px] rounded-l-0 rounded-r-[6rem]" />
        </main>
    )
}
