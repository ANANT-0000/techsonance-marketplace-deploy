import CategoryManager from "@/components/vendor/CategoryManager";
import { authToken } from "@/utils/authToken";
import { fetchVendorsProductsCategory } from "@/utils/vendorApiClient";
import { redirect } from "next/navigation";

export default async function CategoryPage({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = await params;

    const token = authToken();
    if (!token) {
        redirect("/auth/vendorLogin")
    }
    const getCategory = await fetchVendorsProductsCategory(vendorId, token);
    const categories = getCategory?.data || [];

    return (
        <div className=" p-6 w-full">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
                <p className="text-gray-500">Organize your products by creating descriptive categories.</p>
            </header>

            <CategoryManager
                categories={categories}
                vendorId={vendorId}
            />
        </div>
    );
}