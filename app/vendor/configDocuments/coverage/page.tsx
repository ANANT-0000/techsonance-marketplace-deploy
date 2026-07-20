"use client";
import { useState, useEffect } from "react";
import { authToken } from "@/utils/authToken";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import {
  ShieldCheck,
  Tag,
  Box,
  ChevronRight,
  Loader2,
  AlertCircle,
  Search,
  Layers,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { fetchPolicyCoverageOverview } from "@/utils/vendorApiClient";
import { UiText } from "@/constants/ui-text";
import { PolicyType } from "../page";
import { getClientCompanyId } from "@/utils/getCompanyId";

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
}

export enum PolicyFilterScope {
  ALL = "all",
  CATEGORIES = "categories",
  PRODUCTS = "products",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_PALETTE: Record<
  string,
  { border: string; badge: string; icon: string }
> = {
  [PolicyType.WARRANTY]: {
    border: "border-l-blue-500",
    badge: "bg-blue-50 text-blue-700",
    icon: "🛡️",
  },
  [PolicyType.GUARANTEE]: {
    border: "border-l-emerald-500",
    badge: "bg-emerald-50 text-emerald-700",
    icon: "✅",
  },
  [PolicyType.EXCHANGE_ONLY]: {
    border: "border-l-amber-500",
    badge: "bg-amber-50 text-amber-700",
    icon: "🔄",
  },
  [PolicyType.NO_RETURN]: {
    border: "border-l-red-500",
    badge: "bg-red-50 text-red-700",
    icon: "🚫",
  },
  [PolicyType.EXTENDED_SUPPORT]: {
    border: "border-l-purple-500",
    badge: "bg-purple-50 text-purple-700",
    icon: "🔧",
  },
  [PolicyType.NONE]: {
    border: "border-l-gray-300",
    badge: "bg-gray-50 text-gray-600",
    icon: "➖",
  },
};

function TypeBadge({ type }: { type: string }) {
  const p = TYPE_PALETTE[type] ?? TYPE_PALETTE[PolicyType.NONE];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-theme-caption font-medium ${p.badge}`}
    >
      {p.icon} {type.replace(/_/g, " ")}
    </span>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

interface PolicyCoveragePageProps {
  labels?: typeof UiText;
}

export default function PolicyCoveragePage({
  labels = UiText,
}: PolicyCoveragePageProps) {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const token = authToken();

  const [data, setData] = useState<PolicyCoverageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterScope, setFilterScope] = useState<PolicyFilterScope>(
    PolicyFilterScope.ALL,
  );
  const companyId = getClientCompanyId();

  useEffect(() => {
    if (!token || !companyId) return;
    const loadCoverage = async () => {
      setLoading(true);
      const res = await fetchPolicyCoverageOverview(token, companyId);
      setData(res?.data || []);
      setLoading(false);
    };
    loadCoverage();
  }, [token]);

  const policyTypes = [
    "all",
    ...Array.from(new Set(data.map((d) => d.policy.policy_type))),
  ];

  const filtered = data.filter((item) => {
    const matchesSearch =
      item.policy.policy_name.toLowerCase().includes(search.toLowerCase()) ||
      item.categories.some((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      ) ||
      item.products.some((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );

    const matchesType =
      filterType === "all" || item.policy.policy_type === filterType;

    const matchesScope =
      filterScope === PolicyFilterScope.ALL ||
      (filterScope === PolicyFilterScope.CATEGORIES &&
        item.categories.length > 0) ||
      (filterScope === PolicyFilterScope.PRODUCTS && item.products.length > 0);

    return matchesSearch && matchesType && matchesScope;
  });

  const totalCategories = data.reduce((sum, d) => sum + d.categories.length, 0);
  const totalProducts = data.reduce((sum, d) => sum + d.products.length, 0);
  const unassigned = data.filter(
    (d) => d.categories.length === 0 && d.products.length === 0,
  ).length;

  if (loading) {
    return (
      <div className=" absolute top-0 bottom-0 left-0 right-0 w-full h-full flex justify-center items-center   text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-500">
        <AlertCircle className="w-8 h-8" />
        <p className="text-theme-body-sm">{error}</p>
      </div>
    );
  }

  return (
    <main className="w-full   mx-auto py-6 px-1 max-h-screen min-h-screen overflow-y-scroll">
      {/* ── Header ── */}
      <div className="mb-6">
        <Link
          href={`/vendor/configDocuments`}
          className="inline-flex items-center gap-1.5 text-theme-body-sm text-gray-500 hover:text-gray-800 mb-4 group"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          {labels.COVERAGE_MAP_PAGE.BACK_TO_POLICIES}
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-theme-h4 font-bold text-gray-800">
              {labels.COVERAGE_MAP_PAGE.TITLE}
            </h1>
            <p className="text-theme-body-sm text-gray-500">
              {labels.COVERAGE_MAP_PAGE.SUBTITLE}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: labels.TOTAL_POLICIES,
            value: data.length,
            icon: <ShieldCheck size={16} />,
            color: "blue",
          },
          {
            label: labels.COVERAGE_MAP_PAGE.CATEGORY_LINKS,
            value: totalCategories,
            icon: <Tag size={16} />,
            color: "indigo",
          },
          {
            label: labels.COVERAGE_MAP_PAGE.PRODUCT_OVERRIDES,
            value: totalProducts,
            icon: <Box size={16} />,
            color: "orange",
          },
          {
            label: labels.COVERAGE_MAP_PAGE.UNASSIGNED,
            value: unassigned,
            icon: <AlertCircle size={16} />,
            color: "gray",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm"
          >
            <div className={`text-${s.color}-500 mb-1`}>{s.icon}</div>
            <p className="text-theme-caption text-gray-500">{s.label}</p>
            <p className={`text-theme-h4 font-bold text-${s.color}-600`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex flex-1 items-center gap-2 border border-gray-200 bg-gray-50 px-3 py-2 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-colors">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder={labels.COVERAGE_MAP_PAGE.SEARCH_PLACEHOLDER}
            className="text-theme-body-sm bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-theme-body-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none focus:border-blue-400 text-gray-700"
          >
            {policyTypes.map((t) => (
              <option key={t} value={t}>
                {t === "all"
                  ? labels.COVERAGE_MAP_PAGE.ALL_TYPES
                  : t.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            {(
              [
                PolicyFilterScope.ALL,
                PolicyFilterScope.CATEGORIES,
                PolicyFilterScope.PRODUCTS,
              ] as const
            ).map((s) => (
              <button
                key={s}
                onClick={() => setFilterScope(s)}
                className={`px-3 py-2 text-theme-caption font-medium capitalize transition-colors ${
                  filterScope === s
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Coverage Cards ── */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center text-gray-400 shadow-sm">
          <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-theme-body-sm">
            {labels.COVERAGE_MAP_PAGE.NO_MATCHES}
          </p>
          <Link
            href={`/vendor/configDocuments/assign`}
            className="inline-flex items-center gap-1 mt-3 text-theme-body-sm text-blue-600 hover:underline"
          >
            {labels.COVERAGE_MAP_PAGE.ASSIGN_POLICIES}{" "}
            <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const palette =
              TYPE_PALETTE[item.policy.policy_type] ??
              TYPE_PALETTE[PolicyType.NONE];
            return (
              <div
                key={item.policy.id}
                className={`bg-white border border-gray-200 rounded-2xl shadow-sm border-l-4 ${palette.border} overflow-hidden`}
              >
                {/* Policy Header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 border-b border-gray-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-theme-body">
                        {item.policy.policy_name}
                      </h3>
                      <TypeBadge type={item.policy.policy_type} />
                      {!item.policy.is_active && (
                        <span className="px-2 py-0.5 text-theme-caption font-bold bg-red-50 text-red-600 rounded-full">
                          {labels.COVERAGE_MAP_PAGE.INACTIVE}
                        </span>
                      )}
                      {item.policy.generates_document && (
                        <span className="px-2 py-0.5 text-theme-caption font-medium bg-gray-100 text-gray-600 rounded-full">
                          {labels.COVERAGE_MAP_PAGE.GENERATES_PDF}
                        </span>
                      )}
                    </div>
                    {item.policy.duration_value && (
                      <p className="text-theme-caption text-gray-500">
                        {labels.COVERAGE_MAP_PAGE.DURATION_PREFIX}
                        {item.policy.duration_value} {item.policy.duration_unit}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-theme-caption text-gray-500">
                      {item.categories.length}{" "}
                      {item.categories.length === 1
                        ? labels.COVERAGE_MAP_PAGE.CATEGORY_SINGULAR
                        : labels.COVERAGE_MAP_PAGE.CATEGORY_PLURAL}{" "}
                      · {item.products.length}{" "}
                      {item.products.length === 1
                        ? labels.COVERAGE_MAP_PAGE.PRODUCT_SINGULAR
                        : labels.COVERAGE_MAP_PAGE.PRODUCT_PLURAL}
                    </span>
                    <Link
                      href={`/vendor/configDocuments/coverage/${item.policy.id}`}
                      className="inline-flex items-center gap-1 text-theme-caption font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {labels.COVERAGE_MAP_PAGE.FULL_DETAIL}{" "}
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>

                {/* Categories + Products */}
                {item.categories.length > 0 || item.products.length > 0 ? (
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Categories */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Tag size={14} className="text-indigo-500" />
                        <span className="text-theme-caption font-semibold text-gray-600 uppercase tracking-wider">
                          {labels.COVERAGE_MAP_PAGE.CATEGORIES_HEADER} (
                          {item.categories.length})
                        </span>
                      </div>
                      {item.categories.length === 0 ? (
                        <p className="text-theme-caption text-gray-400 italic">
                          {labels.COVERAGE_MAP_PAGE.NO_CATEGORIES}
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {item.categories.map((cat) => (
                            <span
                              key={cat.assignment_id}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-theme-caption font-medium rounded-full border border-indigo-100"
                            >
                              <Tag size={10} />
                              {cat.name}
                              {cat.priority > 1 && (
                                <span className="ml-1 bg-indigo-200 text-indigo-800 px-1 rounded text-theme-tiny">
                                  p{cat.priority}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Products */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Box size={14} className="text-orange-500" />
                        <span className="text-theme-caption font-semibold text-gray-600 uppercase tracking-wider">
                          {labels.COVERAGE_MAP_PAGE.PRODUCT_OVERRIDES_HEADER} (
                          {item.products.length})
                        </span>
                      </div>
                      {item.products.length === 0 ? (
                        <p className="text-theme-caption text-gray-400 italic">
                          {labels.COVERAGE_MAP_PAGE.NO_OVERRIDES}
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {item.products.slice(0, 8).map((prod) => (
                            <span
                              key={prod.override_id}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 text-theme-caption font-medium rounded-full border border-orange-100"
                            >
                              <Box size={10} />
                              {prod.name}
                            </span>
                          ))}
                          {item.products.length > 8 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-theme-caption font-medium rounded-full">
                              +{item.products.length - 8}{" "}
                              {labels.COVERAGE_MAP_PAGE.MORE}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center gap-2 text-theme-caption text-amber-600 bg-amber-50">
                    <AlertCircle size={13} />
                    {labels.COVERAGE_MAP_PAGE.NOT_ASSIGNED_WARNING}
                    <Link
                      href={`/vendor/configDocuments/assign`}
                      className="underline font-medium hover:text-amber-800"
                    >
                      {labels.COVERAGE_MAP_PAGE.ASSIGN_NOW}
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
