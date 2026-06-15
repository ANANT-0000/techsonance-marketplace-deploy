"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, MousePointer, ShoppingCart, CheckCircle } from "lucide-react";
import AxiosAPI from "@/lib/axios";
import { LoaderSpinner } from "@/components/common/LoaderSpinner";
import { authToken } from "@/utils/authToken";
import { CAMPAIGN_ANALYTICS_TEXT } from "@/constants/vendorText";

interface Funnel {
  viewed: number;
  clicked: number;
  applied: number;
  redeemed: number;
  total_discount_granted: number;
}

interface AnalyticsData {
  funnel: Funnel;
  conversion_rates: {
    view_to_redeem_pct: string;
    apply_to_redeem_pct: string;
  };
}

const FUNNEL_STEPS = [
  { key: "viewed", label: CAMPAIGN_ANALYTICS_TEXT.FUNNEL.VIEWED, icon: <Eye size={18} />, color: "bg-blue-50 text-blue-600 border-blue-200" },
  { key: "clicked", label: CAMPAIGN_ANALYTICS_TEXT.FUNNEL.CLICKED, icon: <MousePointer size={18} />, color: "bg-purple-50 text-purple-600 border-purple-200" },
  { key: "applied", label: CAMPAIGN_ANALYTICS_TEXT.FUNNEL.APPLIED, icon: <ShoppingCart size={18} />, color: "bg-amber-50 text-amber-600 border-amber-200" },
  { key: "redeemed", label: CAMPAIGN_ANALYTICS_TEXT.FUNNEL.REDEEMED, icon: <CheckCircle size={18} />, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
] as const;

export default function CampaignAnalyticsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const router = useRouter();
  const token = authToken();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AxiosAPI.get(`/v1/promotions/${campaignId}/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [campaignId]);

  return (
    <div className="w-full p-6  mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-theme-body-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> {CAMPAIGN_ANALYTICS_TEXT.BACK_TO_CAMPAIGNS}
      </button>

      <h1 className="text-theme-h4 font-bold text-gray-800 mb-1">{CAMPAIGN_ANALYTICS_TEXT.HEADER.TITLE}</h1>
      <p className="text-theme-body-sm text-gray-500 mb-8">{CAMPAIGN_ANALYTICS_TEXT.HEADER.SUBTITLE}</p>

      {loading ? (
        <div className="flex justify-center py-20"><LoaderSpinner /></div>
      ) : !data ? (
        <p className="text-gray-500 text-center py-20">{CAMPAIGN_ANALYTICS_TEXT.EMPTY_STATE}</p>
      ) : (
        <div className="space-y-6">
          {/* Funnel cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FUNNEL_STEPS.map((step) => (
              <div key={step.key} className={`rounded-2xl border p-5 ${step.color}`}>
                <div className="flex items-center gap-2 mb-3">{step.icon}<span className="text-theme-caption font-bold uppercase tracking-wider">{step.label}</span></div>
                <p className="text-theme-h3 font-bold">{data.funnel[step.key].toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Conversion rates */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-theme-body font-semibold text-gray-800 mb-4">{CAMPAIGN_ANALYTICS_TEXT.CONVERSION.TITLE}</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-theme-caption text-gray-500 uppercase tracking-wider mb-1">{CAMPAIGN_ANALYTICS_TEXT.CONVERSION.VIEW_TO_REDEEM}</p>
                <p className="text-theme-h2 font-bold text-gray-900">{data.conversion_rates.view_to_redeem_pct}%</p>
              </div>
              <div>
                <p className="text-theme-caption text-gray-500 uppercase tracking-wider mb-1">{CAMPAIGN_ANALYTICS_TEXT.CONVERSION.APPLY_TO_REDEEM}</p>
                <p className="text-theme-h2 font-bold text-gray-900">{data.conversion_rates.apply_to_redeem_pct}%</p>
              </div>
            </div>
          </div>

          {/* Total discount granted */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <p className="text-theme-caption text-gray-500 uppercase tracking-wider mb-1">{CAMPAIGN_ANALYTICS_TEXT.DISCOUNT.LABEL}</p>
            <p className="text-theme-h2 font-bold text-gray-900">
              ₹{data.funnel.total_discount_granted.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}