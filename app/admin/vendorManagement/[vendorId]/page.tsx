"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Store,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Briefcase,
  CheckCircle2,
  XCircle,
  Key,
  Clock,
  CalendarDays,
  Power,
  AlertOctagon,
  FileText,
  ExternalLink,
  Activity,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import { authToken } from "@/utils/authToken";
import AxiosAPI from "@/lib/axios";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import toast from "react-hot-toast";

export enum UserStatus {
  PENDING = "pending",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  DEACTIVATED = "deactivated",
}

export enum LicenseStatus {
  TRIAL = "TRIAL",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  SUSPENDED = "SUSPENDED",
}

interface DocumentType {
  id: string;
  document_type: string;
  document_url: string;
  document_status: string | null;
}

// State structure mapping to your UI requirements
interface AdminVendorDetail {
  company: {
    id: string;
    company_name: string;
    company_domain: string;
    company_structure: string;
    company_status: string;
    created_at: string;
  };
  owner: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    is_verified: boolean;
  };
  license: {
    plan_name: string;
    status: LicenseStatus;
    is_trial: boolean;
    trial_ends_at: string | null;
    valid_from: string;
    expires_at: string;
  };
  stats: {
    total_orders: number;
    total_revenue: number;
    active_products: number;
    total_customers: number;
  };
  documents: DocumentType[];
}
// --- FINANCIAL LEDGER TYPES ---
export interface EarningRecord {
  id: string;
  order_id: string;
  gross_amount: string;
  platform_fee: string;
  net_earning: string;
  status: string; // 'CLEARED', 'PENDING', 'REVERSED'
  created_at: string;
  transaction_ref: string;
}

