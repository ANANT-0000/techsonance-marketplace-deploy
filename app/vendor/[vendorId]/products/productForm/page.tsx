import { fetchVendorsProductsCategory, fetchVendorWarehouse } from "@/utils/vendorApiClient";
import { ProductForm } from "@/components/vendor/ProductForm";
import { authToken } from "@/utils/authToken";
import { redirect } from "next/navigation";

export default async function ProductFormPage({ params }: { params: Promise<{ vendorId: string }> }) {

    const { vendorId } = await params;
    const token = authToken();
    if (!token) {
        redirect("/auth/vendorLogin");
    }
    const warehouseOptions = await fetchVendorWarehouse(token).then((res) => {
        return res.data.map((w: any) => ({ value: w.id, label: w.warehouse_name }));
    }).catch((error) => {
        console.error("Error fetching warehouse options:", error);
        return [];
    });
    const categoryOptions = await fetchVendorsProductsCategory(vendorId, token).then((res) => {
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