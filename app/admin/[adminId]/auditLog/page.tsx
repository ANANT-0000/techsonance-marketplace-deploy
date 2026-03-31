'use client';
import { Navbar } from "@/components/admin/Navbar";
import { Pagination } from "@/components/common/Pagination";
import { AUDIT_LOG_DATA } from "@/constants/admin";
import { searchImgDark } from "@/constants/common";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAppSelector } from "@/hooks/reduxHooks";
import { AUDIT_LOG_COLUMNS, AUTH_LOG_FILTERS } from "@/constants/dynamicFields";

export default function AuditLogPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isOpen, setIsOpen] = useState(false);
    const [logs] = useState(AUDIT_LOG_DATA);
    const { theme } = useAppSelector((state: any) => state.adminTheme);
    const [count, setCount] = useState(1);

    const handleDateChange = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        setIsOpen(false);
    };

    const pageSize = 5;
    const totalPages = Math.ceil(logs.length / pageSize);
    const startIndex = (count - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData = logs.slice(startIndex, endIndex);

    return (
        <>
            <Navbar title="Audit Log" />
            <main className="admin_vendorManagement">
                <header className="flex justify-between items-center my-6">
                    <h1 className="font-bold text-2xl">Manage Vendor domains, and platform access.</h1>
                </header>
                <div className={"border-2 justify-between rounded-lg flex border-gray-400 items-center px-4 py-2 gap-4 bg-white filter " + (theme === 'light' ? '' : 'invert')}>
                    <span className="border flex flex-3 items-center justify-between gap-0 border-gray-400 px-4 rounded-lg">
                        <button className="rounded-full w-8 h-8"><img className="w-6 h-6" src={searchImgDark} alt="search icon" /></button>
                        <input type="text" className="text-xl py-2 px-4 w-full" placeholder="Search by name, email or domain" />
                    </span>
                    <span className="flex gap-4">
                        <select className="vendor_filter" name="status" id="status">
                            {AUTH_LOG_FILTERS.map((filter) => (
                                <option key={filter.id} value={filter.id}>
                                    {filter.label}
                                </option>
                            ))}
                        </select>
                        <select className="vendor_filter" name="sort_by" id="sort_by">
                            <option value="date_newest">Newest</option>
                            <option value="date_oldest">Oldest</option>
                        </select>
                        {isOpen ? (
                            <button onClick={() => setIsOpen(false)} className="vendor_filter bg-blue-100 text-blue-600">{date ? date.toDateString() : "Select Date"}<ChevronUp size={40} strokeWidth={3} absoluteStrokeWidth /></button>
                        ) : (
                            <button onClick={() => setIsOpen(true)} className="vendor_filter">{date ? date.toDateString() : "Select Date"}<ChevronDown size={40} strokeWidth={3} absoluteStrokeWidth /></button>
                        )}
                        {isOpen && (
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateChange}
                                className="rounded-md border shadow-sm absolute z-20"
                                captionLayout="dropdown"
                            />
                        )}
                    </span>
                </div>
                <div className="my-6 relative flex flex-col w-full h-full overflow-scroll bg-white border rounded-xl bg-clip-border">
                    <table className="w-full text-left table-auto min-w-max">
                        <thead>
                            <tr>
                                {AUDIT_LOG_COLUMNS.map((column) => (
                                    <th key={column.id} className="p-4 bg-gray-100 text-gray-600 font-semibold uppercase tracking-wide">
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-100 border-b border-gray-400">
                                    <td className="p-4">{log.timestamp}</td>
                                    <td className="p-4">{log.actor}</td>
                                    <td className="p-4">{log.tenant}</td>
                                    <td className="p-4">
                                        <span className={`py-1 px-3 text-nowrap-sm items-center ${log.actionType === "Active" ? "bg-green-100 text-green-500" : log.actionType === "Pending" ? "bg-yellow-100 text-yellow-500" : "bg-gray-100 text-gray-500"}`}>{log.actionType}</span>
                                    </td>
                                    <td className="p-4">{log.targetEntity}</td>
                                    <td className="p-4"><a href="#" className="text-blue-600 underline">View JSON</a></td>
                                    <td className="p-4">{log.ipAddress}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <span className="flex justify-end">
                    <Pagination setCount={setCount} count={count} totalPages={totalPages} style="relative right-0 w-54" />
                </span>
            </main>
        </>
    );
}
