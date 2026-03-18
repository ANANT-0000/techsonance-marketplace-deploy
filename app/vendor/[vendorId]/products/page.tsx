'use client';
import { useState } from "react";
import Link from "next/link";
import { Edit } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { productData, searchImgDark } from "@/constants/constants";





export default function Products() {
    const [count, setCount] = useState(1);
    const pageSize = 5;
    const totalPages = Math.ceil(productData.length / pageSize);
    const currentPage = count;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData: typeof productData = productData.slice(startIndex, endIndex);
    console.log(currentData)
    return (

        <>
            <main>
                <div className="flex gap-6 my-6 justify-end">
                    <Link className="rounded-xl bg-black text-white px-4 py-2" href="/vendor/products/productForm">+ Add New Product</Link>
                    <button className="rounded-xl bg-blue-500 text-white px-4 py-2"> Export CSV</button>
                </div>
                <div className={" mt-2 justify-between rounded-2xl flex border-gray-300    items-center  py-2 gap-4   bg-white  filter  "}>
                    <span className="border flex   flex-3 items-center justify-between gap-0 border-gray-400 px-4 rounded-lg ">
                        <button className="rounded-full w-8 h-8"><img className="w-6 h-6" src={searchImgDark} alt="search icon" /></button>
                        <input type="text" className="  text-xl py-2 px-4 w-full " placeholder="Search by name,email or domain" />
                    </span>
                    <span className="flex  gap-4">
                        <select className="vendor_filter rounded-2xl" name="status" id="status">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">In Active</option>

                        </select>
                        <select className="vendor_filter rounded-2xl" name="sort_by" id="sort_by">
                            <option value="category">Category</option>
                            <option value="headphone">Headphone</option>
                        </select>
                    </span>
                </div>
                <div
                    className="my-6 relative flex w-full h-full overflow-scroll  bg-white border rounded-2xl bg-clip-border">
                    <table className="w-full  table-auto min-w-max  ">

                        <thead className=" w-full " >
                            <tr className="text-left bg-gray-200 ">
                                <th className="p-4 border-b  text-center  border-gray-400"><input className="w-4  h-4 text-center" type="checkbox" /></th>
                                <th className="p-4 border-b   border-gray-400"></th>
                                <th className="p-4 border-b   border-gray-400">PRODUCT NAME</th>
                                <th className="p-4 border-b   border-gray-400">SKU</th>
                                <th className="p-4 border-b   border-gray-400">STOCK</th>
                                <th className="p-4 border-b   border-gray-400">PRICE</th>
                                <th className="p-4 border-b   border-gray-400">STATUS</th>
                                <th className="p-4 border-b   border-gray-400">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="text-center w-full ">
                            {
                                currentData.map((item, index) => (

                                    <tr key={index} className={`hover:bg-gray-100 ${item.id === currentData[pageSize - 1].id ? 'border-b-0' : 'border-b border-gray-400'} border-b border-gray-400   `}>
                                        <td className={`p-4  `}> <input type="checkbox" className="w-4 h-4" /></td>
                                        <td className={`p-4  `}> <img className="w-16 h-16" src={item.imageUrl} alt="product image" /> </td>
                                        <td className={`p-4 w-56  `}>{item.productName}</td>
                                        <td className={`p-4  `}>
                                            {item.sku}
                                        </td>

                                        <td className={`p-4  `}>
                                            <p className={`${item.stock >= 20 ? 'text-green-500  py-1 px-3 rounded-lg ' : 'text-red-500   py-1 px-3 rounded-lg  '}`}>{item.stock}</p>
                                        </td>
                                        <td className={`p-4  `}>₹ {item.price}</td>
                                        <td className={`p-4  `}>
                                            {
                                                item.status === "Active" ? <span className="bg-green-100 text-green-800 py-1 px-3 rounded-lg text-sm">Active</span> :
                                                    item.status === "Inactive" ? <span className="bg-green-100 text-green-800 py-1 px-3 rounded-lg text-sm">In Active</span> :
                                                        <></>
                                            }
                                        </td>
                                        <td className={`p-4`}>
                                            <Link href={`/vendor/products/productUpdateForm/${item.id}`}>
                                                <Edit />
                                            </Link>
                                        </td>

                                    </tr>
                                ))
                            }
                        </tbody >

                    </table>
                </div>
                <span className="flex justify-end">
                    <Pagination setCount={setCount} count={count} totalPages={totalPages} style="relative right-0 w-54" />
                </span>
            </main>
        </>
    )
}
