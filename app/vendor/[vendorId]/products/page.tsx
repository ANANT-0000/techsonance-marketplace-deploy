import Link from "next/link";
import { Delete, Edit, Plus } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { fetchVendorProducts, fetchVendorsProductsCategory } from "@/utils/vendorApiClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductType } from "@/utils/Types";
import { DeleteBtn } from "@/components/vendor/DeleteBtn";
import { DynamicIcon } from "lucide-react/dynamic";

export const PRODUCT_TABLE_HEAD = ['', "PRODUCT NAME", "VARIANT", "SKU", "STOCK", "PRICE", "STATUS", "ACTION"];
export default async function Products({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = await params;
    const categoryOptions = await fetchVendorsProductsCategory(vendorId).then((res) => {
        const categories = res?.data || [];
        return categories.map((cat: any) => ({ value: cat.id, label: cat.name }));
    }).catch((error) => {
        console.error("Error fetching category options:", error);
        return [];
    });
    const getProducts = await fetchVendorProducts(vendorId).then((res) => res?.data || []).catch((error) => {
        console.error("Error fetching products:", error);
        return [];
    });
    console.log('vendor product list ', getProducts);
    const productList: ProductType[] = getProducts || [];
    // console.log("productList[2].variants", productList[2]?.variants?.length);
    let count = 1
    const pageSize = 5;
    const totalPages = Math.ceil(productList.length / pageSize);
    const currentPage = count;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData: typeof productList = productList.slice(startIndex, endIndex);
    console.log(productList[pageSize - 1]?.id);
    console.log(currentData)
    const handleDelete = (productId: string) => {
        // Implement the logic to delete the product with the given productId
        console.log(`Delete product with ID: ${productId}`);
    }
    return (

        <>
            <main>
                <div className="flex gap-6 my-6 justify-end">
                    <Link className="rounded-xl bg-black text-white px-4 py-2" href="products/productForm">+ Add New Product</Link>
                    <button className="rounded-xl bg-blue-500 text-white px-4 py-2"> Export CSV</button>
                </div>
                <div className={" mt-2 justify-between rounded-2xl flex border-gray-300    items-center  py-2 gap-4   bg-white  filter  "}>
                    <span className="border flex   flex-3 items-center justify-between gap-0 border-gray-400 px-4 rounded-lg ">
                        <button className="rounded-full w-8 h-8">
                            <DynamicIcon name="search" />
                        </button>

                        <input type="text" className="  text-xl py-2 px-4 w-full " placeholder="Search by name,email or domain" />
                    </span>
                    <span className="flex  gap-4">
                        <select className="vendor_filter rounded-2xl" name="status" id="status">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">In Active</option>

                        </select>
                        <select className="vendor_filter rounded-2xl" name="sort_by" id="sort_by">
                            {
                                categoryOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))

                            }
                        </select>
                    </span>
                </div>

                <Table className="w-full  table-auto min-w-max  my-6 relative border-collapse border border-gray-200  ">

                    <TableHeader className="w-full " >
                        <TableRow className="text-left bg-gray-200 ">
                            <TableHead className="p-4 border-b  text-center  border-gray-400"><input className="w-4  h-4 text-center" type="checkbox" /></TableHead>
                            {
                                PRODUCT_TABLE_HEAD.map((head, index) => (
                                    <TableHead key={index} className={`p-4 border-b  text-center  border-gray-400 ${index === 1 ? 'text-start' : ''} `}>
                                        {head}
                                    </TableHead>
                                ))
                            }

                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-center w-full ">
                        {
                            productList.map((item, index) => (
                                <TableRow key={index} className={`hover:bg-gray-100 ${item.id === productList[pageSize - 1]?.id || item.id === productList[productList.length - 1]?.id ? 'border-b-0' : 'border-b border-gray-400'} border-b border-gray-400   `}>
                                    <TableCell className={`p-4   `}> <input type="checkbox" className="w-6 h-6" /></TableCell>
                                    <TableCell className={` max-w-6 min-w-4 pr-4  `}> <img className=" min-h-8 min-w-8   rounded-2xl" src={item.images[0].image_url} alt="product image" /> </TableCell>
                                    <TableCell className={`p-4  line-clamp-1 whitespace-normal min-w-[300px] max-w-[500px] text-start  `}>
                                        {item.name.trimStart()}
                                    </TableCell>
                                    <TableCell >
                                        {item.variants?.length > 0 ? (
                                            <div className="flex flex-col items-center border p-2 gap-2   border-emerald-600 border-b-3  hover:border-b-1 hover:border-emerald-800 rounded-lg">
                                                <Link href={`/vendor/${vendorId}/products/${item.id}/variants`} className="flex gap-2 text-emerald-600 hover:text-emerald-800 items-center justify-center" title="View Variants">
                                                    {item.variants?.length} Variants <DynamicIcon name="tag" size={18} />
                                                </Link>
                                            </div>
                                        ) : (
                                            <Link
                                                href={`/vendor/${vendorId}/products/variantForm/${item.id}`}
                                                className="flex gap-2 text-emerald-600 hover:text-emerald-800 items-center justify-center"
                                                title="Add Variant">
                                                Create Variant    <DynamicIcon name="plus" size={18} />
                                            </Link>
                                        )
                                        }

                                    </TableCell>
                                    <TableCell className={`p-4 text-start `}>
                                        {/* {item.variants.sku ? item.variants.sku : 'No'} */}
                                        {item.variants[0]?.sku || 'No SKU'}
                                    </TableCell>

                                    <TableCell className={`p-4 text-start  `}>
                                        <p className={`${item.
                                            stock_quantity >= 20 ? 'text-green-500  py-1 px-3 rounded-lg ' : 'text-red-500   py-1 px-3 rounded-lg  '}`}>{item.
                                                stock_quantity}</p>
                                    </TableCell>
                                    <TableCell className={`p-4 text-start  `}>₹ {item.base_price}</TableCell>
                                    <TableCell className={`p-4 text-start  `}>
                                        {
                                            item.status
                                                === "active" ? <span className="bg-green-100 text-green-800 py-1 px-3 rounded-lg text-sm">Active</span> :
                                                item.status === "inactive" ? <span className="bg-green-100 text-green-800 py-1 px-3 rounded-lg text-sm">In Active</span> :
                                                    <></>
                                        }
                                    </TableCell>
                                    <TableCell className={`p-4 text-start flex gap-4  items-center  justify-around  `}>
                                        <Link href={`/vendor/${vendorId}/products/productUpdateForm/${item.id}`} className="flex gap-2 border border-blue-600
                                        border-b-3 hover:border-b hover:border-blue-800 text-blue-600 hover:text-blue-800 py-2 px-3 rounded-lg" title="Edit Product">
                                            Edit<Edit />
                                        </Link>
                                        <DeleteBtn id={item.id} vendorId={vendorId} toDelete="PRODUCT" style="flex gap-2 border border-red-600
                                        border-b-3 hover:border-b hover:border-red-800 text-red-600 hover:text-red-800 py-2 px-3 rounded-lg" />

                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>


                </Table>

                <span className="flex justify-end">
                    {/* <Pagination setCount={setCount} count={count} totalPages={totalPages} style="relative right-0 w-54" /> */}
                </span>
            </main >
        </>
    )
}
