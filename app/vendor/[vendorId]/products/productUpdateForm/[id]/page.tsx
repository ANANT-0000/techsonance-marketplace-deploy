"use client"
import { fetchVendorOneProducts, fetchVendorsProductsCategory, fetchVendorWarehouse } from "@/utils/vendorApiClient";
import { ProductForm } from "@/components/vendor/ProductForm";
import { Inventory, ProductResponseType, ProductStatusEnum } from "@/utils/Types";
import { ProductFormInput, ProductFormOutput, ProductFormValuesType } from "@/utils/validation";
import { authToken } from "@/utils/authToken";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";
interface Attribute {
    name: string;
    value: string; // could be string[] if multiple values
}

interface ProductImage {
    id: string;
    image_url: string;
    alt_text?: string;
    imgType: "main" | "gallery";
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
const getCategoryOptions = async (setCategoryOptions: (categoryOptions: { value: string; label: string; }[]) => void, vendorId: string, token: string) => {
    await fetchVendorsProductsCategory(vendorId, token).then((res) => {
        setCategoryOptions(res.data.map((c: any) => ({ value: c.id, label: c.name })));
    }).catch((error) => {
        console.error("Error fetching category options:", error);
        setCategoryOptions([]);
    });
}
const getExitingProduct = async (setGetExitingProduct: (getExitingProduct: ProductVariant | null) => void, id: string, token: string) => {
    id ? await fetchVendorOneProducts(id, token).then((res) => {
        console.log('res', res.data)
        setGetExitingProduct(res.data);
    }).catch((error) => {
        console.error("Error fetching existing product data:", error);
        setGetExitingProduct(null);
    }) : null;
}

const getwarehouseOptions = async (setWarehouseOptions: (warehouseOptions: { value: string; label: string; }[]) => void, token: string) => {
    await fetchVendorWarehouse(token).then((res) => {
        setWarehouseOptions(res.data.map((w: any) => ({ value: w.id, label: w.warehouse_name })));
    }).catch((error) => {
        console.error("Error fetching warehouse options:", error);
        return [];
    });
}
export default function ProductUpdateFormPage() {
    const { vendorId, id } = useParams<{ vendorId: string, id: string }>();
    const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string; }[]>([]);
    const [warehouseOptions, setWarehouseOptions] = useState<{ value: string; label: string; }[]>([]);
    const [exitingProduct, setGetExitingProduct] = useState<ProductVariant | null>(null);
    const token = authToken();
    if (!token) {
        redirect("/auth/vendorLogin")
    }
    useEffect(() => {
        getExitingProduct(setGetExitingProduct, id, token);
        getCategoryOptions(setCategoryOptions, vendorId, token);
        getwarehouseOptions(setWarehouseOptions, token);
    }, [token, id]);
    console.log("exitingProduct",exitingProduct)
    const exitingData: Partial<ProductFormInput | ProductFormOutput | {}> = exitingProduct ? {
        productName: exitingProduct?.product?.name || '',
        description: exitingProduct?.product?.description || '',
        features: exitingProduct?.product?.features || [],
        attributes: exitingProduct?.attributes
            ? exitingProduct.attributes.map((attr) => ({ name: attr.name, value: attr.value }))
            : [],
        basePrice: exitingProduct?.product?.base_price || '',
        discountPercent: exitingProduct?.product?.discount_percent || '',

        // Fixed: Stock is inside the 'inventory' object
        stocks: exitingProduct?.inventory?.stock_quantity !== undefined
            ? String(exitingProduct.inventory.stock_quantity)
            : '',

        sku: exitingProduct?.sku || '',

        // Fixed: Images array is at the root level, not inside 'product'
        productMedia: exitingProduct?.images?.filter((img) => img?.imgType === "main") || [],
        featureMedia: exitingProduct?.images?.filter((img) => img?.imgType === "gallery") || [],

        // Note: 'category_id' isn't in the provided JSON, but kept here if your schema expects it
        category: exitingProduct?.product?.category_id || '',

        status: exitingProduct?.status as ProductStatusEnum || '',
        variantId: exitingProduct?.id || '',

        // Fixed: Warehouse ID is inside the 'inventory' object
        warehouseId: exitingProduct?.inventory?.warehouse_id || ''
    } : {};


    return (
        <main className="min-h-screen  py-8 w-full">
            <div className=" mx-auto">
                <ProductForm categoryOptions={categoryOptions} warehouseOptions={warehouseOptions} vendorId={vendorId} existingData={exitingData} productId={id} />
            </div>
        </main>
    );
}