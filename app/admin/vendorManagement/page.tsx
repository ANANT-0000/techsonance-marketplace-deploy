"use client";
import { Navbar } from "@/components/admin/Navbar";
import { Pagination } from "@/components/common/Pagination";
import { VENDOR_LIST } from "@/constants/admin";
import { searchImgDark } from "@/constants/common";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ADMIN_BASE_URL } from "@/constants/constants";
import { useAppSelector } from "@/hooks/reduxHooks";
import { formatCurrency } from "@/lib/utils";
import AxiosAPI from "@/lib/axios";
import { Store, Plus, ClipboardCheck, Trash2 } from "lucide-react"; // Added Lucide icons
import toast from "react-hot-toast";

export const FILTER_STATUS_OPTIONS = [
  { value: undefined, label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Approved" },
  { value: "inactive", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

export interface Vendor {
  id: string;
  store_owner_first_name: string;
  store_owner_last_name: string;
  store_name: string;
  store_description: string;
  category: string;
  vendor_status: "active" | "inactive" | "pending";
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  company_id: string;
  user_id: string;
  company: Company;
  user: User;
  total_sales?: number;
}

export interface Company {
  id: string;
  company_name: string;
  company_domain: string;
  company_structure: "sole_proprietorship" | "partnership" | "corporation";
  company_status: "pending" | "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  profile_picture_url: string | null;
  first_name: string;
  last_name: string;
  email: string;
}

const getVendorRequests = async () => {
  try {
    const response = await AxiosAPI.get(
      `${ADMIN_BASE_URL}/vendor-applications-count`,
    );
    const count = response.data.data.count;

    return count;
  } catch (error) {
    toast.error("Error fetching vendor applications");
    return 0;
  }
};
const getStatusBadgeClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "inactive":
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function VendorManagementPage() {
  const { theme } = useAppSelector((state) => state.adminTheme);
  const [count, setCount] = useState(1);
  const [sort, setSort] = useState<string>("desc");
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * itemsPerPage;

  const [vendorRequests, setVendorRequests] = useState(0);
  const [companies, setCompanies] = useState<Vendor[]>([]);
  const [status, setStatus] = useState<string | undefined>(undefined);
  useEffect(() => {
    const fetchVendorRequests = async () => {
      const count = await getVendorRequests();
      setVendorRequests(count);
    };
    fetchVendorRequests();

    AxiosAPI.get(`/v1/admin/vendors`, {
      params: {
        offset: offset,
        limit: itemsPerPage,
        status: status,
        sort: sort,
      },
    }).then((res) => {
      setCompanies(res.data.data);
      setTotalPages(res.data.totalCount / itemsPerPage || 1);
    });
  }, [count, status, sort]);

  return (
    <>
      <main className="w-full px-1 py-4">
        {/* Header matching Customers UI */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center my-6 gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Store size={22} className="text-blue-500" />
            <div>
              <h1 className="text-theme-h4 font-bold text-gray-800">Vendors</h1>
              <p className="text-theme-caption text-gray-500 mt-1">
                Manage vendor domains and platform access.
              </p>
            </div>
            {companies && companies.length > 0 && (
              <span className="ml-2 self-start mt-1 bg-blue-100 text-blue-700 text-theme-caption font-semibold px-2.5 py-1 rounded-full">
                {companies.length}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {vendorRequests > 0 && (
              <Link
                href="vendorManagement/vendorsApplications"
                className="flex items-center gap-2 font-semibold text-theme-body-sm bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-xl px-4 py-2.5 transition-colors shadow-sm"
              >
                <ClipboardCheck size={16} />
                Approve Requests
                <span className="bg-yellow-200 text-yellow-800 text-theme-caption font-bold px-2 py-0.5 rounded-full ml-1">
                  {vendorRequests}
                </span>
              </Link>
            )}
            <Link
              href="vendorManagement/vendorForm"
              className="flex items-center gap-2 font-semibold text-theme-body-sm bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Create Vendor
            </Link>
          </div>
        </header>

        {/* Filter Bar matching Customers UI */}
        <div
          className={`relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4 ${theme === "light" ? "" : "invert"}`}
        >
          <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-colors">
            <img
              className="w-5 h-5 opacity-50 shrink-0"
              src={searchImgDark}
              alt="search icon"
            />
            <input
              type="text"
              className="text-theme-body-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
              placeholder="Search by name, email or domain"
            />
          </span>
          <span className="flex gap-3">
            <select
              className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
              onChange={(e) => setStatus(e.target.value)}
            >
              {FILTER_STATUS_OPTIONS.map((option, idx) => (
                <option key={idx} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </span>
        </div>

        {/* Table matching Customers UI */}
        <div
          className={`w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white ${theme === "light" ? "" : "invert"}`}
        >
          <table className="w-full table-auto min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Owner Name
                </th>
                <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Company/Store
                </th>
                <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Domain
                </th>
                <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Total Sales
                </th>
                <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!companies || companies.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-16 text-center text-gray-400 text-theme-body-sm"
                  >
                    <Store size={36} className="mx-auto mb-3 opacity-30" />
                    No vendors found.
                  </td>
                </tr>
              ) : (
                companies.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    {/* VENDOR INFO WITH AVATAR */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-theme-caption shrink-0 uppercase">
                          {vendor.user.first_name?.substring(0, 1) +
                            vendor.user.last_name?.substring(0, 1)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800 whitespace-nowrap">
                            {vendor.user.first_name +
                              " " +
                              vendor.user.last_name}
                          </span>
                          <span className="text-theme-caption text-gray-500">
                            {vendor.user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800 whitespace-nowrap">
                            {vendor.company.company_name}
                          </span>
                          <span className="text-theme-caption text-gray-500">
                            {vendor.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* DOMAIN */}
                    <td className="p-4 text-theme-body-sm text-gray-600">
                      {vendor.company.company_domain}
                    </td>

                    {/* STATUS BADGE */}
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-theme-caption font-semibold rounded-full capitalize ${getStatusBadgeClass(vendor.company.company_status)}`}
                      >
                        {vendor.vendor_status}
                      </span>
                    </td>

                    {/* VALUE */}
                    <td className="p-4 text-theme-body-sm text-gray-600 font-medium">
                      ₹ {formatCurrency(vendor.total_sales || 0)}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`vendorManagement/${vendor.id}`}
                          className="text-theme-caption font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Manage →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <span className="flex justify-end mt-4">
          <Pagination
            setCount={setCurrentPage}
            count={currentPage}
            totalPages={totalPages}
            style="relative right-0 w-54"
          />
        </span>
      </main>
    </>
  );
}
