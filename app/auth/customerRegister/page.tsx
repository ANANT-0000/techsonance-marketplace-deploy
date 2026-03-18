'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { passwordValidationSchema } from "@/utils/validation";
import axios from "axios";
import { CUSTOMER_BASE_URL } from "@/constants/common";

interface FormData {
    customer_name: string | null;
    customer_email: string | null;
    password: string | null;
    password_confirm: string | null;
}

export default function CustomerRegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        customer_name: null,
        customer_email: null,
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
        if (name === 'confirm_password') {
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
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
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
        <main className="flex justify-around items-center border h-[100vh]">
            <form onSubmit={submitHandler} className="flex bg-white z-20 flex-col border rounded-2xl px-12 py-6 justify-center w-[560px]">
                <h1 className="lg:text-[1.5rem] md:text-[1rem] text-center">Create an account</h1>
                <p className="text-[.7rem] text-slate-600 mb-4 text-center">Join to Find great products.</p>
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex flex-col text-[.8rem] gap-2">
                        <label htmlFor="name">Full name</label>
                        <input type="text" placeholder="Enter your full name" name="customer_name" required className="border rounded-[.5rem] py-1 px-3" onChange={handleChange} />
                    </div>
                    <div className="flex flex-col text-[.8rem] gap-2">
                        <label htmlFor="email">Email</label>
                        <input type="text" placeholder="Enter your email" name="customer_email" required className="border rounded-[.5rem] py-1 px-3" onChange={handleChange} />
                    </div>
                    <div className="flex flex-col text-[.8rem] gap-2">
                        <label htmlFor="password">Password<span className="text-red-600">*</span></label>
                        <input type="password" placeholder="Password" name="password" required className="border rounded-[.5rem] py-1 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                    </div>
                    <div className="flex flex-col gap-2 text-[.8rem] w-full">
                        <label htmlFor="confirm_password">Confirm Password<span className="text-red-600">*</span></label>
                        <input type="password" name="confirm_password" className="border-2 py-1 px-3 rounded-xl" placeholder="Please reenter password" onChange={handleChange} />
                    </div>
                </div>
                {passwordMatchError && <p className="text-red-500 text-[.7rem] mb-2">{passwordMatchError}</p>}
                {error && <p className="text-red-500 text-[.7rem] mb-2">{error}</p>}
                <button type="submit" className="bg-blue-500 text-[.8rem] text-center text-white py-[.3rem] rounded-xl mb-3">Create Account</button>
                <p className="w-full flex justify-center text-center items-center text-[.6rem] text-slate-800">
                    Already have an account?
                    <Link href="/auth/customerLogin" className="ml-1 text-blue-500 underline">Log in</Link>
                </p>
            </form>
        </main>
    )
}
