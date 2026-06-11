"use client";

import { useEffect, useState } from "react";
import { searchImgDark } from "@/constants/common";
import { ChevronDown, ChevronUp, Download, FileText } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TableRowSkeleton } from "@/components/common/skeletons";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authToken } from "@/utils/authToken";
import { fetchGstInvoices } from "@/utils/vendorApiClient";
import { Pagination } from "@/components/common/Pagination";

interface InvoiceType {
  id: string;
  invoice_number: string;
  order_id: string;
  cgst_amount: string;
  sgst_amount: string;
  igst_amount: string;
  total_tax: string;
  invoice_date: string;
}

export const invoiceTableHeader = [
  "Invoice No.",
  "Order Ref",
  "CGST",
  "SGST",
  "IGST",
  "Total Tax",
  "Date",
  // "Actions"
];

export default function InvoicesPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("desc");
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsOpen(false);
  };
  const offset = (currentPage - 1) * limit;

  const token = authToken();

  useEffect(() => {
    if (!token) {
      redirect("/auth/vendorLogin");
    }

    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await fetchGstInvoices(
          offset,
          limit,
          debouncedSearch,
          sortBy,
          date,
          token,
        );
        setInvoices(res.data.invoices || []);
        setTotalInvoices(res.data.total || 0);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [sortBy, token, currentPage, limit, debouncedSearch]);

  useEffect(() => {
    setTotalPages(Math.ceil(totalInvoices / limit));
  }, [totalInvoices, limit]);
  // Debounce effect - waits 500ms after user stops typing before updating search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to first page on new search
    }, 500); // 500ms delay

    return () => clearTimeout(debounceTimer);
  }, [search]);

  return (
    <main className="w-full px-1">
      {/* Header */}
      <header className="flex justify-between items-center my-6">
        <div className="flex items-center gap-2 text-gray-700">
          <FileText size={22} className="text-purple-500" />
          <h1 className="text-2xl font-bold text-gray-800">GST Invoices</h1>
          {invoices && invoices.length > 0 && (
            <span className="ml-2 bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {invoices.length}
            </span>
          )}
        </div>
        {/* <button className="flex items-center gap-2 font-semibold text-sm bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm">
                    <Download size={16} />
                    Export Invoices
                </button> */}
      </header>

      {/* Filter Bar */}
      <div className="relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4">
        <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-purple-400 focus-within:bg-white transition-colors">
          <img
            className="w-5 h-5 opacity-50 shrink-0"
            src={searchImgDark}
            alt="search icon"
          />
          <input
            type="text"
            className="text-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
            placeholder="Search by Invoice No. or Order Ref"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </span>

        <span className="flex flex-wrap gap-3 items-center">
          <select
            className="text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-purple-400 cursor-pointer transition-colors"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            name="sort_by"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          {/* {isOpen ? (
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 text-sm border border-purple-300 bg-purple-50 text-purple-600 rounded-xl px-3 py-2 font-medium transition-colors"
                        >
                            {date ? date.toDateString() : "Select Date"}
                            <ChevronUp size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsOpen(true)}
                            className="flex items-center gap-2 text-sm border border-gray-200 bg-gray-50 text-gray-600 rounded-xl px-3 py-2 hover:border-gray-300 transition-colors"
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
                    )} */}
        </span>
      </div>

      {/* Data Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white my-2">
        <table className="w-full table-auto min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="p-4 w-10">
                <input type="checkbox" className="rounded" />
              </th>
              {invoiceTableHeader.map((header) => (
                <th
                  key={header}
                  className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <TableRowSkeleton columns={8} rows={10} />
            ) : invoices && invoices?.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="py-16 text-center text-gray-400 text-sm"
                >
                  <FileText size={36} className="mx-auto mb-3 opacity-30" />
                  No invoices generated yet.
                </td>
              </tr>
            ) : (
              invoices &&
              invoices?.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                    />
                  </td>

                  <td className="p-4">
                    <span className="font-mono text-sm font-semibold text-gray-800">
                      {item.invoice_number}
                    </span>
                  </td>

                  <td className="p-4">
                    <Link
                      href={`/vendor/orders/${item.order_id}`}
                      className="font-mono text-sm font-semibold text-purple-600 hover:underline"
                    >
                      ORD-{item.order_id.split("-")[0].toUpperCase()}
                    </Link>
                  </td>

                  <td className="p-4 text-gray-600 text-sm">
                    ₹{Number(item.cgst_amount).toFixed(2)}
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    ₹{Number(item.sgst_amount).toFixed(2)}
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    ₹{Number(item.igst_amount).toFixed(2)}
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-gray-900">
                      ₹{Number(item.total_tax).toFixed(2)}
                    </span>
                  </td>

                  <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(item.invoice_date).toLocaleDateString("en-GB")}
                  </td>

                  {/* <td className="p-4">
                                        <button className="text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                                            Download ↓
                                        </button>
                                    </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <span className="flex justify-end mt-4">
        {/* Pagination here */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className=" flex ">
            showing {limit} of {totalInvoices}
          </span>
          <Pagination
            count={currentPage}
            setCount={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      </span>
    </main>
  );
}
