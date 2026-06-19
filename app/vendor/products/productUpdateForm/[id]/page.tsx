"use client";
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
  ProductStatusEnum,
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
}
const getCategoryOptions = async (
  setCategoryOptions: (
    categoryOptions: { value: string; label: string }[],
  ) => void,
  token: string,
) => {
  await fetchVendorsProductsCategory(token)
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
) => {
  id
    ? await fetchVendorOneProducts(id, token)
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
) => {
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
const getTaxSlabsOptions = async (token: string, setTaxSlabsOptions: any) => {
  fetchTaxSlabOptions(token)
    .then((res) => {
      setTaxSlabsOptions(
        res.data.map((t: any) => ({ value: t.id, label: t.slab_name })),
      );
    })
    .catch((error) => {});
};

export default function ProductUpdateFormPage() {
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
  if (!token) {
    redirect("/auth/vendorLogin");
  }
  useEffect(() => {
    getExitingProduct(setGetExitingProduct, id, token);
    getCategoryOptions(setCategoryOptions, token);
    getWarehouseOptions(setWarehouseOptions, token);
    getTaxSlabsOptions(token, setTaxSlabsOptions);
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
          status: (exitingProduct?.status as ProductStatusEnum) || "",
          variantId: exitingProduct?.id || "",

          // Fixed: Warehouse ID is inside the 'inventory' object
          warehouseId: exitingProduct?.inventory?.warehouse_id || "",
        }
      : {};

  return (
    <main className="min-h-screen  overflow-y-scroll py-8 w-full">
      <div className=" mx-auto">
        <ProductForm
          categoryOptions={categoryOptions}
          warehouseOptions={warehouseOptions}
          taxSlabsOptions={taxSlabsOptions}
          vendorId={vendorId}
          existingData={exitingData}
          productId={id}
        />
      </div>
    </main>
  );
}