export interface FinancialData {
  total_transactions: number;
  total_cleared_earnings: string;
  total_pending_earnings: string;
  earnings: EarningRecord[];
}
export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  // const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'financial'>('overview');
  const [vendorData, setVendorData] = useState<AdminVendorDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = authToken();

  useEffect(() => {
    if (!token) {
      router.push("/auth/adminLogin");
      return;
    }

    const fetchVendorDetails = async () => {
      setIsLoading(true);
      try {
        const res = await AxiosAPI.get(`v1/admin/vendors/${params.vendorId}`);

        const apiData = res.data.data;
        setVendorData({
          company: {
            id: apiData.company.id,
            company_name: apiData.company.company_name,
            company_domain: apiData.company.company_domain,
            company_structure: apiData.company.company_structure,
            company_status: apiData.company.company_status,
            created_at: apiData.company.created_at,
          },
          owner: {
            user_id: apiData.owner.user_id,
            first_name:
              apiData.owner.store_owner_first_name ||
              apiData.owner.user?.first_name ||
              "N/A",
            last_name:
              apiData.owner.store_owner_last_name ||
              apiData.owner.user?.last_name ||
              "",
            email: apiData.owner.user?.email || "N/A",
            phone_number: apiData.owner.user?.phone_number || "N/A",
            is_verified: apiData.owner.is_verified,
          },
          // Dummy license calculation based on company creation date
          license: {
            plan_name: "Marketplace Standard",
            status: LicenseStatus.TRIAL,
            // status: LicenseStatus.ACTIVE,
            // status: LicenseStatus.SUSPENDED,
            // status: LicenseStatus.EXPIRED,
            // status: LicenseStatus.REVOKED,
            // is_trial: false,
            is_trial: true,
            trial_ends_at: new Date(
              new Date(apiData.company.created_at).getTime() +
                14 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            valid_from: apiData.company.created_at,
            expires_at: new Date(
              new Date(apiData.company.created_at).getTime() +
                365 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
          stats: {
            total_orders: apiData.stats?.total_orders || 0,
            total_revenue: apiData.stats?.total_revenue || 0,
            active_products: apiData.stats?.active_products || 0,
            total_customers: apiData.stats?.total_customers || 0,
          },
          documents: apiData.documents || [],
        });
      } catch (error) {
        toast.error("Failed to fetch vendor details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorDetails();
  }, [params.vendorId, router]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSuspendClick = () => {
    setModalConfig({
      title: "Suspend Storefront?",
      message:
        "This will immediately hide the vendor's storefront and prevent them from logging in. This action can be reversed later.",
      actionType: "suspend",
      confirmText: "Yes, Suspend",
      onConfirm: async () => {
        setIsProcessing(true);
        await AxiosAPI.patch(`/admin/suspend-vendor/${params.vendorId}`);
        setIsProcessing(false);
        setIsModalOpen(false);
      },
    });
    setIsModalOpen(true);
  };

  const handleActivateClick = () => {
    setModalConfig({
      title: "Approve Vendor?",
      message:
        "This will approve the vendor's KYC documents and grant them full access of storefront.",
      actionType: "approve",
      confirmText: "Yes, Approve",
      onConfirm: async () => {
        setIsProcessing(true);
        await AxiosAPI.patch(`/admin/activate-vendor/${params.vendorId}`);
        setIsProcessing(false);
        setIsModalOpen(false);
      },
    });
    setIsModalOpen(true);
  };

  const handleExtendTrial = () => {
    setModalConfig({
      title: "Extend Trial?",
      message: "This will extend the vendor's trial by 14 days.",
      actionType: "extend_trial",
      confirmText: "Yes, Extend",
      onConfirm: async () => {
        setIsProcessing(true);
        // await AxiosAPI.patch(`/admin/extend-trial/${params.vendorId}`)
        setIsProcessing(false);
        setIsModalOpen(false);
      },
    });
    setIsModalOpen(true);
  };

  const handleDeactivateClick = () => {
    setModalConfig({
      title: "Deactivate Storefront?",
      message:
        "This will immediately hide the vendor's storefront and prevent them from logging in. This action can be reversed later.",
      actionType: "deactivate",
      confirmText: "Yes, Suspend",
      onConfirm: async () => {
        setIsProcessing(true);
        await AxiosAPI.patch(`/admin/deactivate-vendor/${params.vendorId}`);
        setIsProcessing(false);
        setIsModalOpen(false);
      },
    });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading vendor profile...</p>
      </div>
    );
  }

  if (!vendorData)
    return (
      <div className="p-10 text-center text-red-500">
        Failed to load vendor data. Please try again.
      </div>
    );

  const isPending = vendorData.company.company_status === UserStatus.PENDING;

  // Helper to calculate trial days remaining
  const calculateTrialDays = (endDate: string | null) => {
    if (!endDate) return 0;
    const diffTime = new Date(endDate).getTime() - new Date().getTime();
    return diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  };

  return (
    <main className="w-full px-2 lg:px-4 max-w-7xl mx-auto pb-12">
      {/* Top Navigation */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-theme-body-sm text-gray-500 hover:text-blue-600 transition-colors my-6 font-medium"
      >
        <ArrowLeft size={16} />
        Back to Vendors
      </button>

      {/* PENDING VERIFICATION BANNER */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-full mt-1 shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-theme-h6 font-bold text-amber-800">
                Verification Pending
              </h2>
              <p className="text-theme-body-sm text-amber-700 mt-1">
                This vendor has applied to join the marketplace. Review their
                company details and KYC documents below before granting access.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-amber-300 text-amber-700 hover:bg-amber-100 px-4 py-2.5 rounded-xl text-theme-body-sm font-semibold transition-colors">
              <XCircle size={16} /> Reject
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600 px-4 py-2.5 rounded-xl text-theme-body-sm font-semibold transition-colors shadow-sm">
              <CheckCircle2 size={16} /> Approve Vendor
            </button>
          </div>
        </div>
      )}

      {/* Vendor Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 shrink-0">
              <Store size={32} />
            </div>
            <div>
              <h1 className="text-theme-h4 font-bold text-gray-800 flex items-center gap-3">
                <span className="capitalize">
                  {vendorData.company.company_name}
                </span>
                {!isPending && vendorData.owner.is_verified && (
                  <ShieldCheck size={20} className="text-emerald-500" />
                )}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-theme-body-sm text-gray-500">
                <span className="flex items-center gap-1.5 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                  <Globe size={14} /> {vendorData.company.company_domain}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> Registered{" "}
                  {new Date(vendorData.company.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          {/* Master Suspend Button */}
          {!isPending && (
            <div>
              <button className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-theme-body-sm font-semibold transition-colors">
                <ShieldAlert size={16} /> Suspend Storefront
              </button>
            </div>
          )}
        </div>

        {/* KPI Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-500 text-theme-caption font-semibold uppercase tracking-wider mb-1">
              Total Revenue
            </p>
            <p className="text-theme-h4 font-bold text-gray-800">
              ₹{vendorData.stats.total_revenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-500 text-theme-caption font-semibold uppercase tracking-wider mb-1">
              Total Orders
            </p>
            <p className="text-theme-h4 font-bold text-gray-800">
              {vendorData.stats.total_orders}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-500 text-theme-caption font-semibold uppercase tracking-wider mb-1">
              Catalog Size
            </p>
            <p className="text-theme-h4 font-bold text-gray-800">
              {vendorData.stats.active_products}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-500 text-theme-caption font-semibold uppercase tracking-wider mb-1">
              Customers
            </p>
            <p className="text-theme-h4 font-bold text-gray-800">
              {vendorData.stats.total_customers}
            </p>
          </div>
        </div>
      </div>

      {/* Tabbed Navigation */}
      {/* <div className="flex items-center gap-6 border-b border-gray-200 mb-6 px-2">
                {[
                    { id: 'overview', label: 'Overview & Licensing', icon: Briefcase },
                    { id: 'orders', label: 'Store Orders', icon: ShoppingBag },
                    { id: 'financials', label: 'Revenue & Payouts', icon: DollarSign },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 pb-3 text-theme-body-sm font-semibold transition-colors relative ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
                        )}
                    </button>
                ))}
            </div> */}

      {/* Tab Content Area */}
      <div className="mb-10">
        {/* {activeTab === 'overview' && ( */}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Company Details */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-theme-h6 font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase size={18} className="text-blue-500" /> Company Info
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-theme-body-sm text-gray-500 mb-1">Legal Name</p>
                  <p className="font-medium text-gray-800 capitalize">
                    {vendorData.company.company_name}
                  </p>
                </div>
                <div>
                  <p className="text-theme-body-sm text-gray-500 mb-1">
                    Business Structure
                  </p>
                  <p className="font-medium text-gray-800 capitalize">
                    {vendorData.company.company_structure.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-theme-body-sm text-gray-500 mb-1">Status</p>
                  <p className="font-medium text-gray-800 capitalize">
                    {vendorData.company.company_status}
                  </p>
                </div>
              </div>
            </div>

            {/* Owner Details */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-theme-h6 font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-500" /> Primary Owner
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-theme-body-sm text-gray-500 mb-1">Full Name</p>
                  <p className="font-medium text-gray-800 capitalize">
                    {vendorData.owner.first_name} {vendorData.owner.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-theme-body-sm text-gray-500 mb-1">Contact Details</p>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <p className="text-theme-body-sm font-medium text-gray-800 flex items-center gap-2 truncate">
                      <Mail size={14} className="text-gray-400 shrink-0" />{" "}
                      {vendorData.owner.email}
                    </p>
                    <p className="text-theme-body-sm font-medium text-gray-800 flex items-center gap-2">
                      <Phone size={14} className="text-gray-400 shrink-0" />{" "}
                      {vendorData.owner.phone_number}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* KYC Documents */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-theme-h6 font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-blue-500" /> KYC Documents
              </h3>
              {vendorData.documents.length === 0 ? (
                <p className="text-theme-body-sm text-gray-500">No documents uploaded.</p>
              ) : (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
                  {vendorData.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                      <span className="text-theme-caption font-bold text-gray-600 group-hover:text-blue-700 uppercase tracking-wide">
                        {doc.document_type.replace(/_/g, " ")}
                      </span>
                      <ExternalLink
                        size={14}
                        className="text-gray-400 group-hover:text-blue-600"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ROW 2: License & Subscription Management */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-theme-h6 font-bold text-gray-800 flex items-center gap-2">
                <Key size={18} className="text-indigo-500" /> License &
                Subscription
              </h3>
              {/* Dynamic Status Badge */}
              {vendorData.license.status === LicenseStatus.TRIAL ? (
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-theme-caption font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} /> Trial Active
                </span>
              ) : vendorData.license.status === LicenseStatus.ACTIVE ? (
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-theme-caption font-bold uppercase tracking-wider">
                  Active License
                </span>
              ) : (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-theme-caption font-bold uppercase tracking-wider">
                  {vendorData.license.status}
                </span>
              )}
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Plan Info */}
              <div>
                <p className="text-theme-body-sm text-gray-500 mb-1">Current Plan</p>
                <p className="text-theme-h5 font-bold text-gray-800">
                  {vendorData.license.plan_name}
                </p>

                {vendorData.license.is_trial &&
                  vendorData.license.trial_ends_at && (
                    <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <p className="text-theme-caption font-semibold text-indigo-800 mb-2">
                        Trial Ends in{" "}
                        {calculateTrialDays(vendorData.license.trial_ends_at)}{" "}
                        Days
                      </p>
                      <div className="w-full bg-indigo-200 rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: "45%" }}
                        ></div>
                      </div>
                      <p className="text-theme-caption text-indigo-600 mt-2">
                        {new Date(
                          vendorData.license.trial_ends_at,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
              </div>

              {/* Validity Period */}
              <div className="space-y-4">
                <div>
                  <p className="text-theme-body-sm text-gray-500 mb-1 flex items-center gap-1.5">
                    <CalendarDays size={14} /> License Issued
                  </p>
                  <p className="font-medium text-gray-800">
                    {new Date(vendorData.license.valid_from).toLocaleDateString(
                      "en-GB",
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-theme-body-sm text-gray-500 mb-1 flex items-center gap-1.5">
                    <AlertOctagon size={14} /> License Expiry
                  </p>
                  <p className="font-medium text-gray-800">
                    {new Date(vendorData.license.expires_at).toLocaleDateString(
                      "en-GB",
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                  </p>
                </div>
              </div>

              {/* License Actions */}
              <div className="flex flex-col gap-3 justify-center border-l border-gray-100 md:pl-8">
                {vendorData.license.is_trial ? (
                  <>
                    <button
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-theme-body-sm font-semibold transition-colors shadow-sm cursor-pointer"
                      onClick={handleActivateClick}
                    >
                      <CheckCircle2 size={16} /> Activate Full License
                    </button>
                    <button
                      className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-theme-body-sm font-semibold transition-colors cursor-pointer"
                      onClick={handleExtendTrial}
                    >
                      <Clock size={16} /> Extend Trial +14 Days
                    </button>
                  </>
                ) : (
                  <button className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl text-theme-body-sm font-semibold transition-colors cursor-pointer">
                    <Power size={16} onClick={handleDeactivateClick} />{" "}
                    Deactivate License
                  </button>
                )}

                <button
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2.5 rounded-xl text-theme-body-sm font-semibold transition-colors mt-2 cursor-pointer"
                  onClick={handleSuspendClick}
                >
                  <ShieldAlert size={16} /> Emergency Suspend Store
                </button>
              </div>
            </div>
          </div>
        </div>

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => !isProcessing && setIsModalOpen(false)}
          onConfirm={modalConfig.onConfirm}
          title={modalConfig.title}
          message={modalConfig.message}
          actionType={modalConfig.actionType}
          confirmText={modalConfig.confirmText}
          isLoading={isProcessing}
        />
        {/* )} */}

        {/* ORDERS TAB */}
        {/* {activeTab === 'orders' && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="text-theme-h6 font-bold text-gray-800 flex items-center gap-2">
                                <ShoppingBag size={18} className="text-blue-500" /> Recent Orders
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                 
                                    {vendorData.recent_orders && vendorData.recent_orders.length > 0 ? (
                                        vendorData.recent_orders.map((order: any) => (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-mono text-theme-body-sm font-semibold text-blue-600">
                                                    #{order.id.split('-')[0].toUpperCase()}
                                                </td>
                                                <td className="p-4 text-theme-body-sm text-gray-600">
                                                    {new Date(order.created_at).toLocaleDateString('en-GB')}
                                                </td>
                                                <td className="p-4 text-theme-body-sm font-bold text-gray-800">
                                                    ₹{Number(order.total_amount || 0).toLocaleString()}
                                                </td>
                                                <td className="p-4">
                                                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-theme-caption font-semibold capitalize">
                                                        {order.order_status || 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-400 text-theme-body-sm">
                                                <ShoppingBag size={32} className="mx-auto mb-2 opacity-20" />
                                                No recent orders found for this vendor.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )} */}

        {/* FINANCIALS TAB (Lazy Loaded) */}
        {/* {activeTab === 'financials' && (
                    <div className="flex flex-col gap-6">
                        {isFinancialsLoading ? (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 flex flex-col items-center justify-center">
                                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-500 font-medium">Loading financial ledger...</p>
                            </div>
                        ) : financials ? (
                            <>
                             
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                        <p className="text-gray-500 text-theme-caption font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Activity size={14} /> Total Transactions</p>
                                        <p className="text-theme-h4 font-bold text-gray-800">{financials.total_transactions}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                        <p className="text-gray-500 text-theme-caption font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> Cleared Revenue</p>
                                        <p className="text-theme-h4 font-bold text-emerald-600">₹{Number(financials.total_cleared_earnings).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                        <p className="text-gray-500 text-theme-caption font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Clock size={14} className="text-amber-500" /> Pending Revenue</p>
                                        <p className="text-theme-h4 font-bold text-amber-600">₹{Number(financials.total_pending_earnings).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                        <h3 className="text-theme-h6 font-bold text-gray-800 flex items-center gap-2">
                                            <DollarSign size={18} className="text-emerald-500" /> Revenue Ledger
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider">Transaction Ref</th>
                                                    <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                                    <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider">Net Earning</th>
                                                    <th className="p-4 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {financials.earnings.length > 0 ? (
                                                    financials.earnings.map((earning) => (
                                                        <tr key={earning.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="p-4 font-mono text-theme-body-sm text-gray-500 truncate max-w-[150px]" title={earning.transaction_ref}>
                                                                {earning.transaction_ref}
                                                            </td>
                                                            <td className="p-4 font-mono text-theme-body-sm font-semibold text-blue-600">
                                                                #{earning.order_id.split('-')[0].toUpperCase()}
                                                            </td>
                                                            <td className="p-4 text-theme-body-sm text-gray-600">
                                                                {new Date(earning.created_at).toLocaleDateString('en-GB')}
                                                            </td>
                                                            <td className="p-4 text-theme-body-sm font-bold text-gray-800">
                                                                ₹{Number(earning.net_earning).toLocaleString()}
                                                            </td>
                                                            <td className="p-4">
                                                                {getStatusBadge(earning.status)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="p-8 text-center text-gray-400 text-theme-body-sm">
                                                            No financial records found for this vendor.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
                                <AlertOctagon size={40} className="mx-auto mb-3 opacity-20" />
                                <p className="font-medium text-gray-700">Unable to load financials</p>
                            </div>
                        )}
                    </div>
                )} */}
      </div>
    </main>
  );
}
