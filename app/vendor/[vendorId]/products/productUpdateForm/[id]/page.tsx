import { fetchVendorOneProducts, fetchVendorsProductsCategory } from "@/utils/vendorApiClient";
import { ProductForm } from "@/components/vendor/ProductForm";
import { ProductResponseType, ProductStatusEnum } from "@/utils/Types";
import { ProductFormInput, ProductFormOutput, ProductFormValuesType } from "@/utils/validation";

export default async function ProductFormPage({ params }: { params: Promise<{ vendorId: string, id: string }> }) {

    const { vendorId, id } = await params;
    const getExitingProduct: ProductResponseType | null = id ? await fetchVendorOneProducts(id).then((res) => {
        return res.data;
    }).catch((error) => {
        console.error("Error fetching existing product data:", error);
        return null;
    }) : null;
    // console.log(getExitingProduct)

    const exitingData: Partial<ProductFormInput | ProductFormOutput> = {
        productName: getExitingProduct?.name || '',
        description: getExitingProduct?.description || '',
        features: getExitingProduct?.features ? getExitingProduct.features : [],
        attributes: getExitingProduct?.variants ? getExitingProduct.variants.attributes : [],
        basePrice: getExitingProduct?.base_price || '',
        discountPercent: getExitingProduct?.discount_percent || '',
        stocks: String(getExitingProduct?.stock_quantity) || '',
        sku: getExitingProduct?.variants ? getExitingProduct.variants.sku : '',
        productMedia: getExitingProduct?.images.filter((img) => img?.imgType === "main") || [],
        featureMedia: getExitingProduct?.images.filter((img) => img?.imgType === "gallery") || [],
        category: getExitingProduct?.category_id || '',
        status: getExitingProduct?.status as ProductStatusEnum || '',
        taxProfile: getExitingProduct?.tax_profile || '',
        variantId: getExitingProduct?.variants.id
    }
    const categoryOptions = await fetchVendorsProductsCategory(vendorId).then((res) => {
        return res.data.map((c: any) => ({ value: c.id, label: c.name }));
    }).catch((error) => {
        console.error("Error fetching category options:", error);
        return [];
    });
    console.log("exitingData", exitingData)

    return (
        <main className="min-h-screen  py-8 ">
            <div className=" mx-auto">
                <ProductForm categoryOptions={categoryOptions} vendorId={vendorId} existingData={exitingData} productId={id} />
            </div>
        </main>
    );
}