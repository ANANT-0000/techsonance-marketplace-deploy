'use client';

import { Navbar } from "@/components/admin/Navbar";
import { useEffect, useState } from "react";
import { Check, X, BadgeCheck, ShieldAlert, } from "lucide-react";
import { VendorApplication, } from "@/utils/Types";
import { ADMIN_BASE_URL, down_arrow, internet_icon } from "@/constants";
import { approveVendor, fetchApplications, rejectVendor } from "@/utils/adminApiClients";
import { formatStructure, formatDate } from "@/lib/utils";
import { DocumentsSection } from "@/components/admin/DocumentSection";




/* ── Main Page ── */
export default function ApproveVendorsPage() {
    const [isOpen, setIsOpen] = useState<number | null>(null);
    const [vendorApplications, setVendorApplications] = useState<VendorApplication[]>([]);

    useEffect(() => {
        fetchApplications()
            .then((applications) => {
                setVendorApplications(applications.data);
                console.log(applications.data[0]);
            })
            .catch((error) => {
                console.error('Error fetching vendor applications:', error);
            });
    }, [vendorApplications.length]);
    const onApprove = async (vendorId: string) => {
        try {
            await approveVendor(vendorId);
            setVendorApplications((prev) =>
                prev.map((app) =>
                    app.id === vendorId ? { ...app, company: { ...app.company, company_status: 'approved' }, vendor_status: 'approved' } : app
                )
            );
        } catch (error) {
            console.error('Error approving vendor:', error);
        }
    }
    const onReject = async (vendorId: string) => {
        try {
            await rejectVendor(vendorId);
            setVendorApplications((prev) =>
                prev.map((app) =>
                    app.id === vendorId ? { ...app, company: { ...app.company, company_status: 'rejected' }, vendor_status: 'rejected' } : app
                )
            );
        } catch (error) {
            console.error('Error rejecting vendor:', error);
        }
    }
    return (
        <>
            <Navbar title="Vendors Applications" />
            <div>
                {vendorApplications.map((application, index) => {
                    const { user, company, ...vendor } = application;
                    const ownerName = `${vendor?.store_owner_first_name} ${vendor?.store_owner_last_name}`;

                    return (
                        <section key={index} className="border-2 border-gray-400 my-6 rounded-xl">

                            {/* ── Header ── */}
                            <div
                                onClick={() => setIsOpen(isOpen === index ? null : index)}
                                className={`${isOpen === index ? 'border-b' : ''} px-4 py-2 flex justify-between items-center cursor-pointer`}
                            >
                                <p className="text-xl font-bold">
                                    Application Request from {vendor.store_name}
                                </p>
                                <button>
                                    <img
                                        src={down_arrow}
                                        className={`${isOpen === index ? '' : 'rotate-180'}`}
                                        alt="dropdown Arrow"
                                    />
                                </button>
                            </div>

                            {/* ── Expanded Body ── */}
                            {isOpen === index && (
                                <div className="border border-gray-200 p-4 border-b-0">
                                    <span className="flex justify-between p-4 border-2 border-gray-300 rounded-2xl mb-0">

                                        {/* Left — Business Profile */}
                                        <div className="leftSection px-4">
                                            <h1 className="text-xl font-bold">Business Profile</h1>

                                            <p className="my-4 flex flex-col">
                                                <span className="font-semibold text-gray-500">STORE NAME</span>
                                                {vendor.store_name}
                                            </p>

                                            <p className="my-4 flex flex-col">
                                                <span className="font-semibold text-gray-500">OWNER NAME</span>
                                                {ownerName}
                                            </p>

                                            <p className="my-4 flex flex-col">
                                                <span className="font-semibold text-gray-500">OWNER EMAIL</span>
                                                {user.email}
                                            </p>

                                            <p className="my-4 flex flex-col">
                                                <span className="font-semibold text-gray-500">PHONE</span>
                                                {user.country_code} {user.phone_number}
                                            </p>

                                            <p className="my-4 flex flex-col">
                                                <span className="font-semibold text-gray-500">CATEGORY</span>
                                                {vendor.category}
                                            </p>

                                            <p className="my-4 flex flex-col">
                                                <span className="font-semibold text-gray-500">COMPANY STRUCTURE</span>
                                                {formatStructure(company.company_structure)}
                                            </p>

                                            <p className="my-4 flex flex-col">
                                                <span className="font-semibold text-gray-500">VERIFICATION STATUS</span>
                                                <span className="flex items-center gap-2 mt-1">
                                                    {vendor.is_verified
                                                        ? <BadgeCheck size={18} className="text-green-500" />
                                                        : <ShieldAlert size={18} className="text-amber-500" />
                                                    }
                                                    {vendor.is_verified ? "Verified" : "Not Verified"}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Right — Domain Assignment */}
                                        <div className="rightSection px-4">
                                            <p className="text-right">{formatDate(vendor.created_at)}</p>

                                            <div className="w-full flex justify-start flex-col gap-6 bg-gray-100 my-4 border py-4 px-6 rounded-lg items-center">
                                                <span className="flex w-full gap-2 items-center">
                                                    <img src={internet_icon} className="w-6 h-6" alt="Internet Icon" />
                                                    <p className="text-lg font-bold">Instance Domain Assignment</p>
                                                </span>

                                                <label className="font-semibold w-full text-gray-500">
                                                    Requested Subdomain
                                                </label>

                                                <span className="flex">
                                                    <p className="text-xl bg-white border min-w-64 border-gray-400 p-4 py-2 rounded-l-lg">
                                                        {company.company_domain}
                                                    </p>
                                                    <p className="text-xl border border-gray-400 p-4 py-2 rounded-r-lg bg-gray-200">
                                                        .platform.com
                                                    </p>
                                                </span>

                                                <label className="w-full font-semibold flex gap-6 items-center text-gray-500">
                                                    {company.company_status === 'approved'
                                                        ? <Check className="border-2 border-green-400 bg-green-100 text-green-500" />
                                                        : <X className="border-2 border-red-400 bg-red-100 text-red-500" />
                                                    }
                                                    Company status is {company.company_status}.
                                                </label>
                                            </div>

                                            {/* Status pills */}
                                            <div className="flex gap-3 mt-2">
                                                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${vendor.vendor_status === 'pending'
                                                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                                    Vendor: {vendor.vendor_status}
                                                </span>
                                                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${company.company_status === 'pending'
                                                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                                    Company: {company.company_status}
                                                </span>
                                            </div>
                                        </div>
                                    </span>

                                    {/* ── Documents Preview ── */}
                                    <DocumentsSection documents={vendor.documents} />

                                    {/* ── Validation Actions ── */}
                                    <span className="flex gap-6 justify-between items-baseline">
                                        <div className="flex flex-1 flex-col gap-6 border-2 border-gray-300 rounded-xl mt-6 px-8 py-4">
                                            <h1 className="font-bold text-2xl">Validation Actions</h1>
                                            <p>
                                                By approving, a dedicated database instance will be provisioned for
                                                <span className="ml-1 font-black">{company.company_domain}</span>
                                            </p>
                                            <button onClick={() => onApprove(vendor.id)} className="cursor-pointer rounded-lg font-medium text-white bg-black py-2 px-4">
                                                Verify & Approve Vendor
                                            </button>
                                            <button onClick={() => onReject(vendor.id)} className="cursor-pointer rounded-lg font-medium bg-red-50 text-red-500 py-2 px-4">
                                                Reject
                                            </button>
                                        </div>
                                    </span>
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>
        </>
    );
}