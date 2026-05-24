import AxiosAPI from '@/lib/axios';
import { authToken } from '@/utils/authToken';
import { Coupon, PromotionType,   } from '@/utils/Types';
import { couponSchema } from '@/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';

// --- API Methods ---
const createNewCoupon = async (data: any, vendorId: string, token: string) => {
    return await AxiosAPI.post(`/v1/coupon/${vendorId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const updateExistingCoupon = async (id: string, data: any, vendorId: string, token: string) => {
    return await AxiosAPI.patch(`/v1/coupon/${id}/${vendorId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const fetchCouponDetails = async (id: string, token: string) => {
    return await AxiosAPI.get(`/v1/coupon/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
}
const fetchAllProductOptions = async (token: string) => {
    return await AxiosAPI.get(`/v1/products/options`, {
        headers: { Authorization: `Bearer ${token}` }
    });
}
interface CouponModelProps {
    isModalOpen: boolean;
    setIsModalOpen: (val: boolean) => void;
    id?: string | null;
    onSuccess?: () => void;
    vendorId?: string;
    setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
}

export const CouponModel = ({ setIsModalOpen, isModalOpen, id, onSuccess, vendorId, setCoupons }: CouponModelProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const token = authToken();
    const isEditMode = !!id; 
    const [productOptions, setProductOptions] = useState<{ id: string; name: string }[]>([]);
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            discount_type: PromotionType.PERCENTAGE,
            code: "",
            description: "",
            value: 0,
            valid_from: new Date().toISOString().split('T')[0],
            valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            min_order_amount: "",
            max_discount_amount: "",
            max_uses: null,
            max_uses_per_user: 1,
            is_auto_applied: false,
            is_active: true,
            applicable_product_ids: [],
        },
    });

    useEffect(() => {
        const loadProductOptions = async () => {

          try {
              const res = await fetchAllProductOptions(token as string);
              console.log("product opt",res.data)
              setProductOptions(res.data.data);
          } catch (error) {
              console.error("Failed to fetch product options", error);
              toast.error("Failed to load product options.");
          }
      };
        if (id && isModalOpen) {
          
            const loadCouponData = async () => {
                try {
                    const res = await fetchCouponDetails(id, token as string);
                    const couponData = res.data.data; 

                    reset({
                        discount_type: couponData.discount_type || PromotionType.PERCENTAGE,
                        code: couponData.code || "",
                        description: couponData.description || "",
                        value: Number(couponData.discount_value || 0),
                        valid_from: couponData.valid_from ? new Date(couponData.valid_from).toISOString().split('T')[0] : "",
                        valid_to: couponData.valid_to ? new Date(couponData.valid_to).toISOString().split('T')[0] : "",
                        min_order_amount: couponData.min_order_amount ? String(couponData.min_order_amount) : "",
                        max_discount_amount: couponData.max_discount_amount ? String(couponData.max_discount_amount) : "",
                        max_uses: couponData.max_uses ? Number(couponData.max_uses) : null,
                        max_uses_per_user: couponData.max_uses_per_user ? Number(couponData.max_uses_per_user) : null,
                        is_auto_applied: couponData.is_auto_applied ?? false,
                        is_active: couponData.is_active ?? true,
                    });
                } catch (error) {
                    console.error("Failed to fetch coupon details", error);
                    toast.error("Failed to load coupon details.");
                }
            
            };
            loadCouponData();
          loadProductOptions();
        } else if (!id && isModalOpen) {
            reset({
                discount_type: PromotionType.PERCENTAGE,
                code: "",
                description: "",
                value: 0,
                valid_from: new Date().toISOString().split('T')[0],
                valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                min_order_amount: "",
                max_discount_amount: "",
                max_uses: null,
                max_uses_per_user: 1,
                is_auto_applied: false,
                is_active: true,
                applicable_product_ids: [],
            });
            loadProductOptions();
        }
    }, [id, isModalOpen, reset, token]);

const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
        // Map the form data EXACTLY to what the NestJS create service expects
        const payload = {
            code: data.code.toUpperCase(), // Ensure uppercase
            description: data.description || "",
            
            // Map the UI discount types to the backend expectations
            // Note: If you want to keep 'fixed_cart'/'fixed_product', you must update the backend service logic.
            // For now, mapping both fixed types to 'fixed_amount' for safety based on backend code.
            discount_type: data.discount_type === 'percentage' 
                           ? 'percentage' 
                           : data.discount_type === 'free_shipping' 
                           ? 'free_shipping' 
                           : 'fixed_amount', 

            discount_value: String(data.value), // Backend expects string to parse to Number

            // Advanced Limits mapping
            max_discount_amount: data.max_discount_amount ? String(data.max_discount_amount) : undefined,
            min_order_amount: data.min_order_amount ? String(data.min_order_amount) : undefined,
            
            max_uses: data.max_uses ? Number(data.max_uses) : undefined,
            max_uses_per_user: data.max_uses_per_user ? Number(data.max_uses_per_user) : 1, // Default to 1 per backend
            
            // Status mapping
            is_auto_applied: !!data.is_auto_applied,
            is_active: !!data.is_active,

            // Date mapping (Ensure proper ISO string)
            valid_from: new Date(data.valid_from).toISOString(),
            valid_to: new Date(data.valid_to).toISOString(),

            // Array mapping
            applicable_product_ids: data.applicable_product_ids || [],
        };

        if (isEditMode) {
            const response = await updateExistingCoupon(id as string, payload, vendorId as string, token as string);
            if(response.status === 200){
                 setCoupons((prevCoupons) => prevCoupons.map(coupon => coupon.id === id ? response.data.data : coupon));
            }
            toast.success("Coupon updated successfully!");
        } else {
            const response = await createNewCoupon(payload, vendorId as string, token as string);
            if(response.status === 201){
                setCoupons((prevCoupons) => [...prevCoupons, response.data.data]);
            }
            toast.success("Coupon created successfully!");
        }
        
        setIsModalOpen(false);
        if (onSuccess) onSuccess();
        reset();
    } catch (error) {
        console.error(`Failed to ${isEditMode ? 'update' : 'create'} coupon:`, error);
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} coupon.`);
    } finally {
        setIsSubmitting(false);
    }
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
    }, [isModalOpen, reset, setIsModalOpen]);

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div ref={modalRef} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">{isEditMode ? "Edit Promo Code" : "New Promo Code"}</h2>
                    <button onClick={() => { setIsModalOpen(false); reset(); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Coupon Code *</label>
                            <input type="text" disabled={isEditMode} {...register("code", { onChange: (e) => e.target.value = e.target.value.toUpperCase() })} className={`border ${errors.code ? 'border-red-500' : 'border-gray-300'} rounded-xl p-2.5 text-sm uppercase ${isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}`} placeholder="SUMMER50" />
                            {errors.code && <p className="text-xs text-red-500">{errors.code.message?.toString()}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Description *</label>
                            <input type="text" {...register("description")} className={`border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-xl p-2.5 text-sm`} placeholder="Summer Sale 2026" />
                            {errors.description && <p className="text-xs text-red-500">{errors.description.message?.toString()}</p>}
                        </div>
                    </div>

                    {/* Value & Type */}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-gray-700">Discount Type *</label>
    <select 
        {...register("discount_type")} 
        className="border border-gray-300 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-white"
    >
        <option value={PromotionType.PERCENTAGE}>Percentage (%)</option>
        <option value={PromotionType.FIXED_AMOUNT}>Fixed Cart Amount</option>
        <option value={PromotionType.TIERED_DISCOUNT}>Tiered Discount</option>
        <option value={PromotionType.FREE_SHIPPING}>Free Shipping</option>
        <option value={PromotionType.BOGO}>Buy 1 Get 1 Free</option>
    </select>
    {errors.discount_type && <p className="text-xs text-red-500">{errors.discount_type.message?.toString()}</p>}
</div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Value *</label>
                            <input type="number" step="0.01" {...register("value", { valueAsNumber: true })} className={`border ${errors.value ? 'border-red-500' : 'border-gray-300'} rounded-xl p-2.5 text-sm`} placeholder="0.00" />
                            {errors.value && <p className="text-xs text-red-500">{errors.value.message?.toString()}</p>}
                        </div>
                    </div>

                    {/* Validity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Valid From *</label>
                            <input type="date" {...register("valid_from")} className={`border ${errors.valid_from ? 'border-red-500' : 'border-gray-300'} rounded-xl p-2.5 text-sm`} />
                            {errors.valid_from && <p className="text-xs text-red-500">{errors.valid_from.message?.toString()}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Valid To *</label>
                            <input type="date" {...register("valid_to")} className={`border ${errors.valid_to ? 'border-red-500' : 'border-gray-300'} rounded-xl p-2.5 text-sm`} />
                            {errors.valid_to && <p className="text-xs text-red-500">{errors.valid_to.message?.toString()}</p>}
                        </div>
                    </div>

                    {/* Advanced Limits Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                        <h3 className="text-sm font-bold text-gray-800 border-b pb-2">Advanced Limits (Optional)</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-600">Min Order Amount (₹)</label>
                                <input type="number" {...register("min_order_amount")} className="border border-gray-300 rounded-lg p-2 text-sm bg-white" placeholder="e.g. 1000" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-600">Max Discount Amount (₹)</label>
                                <input type="number" {...register("max_discount_amount")} className="border border-gray-300 rounded-lg p-2 text-sm bg-white" placeholder="e.g. 500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-600">Total Max Uses</label>
                                <input type="number" {...register("max_uses", { valueAsNumber: true })} className="border border-gray-300 rounded-lg p-2 text-sm bg-white" placeholder="Infinite if empty" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-600">Uses Per User</label>
                                <input type="number" {...register("max_uses_per_user", { valueAsNumber: true })} className="border border-gray-300 rounded-lg p-2 text-sm bg-white" placeholder="e.g. 1" />
                            </div>
                        </div>

                        {/* Status Checkboxes */}
                        <div className="flex gap-6 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" {...register("is_auto_applied")} className="w-4 h-4 text-blue-600 rounded" />
                                <span className="text-sm font-medium text-gray-700">Auto Apply at Checkout</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" {...register("is_active")} className="w-4 h-4 text-blue-600 rounded" />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
                        </div>
                       <div className="flex flex-col gap-1.5 col-span-2">
    <label htmlFor="product" className="text-sm font-semibold text-gray-700">
        Applicable Products (Optional)
    </label>
    
    <select 
        id="product" 
        className="border border-gray-300 rounded-lg p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100"
        onChange={(e) => {
            const selectedId = e.target.value;
            if (!selectedId) return;
            
            // Get current array (default to empty if undefined)
            const currentIds = watch("applicable_product_ids") || [];
            
            // // Prevent duplicates
            // if (!currentIds.includes(selectedId)) {
            //     setValue("applicable_product_ids", [...currentIds, selectedId], { shouldDirty: true });
            // }
            e.target.value = "";
        }}
    >
       <option value="">-- Select a product to add --</option>
    {productOptions.map((option: any) => {
        // 1. Define a maximum length
        const MAX_LENGTH = 30; 
        
        // 2. Truncate the string in JavaScript if it's too long
        const displayName = option.name.length > MAX_LENGTH 
            ? `${option.name.substring(0, MAX_LENGTH)}...` 
            : option.name;

        return (
            <option 
                key={option.id} 
                value={option.id} 
                title={option.name}  
            >
                {displayName}
            </option>
        );
    })}
    </select>

    {/* Display Selected Product Labels (Badges) */}
    <div className="flex flex-wrap gap-2 mt-2">
        {(watch("applicable_product_ids") || []).map((id: string) => {
            // Find the product name based on the selected ID
            const product = productOptions.find((p: any) => p.id === id);
            if (!product) return null;

            return (
                <span 
                    key={id} 
                    className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-100 animate-in fade-in zoom-in duration-200"
                >
                    {/* TRUNCATE: Limits text width and adds '...' if too long */}
                    <span className="truncate max-w-[150px]" title={product.name}>
                        {product.name}
                    </span>
                    
                    {/* REMOVE BUTTON */}
                    <button 
                        type="button" 
                        onClick={() => {
                            const currentIds = watch("applicable_product_ids") || [];
                            setValue(
                                "applicable_product_ids", 
                                currentIds.filter((currentId: string) => currentId !== id),
                                { shouldDirty: true }
                            );
                        }}
                        className="text-blue-400 hover:text-red-500 transition-colors bg-blue-100/50 hover:bg-red-50 p-0.5 rounded-md"
                    >
                        <X size={14} />
                    </button>
                </span>
            );
        })}
        
        {/* Show a placeholder if nothing is selected */}
        {(watch("applicable_product_ids") || []).length === 0 && (
            <p className="text-xs text-gray-400 italic">No specific products selected. Coupon applies to entire cart.</p>
        )}
    </div>
</div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <><Loader2 size={18} className="animate-spin" /> Saving...</>
                        ) : (
                            isEditMode ? "Update Coupon" : "Create Coupon"
                        )}
                    </button>
                </form>
            </div>
                        <Toaster />
            
        </div>
    );
};