// components/vendor/CampaignForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Input } from "./Input";
import { Textarea } from "./TextArea";
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
import { PromotionType, PromotionStatus } from "@/utils/Types";
import { Calendar, Megaphone, Tag } from "lucide-react";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { PromotionConfigurator } from "./PromotionConfigurator";
import { CAMPAIGN_FORM_TEXT } from "@/constants/vendorText";

// ─────────────────────────────────────────────
// Styles (keep in sync with PromotionConfigurator)
// ─────────────────────────────────────────────
const fieldBase =
  "w-full px-3 py-2 text-theme-body-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-white";
const labelBase =
  "block text-theme-caption font-bold text-gray-400 uppercase tracking-wider mb-1.5";
const sectionContainer =
  "border border-gray-100 rounded-2xl p-5 bg-gray-50/50";

// ─────────────────────────────────────────────
// DiscountFields — single flat record, all keys
// used by PromotionConfigurator live here.
// ─────────────────────────────────────────────
export interface DiscountFields {
  // PERCENTAGE
  pct_value: string;
  pct_cap: string;
  // FIXED_AMOUNT
  fixed_amount: string;
  // BUY_X_GET_Y
  bxgy_buy_qty: string;
  bxgy_get_qty: string;
  bxgy_variant_id: string;
  bxgy_discount_pct: string;
  bxgy_max_redemptions: string;
  // BOGO
  bogo_buy_qty: string;
  bogo_free_qty: string;
  bogo_variant_id: string;
  bogo_discount_pct: string;
  bogo_same_product: boolean;
  // FREE_SHIPPING
  shipping_max_amount: string;
  shipping_carriers: string;
  // TIERED_DISCOUNT
  tiers_json: string; // stored as JSON string or Tier[] array
  tier_type: string;
  tier_stackable: boolean;
  // BUNDLE_DEAL
  bundle_variant_ids: string; // comma-joined IDs
  bundle_price: string;
  bundle_discount_type: string;
  bundle_discount_pct: string;
  bundle_require_all: boolean;
  // Shared — used by multiple types inside PromotionConfigurator
  min_cart_value: string;
  max_cart_value: string;
  max_uses: string;
  max_uses_per_customer: string;
}

