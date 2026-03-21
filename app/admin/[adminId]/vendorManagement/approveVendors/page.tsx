'use client';

import { Navbar } from "@/components/admin/Navbar";
import { down_arrow, internet_icon } from "@/constants/common";
import { VENDOR_APPLICATIONS } from "@/constants/admin";
import { useState } from "react";
import { Check, File, X } from "lucide-react";

export default function ApproveVendorsPage() {
    const [isOpen, setIsOpen] = useState<number | null>(null);

    return (
        <>
            <Navbar title="Vendors Applications" />
            <div>
                {VENDOR_APPLICATIONS.map((application, index) => (
                    <section key={index} className="border-2 border-gray-400 my-6 rounded-xl">
                        <div onClick={() => setIsOpen(isOpen === index ? null : index)} className={`${isOpen === index ? ' border-b' : ''} px-4 py-2 flex justify-between items-center cursor-pointer`}>
                            <p className="text-xl font-bold">
                                Application Request from {application.business_profile.business_name}
                            </p>
                            <button>
                                <img src={down_arrow} className={`${isOpen === index ? '' : 'rotate-180'}`} alt="dropdown Arrow" />
                            </button>
                        </div>
                        {isOpen === index && (
                            <>
                                <div className="border border-gray-200 p-4 border-b-0">
                                    <span className="flex justify-between p-4 border-2 border-gray-300 rounded-2xl mb-0">
                                        <div className="leftSection px-4">
                                            <h1 className="text-xl font-bold">Business Profile</h1>
                                            <p className="my-4 flex flex-col"><span className="font-semibold text-gray-500">BUSINESS NAME</span> {application.business_profile.business_name}</p>
                                            <p className="my-4 flex flex-col"><span className="font-semibold text-gray-500">OWNER NAME</span> {application.business_profile.owner_name}</p>
                                            <p className="my-4 flex flex-col"><span className="font-semibold text-gray-500">OWNER EMAIL</span> {application.business_profile.owner_email}</p>
                                        </div>
                                        <div className="rightSection px-4">
                                            <p className="text-right">{application.business_profile.submission_date}</p>
                                            <div className="w-full flex justify-start flex-col gap-6 bg-gray-100 my-4 border py-4 px-6 rounded-lg items-center">
                                                <span className="flex w-full gap-2 items-center">
                                                    <img src={internet_icon} className="w-6 h-6" alt="Internet Icon" />
                                                    <p className="text-lg font-bold">Instance Domain Assignment</p>
                                                </span>
                                                <label htmlFor="Requested Subdomain" className="font-semibold w-full text-gray-500">Requested Subdomain</label>
                                                <span className="flex">
                                                    <p className="text-xl bg-white border min-w-64 border-gray-400 p-4 py-2 rounded-l-lg">{application.instance_details.requested_subdomain}</p>
                                                    <p className="text-xl border border-gray-400 p-4 py-2 rounded-r-lg bg-gray-200">.platform.com</p>
                                                </span>
                                                <label htmlFor="dns check" className="w-full font-semibold flex gap-6 items-center text-gray-500">
                                                    {application.instance_details.dns_check === 'passed' ? (<Check className="border-2 border-green-400 bg-green-100 text-green-500" />) : (<X className="border-2 border-red-400 bg-red-100 text-red-500" />)}
                                                    DNS check {application.instance_details.dns_check === 'passed' ? 'passed' : 'failed'}. Domain is {application.instance_details.dns_check === 'passed' ? 'available' : 'unavailable'}.
                                                </label>
                                            </div>
                                        </div>
                                    </span>
                                    <span className="flex gap-6 justify-between items-baseline">
                                        <div className="flex-2 p-4 border-2 border-gray-300 rounded-xl">
                                            <h1 className="text-xl font-bold px-4">Submitted Documents</h1>
                                            <div className="flex flex-col gap-2 mt-4">
                                                {application.submitted_documents.map((doc, docIndex) => (
                                                    <div key={docIndex} className={`${docIndex === application.submitted_documents.length - 1 ? '' : 'border-b border-gray-300'} p-4 flex justify-between items-center`}>
                                                        <div>
                                                            <span className="flex gap-2 items-center">
                                                                <File size={32} />
                                                                <p className="font-semibold">{doc.file_name}</p>
                                                            </span>
                                                            <ul className="flex gap-4 ml-8 items-center">
                                                                <li className="text-gray-500">Size: {doc.size}</li>
                                                                <span className="h-2 w-2 rounded-full bg-black"></span>
                                                                <li className="text-gray-500">Uploaded: {doc.uploaded_at}</li>
                                                            </ul>
                                                        </div>
                                                        <button className="text-blue-500 underline cursor-pointer">view</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col gap-6 border-2 border-gray-300 rounded-xl mt-6 px-8 py-4">
                                            <h1 className="font-bold text-2xl">Validation Actions</h1>
                                            <p>By approving, a dedicated database instance will be provisioned for
                                                <span className="ml-1 font-black">{application.instance_details.requested_subdomain}</span>
                                            </p>
                                            <button className="rounded-lg font-medium text-white bg-black py-2 px-4">Verify & Approve Vendor</button>
                                            <button className="rounded-lg font-medium bg-red-50 text-red-500 py-2 px-4">Reject</button>
                                        </div>
                                    </span>
                                </div>
                            </>
                        )}
                    </section>
                ))}
            </div>
        </>
    )
}
