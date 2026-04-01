import { fetchVendorsProductsCategory } from "@/utils/vendorApiClient";
import { ProductForm } from "@/components/vendor/ProductForm";

export default async function ProductFormPage({ params }: { params: Promise<{ vendorId: string }> }) {

    const { vendorId } = await params;

    const categoryOptions = await fetchVendorsProductsCategory(vendorId).then((res) => {
        return res.data.map((c: any) => ({ value: c.id, label: c.name }));
    }).catch((error) => {
        console.error("Error fetching category options:", error);
        return [];
    });

    return (
        <main className="min-h-screen  py-8 ">
            <div className=" mx-auto">
                <ProductForm categoryOptions={categoryOptions} vendorId={vendorId} />
            </div>
        </main>
    );
}