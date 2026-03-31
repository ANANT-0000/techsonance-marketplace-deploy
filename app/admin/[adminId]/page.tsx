'use client';

import { Navbar } from "@/components/admin/Navbar";
import { DashboardChart } from "@/components/admin/DashboardChart";
import { ADMIN_DASHBOARD_STATS, ACTIVE_INSTANCES } from "@/constants/admin";

export default function AdminDashboardPage() {
    return (
        <>
            <Navbar title="Dashboard" />
            <main className="admin_dashboard">
                <div className="stats">
                    <div className="stat">
                        <div className="stat_title">Total Vendors</div>
                        <div className="stat_value">{ADMIN_DASHBOARD_STATS.totalVendors}</div>
                        <div className="stat_desc text-green-600">↗︎ {ADMIN_DASHBOARD_STATS.vendorGrowth}% this month</div>
                    </div>
                    <div className="stat">
                        <div className="stat_title">Total Customers</div>
                        <div className="stat_value">{ADMIN_DASHBOARD_STATS.totalCustomers}</div>
                        <div className="stat_desc">Across all instances</div>
                    </div>
                    <div className="stat">
                        <div className="stat_title">Total Orders</div>
                        <div className="stat_value">{ADMIN_DASHBOARD_STATS.totalOrders}</div>
                        <div className="stat_desc">This month</div>
                    </div>
                    {/* <div className="stat">
                        <div className="stat_title">Systems Operations</div>
                        <div className="stat_value text-green-600">{ADMIN_DASHBOARD_STATS.systemsOperations}%</div>
                        <div className="stat_desc">All systems operational</div>
                    </div> */}
                </div>
                <section className="mid_section flex justify-between my-5 gap-6">
                    <DashboardChart />
                    <div className="active_card lg:w-[50%] md:w-[50%] sm:w-full bg-white py-4 px-6 rounded-lg border-2 border-gray-300">
                        <h2 className="font-bold text-lg mb-4">Active Instances</h2>
                        <span className="instance_container overflow-y-scroll h-96 block">
                            {ACTIVE_INSTANCES.map((instance) => (
                                <div key={instance.id} className="instance_card flex mb-4 gap-6 bg-gray-100 border-2 border-gray-300 px-6 py-2 rounded-md justify-between items-center">
                                    <span>
                                        <h2 className="card_title font-medium mb-1">{instance.name}</h2>
                                        <p className="card_email text-sm font-light text-gray-500">{instance.email}</p>
                                    </span>
                                    <button className={`py-1 px-3 text-nowrap-sm items-center ${instance.status === "Healthy" ? "bg-green-100 text-green-500" : instance.status === "High Load" ? "bg-yellow-100 text-yellow-500" : "bg-red-100 text-red-500"}`}>
                                        {instance.status}
                                    </button>
                                </div>
                            ))}
                        </span>
                    </div>
                </section>
            </main>
        </>
    );
}
