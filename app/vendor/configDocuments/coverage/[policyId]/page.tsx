"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { authToken } from "@/utils/authToken";
import {
  ShieldCheck,
  Tag,
  Box,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  FileText,
  Activity,
  Edit,
  ExternalLink,
  GitMerge,
} from "lucide-react";
import Link from "next/link";
import { fetchPolicyCoverageDetails } from "@/utils/vendorApiClient";
import { UiText } from "@/constants/ui-text";
import { PolicyType } from "../../page";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PolicyCoverageItem {
  policy: {
    id: string;
    policy_name: string;
    policy_type: string;
    duration_value: number | null;
    duration_unit: string | null;
    is_active: boolean;
    generates_document: boolean;
    // Return & Replacement fields
    is_returnable: boolean;
    is_replaceable: boolean;
    return_window_days: number | null;
    replacement_window_days: number | null;
    return_conditions: string | null;
    return_replace_mode: "none" | "return_only" | "replace_only" | "both";
  };
  categories: {
    id: string;
    assignment_id: string;
    name: string;
    priority: number;
  }[];
  products: {
    id: string;
    override_id: string;
    name: string;
    overrides_category: boolean;
  }[];
  inherited_products: {
    id: string;
    name: string;
    category_name: string;
  }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_PALETTE: Record<
  string,
  { badge: string; icon: string; bg: string }
> = {
  [PolicyType.WARRANTY]: {
    badge: "bg-blue-50 text-blue-700",
    icon: "🛡️",
    bg: "bg-blue-500",
  },
  [PolicyType.GUARANTEE]: {
    badge: "bg-emerald-50 text-emerald-700",
    icon: "✅",
    bg: "bg-emerald-500",
  },
  [PolicyType.EXCHANGE_ONLY]: {
    badge: "bg-amber-50 text-amber-700",
    icon: "🔄",
    bg: "bg-amber-500",
  },
  [PolicyType.NO_RETURN]: {
    badge: "bg-red-50 text-red-700",
    icon: "🚫",
    bg: "bg-red-500",
  },
  [PolicyType.EXTENDED_SUPPORT]: {
    badge: "bg-purple-50 text-purple-700",
    icon: "🔧",
    bg: "bg-purple-500",
  },
  [PolicyType.NONE]: {
    badge: "bg-gray-50 text-gray-600",
    icon: "➖",
    bg: "bg-gray-400",
  },
};

function TypeBadge({ type }: { type: string }) {
  const p = TYPE_PALETTE[type] ?? TYPE_PALETTE[PolicyType.NONE];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-theme-caption font-bold uppercase tracking-wider ${p.badge}`}
    >
      {p.icon} {type.replace(/_/g, " ")}
    </span>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

interface PolicyCoverageDetailPageProps {
  labels?: typeof UiText;
}

export default function PolicyCoverageDetailPage({
  labels = UiText,
}: PolicyCoverageDetailPageProps) {
  const params = useParams();
  const policyId = params.policyId as string;
  const token = authToken();

  const [data, setData] = useState<PolicyCoverageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !policyId) return;
    const loadCoverageDetail = async () => {
      setLoading(true);
      try {
        const res = await fetchPolicyCoverageDetails(policyId, token);
        if (res?.data) {
          setData(res.data[0]);
        } else {
          setError(labels.COVERAGE_DETAIL_PAGE.NOT_FOUND);
        }
      } catch {
        setError(labels.COVERAGE_DETAIL_PAGE.LOAD_ERROR);
      } finally {
        setLoading(false);
      }
    };
    loadCoverageDetail();
  }, [token, policyId]);

  if (loading)
    return (
      <div className=" absolute top-0 bottom-0 left-0 right-0 w-full h-full flex justify-center items-center   text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );

  if (error || !data)
    return (
      <div className=" absolute top-0 bottom-0 left-0 right-0 w-full h-full flex flex-col items-center justify-center   gap-3 text-red-500">
        <AlertCircle className="w-10 h-10" />
        <p className="font-medium text-theme-h6">
          {error || labels.COVERAGE_DETAIL_PAGE.ERROR_FALLBACK}
        </p>
      </div>
    );

  const p =
    TYPE_PALETTE[data.policy.policy_type] ?? TYPE_PALETTE[PolicyType.NONE];

  return (
    <main className="w-full mx-auto py-6 px-1 max-h-screen min-h-screen overflow-y-scroll">
      {/* ── Header ── */}
      <div className="mb-8">
        <Link
          href={`/vendor/configDocuments/coverage`}
          className="inline-flex items-center gap-1.5 text-theme-body-sm font-medium text-gray-500 hover:text-gray-900 mb-5 group transition-colors"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {labels.COVERAGE_DETAIL_PAGE.BACK_TO_MAP}
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`mt-1 p-3 rounded-xl text-white ${p.bg} shadow-sm`}>
              <ShieldCheck size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-theme-h3 font-extrabold text-gray-900 tracking-tight mb-2">
                {data.policy.policy_name}
              </h1>
              <TypeBadge type={data.policy.policy_type} />
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/vendor/configDocuments/assign`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-theme-body-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ExternalLink size={16} />{" "}
              {labels.COVERAGE_DETAIL_PAGE.MANAGE_ASSIGNMENTS}
            </Link>
            <Link
              href={`/vendor/configDocuments?editId=${data.policy.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-theme-body-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Edit size={16} /> {labels.COVERAGE_DETAIL_PAGE.EDIT_POLICY}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column: Config Summary ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-theme-h6 font-bold text-gray-800 mb-5 border-b pb-2">
              {labels.COVERAGE_DETAIL_PAGE.POLICY_CONFIG}
            </h2>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-theme-caption font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    {labels.COVERAGE_DETAIL_PAGE.DURATION}
                  </p>
                  <p className="text-theme-body-sm font-medium text-gray-900">
                    {data.policy.duration_value
                      ? `${data.policy.duration_value} ${data.policy.duration_unit}`
                      : labels.COVERAGE_DETAIL_PAGE.LIFETIME_NO_EXPIRY}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg shrink-0 ${data.policy.is_active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                >
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-theme-caption font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    {labels.COVERAGE_DETAIL_PAGE.STATUS}
                  </p>
                  <p
                    className={`text-theme-body-sm font-bold ${data.policy.is_active ? "text-emerald-700" : "text-red-700"}`}
                  >
                    {data.policy.is_active
                      ? labels.COVERAGE_DETAIL_PAGE.ACTIVE
                      : labels.COVERAGE_DETAIL_PAGE.INACTIVE}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-theme-caption font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    {labels.COVERAGE_DETAIL_PAGE.DOCUMENTATION}
                  </p>
                  <p className="text-theme-body-sm font-medium text-gray-900">
                    {data.policy.generates_document
                      ? labels.COVERAGE_DETAIL_PAGE.GENERATES_PDF
                      : labels.COVERAGE_DETAIL_PAGE.NO_PDF_GENERATED}
                  </p>
                </div>
              </div>

              {/* Return & Replacement Summary */}
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    data.policy.return_replace_mode === "none"
                      ? "bg-red-50 text-red-500"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-theme-caption font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    Return &amp; Replacement
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {data.policy.is_returnable && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-theme-caption font-semibold">
                        ↩{" "}
                        {data.policy.return_window_days
                          ? `${data.policy.return_window_days}-Day Returns`
                          : "Returns Accepted"}
                      </span>
                    )}
                    {data.policy.is_replaceable && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-theme-caption font-semibold">
                        🔄{" "}
                        {data.policy.replacement_window_days
                          ? `${data.policy.replacement_window_days}-Day Replace`
                          : "Replacement Accepted"}
                      </span>
                    )}
                    {!data.policy.is_returnable && !data.policy.is_replaceable && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-theme-caption font-semibold">
                        🚫 Final Sale
                      </span>
                    )}
                  </div>
                  {data.policy.return_conditions && (
                    <p className="mt-2 text-theme-caption text-gray-500 leading-relaxed">
                      {data.policy.return_conditions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: The Coverage Breakdown ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* EXPLICIT CATEGORIES */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md">
                  <Tag size={18} />
                </div>
                <h2 className="text-theme-h6 font-bold text-gray-800">
                  {labels.COVERAGE_DETAIL_PAGE.LINKED_CATEGORIES}
                </h2>
              </div>
              <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-theme-caption font-bold">
                {data.categories.length} {labels.COVERAGE_DETAIL_PAGE.ASSIGNED}
              </span>
            </div>
            <div className="p-5">
              {data.categories.length === 0 ? (
                <p className="text-theme-body-sm text-gray-500 italic">
                  {labels.COVERAGE_DETAIL_PAGE.NOT_ASSIGNED}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.categories.map((cat) => (
                    <div
                      key={cat.assignment_id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-200"
                    >
                      <span className="font-medium text-theme-body-sm text-gray-800">
                        {cat.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* INHERITED PRODUCTS */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-sky-100 text-sky-600 rounded-md mt-0.5">
                  <GitMerge size={18} />
                </div>
                <div>
                  <h2 className="text-theme-h6 font-bold text-gray-800">
                    {labels.COVERAGE_DETAIL_PAGE.INHERITED_COVERAGE}
                  </h2>
                  <p className="text-theme-caption text-gray-500 mt-0.5">
                    {labels.COVERAGE_DETAIL_PAGE.INHERITED_SUBTITLE}
                  </p>
                </div>
              </div>
              <span className="bg-sky-100 text-sky-700 py-1 px-3 rounded-full text-theme-caption font-bold shrink-0">
                {data.inherited_products.length}{" "}
                {labels.COVERAGE_DETAIL_PAGE.COVERED}
              </span>
            </div>
            <div className="p-5">
              {data.inherited_products.length === 0 ? (
                <p className="text-theme-body-sm text-gray-500 italic">
                  {labels.COVERAGE_DETAIL_PAGE.NO_INHERITED}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.inherited_products.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex flex-col p-3 rounded-xl border border-sky-100 bg-sky-50/30"
                    >
                      <span className="font-medium text-theme-body-sm text-gray-800 truncate">
                        {prod.name}
                      </span>
                      <span className="text-theme-caption text-sky-600 font-medium">
                        {labels.COVERAGE_DETAIL_PAGE.VIA_PREFIX}
                        {prod.category_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* EXPLICIT PRODUCT OVERRIDES */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 text-orange-600 rounded-md">
                  <Box size={18} />
                </div>
                <h2 className="text-theme-h6 font-bold text-gray-800">
                  {labels.COVERAGE_DETAIL_PAGE.DIRECT_OVERRIDES}
                </h2>
              </div>
              <span className="bg-orange-100 text-orange-700 py-1 px-3 rounded-full text-theme-caption font-bold">
                {data.products.length} {labels.COVERAGE_DETAIL_PAGE.OVERRIDES}
              </span>
            </div>
            <div className="p-5">
              {data.products.length === 0 ? (
                <p className="text-theme-body-sm text-gray-500 italic">
                  {labels.COVERAGE_DETAIL_PAGE.NO_DIRECT_OVERRIDES}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.products.map((prod) => (
                    <div
                      key={prod.override_id}
                      className="flex items-center justify-between p-3 rounded-xl border border-orange-200 bg-orange-50/30"
                    >
                      <span className="font-medium text-theme-body-sm text-gray-800">
                        {prod.name}
                      </span>
                      <span className="shrink-0 text-orange-600 text-theme-tiny font-bold uppercase tracking-wider bg-orange-100 px-2 py-1 rounded">
                        {labels.COVERAGE_DETAIL_PAGE.DIRECT_OVERRIDE_BADGE}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
