"use client"
import { Pagination } from "@/components/common/Pagination";
import { useState } from "react";
import { searchImgDark } from "@/constants/common";
import Navbar from "@/components/vendor/Navbar";

export default function InventoryPage() {
    const [count, setCount] = useState(1);
    const pageSize = 5;
    // const totalPages = Math.ceil(INVENTORY_PRODUCTS.length / pageSize);
    // const startIndex = (count - 1) * pageSize;
    // const endIndex = startIndex + pageSize;
    // const currentData = INVENTORY_PRODUCTS.slice(startIndex, endIndex);

    return (
        <>
            <Navbar title="Inventory Management" />
            <main>
                <div className="flex gap-6 my-6 justify-end">
                    <button className="rounded-xl border-2 border-gray-300 text-gray-700 px-4 py-2">Transfer Stock</button>
                    <button className="rounded-xl bg-blue-500 text-white px-4 py-2"> Update Stock</button>
                </div>

                <div className="flex gap-3 justify-between flex-wrap mb-6">
                    {/* {WAREHOUSE_DATA.map((warehouse) => (
                        <div key={warehouse.warehouse_id} className="mb-4 p-4 border-2 border-gray-300 rounded-lg bg-white w-1/5 hover:border-blue-500 hover:shadow-lg cursor-pointer">
                            <div className="flex flex-col justify-between min-h-36 w-full">
                                <span>
                                    <div className="text-xl font-semibold flex justify-between items-start">
                                        <p className="text-balance">{warehouse.name}</p>
                                        {warehouse.is_default && (
                                            <span className="text-sm bg-blue-100 p-2 text-blue-800 rounded-xl">Default</span>
                                        )}
                                    </div>
                                    <p className="text-gray-600">{warehouse.location}</p>
                                </span>
                                <div className="mt-2 flex justify-between items-center gap-6 font-medium">
                                    <p className="text-gray-800 font-medium">Total Units: {warehouse.total_units}</p>
                                    <p className={`text-sm ${warehouse.is_active ? 'text-green-600' : 'text-red-600'}`}>{warehouse.is_active ? 'Active' : 'Inactive'}</p>
                                </div>
                            </div>
                        </div>
                    ))} */}
                </div>
                <div className="mt-2 justify-between rounded-2xl flex border-gray-300 items-center py-2 gap-4 bg-white filter">
                    <span className="border flex flex-3 items-center justify-between gap-0 border-gray-400 px-4 rounded-lg">
                        <button className="rounded-full w-8 h-8"><img className="w-6 h-6" src={searchImgDark} alt="search icon" /></button>
                        <input type="text" className="text-xl py-2 px-4 w-full" placeholder="Search by name, email or domain" />
                    </span>
                    <span className="flex gap-4">
                        <select className="vendor_filter rounded-2xl" name="status" id="status">
                            <option value="all">All Status</option>
                            <option value="active">In Stock</option>
                            <option value="pending">Low Stock</option>
                            <option value="out">Out of Stock</option>
                        </select>
                    </span>
                </div>
                <div className="my-6 relative flex w-full h-full overflow-scroll bg-white border rounded-2xl bg-clip-border">
                    <table className="w-full table-auto min-w-max">
                        <thead>
                            <tr className="text-left bg-gray-200">
                                <th className="p-4 border-b border-gray-400">IMAGE</th>
                                <th className="p-4 border-b border-gray-400">PRODUCT NAME</th>
                                <th className="p-4 border-b border-gray-400">SKU</th>
                                <th className="p-4 border-b border-gray-400">WAREHOUSE</th>
                                <th className="p-4 border-b border-gray-400">STOCK</th>
                                <th className="p-4 border-b border-gray-400">STATUS</th>
                                <th className="p-4 border-b border-gray-400">ADJUST</th>
                            </tr>
                        </thead>
                        <tbody className="text-left">
                            {/* {currentData.map((item, index) => (
                                <tr key={item.id} className={`hover:bg-gray-100 ${index === currentData.length - 1 ? 'border-b-0' : 'border-b border-gray-400'}`}>
                                    <td className="p-4"><img className="w-16 h-16" src={item.imageUrl} alt="product image" /></td>
                                    <td className="p-4 w-56">{item.productName}</td>
                                    <td className="p-4">{item.sku}</td>
                                    <td className="p-4">{item.warehouse}</td>
                                    <td className="p-4">
                                        {item.status === "In Stock" ? <span className="block text-center bg-green-100 text-green-800 py-1 px-3 rounded-lg text-sm w-14">{item.stock}</span> :
                                            item.status === "Low Stock" ? <span className="block text-center bg-yellow-100 text-yellow-800 py-1 px-3 rounded-lg text-sm w-14">{item.stock}</span> :
                                                <span className="block text-center bg-red-100 text-red-800 py-1 px-3 rounded-lg text-sm w-14">{item.stock}</span>}
                                    </td>
                                    <td className="p-4">
                                        {item.status === "In Stock" ? <div className="w-24 text-center bg-green-100 text-green-800 py-1 px-3 rounded-lg text-sm">{item.status}</div> :
                                            item.status === "Low Stock" ? <span className="w-24 block bg-yellow-100 text-center text-yellow-800 py-1 px-3 rounded-lg text-sm">{item.status}</span> :
                                                <span className="w-24 block text-center bg-red-100 text-red-800 py-1 px-3 rounded-lg text-sm">{item.status}</span>}
                                    </td>
                                    <td className="p-4">
                                        {item.status === "In Stock" ? <button className="min-w-24 bg-green-100 border-2 border-green-500 cursor-pointer text-green-800 py-1 px-3 rounded-lg text-sm">Edit</button> :
                                            <button className="min-w-24 cursor-pointer bg-red-100 border-2 border-red-500 text-red-800 py-1 px-3 rounded-lg text-sm">Restock</button>}
                                    </td>
                                </tr>
                            ))} */}
                        </tbody>
                    </table>
                </div>
                <span className="w-full flex justify-between items-center">
                    {/* <p className="text-stone-500">Showing {currentData.length} of {INVENTORY_PRODUCTS.length} products</p>
                    <Pagination setCount={setCount} count={count} totalPages={totalPages} style="relative right-0 w-54" /> */}
                </span>
            </main>
        </>
    )
}
