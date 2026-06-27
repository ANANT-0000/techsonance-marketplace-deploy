"use client";

import { useForm } from "react-hook-form";
import { BUSINESS_PROFILE_TEXT } from "@/constants/vendorText";

interface BusinessProfile {
  id: number;
  full_name: string; // The personal name of the account holder
  tax_id: string; // e.g., GSTIN, VAT, or PAN
  business_name: string; // The display name of the shop/company
  contact_email: string;
  contact_phone: string;
  description: string; // A brief "About Us" for the storefront
  verified: boolean; // (Optional) To track if the profile is approved
}

/**
 * Array of Mock Business Profiles
 */
const businessProfileData: BusinessProfile = {
  id: 2,
  full_name: "Anita Desai",
  tax_id: "27AABCV5678G1Z9",
  business_name: "Desai Electronics Hub",
  contact_email: "support@desaielectronics.in",
  contact_phone: "+91 99887 76655",
  description:
    "Authorized reseller of major tech brands. Selling smartphones, laptops, and accessories with a 1-year warranty on all products.",
  verified: true,
};

export default function BusinessProfilePage() {
  const { register, getValues, setValue, watch, handleSubmit } = useForm({
    defaultValues: {
      full_name: businessProfileData.full_name,
      tax_id: businessProfileData.tax_id,
      business_name: businessProfileData.business_name,
      contact_email: businessProfileData.contact_email,
      contact_phone: businessProfileData.contact_phone,
      description: businessProfileData.description,
    },
  });
  return (
    <>
      <main
        className={`w-full mx-auto mt-6 max-h-screen min-h-screen overflow-y-scroll `}
      >
        <form
          className="vendor_settings_content p-6 bg-white rounded-lg border-2 border-gray-300 "
          onSubmit={handleSubmit((data) => {})}
        >
          <h2 className="text-theme-h4 font-bold mb-4">
            {BUSINESS_PROFILE_TEXT.TITLE}
          </h2>
          <section className="space-y-5">
            <span className="flex  gap-12 justify-between">
              <div className="flex-1">
                <label className="block text-gray-700 mb-2 font-bold">
                  {BUSINESS_PROFILE_TEXT.LABELS.FULL_NAME}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg py-2 px-4"
                  placeholder={BUSINESS_PROFILE_TEXT.PLACEHOLDERS.FULL_NAME}
                  {...register("full_name")}
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 mb-2 font-bold">
                  {BUSINESS_PROFILE_TEXT.LABELS.BUSINESS_NAME}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg py-2 px-4"
                  placeholder={BUSINESS_PROFILE_TEXT.PLACEHOLDERS.BUSINESS_NAME}
                  {...register("business_name")}
                />
              </div>
            </span>
            <span className="flex  gap-12 justify-between">
              <div className="flex-1">
                <label className="block text-gray-700 mb-2 font-bold">
                  {BUSINESS_PROFILE_TEXT.LABELS.CONTACT_EMAIL}
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg py-2 px-4"
                  placeholder={BUSINESS_PROFILE_TEXT.PLACEHOLDERS.CONTACT_EMAIL}
                  {...register("contact_email")}
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 mb-2 font-bold">
                  {BUSINESS_PROFILE_TEXT.LABELS.CONTACT_PHONE}
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg py-2 px-4"
                  placeholder={BUSINESS_PROFILE_TEXT.PLACEHOLDERS.CONTACT_PHONE}
                  {...register("contact_phone")}
                />
              </div>
            </span>
            <div>
              <label className="block text-gray-700 mb-2 font-bold">
                {BUSINESS_PROFILE_TEXT.LABELS.DESCRIPTION}
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg py-2 px-4"
                placeholder={BUSINESS_PROFILE_TEXT.PLACEHOLDERS.DESCRIPTION}
                {...register("description")}
              ></textarea>
            </div>
          </section>
          <div className="mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white font-medium rounded-xl"
            >
              {BUSINESS_PROFILE_TEXT.SAVE_BTN}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
