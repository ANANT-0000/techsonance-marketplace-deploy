// app/vendor/[vendorId]/marketing/banners/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Image, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";
import AxiosAPI from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { LoaderSpinner } from "@/components/common/LoaderSpinner";
import { authToken } from "@/utils/authToken";
import { toast } from "react-hot-toast";

interface Banner {
  id: string;
  placement: string;
  image_url: string;
  headline: string | null;
  sub_headline: string | null;
  cta_label: string | null;
  cta_url: string | null;
  valid_from: string | null;
  valid_to: string | null;
  display_order: number;
  is_active: boolean;
  promotion: { id: string; name: string; status: string } | null;
}

export default function BannersPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const router = useRouter();
  const token = authToken();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await AxiosAPI.get("/v1/banners", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanners(res.data.data ?? []);
    } catch { toast.error("Failed to load banners"); }
    finally { setLoading(false); }
  };

  const toggleActive = async (id: string, current: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await AxiosAPI.patch(`/v1/banners/${id}`, { is_active: !current }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanners((p) => p.map((b) => b.id === id ? { ...b, is_active: !current } : b));
    } catch { toast.error("Failed to update banner"); }
  };

  const PLACEMENT_LABELS: Record<string, string> = {
    homepage_hero: "Homepage Hero",
    homepage_secondary: "Homepage Secondary",
    category_page: "Category Page",
    product_page: "Product Page",
    cart_sidebar: "Cart Sidebar",
    checkout: "Checkout",
  };

  return (
    <div className="p-6 w-full mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage storefront display banners across placement slots.</p>
        </div>
        <Button
          onClick={() => router.push(`/vendor/${vendorId}/marketing/banners/form`)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5"
        >
          <Plus size={18} /> Create Banner
        </Button>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><LoaderSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.isArray(banners) && banners.map((b) => {
            const isExpired = b.valid_to ? new Date(b.valid_to) < new Date() : false;
            return (
              <div
                key={b.id}
                onClick={() => router.push(`/vendor/${vendorId}/marketing/banners/${b.id}`)}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                {/* Image preview */}
                <div className="relative h-36 bg-gray-100 overflow-hidden">
                  <img src={b.image_url} alt={b.headline ?? "Banner"} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-black/60 text-white rounded-full">
                      {PLACEMENT_LABELS[b.placement] ?? b.placement}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-1">{b.headline ?? "Untitled banner"}</p>
                    <button
                      onClick={(e) => toggleActive(b.id, b.is_active, e)}
                      className={`flex-shrink-0 ml-2 ${b.is_active ? "text-emerald-500" : "text-gray-300"}`}
                    >
                      {b.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                  </div>

                  {b.sub_headline && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-1">{b.sub_headline}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {isExpired ? (
                        <span className="text-red-500 font-medium">Expired</span>
                      ) : b.valid_to ? (
                        `Until ${new Date(b.valid_to).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                      ) : (
                        "No expiry"
                      )}
                    </span>
                    {b.promotion && (
                      <span className="flex items-center gap-1 text-blue-500 font-medium">
                        <ExternalLink size={11} /> {b.promotion.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {banners.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <Image size={32} className="text-gray-300 mb-4" />
              <h3 className="font-bold text-gray-800 mb-1">No banners yet</h3>
              <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
                Create a banner and assign it to a storefront placement slot.
              </p>
              <Button
                onClick={() => router.push(`/vendor/${vendorId}/marketing/banners/new`)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5"
              >
                <Plus size={16} className="mr-2" /> Create Banner
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}