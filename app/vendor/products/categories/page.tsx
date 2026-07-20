"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";
import { fetchVendorsProductsCategory } from "@/utils/vendorApiClient";
import CategoryManager from "@/components/vendor/category/CategoryManager";
import { authToken } from "@/utils/authToken";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORY_MANAGER_TEXT } from "@/constants/vendorText";
import { Category } from "@/utils/Types";
import toast from "react-hot-toast";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";

const getCategoryOptions = async (
  token: string,
  companyId: string,
  setCategoryOptions: any,
) => {
  await fetchVendorsProductsCategory(token, companyId)
    .then((res) => {
      setCategoryOptions(
        (res.data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          parent_id: c.parent_id,
          productCount: c.products?.length || 0,
          updated_at: c.updated_at || new Date().toISOString(),
          icon_url: c.icon_url || null,
          show_in_nav: c.show_in_nav ?? true,
        })),
      );
    })
    .catch(() => {
      toast.error("Failed to load categories. Please try again.");
    });
};

export default function CategoryPage() {
  const companyId = getClientCompanyId();

  const token = authToken();
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [checkChange, setCheckChange] = useState(false);
  useEffect(() => {
    if (token && companyId) {
      getCategoryOptions(token, companyId, setCategoryOptions);
    }
  }, [token, checkChange]);

  if (!token) {
    redirect(VEDNOR_LOGIN_PATH);
  }

  return (
    <div className=" px-6 py-1 w-full min-h-screen max-h-screen overflow-y-scroll">
      {/* <header className="mb-8">
        <h1 className="text-theme-h4 font-bold text-gray-800">
          {CATEGORY_MANAGER_TEXT.HEADER.TITLE}
        </h1>
        <p className="text-gray-500">{CATEGORY_MANAGER_TEXT.HEADER.DESC}</p>
      </header> */}

      <CategoryManager
        setCheckChange={setCheckChange}
        categories={categoryOptions}
      />
    </div>
  );
}
