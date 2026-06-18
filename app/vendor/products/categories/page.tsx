"use client";
import { fetchVendorsProductsCategory } from "@/utils/vendorApiClient";
import CategoryManager from "@/components/vendor/category/CategoryManager";
import { authToken } from "@/utils/authToken";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORY_MANAGER_TEXT } from "@/constants/vendorText";

const getCategoryOptions = async (token: string, setCategoryOptions: any) => {
  await fetchVendorsProductsCategory(token)
    .then((res) => {
      setCategoryOptions(
        (res.data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          parent_id: c.parent_id,
          productCount: c.products?.length || 0,
          updated_at: c.updated_at || new Date().toISOString(),
        })),
      );
    })
    .catch((error) => {});
};

export default function CategoryPage() {
  const token = authToken();
  const [categoryOptions, setCategoryOptions] = useState<
    {
      id: string;
      name: string;
      description: string;
      parent_id: string | null;
      productCount: number;
      updated_at: string;
    }[]
  >([]);
  const [checkChange, setCheckChange] = useState(false);
  useEffect(() => {
    if (token) {
      getCategoryOptions(token, setCategoryOptions);
    }
  }, [token, checkChange]);

  if (!token) {
    redirect("/auth/vendorLogin");
  }

  return (
    <div className=" p-6 w-full h-screen overflow-y-scroll">
      <header className="mb-8">
        <h1 className="text-theme-h4 font-bold text-gray-800">
          {CATEGORY_MANAGER_TEXT.HEADER.TITLE}
        </h1>
        <p className="text-gray-500">{CATEGORY_MANAGER_TEXT.HEADER.DESC}</p>
      </header>

      <CategoryManager
        setCheckChange={setCheckChange}
        categories={categoryOptions}
      />
    </div>
  );
}
