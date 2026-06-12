"use client";
import { fetchVendorsProductsCategory } from "@/utils/vendorApiClient";
import CategoryManager from "@/components/vendor/CategoryManager";
import { authToken } from "@/utils/authToken";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

const getCategoryOptions = async (token: string, setCategoryOptions: any) => {
  await fetchVendorsProductsCategory(token)
    .then((res) => {
      setCategoryOptions(
        res.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
        })),
      );
    })
    .catch((error) => {});
};

export default function CategoryPage() {
  const token = authToken();
  const [categoryOptions, setCategoryOptions] = useState<
    { id: string; name: string; description: string }[]
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
    <div className=" p-6 w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Category Management
        </h1>
        <p className="text-gray-500">
          Organize your products by creating descriptive categories.
        </p>
      </header>

      <CategoryManager
        setCheckChange={setCheckChange}
        categories={categoryOptions}
      />
    </div>
  );
}
