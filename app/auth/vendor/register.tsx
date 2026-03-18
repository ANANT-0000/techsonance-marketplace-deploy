import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import axios from "axios";
import { passwordValidationSchema } from "../../../utils/validation";
import { COUNTRY_CODES, VENDOR_AUTH_URL } from "../../../constants/constants";

interface FormData {
    business_name: string;
    business_number: string;
    business_owner_full_name: string;
    category: string;
    country_code?: string;
    vendor_admin_email: string;
    vendor_admin_full_name: string;
    password: string;
    confirm_password: string;
}

const inputClass = "rounded-xl border border-gray-300 py-2.5 px-4 w-full text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";
const labelClass = "text-sm font-medium text-gray-700";
const errorClass = "text-red-500 text-xs mt-0.5";

export function VendorRegister() {
    const navigate = useNavigate();
    const [globalError, setGlobalError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        defaultValues: {
            business_name: "",
            business_number: "",
            business_owner_full_name: "",
            category: "",
            vendor_admin_email: "",
            country_code: "",
            vendor_admin_full_name: "",
            password: "",
            confirm_password: "",
        }
    });

    const onSubmit = async (data: FormData) => {
        setGlobalError(null);
        try {
            const response = await axios.post(`${VENDOR_AUTH_URL}/register-vendor`, {
                user_role: "vendor",
                business_name: data.business_name,
                business_number: data.business_number,
                business_owner_full_name: data.business_owner_full_name,
                category: data.category,
                vendor_admin_email: data.vendor_admin_email,
                vendor_admin_full_name: data.vendor_admin_full_name,
                password: data.password,
                country_code: data.country_code,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                }
            });
            console.log(response.data);
            if (response.status === 201) {
                reset();
                navigate("/auth/vendorLogin");
            }

        } catch (error: unknown) {
            console.error(error);
            setGlobalError("Registration failed. Please try again.");
        }
    };

    return (
        <>
            <main className="py-20 m-auto max-w-4xl px-6 font-[inter] mb-2 flex flex-col items-center">
                <div className="w-full mb-6">
                    <h1 className="font-bold text-2xl mb-1">Business Registration</h1>
                    <p className="text-sm text-gray-500 text-balance">
                        Setup the organization profile, assign a domain, and create the admin account.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">

                    {/* Organization Details */}
                    <section className="border border-gray-200 p-6 rounded-2xl w-full shadow-sm">
                        <h2 className="font-bold text-xl mb-6">Organization Details</h2>

                        <div className="flex flex-col gap-6">
                            <div className="flex lg:flex-row flex-col gap-6 w-full">
                                {/* Business Name */}
                                <div className="flex flex-col gap-1.5 w-full">
                                    <label htmlFor="business_name" className={labelClass}>
                                        Vendor / Business Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="business_name"
                                        type="text"
                                        className={inputClass}
                                        placeholder="Enter your business name"
                                        {...register("business_name", { required: "Business name is required" })}
                                    />
                                    {errors.business_name && <p className={errorClass}>{errors.business_name.message}</p>}
                                </div>

                                {/* Business Category */}
                                <div className="flex flex-col gap-1.5 w-full">
                                    <label htmlFor="category" className={labelClass}>
                                        Business Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="category"
                                        className={inputClass}
                                        {...register("category", { required: "Please select a business category" })}
                                    >
                                        <option value="" disabled>Select Business Category</option>
                                        <option value="retail">Retail</option>
                                        <option value="diy_hardware">DIY and Hardware</option>
                                        <option value="fashion">Fashion and Apparel</option>
                                        <option value="food_and_beverages">Food and Beverages</option>
                                        <option value="health_and_wellness">Health and Wellness</option>
                                        <option value="automotive">Automotive</option>
                                        <option value="sports_and_outdoors">Sports and Outdoors</option>
                                        <option value="furniture">Furniture</option>
                                        <option value="technology">Technology</option>
                                        <option value="beauty_and_personal_care">Beauty and Personal Care</option>
                                        <option value="hospitality">Toys and Hobbies</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.category && <p className={errorClass}>{errors.category.message}</p>}
                                </div>
                            </div>

                            <div className="flex lg:flex-row flex-col gap-6 w-full">
                                {/* Owner Name */}
                                <div className="flex flex-col gap-1.5 w-full">
                                    <label htmlFor="business_owner_full_name" className={labelClass}>
                                        Business Owner Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="business_owner_full_name"
                                        type="text"
                                        className={inputClass}
                                        placeholder="Enter business owner full name"
                                        {...register("business_owner_full_name", { required: "Owner name is required" })}
                                    />
                                    {errors.business_owner_full_name && <p className={errorClass}>{errors.business_owner_full_name.message}</p>}
                                </div>

                                {/* Business Number */}
                                <div className="flex flex-col gap-1.5 w-full">
                                    <label htmlFor="business_number" className={labelClass}>
                                        Business Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all bg-white">
                                        <select
                                            id="country_code"
                                            className="appearance-none bg-gray-50 border-r border-gray-300 pl-3 pr-3 py-2.5 text-sm text-gray-700 font-medium focus:outline-none cursor-pointer"
                                            {...register("country_code", { required: "Country code is required" })}
                                        >
                                            <option value="" disabled>Code</option>
                                            {COUNTRY_CODES.map((country) => (
                                                <option key={country.value} value={country.value}>
                                                    {country.label}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="tel"
                                            id="business_number"
                                            className="flex-1 py-2.5 px-4 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none"
                                            placeholder="123-456-7890"
                                            {...register("business_number", {
                                                required: "Business number is required",
                                                pattern: {
                                                    value: /^[0-9]/,
                                                    message: "Please use the format 123-456-7890",
                                                }
                                            })}
                                        />
                                    </div>
                                    {(errors.country_code || errors.business_number) && (
                                        <p className={errorClass}>
                                            {errors.country_code?.message || errors.business_number?.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Business Admin Account */}
                    <section className="border border-gray-200 p-6 rounded-2xl w-full shadow-sm">
                        <h2 className="font-bold text-xl mb-1">Business Admin Account</h2>
                        <p className="text-sm text-gray-500 mb-6 text-balance">
                            These credentials will be used for the first login to the Vendor Dashboard.
                        </p>

                        <div className="flex flex-col gap-6">
                            {/* Admin Full Name */}
                            <div className="flex flex-col gap-1.5 w-full">
                                <label htmlFor="vendor_admin_full_name" className={labelClass}>
                                    Vendor Admin Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="vendor_admin_full_name"
                                    type="text"
                                    className={inputClass}
                                    placeholder="Enter admin full name"
                                    {...register("vendor_admin_full_name", { required: "Admin full name is required" })}
                                />
                                {errors.vendor_admin_full_name && <p className={errorClass}>{errors.vendor_admin_full_name.message}</p>}
                            </div>

                            {/* Admin Email */}
                            <div className="flex flex-col gap-1.5 w-full">
                                <label htmlFor="vendor_admin_email" className={labelClass}>
                                    Vendor Admin Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="vendor_admin_email"
                                    type="email"
                                    className={inputClass}
                                    placeholder="admin@vendor.com"
                                    {...register("vendor_admin_email", {
                                        required: "Admin email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address",
                                        }
                                    })}
                                />
                                {errors.vendor_admin_email && <p className={errorClass}>{errors.vendor_admin_email.message}</p>}
                            </div>

                            {/* Password + Confirm */}
                            <div className="flex lg:flex-row flex-col gap-6 w-full">
                                <div className="flex flex-col gap-1.5 w-full">
                                    <label htmlFor="password" className={labelClass}>
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        className={inputClass}
                                        placeholder="Enter password"
                                        {...register("password", {
                                            required: "Password is required",
                                            validate: (val) =>
                                                passwordValidationSchema.safeParse(val).success ||
                                                "Must be 8+ chars with uppercase, lowercase, number & special character",
                                        })}
                                    />
                                    {errors.password && <p className={errorClass}>{errors.password.message}</p>}
                                </div>

                                <div className="flex flex-col gap-1.5 w-full">
                                    <label htmlFor="confirm_password" className={labelClass}>
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="confirm_password"
                                        type="password"
                                        className={inputClass}
                                        placeholder="Re-enter password"
                                        {...register("confirm_password", {
                                            required: "Please confirm your password",
                                            validate: (val) => val === watch("password") || "Passwords do not match",
                                        })}
                                    />
                                    {errors.confirm_password && <p className={errorClass}>{errors.confirm_password.message}</p>}
                                </div>
                            </div>
                        </div>
                    </section>

                    {globalError && (
                        <p className="text-red-600 text-center text-sm font-medium">{globalError}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 justify-end mb-4">
                        <button
                            type="button"
                            onClick={() => reset()}
                            className="py-2 px-6 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="py-2 px-6 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-50 transition-all"
                        >
                            {isSubmitting ? "Creating..." : "Create Business Account"}
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-600 mb-4">
                        Already have an account?{" "}
                        <Link className="text-blue-500 underline" to="/auth/vendorLogin">Log in</Link>
                    </p>
                </form>
            </main>
            <Outlet />
        </>
    );
}