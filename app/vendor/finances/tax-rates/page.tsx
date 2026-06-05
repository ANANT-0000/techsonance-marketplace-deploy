'use client';

import { useEffect, useState } from "react";
import { searchImgDark } from "@/constants/common";
import { ChevronDown, ChevronUp, Download, Percent, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TableRowSkeleton } from "@/components/common/skeletons";
import { redirect } from "next/navigation";
import { authToken } from "@/utils/authToken";
import { fetchTaxSlabs } from "@/utils/vendorApiClient";

export interface TaxSlab {
  id: string; // UUID
  tax_profile_id: string; // UUID reference to tax profile
  slab_name: string; // e.g., "GST 18%— Electronics"
  tax_name: string; // e.g., "GST 18%"
  tax_code: string; // e.g., "GST-IN-18"
  tax_scope: "Intra" | "Inter" | "Both"; // scope of applicability
  total_rate: string; // percentage as string, e.g., "18.00"
  is_exempt: boolean; // exemption flag
  effective_from: string; // YYYY-MM-DD
  effective_to: string; // YYYY-MM-DD
  created_at: string; // ISO timestamp
}


export const taxSlabTableHeader = [
    "Rate Name",
    "State / Region",
    "Tax Value (%)",
    "Exemption Status",
    "Effective From",
    "Effective To",
    // "Actions"
]

export default function TaxSlabsPage() {

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isOpen, setIsOpen] = useState(false);
    const [sortBy, setSortBy] = useState<string>("desc");
    const [taxSlabs, setTaxSlabs] = useState<TaxSlab[]>([]);
    const [loading, setLoading] = useState(true);

    const handleDateChange = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        setIsOpen(false);
    };
    
    const token = authToken();
    
    useEffect(() => {
        if (!token) {
            redirect("/auth/vendorLogin");
        }
        
        const getTaxSlabs = async () => {
            setLoading(true);
            try {
                const res = await fetchTaxSlabs(sortBy, token); 
                console.log("Fetched Tax Slabs:", res);
                setTaxSlabs(res.data|| []);
            } catch (err) {
                console.log("Error fetching Tax Rates:", err);
            } finally {
                setLoading(false);
            }
        };
        getTaxSlabs();
    }, [sortBy, date, token]);

        const handleRoute=(id:string|null) => {
        if(id) {
            redirect(`/vendor/finances/tax-rates/${id}`);
            return;
        }
        redirect(`/vendor/finances/tax-rates/new`);
    }
    return (
        <section className="w-full px-1">
            {/* Header */}
            <header className="flex justify-between items-center my-6">
                <div className="flex items-center gap-2 text-gray-700">
                    <Percent size={22} className="text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-800">Tax Types & Rates</h1>
                    {taxSlabs && taxSlabs.length > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {taxSlabs.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {/* <button className="flex items-center gap-2 font-semibold text-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-5 py-2.5 transition-colors shadow-sm">
                        <Download size={16} />
                        Export CSV
                    </button>
                     */}
                    <button onClick={() => handleRoute(null)} className="flex items-center gap-2 font-semibold text-sm bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm">
                        <Plus size={16} />
                        New Tax Rate
                    </button>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="relative flex flex-wrap justify-between rounded-xl items-center py-3 px-4 gap-3 bg-white border border-gray-200 shadow-sm mb-4">
                <span className="flex flex-1 min-w-[220px] items-center gap-2 border border-gray-200 bg-gray-50 py-2 px-3 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-colors">
                    <img className="w-5 h-5 opacity-50 shrink-0" src={searchImgDark} alt="search icon" />
                    <input
                        type="text"
                        className="text-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
                        placeholder="Search by Rate Name or State..."
                    />
                </span>

                <span className="flex flex-wrap gap-3 items-center">
                    <select className="text-sm border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-gray-600 outline-none focus:border-blue-400 cursor-pointer transition-colors" value={sortBy} onChange={(e) => setSortBy(e.target.value)} name="sort_by">
                        <option value="desc">Highest Rate First</option>
                        <option value="asc">Lowest Rate First</option>
                    </select>

                    {/* {isOpen ? (
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 text-sm border border-blue-300 bg-blue-50 text-blue-600 rounded-xl px-3 py-2 font-medium transition-colors"
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
            <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="w-full table-auto min-w-[900px] border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-left">
                            <th className="p-4 w-10">
                                <input type="checkbox" className="rounded" />
                            </th>
                            {taxSlabTableHeader.map((header) => (
                                <th key={header} className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <TableRowSkeleton columns={7} rows={5} />
                        ) : taxSlabs && taxSlabs?.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="py-16 text-center text-gray-400 text-sm">
                                    <Percent size={36} className="mx-auto mb-3 opacity-30 text-blue-400" />
                                    No tax rates configured. Defaults will apply.
                                </td>
                            </tr>
                        ) : (
                            taxSlabs && taxSlabs?.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4">
                                        <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                                    </td>

                                    <td className="p-4">
                                        <span className="font-semibold text-gray-800">
                                            {item.tax_name}
                                        </span>
                                    </td>

                                    <td className="p-4 text-gray-600 text-sm font-medium">
                                        {item.tax_scope}
                                    </td>

                                    <td className="p-4">
                                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">
                                            {Number(item.total_rate).toFixed(2)}%
                                        </span>
                                    </td>
                                    
                                    <td className="p-4">
                                        {item.is_exempt ? (
                                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 py-1 px-3 rounded-full text-xs font-semibold">● Exempt</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-xs font-semibold">● Taxable</span>
                                        )}
                                    </td>

                                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                        {new Date(item.effective_from).toLocaleDateString("en-GB")}
                                    </td>
                                    
                                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                        {item.effective_to === "2099-12-31" || !item.effective_to ? "Ongoing" : new Date(item.effective_to).toLocaleDateString("en-GB")}
                                    </td>
{/* 
                                    <td className="p-4">
                                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                                            View Rules →
                                        </button>
                                    </td> */}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}