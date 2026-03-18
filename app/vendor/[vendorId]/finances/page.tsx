"use client"
import { Pagination } from "@/components/common/Pagination";
import { useState } from "react";
import Navbar from "@/components/vendor/Navbar";
import { Download } from "lucide-react";
import { GST_INVOICES, VENDOR_FINANCE_STATS } from "@/constants/vendor";

export default function FinancesPage() {
    const [count, setCount] = useState(1);
    const pageSize = 5;
    const totalPages = Math.ceil(GST_INVOICES.length / pageSize);
    const startIndex = (count - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData = GST_INVOICES.slice(startIndex, endIndex);

    return (
        <>
            <Navbar title="Finances" />
            <main>
                <div className="flex gap-6 my-6 justify-end">
                    <button className="flex gap-4 items-center rounded-xl bg-blue-500 text-white px-4 py-2"><Download />Download GSTR-1</button>
                </div>

                <div className="stats flex gap-6 justify-start flex-wrap mb-6">
                    <div className="stat lg:w-86 lg:pb-6">
                        <div className="stat_title">Total Earnings</div>
                        <div className="stat_value">{VENDOR_FINANCE_STATS.totalEarnings}</div>
                        <div className="stat_desc text-gray-600">{VENDOR_FINANCE_STATS.earningsDesc}</div>
                    </div>
                    <div className="stat lg:w-86 lg:pb-6">
                        <div className="stat_title">Pending Settlements</div>
                        <div className="stat_value">{VENDOR_FINANCE_STATS.pendingSettlements}</div>
                        <div className="stat_desc text-gray-600">{VENDOR_FINANCE_STATS.pendingDesc}</div>
                    </div>
                    <div className="stat lg:w-86 lg:pb-6">
                        <div className="stat_title">GST Registration</div>
                        <div className="stat_value">{VENDOR_FINANCE_STATS.gstRegistration}</div>
                        <div className="stat_desc text-green-600">{VENDOR_FINANCE_STATS.gstStatus}</div>
                    </div>
                </div>
                <div className="my-6 relative flex w-full h-full overflow-scroll bg-white border rounded-2xl bg-clip-border border-gray-300 flex-col">
                    <h1 className="text-lg font-bold py-4 px-12">GST INVOICES</h1>
                    <table className="w-full table-auto min-w-max">
                        <thead>
                            <tr className="text-left bg-gray-200">
                                <th className="py-4 pr-8 border-b border-gray-400 text-center">DATE</th>
                                <th className="pl-4 border-b border-gray-400">INVOICE NO</th>
                                <th className="pr-10 border-b border-gray-400 text-center">ORDER REF</th>
                                <th className="py-4 border-b border-gray-400">TAXABLE VALUE</th>
                                <th className="py-4 border-b border-gray-400">TOTAL TAX</th>
                                <th className="py-4 border-b border-gray-400 text-center">DOWNLOAD</th>
                            </tr>
                        </thead>
                        <tbody className="text-left">
                            {currentData.map((item, index) => (
                                <tr key={item.id} className={`hover:bg-gray-100 ${index === currentData.length - 1 ? 'border-b-0' : 'border-b border-gray-400'}`}>
                                    <td className="py-4 text-center">{item.date}</td>
                                    <td className="py-4 w-56">{item.invoice_no}</td>
                                    <td className="py-4 text-center">{item.order_ref}</td>
                                    <td className="py-4">₹ {item.taxable_value}</td>
                                    <td className="py-4">₹ {item.total_tax}</td>
                                    <td className="py-4 flex justify-center">
                                        {item.download_available ? (
                                            <button className="min-w-24 bg-green-100 border-2 border-green-500 cursor-pointer text-green-800 py-1 px-3 rounded-lg text-sm flex items-center gap-2">
                                                <Download /> PDF
                                            </button>
                                        ) : (
                                            <button className="min-w-24 cursor-pointer bg-red-100 border-2 border-red-500 text-red-800 py-1 px-3 rounded-lg text-sm">Unavailable</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <span className="w-full flex justify-between items-center">
                    <p className="text-stone-500">Showing {currentData.length} of {GST_INVOICES.length} invoices</p>
                    <Pagination setCount={setCount} count={count} totalPages={totalPages} style="relative right-0 w-54" />
                </span>
            </main>
        </>
    )
}
