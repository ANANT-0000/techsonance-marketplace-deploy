// app/vendor/[vendorId]/marketing/audiences/[segmentId]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, RefreshCw } from "lucide-react";
import AxiosAPI from "@/lib/axios";
import { LoaderSpinner } from "@/components/common/LoaderSpinner";
import { Button } from "@/components/ui/button";
import { authToken } from "@/utils/authToken";
import { toast } from "react-hot-toast";
import { AUDIENCE_DETAILS_TEXT } from "@/constants/vendorText";

export default function SegmentDetailPage() {
  const { segmentId } = useParams<{ segmentId: string }>();
  const router = useRouter();
  const token = authToken();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { fetchSegment(); }, [segmentId]);

  const fetchSegment = async () => {
    try {
      setLoading(true);
      const res = await AxiosAPI.get(`/v1/audiences/${segmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.data);
    } catch { toast.error(AUDIENCE_DETAILS_TEXT.TOASTS.LOAD_ERR); }
    finally { setLoading(false); }
  };

  const handleRecalculate = async () => {
    setSyncing(true);
    try {
      const res = await AxiosAPI.post(`/v1/audiences/${segmentId}/recalculate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(AUDIENCE_DETAILS_TEXT.TOASTS.RECALC_SUCCESS(res.data.matched));
      fetchSegment();
    } catch { toast.error(AUDIENCE_DETAILS_TEXT.TOASTS.RECALC_FAIL); }
    finally { setSyncing(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><LoaderSpinner /></div>;
  if (!data) return <p className="p-6 text-gray-500">{AUDIENCE_DETAILS_TEXT.ERRORS.NOT_FOUND}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-theme-body-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft size={16} /> {AUDIENCE_DETAILS_TEXT.HEADER.BACK}
      </button>

      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-theme-h4 font-bold text-gray-800">{data.name}</h1>
          <p className="text-theme-body-sm text-gray-500 mt-1">{data.description ?? AUDIENCE_DETAILS_TEXT.HEADER.NO_DESC}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/vendor/marketing/audiences/new?edit=${segmentId}`)}
          >
            {AUDIENCE_DETAILS_TEXT.HEADER.EDIT}
          </Button>
          <Button onClick={handleRecalculate} disabled={syncing} className="flex items-center gap-2">
            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
            {syncing ? AUDIENCE_DETAILS_TEXT.HEADER.SYNCING : AUDIENCE_DETAILS_TEXT.HEADER.RECALCULATE}
          </Button>
        </div>
      </div>

      {/* Criteria */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
        <h2 className="text-theme-body-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
          {AUDIENCE_DETAILS_TEXT.CRITERIA.TITLE(data.criteria_operator)}
        </h2>
        <div className="space-y-2">
          {(data.criteria as any[]).map((c: any, i: number) => (
            <div key={i} className="flex items-center gap-3 text-theme-body-sm">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono text-theme-caption">{c.field}</span>
              <span className="text-gray-400">{c.operator}</span>
              <span className="font-semibold text-gray-800">{c.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Members preview */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-theme-body-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
            <Users size={16} /> {AUDIENCE_DETAILS_TEXT.MEMBERS.TITLE}
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-theme-caption font-bold">
              {data.member_count ?? 0}
            </span>
          </h2>
          <p className="text-theme-caption text-gray-400">
            {AUDIENCE_DETAILS_TEXT.MEMBERS.LAST_SYNCED}
            {data.last_recalculated_at
              ? new Date(data.last_recalculated_at).toLocaleString("en-IN")
              : AUDIENCE_DETAILS_TEXT.MEMBERS.NEVER_SYNCED}
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {(data.members as any[]).length === 0 ? (
            <p className="text-theme-body-sm text-gray-400 text-center py-10">{AUDIENCE_DETAILS_TEXT.MEMBERS.NO_MEMBERS}</p>
          ) : (
            (data.members as any[]).map((m: any) => (
              <div key={m.user_id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-theme-body-sm font-medium text-gray-800">
                    {[m.first_name, m.last_name].filter(Boolean).join(" ") || "—"}
                  </p>
                  <p className="text-theme-caption text-gray-500">{m.email}</p>
                </div>
                <p className="text-theme-caption text-gray-400">
                  {AUDIENCE_DETAILS_TEXT.MEMBERS.JOINED} {new Date(m.joined_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}