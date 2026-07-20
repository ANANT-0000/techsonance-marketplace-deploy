"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/common/Pagination";
import { authToken } from "@/utils/authToken";
import {
  MetricsSkeleton,
  TableRowSkeleton,
} from "@/components/common/skeletons";
import AxiosAPI from "@/lib/axios";
import { CouponModel } from "@/components/vendor/CouponModel";
import {
  Plus,
  Target,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Download,
  Loader2,
  Tag,
  Calendar,
  Clock,
  Zap,
  Users,
} from "lucide-react";
import { CouponCardList } from "@/components/vendor/CouponCardList";
import { Coupon } from "@/utils/Types";
import { RootState } from "@/lib/store";
import { useAppSelector } from "@/hooks/reduxHooks";
import { MARKETING_TEXT } from "@/constants/vendorText";
import { VEDNOR_LOGIN_PATH, VEDNOR_REGISTER_PATH } from "@/constants";

// --- Interfaces ---
interface OverallMetrics {
  totalCarts: number;
  totalOrders: number;
  conversionRate: number;
  abandonmentRate: number;
}

interface ProductConversion {
  variantId: string;
  variantName: string;
  sku: string;
  cartAdditions: number;
  orderCompletions: number;
  conversionRate: number;
}

// --- API Functions ---
export const fetchConversionMetrics = async (token: string) => {
  return await AxiosAPI.get(`/v1/orders/analytics/conversion`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const exportAnalyticsCsv = async (token: string) => {
  return await AxiosAPI.get(`/v1/orders/analytics/export`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/csv",
    },
    responseType: "blob",
  });
};

