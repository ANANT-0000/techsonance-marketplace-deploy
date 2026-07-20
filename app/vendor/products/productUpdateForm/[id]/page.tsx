"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";
import {
  fetchTaxSlabOptions,
  fetchVendorOneProducts,
  fetchVendorsProductsCategory,
  fetchVendorWarehouse,
} from "@/utils/vendorApiClient";
import { ProductForm } from "@/components/vendor/ProductForm";
import {
  Inventory,
  ProductResponseType,
  ProductStatus,
  ProductImageType,
} from "@/utils/Types";
import {
  ProductFormInput,
  ProductFormOutput,
  ProductFormValuesType,
} from "@/utils/validation";
import { authToken } from "@/utils/authToken";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/reduxHooks";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";

interface Attribute {
  name: string;
  value: string; // could be string[] if multiple values
}

interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string;
  imgType: ProductImageType;
  is_primary: boolean;
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
  tax_slab_id: string;
}

interface ProductVariant {
  id: string;
  variant_name: string;
  sku: string;
  price: string;
  attributes: Attribute[];
  status: "active" | "inactive" | string;
  stock_quantity: number;
  images: ProductImage[];
  seo_meta: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  product_id: string;
  product: Product;
  inventory: Inventory;
  warehouse_id: string;
  weight_kg?: string;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
}
const getCategoryOptions = async (
  setCategoryOptions: (
    categoryOptions: { value: string; label: string }[],
  ) => void,
  token: string,
  companyId: string,
) => {
  await fetchVendorsProductsCategory(token, companyId)
    .then((res) => {
      setCategoryOptions(
        res.data.map((c: any) => ({ value: c.id, label: c.name })),
      );
    })
    .catch((error) => {
      setCategoryOptions([]);
    });
};
const getExitingProduct = async (
  setGetExitingProduct: (getExitingProduct: ProductVariant | null) => void,
  id: string,
  token: string,
  companyId: string,
) => {
  id
    ? await fetchVendorOneProducts(id, token, companyId)
        .then((res) => {
          setGetExitingProduct(res.data);
        })
        .catch((error) => {
          setGetExitingProduct(null);
        })
    : null;
};

const getWarehouseOptions = async (
  setWarehouseOptions: (
    warehouseOptions: { value: string; label: string }[],
  ) => void,
  token: string,
  companyId: string,
) => {
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
const getTaxSlabsOptions = async (
  token: string,
  setTaxSlabsOptions: any,
  companyId: string,
) => {
  fetchTaxSlabOptions(token, companyId)
    .then((res) => {
      setTaxSlabsOptions(
        res.data.map((t: any) => ({ value: t.id, label: t.slab_name })),
      );
    })
    .catch((error) => {});
};

export default function ProductUpdateFormPage() {
  const companyId = getClientCompanyId();

  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const vendorId = (user && "vendor_id" in user ? user.vendor_id : "") ?? "";
  const [categoryOptions, setCategoryOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [warehouseOptions, setWarehouseOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [taxSlabsOptions, setTaxSlabsOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [exitingProduct, setGetExitingProduct] =
    useState<ProductVariant | null>(null);
  const token = authToken();
  if (!token || !companyId) {
    redirect(VEDNOR_LOGIN_PATH);
  }
  useEffect(() => {
    getExitingProduct(setGetExitingProduct, id, token, companyId);
    getCategoryOptions(setCategoryOptions, token, companyId);
    getWarehouseOptions(setWarehouseOptions, token, companyId);
    getTaxSlabsOptions(token, setTaxSlabsOptions, companyId);
  }, [token, id]);
  const exitingData: Partial<ProductFormInput | ProductFormOutput | {}> =
    exitingProduct
      ? {
          productName: exitingProduct?.product?.name || "",
          description: exitingProduct?.product?.description || "",
          features: exitingProduct?.product?.features || [],
          attributes: exitingProduct?.attributes
            ? exitingProduct.attributes.map((attr) => ({
                name: attr.name,
                value: attr.value,
              }))
            : [],
          basePrice: exitingProduct?.product?.base_price || "",
          discountPercent: exitingProduct?.product?.discount_percent || "",

          // Fixed: Stock is inside the 'inventory' object
          stocks:
            exitingProduct?.inventory?.stock_quantity !== undefined
              ? String(exitingProduct.inventory.stock_quantity)
              : "",

          sku: exitingProduct?.sku || "",

          // Fixed: Images array is at the root level, not inside 'product'
          productMedia:
            exitingProduct?.images?.filter(
              (img) => img?.imgType === ProductImageType.MAIN,
            ) || [],
          featureMedia:
            exitingProduct?.images?.filter(
              (img) => img?.imgType === ProductImageType.GALLERY,
            ) || [],

          // Note: 'category_id' isn't in the provided JSON, but kept here if your schema expects it
          category: exitingProduct?.product?.category_id || "",
          taxSlabId: exitingProduct?.product?.tax_slab_id || "",
          status: (exitingProduct?.status as ProductStatus) || "",
          variantId: exitingProduct?.id || "",

          // Fixed: Warehouse ID is inside the 'inventory' object
          warehouseId: exitingProduct?.inventory?.warehouse_id || "",
          weight_kg: exitingProduct?.weight_kg || "",
          length_cm: exitingProduct?.length_cm?.toString() || "",
          width_cm: exitingProduct?.width_cm?.toString() || "",
          height_cm: exitingProduct?.height_cm?.toString() || "",
        }
      : {};

  return (
    <main className="min-h-screen max-h-screen overflow-y-scroll py-8 w-full mx-auto">
      <ProductForm
        categoryOptions={categoryOptions}
        warehouseOptions={warehouseOptions}
        taxSlabsOptions={taxSlabsOptions}
        vendorId={vendorId}
        existingData={exitingData}
        productId={id}
      />
    </main>
  );
}
