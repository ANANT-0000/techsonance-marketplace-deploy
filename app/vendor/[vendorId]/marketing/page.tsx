"use client";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/vendor/Navbar";
import { Pagination } from "@/components/common/Pagination";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, X, AlertCircle } from "lucide-react";
import { REVIEW_DATA } from "@/constants/vendor";
import { couponSchema, CouponFormData } from "@/utils/validation";
import { CouponDiscountTypeEum, CouponStatusEnum } from "@/utils/Types";

export default function MarketingPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CouponFormData>({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            type: CouponDiscountTypeEum.PERCENTAGE,
            code: "",
            value: 0,
            rules: [{ rule_type: "Min Purchase", rule_value: "" }],
        },
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "rules",
    });

    const onSubmit = (data: CouponFormData) => {
        console.log("Coupon Created: ", data);
        setIsModalOpen(false);
        reset();
    };

    // Close modal on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                setIsModalOpen(false);
                reset();
            }
        };
        if (isModalOpen) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isModalOpen, reset]);

    // Pagination logic (keep as is)
    const [count, setCount] = useState(1);
    const pageSize = 5;
    const totalPages = Math.ceil(REVIEW_DATA.length / pageSize);
    const startIndex = (count - 1) * pageSize;
    const currentData = REVIEW_DATA.slice(startIndex, startIndex + pageSize);

    return (
        <div className="relative min-h-screen bg-slate-50">
            <Navbar title={"Marketing & Reviews"} />
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        ref={modalRef}
                        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">New Promo Code</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Type</label>
                                    <select {...register("type")} className="border border-gray-300 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100">
                                        <option value={CouponStatusEnum.ACTIVE}>Active</option>
                                        <option value={CouponStatusEnum.INACTIVE}>Inactive</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Value</label>
                                    <input type="number" {...register("value")} className="border border-gray-300 rounded-xl p-2.5 text-sm" placeholder="0" />
                                    {errors.value && <p className="text-red-500 text-[10px] font-medium">{errors.value.message}</p>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Coupon Code</label>
                                <input
                                    type="text"
                                    {...register("code")}
                                    className="border border-gray-300 rounded-xl p-2.5 text-sm uppercase placeholder:normal-case"
                                    placeholder="e.g. SUMMER50"
                                />
                                {errors.code && <p className="text-red-500 text-[10px] font-medium">{errors.code.message}</p>}
                            </div>

                            {/* --- DYNAMIC RULES SECTION --- */}
                            <div className="pt-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-gray-800">Usage Rules</label>
                                    <button
                                        type="button"
                                        onClick={() => append({ rule_type: "Min Purchase", rule_value: "" })}
                                        className="text-xs flex items-center gap-1 text-blue-600 font-bold hover:text-blue-700"
                                    >
                                        <Plus size={14} /> Add Rule
                                    </button>
                                </div>

                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start animate-in slide-in-from-left-2 duration-200">
                                        <select
                                            {...register(`rules.${index}.rule_type`)}
                                            className="flex-1 border border-gray-300 rounded-xl p-2 text-xs"
                                        >
                                            <option value="Min Purchase">Min Purchase</option>
                                            <option value="Max Discount">Max Discount</option>
                                            <option value="User Limit">User Limit</option>
                                        </select>
                                        <input
                                            {...register(`rules.${index}.rule_value`)}
                                            placeholder="Value"
                                            className="flex-1 border border-gray-300 rounded-xl p-2 text-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                                Create Coupon
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <main className="max-w-6xl mx-auto px-4 pb-10">
                <header className="flex justify-between items-center py-6">
                    <h1 className="text-2xl font-bold text-gray-800">Marketing Dashboard</h1>
                    <button
                        className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={18} /> Add New Coupon
                    </button>
                </header>

            </main>
        </div>
    );
}