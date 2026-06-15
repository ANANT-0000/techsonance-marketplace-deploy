"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { Plus, Trash2, Target, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AxiosAPI from "@/lib/axios";
import { authToken } from "@/utils/authToken";
import { SEGMENT_FORM_TEXT } from "@/constants/vendorText";

import { SegmentCriteriaOperator } from "@/utils/Types";

// ── Reusable Styles ──
const fieldBase =
  "w-full px-3 py-2 text-theme-body-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-white";
const labelBase =
  "block text-theme-caption font-bold text-gray-400 uppercase tracking-wider mb-1.5";
const buttonBase =
  "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-100 px-5 py-2.5 transition-all";

const FIELD_OPTIONS = SEGMENT_FORM_TEXT.FIELD_OPTIONS;

const OPERATOR_OPTIONS = SEGMENT_FORM_TEXT.OPERATOR_OPTIONS;

interface Criterion {
  field: string;
  operator: string;
  value: string;
}
const fetchSegmentData = async (
  segmentId: string | undefined,
  token: string,
) => {
  if (!segmentId) return;
  try {
    const response = await AxiosAPI.get(`/v1/audiences/${segmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
      return response.data;
    } catch (err) {
      toast.error(SEGMENT_FORM_TEXT.TOASTS.ERR_FETCH);
    }
};

export default function SegmentForm({
  segmentId,
}: {
  segmentId: string | null;
}) {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const vendorId = user && "vendor_id" in user ? user.vendor_id : "";
  const router = useRouter();
  const token = authToken();
  const isEdit = segmentId !== null;
  const [existingData, setExistingData] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [operator, setOperator] = useState<SegmentCriteriaOperator>(
    SegmentCriteriaOperator.AND,
  );
  const [criteria, setCriteria] = useState<Criterion[]>(
    existingData?.criteria?.map((c: any) => ({
      ...c,
      value: String(c.value),
    })) ?? [{ field: "total_orders", operator: "gte", value: "" }],
  );
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isEdit) {
      const loadData = async () => {
        const data = await fetchSegmentData(segmentId, token!).then((data) => {
          if (data) {
            setExistingData(data.data);
            setName(data.data.name);
            setDescription(data.data.description || "");
            setOperator(data.data.criteria_operator);
            setCriteria(
              data.data.criteria.map((c: any) => ({
                ...c,
                value: String(c.value),
              })),
            );
          }
        });
      };
      loadData();
    }
  }, [segmentId, token]);

  const addCriterion = () =>
    setCriteria((p) => [
      ...p,
      { field: "total_orders", operator: "gte", value: "" },
    ]);

  const removeCriterion = (i: number) =>
    setCriteria((p) => p.filter((_, idx) => idx !== i));

  const updateCriterion = (i: number, key: keyof Criterion, val: string) =>
    setCriteria((p) =>
      p.map((c, idx) => (idx === i ? { ...c, [key]: val } : c)),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!criteria.length) {
      toast.error(SEGMENT_FORM_TEXT.TOASTS.ERR_NO_CRITERIA);
      return;
    }
    if (criteria.some((c) => !c.value)) {
      toast.error(SEGMENT_FORM_TEXT.TOASTS.ERR_VAL_REQ);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        description: description || null,
        criteria_operator: operator,
        criteria: criteria.map((c) => ({
          field: c.field,
          operator: c.operator,
          value: Number(c.value),
        })),
      };

      if (isEdit) {
        await AxiosAPI.patch(`/v1/audiences/${existingData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(SEGMENT_FORM_TEXT.TOASTS.UPDATED);
      } else {
        await AxiosAPI.post("/v1/audiences", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(SEGMENT_FORM_TEXT.TOASTS.CREATED);
      }
      router.push(`/vendor/marketing/audiences`);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? SEGMENT_FORM_TEXT.TOASTS.ERR_SAVE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
          <Target size={22} />
        </div>
        <div>
          <h2 className="text-theme-body font-bold text-gray-800">
            {isEdit ? SEGMENT_FORM_TEXT.HEADER.EDIT : SEGMENT_FORM_TEXT.HEADER.CREATE}
          </h2>
          <p className="text-theme-caption text-gray-500 mt-0.5">
            {SEGMENT_FORM_TEXT.HEADER.DESC}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelBase}>{SEGMENT_FORM_TEXT.FIELDS.NAME_LBL}</label>
            <input
              className={fieldBase}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={SEGMENT_FORM_TEXT.FIELDS.NAME_PH}
            />
          </div>
          <div>
            <label className={labelBase}>{SEGMENT_FORM_TEXT.FIELDS.MATCH_LOGIC_LBL}</label>
            <Select
              value={operator}
              onValueChange={(v) => setOperator(v as SegmentCriteriaOperator)}
            >
              <SelectTrigger className={fieldBase}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">
                  {SEGMENT_FORM_TEXT.FIELDS.MATCH_AND}
                </SelectItem>
                <SelectItem value="OR">
                  {SEGMENT_FORM_TEXT.FIELDS.MATCH_OR}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className={labelBase}>{SEGMENT_FORM_TEXT.FIELDS.DESC_LBL}</label>
          <textarea
            className={`${fieldBase} min-h-[80px]`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={SEGMENT_FORM_TEXT.FIELDS.DESC_PH}
          />
        </div>

        {/* Criteria Section */}
        <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <label className={labelBase}>{SEGMENT_FORM_TEXT.FIELDS.CRITERIA_LBL}</label>
            <button
              type="button"
              onClick={addCriterion}
              className="flex items-center gap-1.5 text-theme-caption font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Plus size={13} /> {SEGMENT_FORM_TEXT.FIELDS.ADD_CRITERIA}
            </button>
          </div>

          <div className="space-y-3">
            {criteria.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-100"
              >
                <Select
                  value={c.field}
                  onValueChange={(v) => updateCriterion(i, "field", v)}
                >
                  <SelectTrigger className={`${fieldBase} flex-1`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={c.operator}
                  onValueChange={(v) => updateCriterion(i, "operator", v)}
                >
                  <SelectTrigger className={`${fieldBase} w-32`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATOR_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <input
                  type="number"
                  className={`${fieldBase} w-28`}
                  value={c.value}
                  onChange={(e) => updateCriterion(i, "value", e.target.value)}
                  placeholder="0"
                  required
                />

                {criteria.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCriterion(i)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 text-theme-body-sm font-bold text-gray-600 hover:text-gray-800 transition-colors"
          >
            {SEGMENT_FORM_TEXT.FOOTER.CANCEL}
          </button>
          <Button type="submit" disabled={loading} className={buttonBase}>
            {loading ? SEGMENT_FORM_TEXT.FOOTER.SAVING : isEdit ? SEGMENT_FORM_TEXT.FOOTER.UPDATE : SEGMENT_FORM_TEXT.FOOTER.CREATE}
          </Button>
        </div>
      </form>
    </div>
  );
}
