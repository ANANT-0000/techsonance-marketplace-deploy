"use client";
import { ProductVariantForm } from "@/components/vendor/ProductVariantForm";
import { BASE_API_URL } from "@/constants";
import { authToken } from "@/utils/authToken";
import { fetchProduct } from "@/utils/commonAPiClient";
import { fetchVendorWarehouse } from "@/utils/vendorApiClient";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";

const fetchProductMainDetails = async ({
  productId,
  setProductDetails,
  token,
}: {
  productId: string;
  setProductDetails: (productDetails: {
    id: string;
    name: string;
    category: { id: string; name: string };
  }) => void;
  token: string;
}) => {
  const response = await fetch(
    `${BASE_API_URL}products/main-details/${productId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
    .then((res) => res.json())
    .catch((error) => {
      return null;
    });
  setProductDetails(response?.data || null);
};

const getWarehouseOptions = async ({
  setWarehouseOptions,
  token,
}: {
  setWarehouseOptions: (
    warehouseOptions: { value: string; label: string }[],
  ) => void;
  token: string;
}) => {
  await fetchVendorWarehouse(token)
    .then((res) => {
      setWarehouseOptions(
        res.data.map((w: any) => ({ value: w.id, label: w.warehouse_name })),
      );
    })
    .catch((error) => {
      return [];
    });
};

import { useAppSelector } from "@/hooks/reduxHooks";

export default function ProductVariantFormPage() {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const vendorId = (user && "vendor_id" in user ? user.vendor_id : "") ?? "";
  const [warehouseOptions, setWarehouseOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [productDetails, setProductDetails] = useState<{
    id: string;
    name: string;
    category: { id: string; name: string };
  } | null>(null);
  const token = authToken();
  if (!token) {
    redirect("/auth/vendorLogin");
  }

  useEffect(() => {
    fetchProductMainDetails({ productId, setProductDetails, token });
    getWarehouseOptions({ setWarehouseOptions, token });
  }, [token]);

  return (
    <main className="min-h-screen py-8 px-4 w-full">
      <div className="mx-auto">
        <ProductVariantForm
          vendorId={vendorId}
          productDetails={
            productDetails ?? {
              id: "",
              name: "",
              category: { id: "", name: "" },
            }
          }
          productId={productId}
          warehouseOptions={warehouseOptions}
        />
      </div>
    </main>
  );
}
