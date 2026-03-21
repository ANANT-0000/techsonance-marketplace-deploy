'use client';

import { Navbar } from "@/components/admin/Navbar";
import { useForm } from "react-hook-form";
import { passwordValidationSchema } from "@/utils/validation";
import Link from "next/link";

const isEmailValid = true;
export default function VendorFormPage() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            legalBusinessName: null,
            businessEmail: null,
            businessOwnerFullName: null,
            businessPhoneNumber: null,
            businessStructure: null,
            instanceConfig: null,
            vendorAdminFullName: null,
            vendorAdminLoginEmail: null,
            password: null,
            confirmPassword: null,
        }
    })

    return (
        <>
            <Navbar title={"Vendor Form"} />
            <main className="admin_vendorManagement">
                <header className="flex justify-between items-center my-6">
                    <h1 className="font-bold text-2xl">Manage Vendor domains, and platform access.</h1>
                </header>
                <form onSubmit={handleSubmit((data) => console.log(data))}>
                    <div className="rounded-xl border-2 border-gray-300 px-6 py-6 mb-6">
                        <h2 className="font-bold text-xl mb-4">Organization Details</h2>
                        <div className="w-full flex flex-col gap-4">
                            <span className="w-full flex justify-between gap-6">
                                <div className="flex flex-2 flex-col">
                                    <label className="form_label">Legal Business Name <span className="text-red-500">*</span></label>
                                    <input className="form_input" type="text" placeholder="e.g Techsonance llp" {...register("legalBusinessName", { required: "Legal Business Name is required" })} />
                                    {errors.legalBusinessName && <p className="text-red-500">{errors.legalBusinessName.message}</p>}
                                </div>
                                <div className="flex flex-1 flex-col">
                                    <label className="form_label" htmlFor="business structure">
                                        Business Structure <span className="text-red-500">*</span>
                                    </label>
                                    <select className="form_select" id="business structure" {...register("businessStructure", { required: "Business Structure is required" })}>
                                        <option value="">Select Business Structure</option>
                                        <option value="sole_proprietorship">Sole Proprietorship</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="corporation">Corporation</option>
                                        <option value="llc">Limited Liability Company (LLC)</option>
                                    </select>
                                    {errors.businessStructure && <p className="text-red-500">{errors.businessStructure.message}</p>}
                                </div>
                            </span>
                            <span className="flex justify-between gap-6">
                                <div className="flex flex-2 flex-col">
                                    <label className="form_label">Business Owner Full Name <span className="text-red-500">*</span></label>
                                    <input className="form_input" placeholder="Enter Business Owner Full Name" type="text" {...register("businessOwnerFullName", { required: "Business Owner Full Name is required" })} />
                                </div>
                                <div className="flex flex-1 flex-col">
                                    <label className="form_label" htmlFor="phone number">
                                        Business Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input className="form_input" type="tel" placeholder="+91 5555000000" id="phone number" {...register("businessPhoneNumber", { required: "Business Phone Number is required" })} />
                                    {errors.businessPhoneNumber && <p className="text-red-500">{errors.businessPhoneNumber.message}</p>}
                                </div>
                            </span>
                        </div>
                    </div>
                    <div className="rounded-xl border-2 border-gray-200 px-6 py-6 mb-6">
                        <label className="font-bold text-xl mb-4">Instance Configuration</label>
                        <div className="w-full flex mt-3">
                            <input id="instanceConfig" {...register('instanceConfig', { required: "Instance Configuration is required" })} className="border-2 flex-2 border-gray-200 px-4 py-2 rounded-l-xl" />
                            <p className="border-2 flex-1 bg-gray-200 border-gray-300 px-4 py-2 rounded-r-xl">.platform.com</p>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">This Will be the URL where customers access this vendor.</p>
                        {errors.instanceConfig && <p className="text-red-500">{errors.instanceConfig.message}</p>}
                    </div>
                    <div className="rounded-xl border-2 border-gray-200 px-6 py-6 mb-6 font-medium">
                        <h2 className="font-bold text-xl mb-4">Initial vendor Admin Account</h2>
                        <p className="text-gray-500">These credentials will be used for the first login to the Vendor Dashboard.</p>
                        <div className="w-full flex gap-6 mt-4">
                            <div className="w-full flex flex-2 flex-col justify-between">
                                <label className="form_label">Vendor Admin Full Name <span className="text-red-500">*</span></label>
                                <input className="form_input" type="text" placeholder="Enter Vendor Admin Full Name" {...register("vendorAdminFullName", { required: "Vendor Admin Full Name is required" })} />
                                {errors.vendorAdminFullName && <p className="text-red-500">{errors.vendorAdminFullName.message}</p>}
                            </div>
                            <div className="w-full flex flex-1 flex-col justify-between">
                                <label className="form_label">Category <span className="text-red-500">*</span></label>
                                <select className="form_select" id="category">
                                    <option value="select category">Select Category</option>
                                    <option value="fashion">Fashion & Apparel</option>
                                    <option value="electronics">Electronics & Gadgets</option>
                                    <option value="home_garden">Home & Garden</option>
                                    <option value="health_beauty">Health & Beauty</option>
                                    <option value="sports_outdoors">Sports & Outdoors</option>
                                    <option value="toys_games">Toys & Games</option>
                                    <option value="automotive">Automotive</option>
                                    <option value="books_media">Books & Media</option>
                                    <option value="food_beverages">Food & Beverages</option>
                                    <option value="jewelry_accessories">Jewelry & Accessories</option>
                                </select>
                            </div>
                        </div>
                        <div className="w-full flex gap-6 items-center mt-4">
                            <div className="w-full flex-2 flex flex-col justify-between">
                                <label className="form_label">Vendor Admin Login Email <span className="text-red-500">*</span></label>
                                <input type="text" className="form_input" {...register("vendorAdminLoginEmail", { required: "Vendor Admin Email is required" })} placeholder="admin@vendor.com" />
                            </div>
                            <span className="block flex-1">
                                <p className={`w-24 h-10 rounded-lg text-center mt-7 px-4 py-2 ${isEmailValid ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>{isEmailValid ? 'Verified' : 'Invalid'}</p>
                            </span>
                        </div>
                        <div className="w-full flex gap-6 mt-4">
                            <div className="w-full flex-2 flex flex-col justify-between">
                                <label className="form_label">Password <span className="text-red-500">*</span></label>
                                <input type="password" className={`form_input ${errors.password ? 'form_input_error' : ''}`} {...register("password", {
                                    validate: (value) => passwordValidationSchema.safeParse(value).success || 'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character'
                                })} placeholder="Enter Password" />
                                {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                            </div>
                            <div className="w-full flex-2 flex flex-col justify-between">
                                <label className="form_label">Confirm Password <span className="text-red-500">*</span></label>
                                <input type="password" className={`form_input ${errors.confirmPassword ? 'form_input_error' : ''}`} {...register("confirmPassword", {
                                    validate: (value) => value === watch('password') || "Passwords do not match"
                                })} placeholder="Confirm Password" />
                                {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-6 mb-6">
                        <Link className="border border-gray-300 bg-gray-200 px-4 py-2 rounded-lg" href="/admin/vendorManagement">Cancel</Link>
                        <input className="bg-blue-500 text-white font-medium border border-gray-300 px-4 py-2 rounded-lg" type="submit" value="Create Vendor" />
                    </div>
                </form>
            </main>
        </>
    )
}
