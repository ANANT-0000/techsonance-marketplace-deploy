'use client';
import { useState, useEffect } from "react"; // Added useEffect for debugging
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { CUSTOMER_REGISTRATION_FIELDS } from "@/constants/dynamicFields";
import { CustomerRegister } from "@/utils/authApiClient";
import { customerRegisterSchema, CustomerRegisterSchemaType } from "@/utils/validation";
import { getCompanyDomain } from "@/lib/get-domain";


export default function CustomerRegisterPage() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid, isDirty },
    } = useForm({
        resolver: zodResolver(customerRegisterSchema),
        mode: "onChange",
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            confirm_password: '',
            phone_number: '',
            terms_accepted: true,
        }
    });

    // This will help you see why the form is invalid in real-time
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log("Validation Errors:", errors);
        }
    }, [errors]);

    console.log("Password:", watch('password'));
    console.log("Confirm Password:", watch('confirm_password'));
    const onSubmit = async (data: CustomerRegisterSchemaType) => {
        console.log('🚀 Submit Triggered!', data);
        setIsSubmitting(true);
        setServerError(null);
        try {
            const companyDomain = await getCompanyDomain();
            const response = await CustomerRegister(data, companyDomain);
            if (response?.status === 201) {
                router.push('/auth/customerLogin');
            } else {
                setServerError(response?.message || "Registration failed");
            }
        } catch (err: any) {
            setServerError(err.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex justify-center items-center min-h-screen w-full p-4">
            <div className="flex flex-col lg:flex-row bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full">

                <form
                    onSubmit={handleSubmit(onSubmit, (err) => console.log("Submit blocked by Zod:", err))}
                    className="flex flex-col px-8 py-10 lg:px-12 justify-center flex-1"
                >
                    <h1 className="text-2xl font-bold text-center text-gray-800">Create an account</h1>
                    <p className="text-sm text-slate-500 mb-8 text-center font-medium">
                        Form Valid: {isValid ? "✅" : "❌"} | Changed: {isDirty ? "✅" : "❌"}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {CUSTOMER_REGISTRATION_FIELDS.map((field) => (
                            <div
                                key={field.id}
                                className={`flex flex-col gap-1.5 ${field.id === 'email' || field.id.includes('password') ? 'md:col-span-2' : ''
                                    }`}
                            >
                                <label htmlFor={field.id} className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    {field.label}
                                </label>
                                <input
                                    {...register(field.id as keyof CustomerRegisterSchemaType)}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all ${errors[field.id as keyof CustomerRegisterSchemaType]
                                        ? "border-red-400 focus:ring-red-100"
                                        : "border-gray-300 focus:ring-blue-100"
                                        }`}
                                />
                                {errors[field.id as keyof CustomerRegisterSchemaType] && (
                                    <p className="text-red-500 text-[10px] font-medium">
                                        {errors[field.id as keyof CustomerRegisterSchemaType]?.message}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {serverError && (
                        <p className="text-red-500 text-xs text-center font-medium mb-4 p-2 bg-red-50 rounded">
                            {serverError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`font-bold py-3 rounded-xl transition-colors ${isSubmitting
                            ? "bg-blue-400 text-white cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        {isSubmitting ? "Creating Account..." : "Register"}
                    </button>

                    <p className="mt-6 text-center text-sm text-slate-600">
                        Already have an account?
                        <Link href="/auth/customerLogin" className="ml-1 text-blue-600 font-bold hover:underline">
                            Log in
                        </Link>
                    </p>
                </form>

                {/* Image Section */}
                <div className="hidden lg:block relative flex-1 bg-slate-100">
                    <Image
                        src="https://imgs.search.brave.com/KuCYM754oU5_H4hh07t-Qc6WZH3BUTuLJEFzYxh8Y2c/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzUyLzg1/LzEyLzUyODUxMmU2/MDA1NjY1OGVmN2Zi/MGEwZWM5MDk0YmI0/LmpwZw"
                        alt="Join us"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>
        </main>
    );
}