// ─────────────────────────────────────────────
// Build the discount_config payload from fields
// ─────────────────────────────────────────────
function buildDiscountConfig(
  type: string,
  f: DiscountFields
): Record<string, unknown> {
  // Shared eligibility helpers (included where relevant)
  const minCart = f.min_cart_value ? Number(f.min_cart_value) : undefined;
  const maxCart = f.max_cart_value ? Number(f.max_cart_value) : undefined;
  const maxUses = f.max_uses ? Number(f.max_uses) : undefined;
  const maxUsesPerCustomer = f.max_uses_per_customer
    ? Number(f.max_uses_per_customer)
    : undefined;

  const cartEligibility = {
    ...(minCart !== undefined ? { min_cart_value: minCart } : {}),
    ...(maxCart !== undefined ? { max_cart_value: maxCart } : {}),
  };
  const usageLimits = {
    ...(maxUses !== undefined ? { max_uses: maxUses } : {}),
    ...(maxUsesPerCustomer !== undefined
      ? { max_uses_per_customer: maxUsesPerCustomer }
      : {}),
  };

  switch (type) {
    case PromotionType.PERCENTAGE:
      return {
        value: Number(f.pct_value),
        ...(f.pct_cap ? { cap: Number(f.pct_cap) } : {}),
        ...cartEligibility,
        ...usageLimits,
      };

    case PromotionType.FIXED_AMOUNT:
      return {
        value: Number(f.fixed_amount),
        ...cartEligibility,
        ...usageLimits,
      };

    case PromotionType.BUY_X_GET_Y:
      return {
        buy_qty: Number(f.bxgy_buy_qty),
        get_qty: Number(f.bxgy_get_qty),
        get_product_variant_id: f.bxgy_variant_id,
        get_discount_percent: f.bxgy_discount_pct
          ? Number(f.bxgy_discount_pct)
          : 100,
        ...(f.bxgy_max_redemptions
          ? { max_redemptions_per_order: Number(f.bxgy_max_redemptions) }
          : {}),
        ...cartEligibility,
        ...usageLimits,
      };

    case PromotionType.BOGO:
      return {
        buy_qty: Number(f.bogo_buy_qty),
        free_qty: f.bogo_free_qty ? Number(f.bogo_free_qty) : 1,
        free_product_variant_id: f.bogo_variant_id,
        free_item_discount_percent: f.bogo_discount_pct
          ? Number(f.bogo_discount_pct)
          : 100,
        same_product_only: f.bogo_same_product ?? false,
        ...usageLimits,
      };

    case PromotionType.FREE_SHIPPING:
      return {
        max_shipping_waived: f.shipping_max_amount
          ? Number(f.shipping_max_amount)
          : undefined,
        ...(f.shipping_carriers
          ? {
              carriers: f.shipping_carriers
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }
          : {}),
        ...(minCart !== undefined ? { min_cart_value: minCart } : {}),
        ...(maxUsesPerCustomer !== undefined
          ? { max_uses_per_customer: maxUsesPerCustomer }
          : {}),
      };

    case PromotionType.TIERED_DISCOUNT: {
      let tiers: unknown[] = [];
      if (Array.isArray(f.tiers_json)) {
        tiers = f.tiers_json;
      } else if (f.tiers_json) {
        try {
          tiers = JSON.parse(f.tiers_json);
        } catch {
          tiers = [];
        }
      }
      return {
        tiers,
        tier_type: f.tier_type ?? "percentage",
        stackable: f.tier_stackable ?? false,
        ...usageLimits,
      };
    }

    case PromotionType.BUNDLE_DEAL: {
      const variantIds = Array.isArray(f.bundle_variant_ids)
        ? f.bundle_variant_ids
        : f.bundle_variant_ids
        ? f.bundle_variant_ids
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      return {
        product_variant_ids: variantIds,
        bundle_price: Number(f.bundle_price),
        discount_type: f.bundle_discount_type ?? "fixed_price",
        ...(f.bundle_discount_type === "percentage_off" && f.bundle_discount_pct
          ? { discount_percent: Number(f.bundle_discount_pct) }
          : {}),
        require_all: f.bundle_require_all !== false,
        ...usageLimits,
      };
    }

    default:
      return {};
  }
}

