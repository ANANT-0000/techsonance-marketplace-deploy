"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  MousePointerClick,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Tag,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import AxiosAPI from "@/lib/axios";
import { authToken } from "@/utils/authToken";
import { LoaderSpinner } from "@/components/common/LoaderSpinner";
import { Button } from "@/components/ui/button";
import { BANNER_DETAILS_PAGE_TEXT } from "@/constants/vendorText";

// --- Types based on your Unified Ecosystem ---
interface BannerDetails {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  placement: string;
  status: "ACTIVE" | "DRAFT" | "EXPIRED" | "SCHEDULED";
  start_date: string;
  end_date: string | null;
  target_segment_id: string | null;
  promotion_id: string | null;
  // Resolved relations (Ideally your backend sends these nested)
  segment_name?: string;
  promotion_name?: string;
}

interface BannerAnalytics {
  views: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-Through Rate (%)
  cvr: number; // Conversion Rate (%)
  revenue_generated: number;
}

export default function BannerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bannerId = params.bannerId as string;

  const [banner, setBanner] = useState<BannerDetails | null>(null);
  const [analytics, setAnalytics] = useState<BannerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const token = authToken();
  useEffect(() => {
    fetchBannerData();
  }, [bannerId]);

  const fetchBannerData = async () => {
    try {
      setLoading(true);
      // Replace with your actual backend endpoints for banner details and analytics
      const [bannerRes, analyticsRes] = await Promise.all([
        AxiosAPI.get(`/v1/banners/${bannerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        AxiosAPI.get(`/v1/banners/analytics/${bannerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setBanner(bannerRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <LoaderSpinner />
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center">
        <h2 className="text-theme-h5 font-bold text-gray-800 light:text-white">
          {BANNER_DETAILS_PAGE_TEXT.ERRORS.NOT_FOUND}
        </h2>
        <Button
          onClick={() => router.back()}
          className="mt-4"
          variant="outline"
        >
          {BANNER_DETAILS_PAGE_TEXT.ERRORS.GO_BACK}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full p-6   mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 light:hover:bg-gray-800 rounded-full transition-colors text-gray-600 light:text-gray-400"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-theme-h4 font-bold text-gray-900 light:text-white">
              {banner.title}
            </h1>
            <span
              className={`px-2.5 py-1 text-theme-caption font-semibold rounded-full border ${
                banner.status === "ACTIVE"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : banner.status === "SCHEDULED"
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              {banner.status}
            </span>
          </div>
          <p className="text-theme-body-sm text-gray-500 mt-1">
            {BANNER_DETAILS_PAGE_TEXT.HEADER.SUBTITLE}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Asset & Config */}
        <div className="lg:col-span-1 space-y-6">
          {/* Banner Preview Card */}
          <div className="bg-white light:bg-gray-800 rounded-xl shadow-sm border border-gray-100 light:border-gray-700 overflow-hidden">
            <div className="h-40 bg-gray-100 light:bg-gray-900 relative group flex items-center justify-center border-b border-gray-100 light:border-gray-700">
              {banner.image_url ? (
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  loading="eager"
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <ImageIcon size={40} className="text-gray-300" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-medium text-theme-body-sm">
                  {BANNER_DETAILS_PAGE_TEXT.CONFIG.PREVIEW_ASSET}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-gray-900 light:text-white truncate">
                {banner.title}
              </h3>
              {banner.subtitle && (
                <p className="text-theme-body-sm text-gray-500 mt-1 truncate">
                  {banner.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Configuration Card */}
          <div className="bg-white light:bg-gray-800 rounded-xl shadow-sm border border-gray-100 light:border-gray-700 p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 light:text-white border-b pb-3 light:border-gray-700">
              {BANNER_DETAILS_PAGE_TEXT.CONFIG.TITLE}
            </h3>

            <div className="space-y-3 text-theme-body-sm">
              <div className="flex items-start gap-3">
                <ImageIcon size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500 font-medium">
                    {BANNER_DETAILS_PAGE_TEXT.CONFIG.PLACEMENT}
                  </p>
                  <p className="text-gray-900 light:text-gray-200 capitalize">
                    {banner.placement.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500 font-medium">
                    {BANNER_DETAILS_PAGE_TEXT.CONFIG.ACTIVE_PERIOD}
                  </p>
                  <p className="text-gray-900 light:text-gray-200">
                    {new Date(banner.start_date).toLocaleDateString()} -{" "}
                    {banner.end_date
                      ? new Date(banner.end_date).toLocaleDateString()
                      : BANNER_DETAILS_PAGE_TEXT.CONFIG.ONGOING}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag size={16} className="text-indigo-400 mt-0.5" />
                <div>
                  <p className="text-gray-500 font-medium">
                    {BANNER_DETAILS_PAGE_TEXT.CONFIG.LINKED_PROMO}
                  </p>
                  {banner.promotion_id ? (
                    <button
                      onClick={() =>
                        router.push(
                          `/vendor/marketing/campaigns/campaignForm/${banner.promotion_id}`,
                        )
                      }
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      {banner.promotion_name ||
                        BANNER_DETAILS_PAGE_TEXT.CONFIG.VIEW_CAMPAIGN}
                    </button>
                  ) : (
                    <span className="text-gray-400 italic">
                      {BANNER_DETAILS_PAGE_TEXT.CONFIG.NO_PROMO}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users size={16} className="text-orange-400 mt-0.5" />
                <div>
                  <p className="text-gray-500 font-medium">
                    {BANNER_DETAILS_PAGE_TEXT.CONFIG.TARGET_AUDIENCE}
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded text-theme-caption font-semibold ${banner.target_segment_id ? "bg-orange-50 text-orange-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {banner.segment_name ||
                      (banner.target_segment_id
                        ? BANNER_DETAILS_PAGE_TEXT.CONFIG.CUSTOM_SEGMENT
                        : BANNER_DETAILS_PAGE_TEXT.CONFIG.GLOBAL_USERS)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Performance Engine */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-theme-h6 font-bold text-gray-900 light:text-white">
            {BANNER_DETAILS_PAGE_TEXT.ANALYTICS.TITLE}
          </h2>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white light:bg-gray-800 p-4 rounded-xl border border-gray-100 light:border-gray-700 shadow-sm flex flex-col items-center text-center">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mb-2">
                <Eye size={20} />
              </div>
              <p className="text-theme-caption text-gray-500 font-medium uppercase tracking-wider">
                {BANNER_DETAILS_PAGE_TEXT.ANALYTICS.IMPRESSIONS}
              </p>
              <p className="text-theme-h4 font-bold text-gray-900 light:text-white mt-1">
                {analytics?.views?.toLocaleString() || 0}
              </p>
            </div>

            <div className="bg-white light:bg-gray-800 p-4 rounded-xl border border-gray-100 light:border-gray-700 shadow-sm flex flex-col items-center text-center">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg mb-2">
                <MousePointerClick size={20} />
              </div>
              <p className="text-theme-caption text-gray-500 font-medium uppercase tracking-wider">
                {BANNER_DETAILS_PAGE_TEXT.ANALYTICS.CLICKS}
              </p>
              <p className="text-theme-h4 font-bold text-gray-900 light:text-white mt-1">
                {analytics?.clicks?.toLocaleString() || 0}
              </p>
            </div>

            <div className="bg-white light:bg-gray-800 p-4 rounded-xl border border-gray-100 light:border-gray-700 shadow-sm flex flex-col items-center text-center">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mb-2">
                <ShoppingCart size={20} />
              </div>
              <p className="text-theme-caption text-gray-500 font-medium uppercase tracking-wider">
                {BANNER_DETAILS_PAGE_TEXT.ANALYTICS.CONVERSIONS}
              </p>
              <p className="text-theme-h4 font-bold text-gray-900 light:text-white mt-1">
                {analytics?.conversions?.toLocaleString() || 0}
              </p>
            </div>

            <div className="bg-white light:bg-gray-800 p-4 rounded-xl border border-gray-100 light:border-gray-700 shadow-sm flex flex-col items-center text-center">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg mb-2">
                <TrendingUp size={20} />
              </div>
              <p className="text-theme-caption text-gray-500 font-medium uppercase tracking-wider">
                {BANNER_DETAILS_PAGE_TEXT.ANALYTICS.REVENUE}
              </p>
              <p className="text-theme-h4 font-bold text-green-600 mt-1">
                ₹{analytics?.revenue_generated?.toLocaleString() || 0}
              </p>
            </div>
          </div>
          {/* Conversion Funnel Analysis */}
          <div className="bg-white light:bg-gray-800 rounded-xl shadow-sm border border-gray-100 light:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 light:text-white mb-6">
              {BANNER_DETAILS_PAGE_TEXT.ANALYTICS.FUNNEL_TITLE}
            </h3>

            <div className="space-y-6">
              {/* CTR Bar */}
              <div>
                <div className="flex justify-between text-theme-body-sm mb-2">
                  <span className="font-medium text-gray-600 light:text-gray-300">
                    {BANNER_DETAILS_PAGE_TEXT.ANALYTICS.CTR_LABEL}
                  </span>
                  <span className="font-bold text-purple-600">
                    {analytics?.ctr?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 light:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-purple-500 h-2.5 rounded-full"
                    style={{ width: `${Math.min(analytics?.ctr || 0, 100)}%` }}
                  ></div>
                </div>
                <p className="text-theme-caption text-gray-500 mt-2">
                  {BANNER_DETAILS_PAGE_TEXT.ANALYTICS.CTR_DESC}
                </p>
              </div>

              {/* CVR Bar */}
              {banner.promotion_id && (
                <div>
                  <div className="flex justify-between text-theme-body-sm mb-2">
                    <span className="font-medium text-gray-600 light:text-gray-300">
                      {BANNER_DETAILS_PAGE_TEXT.ANALYTICS.CVR_LABEL}
                    </span>
                    <span className="font-bold text-emerald-600">
                      {analytics?.cvr?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 light:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(analytics?.cvr || 0, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-theme-caption text-gray-500 mt-2">
                    {BANNER_DETAILS_PAGE_TEXT.ANALYTICS.CVR_DESC}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Footers */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/vendor/marketing/banners/form/${bannerId}`)
              }
            >
              {BANNER_DETAILS_PAGE_TEXT.ACTIONS.EDIT_DESIGN}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
