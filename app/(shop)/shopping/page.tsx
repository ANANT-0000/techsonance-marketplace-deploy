import { ShoppingList } from "@/components/customer/ShoppingList";
import { getCompanyDomain} from "@/lib/get-domain";
import { fetchProductVendorProducts } from "@/utils/commonAPiClient";

export default async function ShoppingPage({ Params }: { Params: { id: string } }) {
    const getProducts = await fetchProductVendorProducts();
    console.log("Products from API:", getProducts);
    const products = getProducts.data && getProducts.data.length > 0 ? getProducts.data : [];
    const companyDomain = await getCompanyDomain();
    console.log("companyDomain", companyDomain);
    return (
        <>
            <main className="flex gap-8 xl:pt-10 pb-8 xl:px-32 lg:px-8 md:px-4 sm:px-2 py-1 px-2">
                <section className="w-full content-visibility-auto contain-intrinsic-size-[100dvh]">
                    <ShoppingList products={products} />
                </section>
            </main>
        </>
    );
}