export const fetchCoupons = async (token: string) => {
  return await AxiosAPI.get(`/v1/coupon`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default function MarketingPage() {
  const router = useRouter();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const userId =
    user && "user_id" in user
      ? user.user_id
      : user && "id" in user
        ? user.id
        : "";

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponId, setCouponId] = useState<string | null>(null);

  // Analytics & Data State
  const [overallMetrics, setOverallMetrics] = useState<OverallMetrics | null>(
    null,
  );
  const [productConversions, setProductConversions] = useState<
    ProductConversion[]
  >([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const token = authToken();

  // Data Loaders
  const loadMetrics = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetchConversionMetrics(token as string);
      setOverallMetrics(res.data.data.overall);
      setProductConversions(res.data.data.productConversions);
    } catch (error) {
    } finally {
      setIsLoadingMetrics(false);
    }
  }, [token]);

  const loadCoupons = async () => {
    if (!token) return;
    try {
      const res = await fetchCoupons(token as string);
      setCoupons(res.data.data || []);
    } catch (error) {
    } finally {
      setIsLoadingCoupons(false);
    }
  };
  useEffect(() => {
    if (!token) {
      router.push(VEDNOR_LOGIN_PATH);
      return;
    }
    loadMetrics();
  }, [token, router, loadMetrics]);

  useEffect(() => {
    if (!token) {
      router.push(VEDNOR_LOGIN_PATH);
      return;
    }
    loadCoupons();
  }, [token, isModalOpen]);

  // Pagination for Reviews
  const [count, setCount] = useState(1);
  const pageSize = 5;
  // const totalPages = Math.ceil(REVIEW_DATA.length / pageSize);
  const startIndex = (count - 1) * pageSize;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await exportAnalyticsCsv(token as string);
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const dateStr = new Date().getTime().toString();
      link.setAttribute("download", `store_analytics_${dateStr}.csv`);

      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(MARKETING_TEXT.ALERTS.EXPORT_FAILED);
    } finally {
      setIsExporting(false);
    }
  };

  const openNewPromoModal = () => {
    setCouponId(null);
    setIsModalOpen(true);
  };

  const openEditPromoModal = (id: string) => {
    setCouponId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full relative min-h-screen ">
      {/* Main Content Dashboard */}
      <section className="mx-auto px-4 pb-10">
        <header className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-theme-h4 font-bold text-gray-800">
              {MARKETING_TEXT.HEADER.TITLE}
            </h1>
            <p className="text-theme-body-sm text-gray-500 mt-1">
              {MARKETING_TEXT.HEADER.SUBTITLE}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {isExporting
                ? MARKETING_TEXT.HEADER.EXPORTING
                : MARKETING_TEXT.HEADER.EXPORT_CSV}
            </button>

            <button
              className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-100 transition-all flex items-center gap-2"
              onClick={openNewPromoModal}
            >
              <Plus size={18} /> {MARKETING_TEXT.HEADER.ADD_NEW_PROMO}
            </button>
          </div>
        </header>

        {/* Overviews Cards */}
        {isLoadingMetrics ? (
          <MetricsSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-theme-caption font-bold text-gray-400 uppercase tracking-wider">
                  {MARKETING_TEXT.METRICS.STORE_CONVERSION}
                </span>
                <span className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                  <Target size={18} />
                </span>
              </div>
              <h3 className="text-theme-h4 font-bold text-gray-800">
                {`${overallMetrics?.conversionRate || 0}%`}
              </h3>
              <p className="text-theme-caption text-gray-500 mt-1 font-medium">
                {MARKETING_TEXT.METRICS.CONVERSION_SUB}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-theme-caption font-bold text-gray-400 uppercase tracking-wider">
                  {MARKETING_TEXT.METRICS.ABANDONMENT_RATE}
                </span>
                <span className="bg-red-50 text-red-600 p-2 rounded-lg">
                  <AlertTriangle size={18} />
                </span>
              </div>
              <h3 className="text-theme-h4 font-bold text-gray-800">
                {`${overallMetrics?.abandonmentRate || 0}%`}
              </h3>
              <p className="text-theme-caption text-red-500 mt-1 font-medium">
                {MARKETING_TEXT.METRICS.ABANDONMENT_SUB}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-theme-caption font-bold text-gray-400 uppercase tracking-wider">
                  {MARKETING_TEXT.METRICS.ACTIVE_CARTS}
                </span>
                <span className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                  <ShoppingCart size={18} />
                </span>
              </div>
              <h3 className="text-theme-h4 font-bold text-gray-800">
                {overallMetrics?.totalCarts || 0}
              </h3>
              <p className="text-theme-caption text-gray-500 mt-1 font-medium">
                {MARKETING_TEXT.METRICS.CARTS_SUB}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-theme-caption font-bold text-gray-400 uppercase tracking-wider">
                  {MARKETING_TEXT.METRICS.COMPLETED_ORDERS}
                </span>
                <span className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                  <TrendingUp size={18} />
                </span>
              </div>
              <h3 className="text-theme-h4 font-bold text-gray-800">
                {overallMetrics?.totalOrders || 0}
              </h3>
              <p className="text-theme-caption text-gray-500 mt-1 font-medium">
                {MARKETING_TEXT.METRICS.ORDERS_SUB}
              </p>
            </div>
          </div>
        )}

        {/* --- HORIZONTAL COUPON LISTING --- */}
        <CouponCardList
          coupons={coupons}
          isLoading={isLoadingCoupons}
          onEdit={openEditPromoModal}
        />

        {/* Funnel Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-theme-h6 text-gray-800">
              {MARKETING_TEXT.FUNNEL.TITLE}
            </h2>
            <p className="text-theme-caption text-gray-500 mt-1">
              {MARKETING_TEXT.FUNNEL.SUBTITLE}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-theme-caption font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4">
                    {MARKETING_TEXT.FUNNEL.HEADERS.PRODUCT_VARIANT}
                  </th>
                  <th className="p-4">{MARKETING_TEXT.FUNNEL.HEADERS.SKU}</th>
                  <th className="p-4 text-center">
                    {MARKETING_TEXT.FUNNEL.HEADERS.CART_ADDITIONS}
                  </th>
                  <th className="p-4 text-center">
                    {MARKETING_TEXT.FUNNEL.HEADERS.PURCHASED}
                  </th>
                  <th className="p-4">
                    {MARKETING_TEXT.FUNNEL.HEADERS.CONVERSION_RATE}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoadingMetrics ? (
                  <TableRowSkeleton columns={5} rows={4} />
                ) : productConversions?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-gray-400 text-theme-body-sm"
                    >
                      {MARKETING_TEXT.FUNNEL.NO_DATA}
                    </td>
                  </tr>
                ) : (
                  productConversions?.map((product) => (
                    <tr
                      key={product.variantId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 font-semibold text-theme-body-sm text-gray-800">
                        {product.variantName}
                      </td>
                      <td className="p-4 text-theme-body-sm text-gray-500 font-mono">
                        {product.sku}
                      </td>
                      <td className="p-4 text-center font-medium text-gray-600">
                        {product.cartAdditions}
                      </td>
                      <td className="p-4 text-center font-medium text-gray-600">
                        {product.orderCompletions}
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-3">
                          <span
                            className={`text-theme-body-sm font-bold ${
                              product.conversionRate >= 50
                                ? "text-emerald-600"
                                : product.conversionRate >= 20
                                  ? "text-amber-500"
                                  : "text-red-500"
                            }`}
                          >
                            {product.conversionRate}%
                          </span>
                          <span className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                product.conversionRate >= 50
                                  ? "bg-emerald-500"
                                  : product.conversionRate >= 20
                                    ? "bg-amber-400"
                                    : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.min(product.conversionRate, 100)}%`,
                              }}
                            />
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reviews Section */}
        {/* <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                         <h2 className="font-bold text-theme-h6 text-gray-800">Customer Reviews</h2>
                     </div>
                     <div className="p-8 text-center text-gray-400 text-theme-body-sm">
                          Review mapping logic here...
                     </div>
                     <span className="flex justify-end p-4 border-t border-gray-100">
                       <Pagination setCount={setCount} count={count} totalPages={totalPages} style="relative" /> 
                     </span>
                 </div> */}
      </section>

      {/* Promo Code Creation Modal */}
      {(isModalOpen || couponId) && (
        <CouponModel
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          id={couponId}
          userId={userId}
          setCoupons={setCoupons}
          onSuccess={loadCoupons}
        />
      )}
    </div>
  );
}
