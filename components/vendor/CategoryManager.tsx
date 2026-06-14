"use client";
import { authToken } from "@/utils/authToken";
import {
  createVendorProductCategory,
  deleteVendorProductCategory,
} from "@/utils/vendorApiClient";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAppSelector } from "@/hooks/reduxHooks";
import { CATEGORY_MANAGER_TEXT } from "@/constants/vendorText";

export default function CategoryManager({ categories, setCheckChange }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const vendorId = (user && "vendor_id" in user ? user.vendor_id : "") ?? "";
  const router = useRouter();
  const token = authToken();
  const [isLoading, setIsLoading] = useState(false);
  const handleCreateCategory = async (formData: FormData) => {
    if (!token) {
      toast.error(CATEGORY_MANAGER_TEXT.ERRORS.NO_TOKEN);
      setTimeout(() => {
        router.push("/auth/vendorLogin");
      }, 2000);
      return;
    }
    try {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const categoryData = { name, description };
      setIsLoading(true);
      const response = await createVendorProductCategory(categoryData, token);
      if (response?.status === 201 || response?.status === 200) {
        toast.success(CATEGORY_MANAGER_TEXT.SUCCESS.CREATED);
        setCheckChange((prev: boolean) => !prev);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(CATEGORY_MANAGER_TEXT.ERRORS.CREATE_FAIL);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
      {/* LEFT: Stats & Add Form */}
      <div className="md:col-span-1 space-y-6 ">
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <p className="text-blue-600 text-theme-body-sm font-medium">{CATEGORY_MANAGER_TEXT.STATS.TOTAL}</p>
          <p className="text-theme-h3 font-bold text-blue-900">
            {categories.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-semibold mb-4 text-gray-700">{CATEGORY_MANAGER_TEXT.FORM.TITLE}</h3>
          <form
            action={handleCreateCategory}
            id="add-form"
            className="space-y-4"
          >
            <div>
              <label className="text-theme-caption font-medium text-gray-500">
                {CATEGORY_MANAGER_TEXT.FORM.NAME_LABEL}
              </label>
              <input
                name="name"
                required
                className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-theme-body-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={CATEGORY_MANAGER_TEXT.FORM.NAME_PLACEHOLDER}
              />
            </div>
            <div>
              <label className="text-theme-caption font-medium text-gray-500">
                {CATEGORY_MANAGER_TEXT.FORM.DESC_LABEL}
              </label>
              <textarea
                name="description"
                rows={3}
                className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-theme-body-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={CATEGORY_MANAGER_TEXT.FORM.DESC_PLACEHOLDER}
              />
            </div>
            <button
              type="submit"
              disabled={false}
              className="w-full bg-gray-900 text-white py-2 rounded-xl text-theme-body-sm font-medium hover:bg-black disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? CATEGORY_MANAGER_TEXT.FORM.BTN_LOADING : CATEGORY_MANAGER_TEXT.FORM.BTN_DEFAULT}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: Category List */}
      <div className="md:col-span-2">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-theme-body-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  {CATEGORY_MANAGER_TEXT.TABLE.HEADERS.CATEGORY}
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  {CATEGORY_MANAGER_TEXT.TABLE.HEADERS.DESCRIPTION}
                </th>
                <th className="px-6 py-4 text-right font-semibold text-gray-700">
                  {CATEGORY_MANAGER_TEXT.TABLE.HEADERS.ACTIONS}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <Suspense
                fallback={
                  <p className="px-6 py-10 text-center text-gray-400">
                    {CATEGORY_MANAGER_TEXT.TABLE.LOADING}
                  </p>
                }
              >
                {categories.length > 0 ? (
                  categories.map((cat: any, idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {cat.name}
                      </td>
                      <td className="px-6 py-4 text-gray-500 md:max-w-[200px] truncate">
                        {cat.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button className="bg-blue-50 px-2 py-1 rounded-lg text-blue-600 hover:underline font-medium cursor-pointer">
                          {CATEGORY_MANAGER_TEXT.TABLE.BTN_EDIT}
                        </button>
                        <button
                          className="bg-red-50 px-2 py-1 rounded-lg text-red-600 hover:underline font-medium cursor-pointer"
                          onClick={() =>
                            deleteVendorProductCategory(
                              cat.id,
                              token ?? "",
                            ).then(() =>
                              setCheckChange((prev: boolean) => !prev),
                            )
                          }
                        >
                          {CATEGORY_MANAGER_TEXT.TABLE.BTN_DELETE}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      {CATEGORY_MANAGER_TEXT.TABLE.NO_DATA}
                    </td>
                  </tr>
                )}
              </Suspense>
            </tbody>
          </table>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
