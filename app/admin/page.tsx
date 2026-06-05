'use client'
import { Navbar } from "@/components/admin/Navbar";
import { DashboardChart } from "@/components/admin/DashboardChart";
import { ADMIN_DASHBOARD_STATS, ACTIVE_INSTANCES } from "@/constants/admin";
import { Store, Users, ShoppingBag, Activity, TrendingUp, Server } from "lucide-react";
import AxiosAPI from "@/lib/axios";
import { authToken } from "@/utils/authToken";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
export interface Vendor {
    id: string;
    store_owner_first_name: string;
    store_owner_last_name: string;
    store_name: string;
    store_description: string;
    category: string;
    vendor_status: "active" | "inactive" | "pending"; // adjust as needed
    is_verified: boolean;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    company_id: string;
    user_id: string;
    company: Company;
    user: User;
}

export interface Company {
    id: string;
    company_name: string;
    company_domain: string;
    company_structure: "sole_proprietorship" | "partnership" | "corporation"; // extend if needed
    company_status: "pending" | "active" | "inactive"; // adjust as needed
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


const getInstanceStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
        case "active":
            return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-3 rounded-full text-xs font-semibold">● Active</span>;
        case "inactive":
            return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 py-1 px-3 rounded-full text-xs font-semibold">● Inactive</span>;
        case "pending":
            return <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 py-1 px-3 rounded-full text-xs font-semibold">● {status}</span>;
        default:
            return <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 py-1 px-3 rounded-full text-xs font-semibold capitalize">● {status}</span>;
    }
};
export default function AdminDashboardPage() {
    const params = useParams()
    const token = authToken()
    const [companies, setCompanies] = useState<Vendor[]>([])
    const [customers, setCustomers] = useState([])
    const [orders, setOrders] = useState([])
    const [systemsOperations, setSystemsOperations] = useState([])
    useEffect(() => {
        AxiosAPI.get(`/v1/admin/vendors`).then((res) => {
            console.log("vednor res", res.data.data)
            setCompanies(res.data.data)
        }).catch((err) => console.log(err))
        AxiosAPI.get(`/v1/admin/customers`).then((res) => {
            console.log("cusotmer res", res.data.data)
            setCustomers(res.data.data)
        }).catch((err) => console.log(err))
        AxiosAPI.get(`/v1/admin/orders`).then((res) => {
            console.log("orders res", res.data.data)
            setOrders(res.data.data)
        }).catch((err) => console.log(err))
        // AxiosAPI.get(`/v1/systemoperations/all`).then((res) => {
        //     console.log("res", res)
        //     setSystemsOperations(res.data.data)
        // }).catch((err) => console.log(err))
    }, []);


    return (
        <>
            <Navbar title="Dashboard" />

            <main className="w-full px-2 lg:px-4  mx-auto pb-12 mt-6">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:border-gray-300 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Vendors</p>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <Store size={18} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{companies.length || 0}</p>
                        {/* <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
                            <TrendingUp size={14} />
                            {ADMIN_DASHBOARD_STATS.vendorGrowth}% this month
                        </p> */}
                    </div>

                    {/* Customers Stat */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:border-gray-300 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Customers</p>
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                                <Users size={18} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{customers.length}</p>
                        {/* <p className="text-xs font-medium text-gray-500 mt-2">
                            Across all instances
                        </p> */}
                    </div>

                    {/* Orders Stat */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:border-gray-300 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Orders</p>
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition-colors">
                                <ShoppingBag size={18} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{orders.length}</p>
                        {/* <p className="text-xs font-medium text-gray-500 mt-2">
                            This month
                        </p> */}
                    </div>

                    {/* Operations Stat */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:border-gray-300 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Systems Ops</p>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                <Activity size={18} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-emerald-600">{ADMIN_DASHBOARD_STATS.systemsOperations}%</p>
                        <p className="text-xs font-medium text-gray-500 mt-2">
                            All systems operational
                        </p>
                    </div>

                </div>

                {/* Mid Section: Chart & Instances */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Chart Container */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
                        <h2 className="font-bold text-lg text-gray-800 mb-4">Revenue Overview</h2>
                        <div className="w-full relative">
                            <DashboardChart />
                        </div>
                    </div>

                    {/* Active Instances Container */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[450px]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                <Server size={20} className="text-blue-500" />
                                Active Instances
                            </h2>
                            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                                {companies.filter((company) => company.vendor_status === 'active').length} Total
                            </span>
                        </div>

                        {/* Scrollable List */}
                        <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                            {companies.map((instance) => (
                                <div
                                    key={instance.id}
                                    className="flex justify-between items-center bg-white border border-gray-100 hover:border-gray-200 hover:bg-gray-50 p-4 rounded-xl transition-all shadow-sm group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">
                                            {instance.store_owner_first_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">
                                                {instance.store_name}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {instance.user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        {getInstanceStatusBadge(instance.vendor_status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </section>
            </main>
        </>
    );
}