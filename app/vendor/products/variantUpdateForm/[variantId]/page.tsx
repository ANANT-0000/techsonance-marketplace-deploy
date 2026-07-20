"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";
import { ProductVariantForm } from "@/components/vendor/ProductVariantForm";
import { authToken } from "@/utils/authToken";
import { fetchVariant, fetchVendorWarehouse } from "@/utils/vendorApiClient";
import { id, is } from "date-fns/locale";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductImageType } from "@/utils/Types";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";
import { SessionErrorCard } from "@/components/vendor/SessionErrorCard";

interface Attribute {
  name: string;
  value: string; // could be string[] if multiple values
}

interface ProductFeature {
  id: string;
  title: string;
  description: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  features: ProductFeature[];
  base_price: string;
  discount_percent: string;
  stock_quantity: number;
  status: "active" | "inactive" | string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  company_id: string;
  vendor_id: string;
  category_id: string;
}

interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string;
  imgType: ProductImageType;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  product_id: string;
  variant_id: string;
}

interface ProductVariantResponseType {
  id: string;
  variant_name: string;
  sku: string;
  price: string;
  attributes: Attribute[];
  status: "active" | "inactive" | string;
  stock_quantity: number;
  seo_meta: string | null;
  created_at: string;
  updated_at: string;
  product_id: string;
  product: Product;
  inventory?: {
    stock_quantity: number;
    warehouse_id: string;
  };
  images: ProductImage[];
  weight_kg?: string;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
}
const getExistVariant = async (
  variantId: string,
  setExistVariant: (existVariant: ProductVariantResponseType | null) => void,
  token: string,
  companyId: string,
) => {
  await fetchVariant(variantId, token, companyId)
    .then((res) => setExistVariant(res.data))
    .catch((error) => {});
};
const getWarehouseOptions = async ({
  setWarehouseOptions,
  token,
  companyId,
}: {
  setWarehouseOptions: (
    warehouseOptions: { value: string; label: string }[],
  ) => void;
  token: string;
  companyId: string;
}) => {
  await fetchVendorWarehouse(token, companyId)
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
  const companyId = getClientCompanyId();

  const { variantId } = useParams<{ variantId: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const vendorId = (user && "vendor_id" in user ? user.vendor_id : "") ?? "";
  const [existVariant, setExistVariant] =
    useState<ProductVariantResponseType | null>(null);
  const [warehouseOptions, setWarehouseOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const token = authToken();
  if (!token || !companyId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/30">
        <SessionErrorCard />
      </div>
    );
  }
  useEffect(() => {
    getExistVariant(variantId, setExistVariant, token, companyId);
    getWarehouseOptions({ setWarehouseOptions, token, companyId });
  }, [token]);
  const existingProductVariant = existVariant
    ? {
        id: existVariant.id,
        productId: existVariant.product_id,
        variantName: existVariant.variant_name,
        attributes: existVariant.attributes?.map((attr) => ({
          name: attr.name,
          value: attr.value,
        })) || [{ name: "", value: "" }],
        basePrice: existVariant.price,
        discountPercent: existVariant.product.discount_percent,
        stocks: existVariant.stock_quantity?.toString() || "0",
        sku: existVariant.sku,
        warehouseId: existVariant.inventory?.warehouse_id || "",
        // Map images from API into FileOrProductImage shape
        variantMediaMain: existVariant.images
          .filter((img) => img.imgType === ProductImageType.MAIN)
          .map((img) => ({
            id: img.id,
            image_url: img.image_url,
            alt_text: img.alt_text,
            imgType: img.imgType,
            is_primary: img.is_primary,
            created_at: img.created_at,
            updated_at: img.updated_at,
            product_id: img.product_id,
            variant_id: img.variant_id,
          })),
        variantMediaGallery: existVariant.images
          .filter((img) => img.imgType === ProductImageType.GALLERY)
          .map((img) => ({
            id: img.id,
            image_url: img.image_url,
            alt_text: img.alt_text,
            imgType: img.imgType,
            is_primary: img.is_primary,
            created_at: img.created_at,
            updated_at: img.updated_at,
            product_id: img.product_id,
            variant_id: img.variant_id,
          })),
        status: existVariant.status,
        weight_kg: existVariant.weight_kg || "",
        length_cm: existVariant.length_cm?.toString() || "",
        width_cm: existVariant.width_cm?.toString() || "",
        height_cm: existVariant.height_cm?.toString() || "",
      }
    : undefined;

  return (
    <main className="min-h-screen max-h-screen overflow-y-scroll w-full py-8 px-4 ">
      <ProductVariantForm
        vendorId={vendorId}
        productId={existVariant?.product_id}
        existVariant={existingProductVariant}
        variantId={variantId}
        warehouseOptions={warehouseOptions}
      />
    </main>
  );
}
