"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { Textarea } from "./TextArea";
import { Input } from "./Input";
import AxiosAPI from "@/lib/axios";
import { Button } from "../ui/button";

export default function CampaignForm({ existingData }: { existingData?: any }) {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: existingData?.name || "",
    description: existingData?.description || "",
    discountType: existingData?.discount_config?.type || "percentage",
    discountValue: existingData?.discount_config?.value || "",
    discountCap: existingData?.discount_config?.cap || "",
    validFrom: existingData?.valid_from ? new Date(existingData.valid_from).toISOString().slice(0, 16) : "",
    validTo: existingData?.valid_to ? new Date(existingData.valid_to).toISOString().slice(0, 16) : "",
    minCartValue: existingData?.rules?.minCartValue || "",
    maxUsesTotal: existingData?.max_uses_total || "",
    autoApply: existingData?.is_auto_applied ?? true,
    couponCode: existingData?.coupon_code || "", // Optional, only if autoApply is false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Map to your unified promotions backend schema
      const payload = {
        company_id: vendorId,
        name: formData.name,
        description: formData.description,
        is_auto_applied: formData.autoApply,
        coupon_code: formData.autoApply ? null : formData.couponCode,
        discount_config: {
          type: formData.discountType,
          value: Number(formData.discountValue),
          cap: formData.discountCap ? Number(formData.discountCap) : null,
        },
        valid_from: new Date(formData.validFrom).toISOString(),
        valid_to: new Date(formData.validTo).toISOString(),
        max_uses_total: formData.maxUsesTotal ? Number(formData.maxUsesTotal) : null,
        rules: {
          min_cart_value: formData.minCartValue ? Number(formData.minCartValue) : null,
        }
      };

      if (existingData?.id) {
        await AxiosAPI.patch(`/v1/promotions/${existingData.id}`, payload);
        toast.success("Campaign updated successfully");
      } else {
        await AxiosAPI.post(`/v1/promotions`, payload);
        toast.success("Campaign created successfully");
      }

      router.push(`/vendor/${vendorId}/marketing/campaigns`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Campaign Name</label>
            <Input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Summer Mega Sale" />
          </div>
          
          <div className="flex flex-col justify-center mt-6">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" name="autoApply" checked={formData.autoApply} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Auto-apply at checkout (No coupon code needed)</span>
            </label>
          </div>
        </div>

        {!formData.autoApply && (
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Coupon Code</label>
            <Input name="couponCode" value={formData.couponCode} onChange={handleChange} required={!formData.autoApply} placeholder="e.g. SUMMER50" />
          </div>
        )}
        
        <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <Textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Describe the offer details..." />
        </div>
      </div>

      {/* Discount Configuration (JSON Strategy mapping) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Discount Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-1.5">
  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
    Discount Type
  </label>
  <Select 
    value={formData.discountType} 
    onValueChange={(value) => setFormData(prev => ({ ...prev, discountType: value }))}
  >
    <SelectTrigger className="w-full dark:bg-gray-900 dark:border-gray-600">
      <SelectValue placeholder="Select Discount Type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="percentage">Percentage (%)</SelectItem>
      <SelectItem value="fixed_amount">Fixed Amount (₹)</SelectItem>
      <SelectItem value="bogo">Buy 1 Get 1 (BOGO)</SelectItem>
    </SelectContent>
  </Select>
</div>
          
          <div className="flex flex-col space-y-1.5">
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount Value</label>
             <Input name="discountValue" type="number" value={formData.discountValue} onChange={handleChange} required placeholder={formData.discountType === 'percentage' ? "e.g. 20" : "e.g. 500"} />
          </div>

          {formData.discountType === 'percentage' && (
            <div className="flex flex-col space-y-1.5">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Discount Cap (₹)</label>
               <Input name="discountCap" type="number" value={formData.discountCap} onChange={handleChange} placeholder="e.g. 2000" />
            </div>
          )}
        </div>
      </div>

      {/* Rules & Constraints */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Rules & Validity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="flex flex-col space-y-1.5">
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Valid From</label>
             <Input name="validFrom" type="datetime-local" value={formData.validFrom} onChange={handleChange} required />
           </div>
           
           <div className="flex flex-col space-y-1.5">
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Valid To</label>
             <Input name="validTo" type="datetime-local" value={formData.validTo} onChange={handleChange} required />
           </div>
           
           <div className="flex flex-col space-y-1.5">
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Cart Value (₹)</label>
             <Input name="minCartValue" type="number" value={formData.minCartValue} onChange={handleChange} placeholder="e.g. 999" />
           </div>
           
           <div className="flex flex-col space-y-1.5">
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Global Usages Allowed</label>
             <Input name="maxUsesTotal" type="number" value={formData.maxUsesTotal} onChange={handleChange} placeholder="Leave blank for unlimited" />
           </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Campaign"}</Button>
      </div>
    </form>
  );
}