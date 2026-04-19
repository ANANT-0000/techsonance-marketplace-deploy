import { fetchVendorsProductsCategory, fetchVendorWarehouse } from "@/utils/vendorApiClient";
import { ProductForm } from "@/components/vendor/ProductForm";

export default async function ProductFormPage({ params }: { params: Promise<{ vendorId: string }> }) {

    const { vendorId } = await params;
    const warehouseOptions = await fetchVendorWarehouse().then((res) => {
        return res.data.map((w: any) => ({ value: w.id, label: w.warehouse_name }));
    }).catch((error) => {
        console.error("Error fetching warehouse options:", error);
        return [];
    });
    const categoryOptions = await fetchVendorsProductsCategory(vendorId).then((res) => {
        return res.data.map((c: any) => ({ value: c.id, label: c.name }));
    }).catch((error) => {
        console.error("Error fetching category options:", error);
        return [];
    });

    return (
        <main className="min-h-screen  py-8 w-full ">
            <div className=" mx-auto">
                <ProductForm categoryOptions={categoryOptions} vendorId={vendorId} warehouseOptions={warehouseOptions} />
            </div>
        </main>
    );
}