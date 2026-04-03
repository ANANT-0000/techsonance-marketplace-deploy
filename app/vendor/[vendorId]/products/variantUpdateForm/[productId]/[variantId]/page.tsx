import { ProductVariantForm } from "@/components/vendor/ProductVariantForm";
import { fetchVariant } from "@/utils/vendorApiClient";

export default async function ProductVariantFormPage({ params }: { params: Promise<{ vendorId: string, productId: string, variantId: string }> }) {
    const { vendorId, productId, variantId } = await params;
    const existVariant = await fetchVariant(vendorId, productId, variantId).then((res) => {
        return res.data;
    }).catch((error) => {
        console.error("Error fetching variant data:", error);
        return null;
    }
    );
    return (
        <main className="min-h-screen py-8 px-4">
            <div className="mx-auto">
                <ProductVariantForm vendorId={vendorId} productId={productId} existVariant={existVariant} />
            </div >
        </main >
    );
}