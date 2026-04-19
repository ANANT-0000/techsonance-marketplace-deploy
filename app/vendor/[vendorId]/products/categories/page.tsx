import CategoryManager from "@/components/vendor/CategoryManager";
import { fetchVendorsProductsCategory } from "@/utils/vendorApiClient";

export default async function CategoryPage({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = await params;
    console.log(vendorId);

    const getCategory = await fetchVendorsProductsCategory(vendorId);
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