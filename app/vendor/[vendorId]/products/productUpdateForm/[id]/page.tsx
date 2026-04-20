import { fetchVendorOneProducts, fetchVendorsProductsCategory } from "@/utils/vendorApiClient";
import { ProductForm } from "@/components/vendor/ProductForm";
import { ProductResponseType, ProductStatusEnum } from "@/utils/Types";
import { ProductFormInput, ProductFormOutput, ProductFormValuesType } from "@/utils/validation";
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
    images: ProductImage[];
}

interface ProductVariant {
    id: string;
    variant_name: string;
    sku: string;
    price: string;
    attributes: Attribute[];
    status: "active" | "inactive" | string;
    stock_quantity: number;
    seo_meta: string | null;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    product_id: string;
    product: Product;
}

export default async function ProductUpdateFormPage({ params }: { params: Promise<{ vendorId: string, id: string }> }) {

    const { vendorId, id } = await params;
    const getExitingProduct: ProductVariant | null = id ? await fetchVendorOneProducts(id).then((res) => {
        console.log("Existing Product Data:", res.data);
        return res.data;
    }).catch((error) => {
        console.error("Error fetching existing product data:", error);
        return null;
    }) : null;
    // console.log(getExitingProduct)

    const exitingData: Partial<ProductFormInput | ProductFormOutput> = {
        productName: getExitingProduct?.product.name || '',
        description: getExitingProduct?.product.description || '',
        features: getExitingProduct?.product.features ? getExitingProduct?.product.features : [],
        attributes: getExitingProduct?.attributes ? getExitingProduct?.attributes.map((attr) => ({ name: attr.name, value: attr.value })) : [],
        basePrice: getExitingProduct?.product.base_price || '',
        discountPercent: getExitingProduct?.product.discount_percent || '',
        stocks: String(getExitingProduct?.stock_quantity) || '',
        sku: getExitingProduct?.sku ? getExitingProduct.sku : '',
        productMedia: getExitingProduct?.product.images && getExitingProduct?.product.images?.filter((img) => img?.imgType === "main") || [],
        featureMedia: getExitingProduct?.product.images && getExitingProduct?.product.images?.filter((img) => img?.imgType === "gallery") || [],
        category: getExitingProduct?.product.category_id || '',
        status: getExitingProduct?.status as ProductStatusEnum || '',
        variantId: getExitingProduct?.id || '',
        warehouseId: getExitingProduct?.warehouse_id || ''

    }
    const categoryOptions = await fetchVendorsProductsCategory(vendorId).then((res) => {
        return res.data.map((c: any) => ({ value: c.id, label: c.name }));
    }).catch((error) => {
        console.error("Error fetching category options:", error);
        return [];
    });
    console.log("exitingData", exitingData)

    return (
        <main className="min-h-screen  py-8 w-full">
            <div className=" mx-auto">
                <ProductForm categoryOptions={categoryOptions} vendorId={vendorId} existingData={exitingData} productId={id} />
            </div>
        </main>
    );
}