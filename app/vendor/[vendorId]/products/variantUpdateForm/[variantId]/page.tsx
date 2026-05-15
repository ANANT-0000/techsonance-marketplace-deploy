'use client';
import { ProductVariantForm } from "@/components/vendor/ProductVariantForm";
import { authToken } from "@/utils/authToken";
import { fetchVariant, fetchVendorWarehouse } from "@/utils/vendorApiClient";
import { id, is } from "date-fns/locale";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
    imgType: "main" | "gallery";
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
    images: ProductImage[];
}
const getExistVariant = async (variantId: string, setExistVariant: (existVariant: ProductVariantResponseType | null) => void, token: string) => {
    await fetchVariant(variantId, token)
        .then((res) => setExistVariant(res.data))
        .catch((error) => {
            console.error("Error fetching variant data:", error);
        });
}
const getWarehouseOptions = async ({ setWarehouseOptions, token }: { setWarehouseOptions: (warehouseOptions: { value: string; label: string; }[]) => void, token: string }) => {
    await fetchVendorWarehouse(token).then((res) => {
        setWarehouseOptions(res.data.map((w: any) => ({ value: w.id, label: w.warehouse_name })));
    }).catch((error) => {
        console.error("Error fetching warehouse options:", error);
        return [];
    });
}
export default function ProductVariantFormPage() {
    const { vendorId, variantId } = useParams<{ vendorId: string; variantId: string }>();
    const [existVariant, setExistVariant] = useState<ProductVariantResponseType | null>(null);
    const [warehouseOptions, setWarehouseOptions] = useState<{ value: string; label: string; }[]>([]);
    const token = authToken();
    if (!token) {
        redirect("/auth/vendorLogin")
    }
    useEffect(() => {
        getExistVariant(variantId, setExistVariant, token);
        getWarehouseOptions({ setWarehouseOptions, token });
    }, [token])
    const existingProductVariant = existVariant
        ? {
            id: existVariant.id,
            productId: existVariant.product_id,
            variantName: existVariant.variant_name,
            attributes:
                existVariant.attributes?.map((attr) => ({
                    name: attr.name,
                    value: attr.value,
                })) || [{ name: "", value: "" }],
            basePrice: existVariant.price,
            discountPercent: existVariant.product.discount_percent,
            stocks: existVariant.stock_quantity?.toString() || "0",
            sku: existVariant.sku,
            // Map images from API into FileOrProductImage shape
            variantMediaMain: existVariant.images
                .filter((img) => img.imgType === "main")
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
                .filter((img) => img.imgType === "gallery")
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
        }
        : undefined;

    return (
        <main className="min-h-screen w-full py-8 px-4">
            <div className="mx-auto">
                <ProductVariantForm
                    vendorId={vendorId}
                    productId={existVariant?.product_id}
                    existVariant={existingProductVariant}
                    variantId={variantId}
                    warehouseOptions={warehouseOptions}
                />
            </div>
        </main>
    );
}