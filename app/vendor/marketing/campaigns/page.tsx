"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Tag,
  Calendar,
  Activity,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoaderSpinner } from "@/components/common/LoaderSpinner";
import AxiosAPI from "@/lib/axios";
import { authToken } from "@/utils/authToken";
import { CAMPAIGNS_PAGE_TEXT } from "@/constants/vendorText";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "DRAFT" | "EXPIRED" | "INACTIVE" | "PENDING_REVIEW";
  promotion_type: string;
  discount_config: Record<string, unknown>;
  valid_from: string;
  valid_to: string | null;
  max_uses_total: number | null;
  total_used: number;
  is_auto_applied: boolean;
  is_exclusive: boolean;
}

function formatDiscount(campaign: Campaign): string {
  const cfg = campaign.discount_config;
  switch (campaign.promotion_type) {
    case "percentage_off":
      return `${cfg.value}% OFF${cfg.cap ? ` (up to ₹${cfg.cap})` : ""}`;
    case "fixed_amount":
      return `₹${cfg.value} OFF`;
    case "free_shipping":
      return "Free Shipping";
    case "buy_x_get_y":
      return `Buy ${cfg.buy_qty} Get ${cfg.get_qty}`;
    case "tiered_discount":
      return "Tiered Discount";
    case "bundle_deal":
      return `Bundle ₹${cfg.bundle_price}`;
    default:
      return "Custom";
  }
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
  EXPIRED: "bg-gray-50 text-gray-500 border-gray-200",
  INACTIVE: "bg-red-50 text-red-600 border-red-200",
  PENDING_REVIEW: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function CampaignsPage() {
  const router = useRouter();
  const token = authToken();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    if (!token) {
      router.push(VEDNOR_LOGIN_PATH);
      return;
    }
    fetchCampaigns();
  }, [token]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await AxiosAPI.get("/v1/promotions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampaigns(res.data.data ?? []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    campaigns && campaigns.length > 0
      ? campaigns.filter((c) => {
          const matchSearch = c.name
            .toLowerCase()
            .includes(search.toLowerCase());
          const matchStatus =
            statusFilter === "ALL" || c.status === statusFilter;
          return matchSearch && matchStatus;
        })
      : [];
  // Summary stats
  const active =
    campaigns && campaigns.length > 0
      ? campaigns.filter((c) => c.status === "ACTIVE").length
      : 0;
  const draft =
    campaigns && campaigns.length > 0
      ? campaigns.filter((c) => c.status === "DRAFT").length
      : 0;
  const totalRedemptions =
    campaigns && campaigns.length > 0
      ? campaigns.reduce((s, c) => s + c.total_used, 0)
      : 0;

  return (
    <div className="p-6 w-full mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-theme-h4 font-bold text-gray-800">
            {CAMPAIGNS_PAGE_TEXT.HEADER.TITLE}
          </h1>
          <p className="text-theme-body-sm text-gray-500 mt-1">
            {CAMPAIGNS_PAGE_TEXT.HEADER.SUBTITLE}
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(`/vendor/marketing/campaigns/campaignForm`)
          }
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5"
        >
          <Plus size={18} /> {CAMPAIGNS_PAGE_TEXT.HEADER.CREATE_BTN}
        </Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: CAMPAIGNS_PAGE_TEXT.METRICS.ACTIVE,
            value: active,
            icon: <Zap size={18} />,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            label: CAMPAIGNS_PAGE_TEXT.METRICS.DRAFTS,
            value: draft,
            icon: <Tag size={18} />,
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: CAMPAIGNS_PAGE_TEXT.METRICS.TOTAL_REDEMPTIONS,
            value: totalRedemptions,
            icon: <TrendingUp size={18} />,
            color: "bg-blue-50 text-blue-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-theme-caption font-bold text-gray-400 uppercase tracking-wider">
                {s.label}
              </span>
              <span className={`p-2 rounded-lg ${s.color}`}>{s.icon}</span>
            </div>
            <h3 className="text-theme-h4 font-bold text-gray-800">
              {loading ? "—" : s.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            className="w-full pl-10 pr-4 py-2 text-theme-body-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder={CAMPAIGNS_PAGE_TEXT.FILTERS.SEARCH_PLACEHOLDER}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="text-theme-body-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {[
            "ALL",
            "ACTIVE",
            "DRAFT",
            "PENDING_REVIEW",
            "EXPIRED",
            "INACTIVE",
          ].map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? CAMPAIGNS_PAGE_TEXT.FILTERS.ALL_STATUSES : s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoaderSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered &&
            filtered.map((c) => {
              const usagePct = c.max_uses_total
                ? Math.min((c.total_used / c.max_uses_total) * 100, 100)
                : null;
              return (
                <div
                  key={c.id}
                  className="group bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col"
                  onClick={() =>
                    router.push(
                      `/vendor/marketing/campaigns/campaignForm/${c.id}`,
                    )
                  }
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                      <Tag size={18} />
                    </div>
                    <div className="flex items-center gap-2">
                      {c.is_auto_applied && (
                        <span className="px-2 py-0.5 text-theme-tiny font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                          {CAMPAIGNS_PAGE_TEXT.CARD.AUTO}
                        </span>
                      )}
                      {c.is_exclusive && (
                        <span className="px-2 py-0.5 text-theme-tiny font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                          {CAMPAIGNS_PAGE_TEXT.CARD.EXCLUSIVE}
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-1 text-theme-xxs font-bold rounded-full border ${STATUS_STYLES[c.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-theme-body font-semibold text-gray-900 mb-1">
                    {c.name}
                  </h3>
                  <p className="text-theme-body-sm text-gray-500 mb-3 line-clamp-2 flex-grow">
                    {c.description ?? (
                      <span className="italic">
                        {CAMPAIGNS_PAGE_TEXT.CARD.NO_DESCRIPTION}
                      </span>
                    )}
                  </p>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-theme-caption font-bold rounded-lg border border-blue-100 mb-4 w-fit">
                    {formatDiscount(c)}
                  </span>

                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <div className="flex items-center justify-between text-theme-caption text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {CAMPAIGNS_PAGE_TEXT.CARD.VALID_UNTIL}
                      </span>
                      <span className="font-medium text-gray-700">
                        {c.valid_to
                          ? new Date(c.valid_to).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : CAMPAIGNS_PAGE_TEXT.CARD.NO_END_DATE}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-theme-caption text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Activity size={13} />
                        {CAMPAIGNS_PAGE_TEXT.CARD.REDEMPTIONS}
                      </span>
                      <span className="font-medium text-gray-700">
                        {c.total_used}
                        {c.max_uses_total ? ` / ${c.max_uses_total}` : ""}
                      </span>
                    </div>
                    {usagePct !== null && (
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${usagePct >= 90 ? "bg-red-400" : usagePct >= 60 ? "bg-amber-400" : "bg-indigo-500"}`}
                          style={{ width: `${usagePct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Quick analytics link — stops propagation so card click still goes to edit */}
                  <button
                    className="mt-3 text-theme-caption text-blue-600 hover:underline text-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/vendor/marketing/campaigns/${c.id}/analytics`,
                      );
                    }}
                  >
                    {CAMPAIGNS_PAGE_TEXT.CARD.VIEW_ANALYTICS}
                  </button>
                </div>
              );
            })}

          {filtered && filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <Tag size={32} className="text-gray-300 mb-4" />
              <h3 className="font-bold text-gray-800 mb-1">
                {CAMPAIGNS_PAGE_TEXT.EMPTY.TITLE}
              </h3>
              <p className="text-theme-body-sm text-gray-500 mb-6">
                {search
                  ? CAMPAIGNS_PAGE_TEXT.EMPTY.SEARCH_DESC
                  : CAMPAIGNS_PAGE_TEXT.EMPTY.DEFAULT_DESC}
              </p>
              {!search && (
                <Button
                  onClick={() =>
                    router.push(`/vendor/marketing/campaigns/campaignForm`)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5"
                >
                  <Plus size={16} className="mr-2" />{" "}
                  {CAMPAIGNS_PAGE_TEXT.HEADER.CREATE_BTN}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
