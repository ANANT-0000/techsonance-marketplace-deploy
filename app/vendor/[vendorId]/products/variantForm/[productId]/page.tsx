import { ProductVariantForm } from "@/components/vendor/ProductVariantForm";

export default async function ProductVariantFormPage({ params }: { params: Promise<{ vendorId: string, productId: string }> }) {
    const { vendorId, productId } = await params;

    return (
        <main className="min-h-screen py-8 px-4 w-full">
            <div className="mx-auto">
<ProductVariantForm vendorId={vendorId} productId={productId} />
            </div >
        </main >
    );
}