import { ProductVariantForm } from "@/components/vendor/ProductVariantForm";
import { BASE_API_URL } from "@/constants";
import { fetchProduct } from "@/utils/commonAPiClient";
import { fetchVendorWarehouse } from "@/utils/vendorApiClient";

export default async function ProductVariantFormPage({ params }: { params: Promise<{ vendorId: string, productId: string }> }) {
    const { vendorId, productId } = await params;
    const fetchProductMainDetails = async () => {
        const response = await fetch(`${BASE_API_URL}products/main-details/${productId}`)
            .then((res) => res.json())
            .catch((error) => {
                console.error("Error fetching product details:", error);
                return null;
            });
        return response?.data || null;
    };
    const warehouseOptions = await fetchVendorWarehouse().then((res) => {
        return res.data.map((w: any) => ({ value: w.id, label: w.warehouse_name }));
    }).catch((error) => {
        console.error("Error fetching warehouse options:", error);
        return [];
    });
    const productDetails: {
        id: string;
        name: string;
        category: { id: string; name: string };
    } = await fetchProductMainDetails();
    return (
        <main className="min-h-screen py-8 px-4 w-full">
            <div className="mx-auto">
                <ProductVariantForm vendorId={vendorId} productDetails={productDetails} productId={productId} warehouseOptions={warehouseOptions} />
            </div >
        </main >
    );
}