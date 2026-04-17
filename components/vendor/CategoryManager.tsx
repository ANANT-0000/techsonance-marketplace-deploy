'use client';
import { isClient, USER_STORAGE_KEY } from "@/constants";
import { createVendorProductCategory, deleteVendorProductCategory, } from "@/utils/vendorApiClient";
import { Suspense, } from "react";
export default function CategoryManager({ categories, vendorId }: any) {
    const company_id = isClient ? localStorage.getItem(USER_STORAGE_KEY) ? JSON.parse(localStorage.getItem(USER_STORAGE_KEY) as string)?.company_id : null : null;

    const handleCreateCategory = async (formData: FormData) => {

        try {
            const name = formData.get('name') as string;
            const description = formData.get('description') as string;
            const categoryData = { name, description };
            
            await createVendorProductCategory(vendorId, categoryData, company_id);

        } catch (error) {
            console.error('Error creating category:', error);
        }

    };
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">

            {/* LEFT: Stats & Add Form */}
            <div className="md:col-span-1 space-y-6 ">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <p className="text-blue-600 text-sm font-medium">Total Categories</p>
                    <p className="text-3xl font-bold text-blue-900">{categories.length}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold mb-4 text-gray-700">Add New Category</h3>
                    <form action={handleCreateCategory} id="add-form" className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500">Category Name</label>
                            <input
                                name="name"
                                required
                                className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Electronics"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Briefly describe what goes here..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={false}
                            className="w-full bg-gray-900 text-white py-2 rounded-xl text-sm font-medium hover:bg-black disabled:opacity-50"
                        >
                            Create Category
                            {/* {isAdding ? 'Creating...' : 'Create Category'} */}
                        </button>
                    </form>
                </div>
            </div>

            {/* RIGHT: Category List */}
            <div className="md:col-span-2">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Category</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Description</th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <Suspense fallback={<p className="px-6 py-10 text-center text-gray-400">Loading categories...</p>}>
                                {categories.length > 0 ?
                                    categories.map((cat: any) => (
                                        <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                                            <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">{cat.description || '-'}</td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <button className="text-blue-600 hover:underline font-medium">Edit</button>
                                                <button className="text-red-600 hover:underline font-medium"
                                                    onClick={() => deleteVendorProductCategory(vendorId, cat.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                    : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                                                No categories found. Create your first one to get started!
                                            </td>
                                        </tr>
                                    )}
                            </Suspense>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}