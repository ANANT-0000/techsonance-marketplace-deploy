"use client";

import { useEffect, useState } from "react";
import { searchImgDark } from "@/constants/common";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Users,
  ShieldAlert,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Pagination } from "@/components/common/Pagination";

import Link from "next/link";
import { redirect } from "next/navigation";
import { authToken } from "@/utils/authToken";
import { fetchCompanyCustomers } from "@/utils/vendorApiClient";

export enum AccessStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DEACTIVATED = "DEACTIVATED",
}

interface CustomerType {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  user_status: string;
}
export const customerTableHeader = [
  "Customer ID",
  "Name",
  "Status",
  "Joined Date",
];

const getCustomerStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
          ● Active
        </span>
      );
    case "SUSPENDED":
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
          ● Suspended
        </span>
      );
    case "DEACTIVATED":
      return (
        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 py-1 px-3 rounded-full text-theme-caption font-semibold">
          ● Deactivated
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 py-1 px-3 rounded-full text-theme-caption font-semibold capitalize">
          ● {status || "Pending"}
        </span>
      );
  }
};

export default function VendorCustomersPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("desc");
  const [customers, setCustomers] = useState<CustomerType[]>([]);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsOpen(false);
  };

  const token = authToken();

  useEffect(() => {
    if (!token) {
      redirect("/auth/vendorLogin");
    }

    const getCustomerList = async () => {
      await fetchCompanyCustomers(0, 10, statusFilter, sortBy, token)
        .then((res) => {
          setCustomers(res.data || []);
        })
        .catch((err) => {});
    };
    getCustomerList();
  }, [statusFilter, sortBy]);

  return (
    <main className="w-full px-1">
      {/* Header */}
      <header className="flex justify-between items-center my-6">
        <div className="flex items-center gap-2 text-gray-700">
          <Users size={22} className="text-blue-500" />
          <h1 className="text-theme-h4 font-bold text-gray-800">Customers</h1>
          {customers && customers.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-700 text-theme-caption font-semibold px-2.5 py-1 rounded-full">
              {customers.length}
            </span>
          )}
        </div>
        {/* <button className="flex items-center gap-2 font-semibold text-theme-body-sm bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm">
                    <Download size={16} />
                    Export CSV
                </button> */}
      </header>

      {/* Filter Bar */}
      <div className="relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4">
        {/* Search */}
        <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-colors">
          <img
            className="w-5 h-5 opacity-50 shrink-0"
            src={searchImgDark}
            alt="search icon"
          />
          <input
            type="text"
            className="text-theme-body-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
            placeholder="Search by name or email"
          />
        </span>

        {/* Filters */}
        <span className="flex flex-wrap gap-3 items-center">
          <select
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
            onChange={(e) => setStatusFilter(e.target.value)}
            value={statusFilter}
          >
            <option value="">All Statuses</option>
            <option value={AccessStatus.ACTIVE}>Active</option>
            <option value={AccessStatus.SUSPENDED}>Suspended</option>
          </select>

          <select
            className="text-theme-body-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          {isOpen ? (
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-theme-body-sm border border-blue-300 bg-blue-50 text-blue-600 rounded-xl px-3 py-2 font-medium transition-colors"
            >
              {date ? date.toDateString() : "Select Date"}
              <ChevronUp size={16} />
            </button>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 text-theme-body-sm border border-gray-200 bg-gray-50 text-gray-600 rounded-xl px-3 py-2 hover:border-gray-300 transition-colors"
            >
              {date ? date.toDateString() : "Select Date"}
              <ChevronDown size={16} />
            </button>
          )}

          {isOpen && (
            <div className="absolute right-4 top-full mt-2 z-20 shadow-lg rounded-xl overflow-hidden border border-gray-200">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                className="rounded-xl bg-white"
                captionLayout="dropdown"
              />
            </div>
          )}
        </span>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full table-auto min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {customerTableHeader.map((header) => (
                <th
                  key={header}
                  className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!customers || customers.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-16 text-center text-gray-400 text-theme-body-sm"
                >
                  <Users size={36} className="mx-auto mb-3 opacity-30" />
                  No customers found.
                </td>
              </tr>
            ) : (
              customers &&
              customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>

                  {/* CUSTOMER ID */}
                  <td className="p-4">
                    <span className="font-mono text-theme-body-sm font-semibold text-gray-800">
                      #{customer.id.split("-")[0].toUpperCase()}
                    </span>
                  </td>

                  {/* NAME */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-theme-caption shrink-0">
                        {customer.first_name.charAt(0)}
                        {customer.last_name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800 whitespace-nowrap">
                        {customer.first_name} {customer.last_name}
                      </span>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="p-4 whitespace-nowrap">
                    {getCustomerStatusBadge(customer.user_status)}
                  </td>

                  {/* JOINED DATE */}
                  <td className="p-4 text-theme-body-sm text-gray-500 whitespace-nowrap">
                    {new Date(customer.created_at).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <span className="flex justify-end mt-4">
        {/* <Pagination setCount={setCount} count={count} totalPages={totalPages ?? 0} style="relative right-0 w-54" /> */}
      </span>
    </main>
  );
}
