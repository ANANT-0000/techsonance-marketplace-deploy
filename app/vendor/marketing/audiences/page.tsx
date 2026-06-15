// app/vendor/[vendorId]/marketing/audiences/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, RefreshCw, ChevronRight } from "lucide-react";
import AxiosAPI from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { LoaderSpinner } from "@/components/common/LoaderSpinner";
import { authToken } from "@/utils/authToken";
import { toast } from "react-hot-toast";
import { AUDIENCES_PAGE_TEXT } from "@/constants/vendorText";

interface Segment {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  last_recalculated_at: string | null;
  criteria_operator: "AND" | "OR";
  criteria: { field: string; operator: string; value: number }[];
  is_active: boolean;
}

export default function AudiencesPage() {
  const router = useRouter();
  const token = authToken();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState<string | null>(null);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const res = await AxiosAPI.get("/v1/audiences", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSegments(res.data.data ?? []);
    } catch {
      toast.error(AUDIENCES_PAGE_TEXT.TOASTS.LOAD_ERR);
    } finally {
      setLoading(false);
    }
  };

  const triggerRecalculate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecalculating(id);
    try {
      const res = await AxiosAPI.post(
        `/v1/audiences/${id}/recalculate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(AUDIENCES_PAGE_TEXT.TOASTS.RECALC_SUCCESS(res.data.matched));
      fetchSegments();
    } catch {
      toast.error(AUDIENCES_PAGE_TEXT.TOASTS.RECALC_FAIL);
    } finally {
      setRecalculating(null);
    }
  };

  const totalMembers = Array.isArray(segments)
    ? segments.reduce((s, seg) => s + (seg.member_count ?? 0), 0)
    : 0;

  return (
    <div className="p-6 w-full mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-theme-h4 font-bold text-gray-800">{AUDIENCES_PAGE_TEXT.HEADER.TITLE}</h1>
          <p className="text-theme-body-sm text-gray-500 mt-1">
            {AUDIENCES_PAGE_TEXT.HEADER.SUBTITLE}
          </p>
        </div>
        <Button
          onClick={() => router.push(`/vendor/marketing/audiences/form`)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5"
        >
          <Plus size={18} /> {AUDIENCES_PAGE_TEXT.HEADER.CREATE_BTN}
        </Button>
      </header>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-theme-caption font-bold text-gray-400 uppercase tracking-wider mb-2">
            {AUDIENCES_PAGE_TEXT.METRICS.SEGMENTS}
          </p>
          <p className="text-theme-h4 font-bold text-gray-800">
            {loading ? "—" : segments.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-theme-caption font-bold text-gray-400 uppercase tracking-wider mb-2">
            {AUDIENCES_PAGE_TEXT.METRICS.TOTAL_MEMBERS}
          </p>
          <p className="text-theme-h4 font-bold text-gray-800">
            {loading ? "—" : totalMembers.toLocaleString()}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoaderSpinner />
        </div>
      ) : (
        <div className="space-y-3">
          {Array.isArray(segments) &&
            segments.map((seg) => (
              <div
                key={seg.id}
                onClick={() =>
                  router.push(
                    `/vendor/marketing/audiences/form?segmentId=${seg.id}`,
                  )
                }
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 flex-shrink-0">
                    <Users size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {seg.name}
                    </p>
                    <p className="text-theme-body-sm text-gray-500 truncate">
                      {seg.description ??
                        AUDIENCES_PAGE_TEXT.CARD.CRITERIA_DESC(seg.criteria.length, seg.criteria_operator)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-theme-h6 font-bold text-gray-800">
                      {(seg.member_count ?? 0).toLocaleString()}
                    </p>
                    <p className="text-theme-caption text-gray-400">{AUDIENCES_PAGE_TEXT.CARD.MEMBERS}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-theme-caption text-gray-400">{AUDIENCES_PAGE_TEXT.CARD.LAST_SYNCED}</p>
                    <p className="text-theme-caption font-medium text-gray-600">
                      {seg.last_recalculated_at
                        ? new Date(seg.last_recalculated_at).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short" },
                          )
                        : AUDIENCES_PAGE_TEXT.CARD.NEVER_SYNCED}
                    </p>
                  </div>
                  <button
                    onClick={(e) => triggerRecalculate(seg.id, e)}
                    disabled={recalculating === seg.id}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={AUDIENCES_PAGE_TEXT.CARD.RECALCULATE}
                  >
                    <RefreshCw
                      size={16}
                      className={recalculating === seg.id ? "animate-spin" : ""}
                    />
                  </button>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            ))}

          {segments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <Users size={32} className="text-gray-300 mb-4" />
              <h3 className="font-bold text-gray-800 mb-1">{AUDIENCES_PAGE_TEXT.EMPTY.TITLE}</h3>
              <p className="text-theme-body-sm text-gray-500 mb-6 text-center max-w-xs">
                {AUDIENCES_PAGE_TEXT.EMPTY.DESC}
              </p>
              <Button
                onClick={() => router.push(`/vendor/marketing/audiences/form`)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5"
              >
                <Plus size={16} className="mr-2" /> {AUDIENCES_PAGE_TEXT.EMPTY.CREATE_FIRST_BTN}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