// ─────────────────────────────────────────────
// Initialise discountFields from existingData
// ─────────────────────────────────────────────
function initDiscountFields(
  existing?: ExistingPromotion
): DiscountFields {
  const dc = existing?.discount_config ?? {};
  const type = existing?.promotion_type ?? "";

  // Shared
  const minCart = String((dc.min_cart_value as number) ?? "");
  const maxCart = String((dc.max_cart_value as number) ?? "");
  const maxUses = String((dc.max_uses as number) ?? "");
  const maxUsesPerCustomer = String((dc.max_uses_per_customer as number) ?? "");

  return {
    // PERCENTAGE
    pct_value:
      type === PromotionType.PERCENTAGE
        ? String((dc.value as number) ?? "")
        : "",
    pct_cap:
      type === PromotionType.PERCENTAGE
        ? String((dc.cap as number) ?? "")
        : "",

    // FIXED_AMOUNT
    fixed_amount:
      type === PromotionType.FIXED_AMOUNT
        ? String((dc.value as number) ?? "")
        : "",

    // BUY_X_GET_Y
    bxgy_buy_qty: String((dc.buy_qty as number) ?? ""),
    bxgy_get_qty: String((dc.get_qty as number) ?? ""),
    bxgy_variant_id: String(
      (dc.get_product_variant_id as string) ?? ""
    ),
    bxgy_discount_pct: String(
      (dc.get_discount_percent as number) ?? "100"
    ),
    bxgy_max_redemptions: String(
      (dc.max_redemptions_per_order as number) ?? ""
    ),

    // BOGO
    bogo_buy_qty: String((dc.buy_qty as number) ?? ""),
    bogo_free_qty: String((dc.free_qty as number) ?? "1"),
    bogo_variant_id: String(
      (dc.free_product_variant_id as string) ?? ""
    ),
    bogo_discount_pct: String(
      (dc.free_item_discount_percent as number) ?? "100"
    ),
    bogo_same_product: Boolean(dc.same_product_only ?? false),

    // FREE_SHIPPING
    shipping_max_amount: String(
      (dc.max_shipping_waived as number) ?? ""
    ),
    shipping_carriers: Array.isArray(dc.carriers)
      ? (dc.carriers as string[]).join(", ")
      : "",

    // TIERED_DISCOUNT
    tiers_json: Array.isArray(dc.tiers)
      ? JSON.stringify(dc.tiers)
      : "",
    tier_type: String((dc.tier_type as string) ?? "percentage"),
    tier_stackable: Boolean(dc.stackable ?? false),

    // BUNDLE_DEAL
    bundle_variant_ids: Array.isArray(dc.product_variant_ids)
      ? (dc.product_variant_ids as string[]).join(", ")
      : "",
    bundle_price: String((dc.bundle_price as number) ?? ""),
    bundle_discount_type: String(
      (dc.discount_type as string) ?? "fixed_price"
    ),
    bundle_discount_pct: String(
      (dc.discount_percent as number) ?? ""
    ),
    bundle_require_all: (dc.require_all as boolean) !== false,

    // Shared
    min_cart_value: minCart,
    max_cart_value: maxCart,
    max_uses: maxUses,
    max_uses_per_customer: maxUsesPerCustomer,
  };
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface ExistingPromotion {
  id: string;
  name: string;
  description: string | null;
  internal_note: string | null;
  promotion_type: string;
  discount_config: Record<string, unknown>;
  is_auto_applied: boolean;
  is_exclusive: boolean;
  priority: number;
  status: string;
  valid_from: string;
  valid_to: string | null;
  max_uses_total: number | null;
  max_uses_per_user: number | null;
  rules: {
    rule_type: string;
    rule_config: Record<string, unknown>;
    negate: boolean;
  }[];
}

// ─────────────────────────────────────────────
// CampaignForm
// ─────────────────────────────────────────────
export default function CampaignForm({
  existingData,
}: {
  existingData?: ExistingPromotion;
}) {
  const router = useRouter();
  const token = authToken();
  const isEdit = !!existingData?.id;

  const { user } = useAppSelector((state: RootState) => state.auth);
  const userId =
    user && "user_id" in user
      ? user.user_id
      : user && "id" in user
      ? user.id
      : "";

  const [loading, setLoading] = useState(false);

  // ── Promotion type ──
  const [promoType, setPromoType] = useState<PromotionType | string>(
    existingData?.promotion_type ?? PromotionType.PERCENTAGE
  );

  // ── Core fields ──
  const [name, setName] = useState(existingData?.name ?? "");
  const [description, setDescription] = useState(
    existingData?.description ?? ""
  );
  const [internalNote, setInternalNote] = useState(
    existingData?.internal_note ?? ""
  );
  const [isAutoApplied, setIsAutoApplied] = useState(
    existingData?.is_auto_applied ?? true
  );
  const [isExclusive, setIsExclusive] = useState(
    existingData?.is_exclusive ?? false
  );
  const [priority, setPriority] = useState(
    String(existingData?.priority ?? 10)
  );
  const [status, setStatus] = useState(
    existingData?.status ?? PromotionStatus.DRAFT
  );

  // ── Schedule ──
  const [validFrom, setValidFrom] = useState(
    existingData?.valid_from
      ? new Date(existingData.valid_from).toISOString().slice(0, 16)
      : ""
  );
  const [validTo, setValidTo] = useState(
    existingData?.valid_to
      ? new Date(existingData.valid_to).toISOString().slice(0, 16)
      : ""
  );
  // NOTE: max_uses_total is kept here for the Schedule section.
  // The per-type max_uses / max_uses_per_customer inside discountFields
  // maps to discount_config — they serve different backend fields.
  const [maxUsesTotal, setMaxUsesTotal] = useState(
    String(existingData?.max_uses_total ?? "")
  );

  // ── Discount config — flat record shared with PromotionConfigurator ──
  const [discountFields, setDiscountFields] = useState<DiscountFields>(
    () => initDiscountFields(existingData)
  );

  // Single updater passed to PromotionConfigurator
  const updateField = (key: string, value: unknown) =>
    setDiscountFields((prev) => ({ ...prev, [key]: value }));

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validFrom) {
      toast.error(CAMPAIGN_FORM_TEXT.TOASTS.VALID_FROM_REQ);
      return;
    }
    if (!name.trim()) {
      toast.error(CAMPAIGN_FORM_TEXT.TOASTS.NAME_REQ);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        description: description || null,
        internal_note: internalNote || null,
        promotion_type: promoType,
        discount_config: buildDiscountConfig(promoType, discountFields),
        is_auto_applied: isAutoApplied,
        is_exclusive: isExclusive,
        priority: Number(priority),
        status,
        valid_from: new Date(validFrom).toISOString(),
        valid_to: validTo ? new Date(validTo).toISOString() : null,
        // max_uses_total comes from Schedule section (global cap)
        max_uses_total: maxUsesTotal ? Number(maxUsesTotal) : null,
        // max_uses_per_user comes from discountFields shared key
        max_uses_per_user: discountFields.max_uses_per_customer
          ? Number(discountFields.max_uses_per_customer)
          : 1,
        // Rules — min_cart_value is expressed both inside discount_config
        // AND as a rule for backend enforcement; keep both.
        rules: discountFields.min_cart_value
          ? [
              {
                rule_type: "min_cart_value",
                rule_config: {
                  amount: Number(discountFields.min_cart_value),
                },
                negate: false,
              },
            ]
          : [],
      };

      if (isEdit) {
        await AxiosAPI.patch(
          `/v1/promotions/${existingData!.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(CAMPAIGN_FORM_TEXT.TOASTS.UPDATED);
      } else {
        await AxiosAPI.post(`/v1/promotions/${userId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(CAMPAIGN_FORM_TEXT.TOASTS.CREATED);
      }

      router.push(`/vendor/marketing/campaigns`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ?? CAMPAIGN_FORM_TEXT.TOASTS.ERR_SAVE
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
          <Megaphone size={22} />
        </div>
        <div>
          <h2 className="text-theme-body font-bold text-gray-800">
            {isEdit ? CAMPAIGN_FORM_TEXT.HEADER.EDIT : CAMPAIGN_FORM_TEXT.HEADER.CREATE}
          </h2>
          <p className="text-theme-caption text-gray-500 mt-0.5">
            {CAMPAIGN_FORM_TEXT.HEADER.DESC}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Basic Information ── */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>{CAMPAIGN_FORM_TEXT.BASIC_INFO.NAME}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={CAMPAIGN_FORM_TEXT.BASIC_INFO.NAME_PH}
                className={fieldBase}
              />
            </div>
            <div>
              <label className={labelBase}>{CAMPAIGN_FORM_TEXT.BASIC_INFO.STATUS}</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className={fieldBase}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PromotionStatus.DRAFT}>
                    {CAMPAIGN_FORM_TEXT.STATUS_OPTIONS.DRAFT}
                  </SelectItem>
                  <SelectItem value={PromotionStatus.ACTIVE}>
                    {CAMPAIGN_FORM_TEXT.STATUS_OPTIONS.ACTIVE}
                  </SelectItem>
                  <SelectItem value={PromotionStatus.PENDING_REVIEW}>
                    {CAMPAIGN_FORM_TEXT.STATUS_OPTIONS.REVIEW}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className={labelBase}>{CAMPAIGN_FORM_TEXT.BASIC_INFO.DESC_LBL}</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={CAMPAIGN_FORM_TEXT.BASIC_INFO.DESC_PH}
              className={fieldBase}
            />
          </div>

          <div>
            <label className={labelBase}>{CAMPAIGN_FORM_TEXT.BASIC_INFO.INTERNAL_NOTE_LBL}</label>
            <Textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              rows={2}
              placeholder={CAMPAIGN_FORM_TEXT.BASIC_INFO.INTERNAL_NOTE_PH}
              className={fieldBase}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>{CAMPAIGN_FORM_TEXT.BASIC_INFO.PRIORITY}</label>
              <Input
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="10"
                className={fieldBase}
              />
              <p className="mt-1 text-theme-caption text-gray-400">
                {CAMPAIGN_FORM_TEXT.BASIC_INFO.PRIORITY_HINT}
              </p>
            </div>

            <div className="flex flex-col justify-end pb-1 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutoApplied}
                  onChange={(e) => setIsAutoApplied(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-theme-body-sm font-medium text-gray-700">
                  {CAMPAIGN_FORM_TEXT.BASIC_INFO.AUTO_APPLY}
                </span>
                <span className="text-theme-caption text-gray-400">
                  {CAMPAIGN_FORM_TEXT.BASIC_INFO.AUTO_APPLY_HINT}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isExclusive}
                  onChange={(e) => setIsExclusive(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-theme-body-sm font-medium text-gray-700">
                  {CAMPAIGN_FORM_TEXT.BASIC_INFO.EXCLUSIVE}
                </span>
                <span className="text-theme-caption text-gray-400">
                  {CAMPAIGN_FORM_TEXT.BASIC_INFO.EXCLUSIVE_HINT}
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* ── Discount Configuration ── */}
        <section className={sectionContainer}>
          <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold text-theme-body-sm">
            <Tag size={16} />
            {CAMPAIGN_FORM_TEXT.DISCOUNT_CONFIG}
          </div>
          <PromotionConfigurator
            promoType={promoType}
            setPromoType={(type) => {
              // Reset all discount fields when type changes to avoid
              // stale values from a previous type leaking into the payload.
              setPromoType(type);
              setDiscountFields(initDiscountFields());
            }}
            discountFields={discountFields}
            updateField={updateField}
          />
        </section>

        {/* ── Schedule & Usage ── */}
        <section className={sectionContainer}>
          <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold text-theme-body-sm">
            <Calendar size={16} />
            {CAMPAIGN_FORM_TEXT.SCHEDULE_USAGE.TITLE}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelBase}>{CAMPAIGN_FORM_TEXT.SCHEDULE_USAGE.VALID_FROM}</label>
              <Input
                type="datetime-local"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                required
                className={fieldBase}
              />
            </div>
            <div>
              <label className={labelBase}>{CAMPAIGN_FORM_TEXT.SCHEDULE_USAGE.VALID_TO}</label>
              <Input
                type="datetime-local"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
                className={fieldBase}
              />
              <p className="mt-1 text-theme-caption text-gray-400">
                {CAMPAIGN_FORM_TEXT.SCHEDULE_USAGE.VALID_TO_HINT}
              </p>
            </div>
            <div>
              <label className={labelBase}>{CAMPAIGN_FORM_TEXT.SCHEDULE_USAGE.GLOBAL_CAP}</label>
              <Input
                type="number"
                value={maxUsesTotal}
                onChange={(e) => setMaxUsesTotal(e.target.value)}
                placeholder={CAMPAIGN_FORM_TEXT.SCHEDULE_USAGE.GLOBAL_CAP_PH}
                className={fieldBase}
              />
              <p className="mt-1 text-theme-caption text-gray-400">
                {CAMPAIGN_FORM_TEXT.SCHEDULE_USAGE.GLOBAL_CAP_HINT}
              </p>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 text-theme-body-sm font-bold text-gray-600 hover:text-gray-800"
          >
            {CAMPAIGN_FORM_TEXT.FOOTER.CANCEL}
          </button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 font-bold shadow-md shadow-blue-100"
          >
            {loading
              ? CAMPAIGN_FORM_TEXT.FOOTER.SAVING
              : isEdit
              ? CAMPAIGN_FORM_TEXT.FOOTER.UPDATE
              : CAMPAIGN_FORM_TEXT.FOOTER.CREATE}
          </Button>
        </div>
      </form>
    </div>
  );
}