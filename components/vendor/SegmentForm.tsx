"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { Plus, Trash2, Target, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AxiosAPI from "@/lib/axios";
import { authToken } from "@/utils/authToken";

// ── Reusable Styles ──
const fieldBase = "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-white";
const labelBase = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5";
const buttonBase = "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-100 px-5 py-2.5 transition-all";

const FIELD_OPTIONS = [
  { value: "total_orders", label: "Total Orders" },
  { value: "total_spent", label: "Total Spent (₹)" },
  { value: "average_order_value", label: "Average Order Value (₹)" },
  { value: "registered_days_ago", label: "Days Since Registration" },
  { value: "last_order_days_ago", label: "Days Since Last Order" },
];

const OPERATOR_OPTIONS = [
  { value: "gte", label: "≥ (at least)" },
  { value: "lte", label: "≤ (at most)" },
  { value: "eq", label: "= (exactly)" },
];

interface Criterion { field: string; operator: string; value: string; }
const fetchSegmentData = async (segmentId: string | undefined,token: string) => {
  if (!segmentId) return;
  try {
    const response = await AxiosAPI.get(`/v1/audiences/${segmentId}`, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  } catch (err) {
    toast.error("Failed to fetch segment data");
  }
};

export default function SegmentForm({segmentId}: {segmentId: string|null}) {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const vendorId = user && 'vendor_id' in user ? user.vendor_id : '';
  const router = useRouter();
  const token = authToken();
  console.log("segmentId",segmentId)
  const isEdit =  segmentId!==null;
  const [existingData, setExistingData] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [operator, setOperator] = useState<"AND" | "OR">("AND");
  const [criteria, setCriteria] = useState<Criterion[]>(
    existingData?.criteria?.map((c: any) => ({ ...c, value: String(c.value) })) ?? [
      { field: "total_orders", operator: "gte", value: "" },
    ]
  );
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isEdit ) {
      console.log("Fetching segment data for ID:", segmentId);
      console.log(isEdit)
      const loadData=async () => {
        const data = await fetchSegmentData(segmentId, token!).then((data) => {
        console.log("data existing",data)
        if (data) {
          setExistingData(data.data);
          setName(data.data.name);
          setDescription(data.data.description || "");
          setOperator(data.data.criteria_operator);
          setCriteria(data.data.criteria.map((c: any) => ({ ...c, value: String(c.value) })));
        }
      })};  
      loadData();
    };


  }, [segmentId, token]);  


  const addCriterion = () =>
    setCriteria((p) => [...p, { field: "total_orders", operator: "gte", value: "" }]);

  const removeCriterion = (i: number) =>
    setCriteria((p) => p.filter((_, idx) => idx !== i));

  const updateCriterion = (i: number, key: keyof Criterion, val: string) =>
    setCriteria((p) => p.map((c, idx) => idx === i ? { ...c, [key]: val } : c));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!criteria.length) { toast.error("Add at least one criterion"); return; }
    if (criteria.some((c) => !c.value)) { toast.error("All criteria need a value"); return; }

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
        await AxiosAPI.patch(`/v1/audiences/${existingData.id}`, payload, { headers: { Authorization: `Bearer ${token}` }});
        toast.success("Segment updated");
      } else {
        await AxiosAPI.post("/v1/audiences", payload, { headers: { Authorization: `Bearer ${token}` }});
        toast.success("Segment created");
      }
      router.push(`/vendor/marketing/audiences`);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to save segment");
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
          <h2 className="text-base font-bold text-gray-800">
            {isEdit ? 'Edit Customer Segment' : 'Create New Segment'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Define dynamic groups based on customer behavior.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelBase}>Segment Name *</label>
            <input 
              className={fieldBase}
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              placeholder="e.g. High-Value Buyers" 
            />
          </div>
          <div>
            <label className={labelBase}>Match Logic</label>
            <Select value={operator} onValueChange={(v) => setOperator(v as "AND" | "OR")}>
              <SelectTrigger className={fieldBase}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">ALL criteria must match (AND)</SelectItem>
                <SelectItem value="OR">ANY criterion must match (OR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className={labelBase}>Description</label>
          <textarea 
            className={`${fieldBase} min-h-[80px]`}
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Optional note about this segment" 
          />
        </div>

        {/* Criteria Section */}
        <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <label className={labelBase}>Criteria</label>
            <button 
              type="button" 
              onClick={addCriterion} 
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Plus size={13} /> Add Criteria
            </button>
          </div>

          <div className="space-y-3">
            {criteria.map((c, i) => (
              <div key={i} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-100">
                <Select value={c.field} onValueChange={(v) => updateCriterion(i, "field", v)}>
                  <SelectTrigger className={`${fieldBase} flex-1`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                <Select value={c.operator} onValueChange={(v) => updateCriterion(i, "operator", v)}>
                  <SelectTrigger className={`${fieldBase} w-32`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATOR_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
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
                  <button type="button" onClick={() => removeCriterion(i)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
            className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <Button type="submit" disabled={loading} className={buttonBase}>
            {loading ? "Saving…" : isEdit ? "Update Segment" : "Create Segment"}
          </Button>
        </div>
      </form>
    </div>
  );
}