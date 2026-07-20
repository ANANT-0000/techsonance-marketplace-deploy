import { getClientCompanyId } from "@/utils/getCompanyId";
import React, { useEffect, useCallback, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./Input";
import { Textarea } from "./TextArea";
import { PromotionType } from "@/utils/Types";
import { authToken } from "@/utils/authToken";
import { RootState } from "@/lib/store";
import { useAppSelector } from "@/hooks/reduxHooks";
import { fetchVendorProductsOptions } from "@/utils/vendorApiClient";
import { PROMO_CONFIG_TEXT } from "@/constants/vendorText";

// ── Reusable Styles ──
const fieldBase =
  "w-full px-3 py-2 text-theme-body-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-white";
const labelBase =
  "block text-theme-caption font-bold text-gray-400 uppercase tracking-wider mb-1.5";

// Helper: small helper text below a field
const HelperText = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-1 text-theme-caption text-gray-400">{children}</p>
);

// Helper: section divider with title inside the form
const SectionLabel = ({ icon, label }: { icon: string; label: string }) => (
  <div className="col-span-2 flex items-center gap-2 pt-1 pb-0.5">
    <span className="text-theme-body">{icon}</span>
    <span className="text-theme-caption font-bold text-gray-500 uppercase tracking-widest">
      {label}
    </span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

const PROMOTION_TYPE_OPTIONS = [
  { value: PromotionType.PERCENTAGE, label: "Percentage (%)", icon: "%" },
  { value: PromotionType.FIXED_AMOUNT, label: "Fixed Amount (₹)", icon: "₹" },
  { value: PromotionType.BUY_X_GET_Y, label: "Buy X Get Y", icon: "🎁" },
  { value: PromotionType.BOGO, label: "Buy 1 Get 1 (BOGO)", icon: "2×" },
  { value: PromotionType.FREE_SHIPPING, label: "Free Shipping", icon: "🚚" },
  {
    value: PromotionType.TIERED_DISCOUNT,
    label: "Tiered Discount",
    icon: "📊",
  },
  { value: PromotionType.BUNDLE_DEAL, label: "Bundle Deal", icon: "📦" },
];

interface VariantOption {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
}

interface PromotionConfiguratorProps {
  promoType: PromotionType | string;
  setPromoType: (type: PromotionType) => void;
  discountFields: any;
  updateField: (key: string, value: any) => void;
}

// ── Multi-Select Variant Picker (for Bundle Deal) ──
function MultiVariantSelect({
  label,
  helperText,
  selectedIds,
  variantOptions,
  onChange,
  fieldBase,
  labelBase,
}: {
  label: string;
  helperText?: string;
  selectedIds: string[];
  variantOptions: VariantOption[];
  onChange: (ids: string[]) => void;
  fieldBase: string;
  labelBase: string;
}) {
  const toggle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onChange(next);
  };

  return (
    <div>
      <label className={labelBase}>{label}</label>
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 max-h-48 overflow-y-auto">
        {variantOptions.length === 0 && (
          <p className="px-3 py-2 text-theme-caption text-gray-400 italic">
            {PROMO_CONFIG_TEXT.COMMON.LOADING_VARIANTS}
          </p>
        )}
        {variantOptions.map((opt) => {
          const checked = selectedIds.includes(opt.id);
          return (
            <label
              key={opt.id}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                checked ? "bg-blue-50" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(opt.id)}
                className="accent-blue-500 w-4 h-4 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p
                  className="text-theme-body-sm font-medium text-gray-800 truncate"
                  title={opt.name}
                >
                  {opt.name}
                </p>
                {(opt.sku || opt.price !== undefined) && (
                  <p className="text-theme-caption text-gray-400 truncate">
                    {opt.sku && `${PROMO_CONFIG_TEXT.COMMON.SKU}: ${opt.sku}`}
                    {opt.sku && opt.price !== undefined && " · "}
                    {opt.price !== undefined && `₹${opt.price}`}
                  </p>
                )}
              </div>
              {opt.stock !== undefined && (
                <span
                  className={`text-theme-caption px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    opt.stock > 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {opt.stock > 0
                    ? `${opt.stock} ${PROMO_CONFIG_TEXT.COMMON.LEFT}`
                    : PROMO_CONFIG_TEXT.COMMON.OUT}
                </span>
              )}
            </label>
          );
        })}
      </div>
      {selectedIds.length > 0 && (
        <p className="mt-1.5 text-theme-caption text-blue-500 font-medium">
          {selectedIds.length}{" "}
          {selectedIds.length > 1
            ? PROMO_CONFIG_TEXT.COMMON.VARIANTS_S
            : PROMO_CONFIG_TEXT.COMMON.VARIANT_S}{" "}
          {PROMO_CONFIG_TEXT.COMMON.SELECTED_VARIANTS}
        </p>
      )}
      {helperText && !selectedIds.length && (
        <HelperText>{helperText}</HelperText>
      )}
    </div>
  );
}

// ── Tiered Discount Builder ──
interface Tier {
  min_cart: number | string;
  percent?: number | string;
  fixed?: number | string;
}

function TieredDiscountBuilder({
  tiers,
  onChange,
}: {
  tiers: Tier[];
  onChange: (tiers: Tier[]) => void;
}) {
  const addTier = () => onChange([...tiers, { min_cart: "", percent: "" }]);

  const removeTier = (i: number) =>
    onChange(tiers.filter((_, idx) => idx !== i));

  const updateTier = (i: number, key: keyof Tier, val: string) => {
    const next = tiers.map((t, idx) => (idx === i ? { ...t, [key]: val } : t));
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {tiers.map((tier, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end bg-gray-50 rounded-xl p-3 border border-gray-100"
        >
          <div>
            <label className={labelBase}>
              {PROMO_CONFIG_TEXT.LABELS.MIN_CART}
            </label>
            <Input
              type="number"
              value={tier.min_cart}
              onChange={(e) => updateTier(i, "min_cart", e.target.value)}
              placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_500}
              className={fieldBase}
            />
          </div>
          <div>
            <label className={labelBase}>
              {PROMO_CONFIG_TEXT.LABELS.DISCOUNT_PCT}
            </label>
            <Input
              type="number"
              value={tier.percent ?? ""}
              onChange={(e) => updateTier(i, "percent", e.target.value)}
              placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_10}
              className={fieldBase}
            />
          </div>
          <button
            type="button"
            onClick={() => removeTier(i)}
            className="mb-0.5 h-9 w-9 flex items-center justify-center rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition-colors text-theme-h6"
            title={PROMO_CONFIG_TEXT.ACTIONS.REMOVE_TIER}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addTier}
        className="w-full py-2 rounded-xl border border-dashed border-blue-300 text-blue-500 text-theme-caption font-semibold hover:bg-blue-50 transition-colors"
      >
        {PROMO_CONFIG_TEXT.ACTIONS.ADD_TIER}
      </button>
    </div>
  );
}

// ── Variant Select (single) ──
function VariantSelect({
  label,
  helperText,
  value,
  variantOptions,
  onValueChange,
  fieldBase,
  labelBase,
}: {
  label: string;
  helperText?: string;
  value: string;
  variantOptions: VariantOption[];
  onValueChange: (val: string) => void;
  fieldBase: string;
  labelBase: string;
}) {
  const selected = variantOptions.find((v) => v.id === value);

  return (
    <div>
      <label className={labelBase}>{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={`${fieldBase} w-full`}>
          <SelectValue placeholder={PROMO_CONFIG_TEXT.COMMON.SELECT_VARIANT} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {variantOptions.length === 0 && (
              <SelectItem value="__loading__" disabled>
                {PROMO_CONFIG_TEXT.COMMON.LOADING}
              </SelectItem>
            )}
            {variantOptions.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                <div className="flex items-center justify-between gap-4 w-full">
                  <span className="truncate max-w-[180px]" title={opt.name}>
                    {opt.name}
                  </span>
                  {opt.price !== undefined && (
                    <span className="text-theme-caption text-gray-400 flex-shrink-0">
                      ₹{opt.price}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {selected && (
        <div className="mt-1.5 flex gap-3 text-theme-caption text-gray-500">
          {selected.sku && (
            <span>
              {PROMO_CONFIG_TEXT.COMMON.SKU}: {selected.sku}
            </span>
          )}
          {selected.price !== undefined && (
            <span>
              {PROMO_CONFIG_TEXT.COMMON.PRICE}: ₹{selected.price}
            </span>
          )}
          {selected.stock !== undefined && (
            <span
              className={selected.stock > 0 ? "text-green-600" : "text-red-500"}
            >
              {selected.stock > 0
                ? `${selected.stock} ${PROMO_CONFIG_TEXT.COMMON.IN_STOCK}`
                : PROMO_CONFIG_TEXT.COMMON.OUT_OF_STOCK}
            </span>
          )}
        </div>
      )}
      {helperText && <HelperText>{helperText}</HelperText>}
    </div>
  );
}

// ── Main Component ──
export function PromotionConfigurator({
  promoType,
  setPromoType,
  discountFields,
  updateField,
}: PromotionConfiguratorProps) {
  const companyId = getClientCompanyId();

  const { user } = useAppSelector((state: RootState) => state.auth);
  const token = authToken();
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Parse tiers from JSON string or array
  const parsedTiers: Tier[] = useMemo(() => {
    if (!discountFields.tiers_json) return [];
    if (Array.isArray(discountFields.tiers_json))
      return discountFields.tiers_json;
    try {
      return JSON.parse(discountFields.tiers_json);
    } catch {
      return [];
    }
  }, [discountFields.tiers_json]);

  const handleTiersChange = useCallback(
    (tiers: Tier[]) => {
      updateField("tiers_json", tiers);
    },
    [updateField],
  );

  // Parse bundle variant IDs from comma string or array
  const bundleIds: string[] = useMemo(() => {
    if (!discountFields.bundle_variant_ids) return [];
    if (Array.isArray(discountFields.bundle_variant_ids))
      return discountFields.bundle_variant_ids;
    return discountFields.bundle_variant_ids
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
  }, [discountFields.bundle_variant_ids]);

  const needsVariants =
    promoType === PromotionType.BUY_X_GET_Y ||
    promoType === PromotionType.BOGO ||
    promoType === PromotionType.BUNDLE_DEAL;

  const fetchProductVariants = useCallback(async () => {
    if (!token || !companyId || variantOptions.length > 0) return;
    setLoadingVariants(true);
    try {
      const res = await fetchVendorProductsOptions(token, companyId);
      setVariantOptions(res.data ?? []);
    } catch (err) {
      // silently handle or log elsewhere
    } finally {
      setLoadingVariants(false);
    }
  }, [token, variantOptions.length]);

  useEffect(() => {
    if (needsVariants) fetchProductVariants();
  }, [needsVariants, fetchProductVariants]);

  const promoLabel =
    PROMOTION_TYPE_OPTIONS.find((o) => o.value === promoType)?.label ?? "";

  return (
    <div className="space-y-5">
      {/* ── Type Selector ── */}
      <div className="max-w-xs">
        <label className={labelBase}>
          {PROMO_CONFIG_TEXT.LABELS.PROMO_TYPE}
        </label>
        <Select
          value={promoType}
          onValueChange={(v) => setPromoType(v as PromotionType)}
        >
          <SelectTrigger className={fieldBase}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROMOTION_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                <span className="mr-2">{o.icon}</span>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Dynamic Config Fields ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* ──────────── PERCENTAGE ──────────── */}
        {promoType === PromotionType.PERCENTAGE && (
          <>
            <SectionLabel
              icon="%"
              label={PROMO_CONFIG_TEXT.LABELS.DISCOUNT_VAL}
            />

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.DISCOUNT_PCT_AST}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={discountFields.pct_value ?? ""}
                  onChange={(e) => updateField("pct_value", e.target.value)}
                  placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_20}
                  className={fieldBase + " pr-8"}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm font-semibold">
                  %
                </span>
              </div>
              <HelperText>{PROMO_CONFIG_TEXT.HINTS.PCT_RANGE}</HelperText>
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MAX_CAP}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.pct_cap ?? ""}
                  onChange={(e) => updateField("pct_cap", e.target.value)}
                  placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_500}
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm">
                  ₹
                </span>
              </div>
              <HelperText>{PROMO_CONFIG_TEXT.HINTS.NO_CAP}</HelperText>
            </div>

            <SectionLabel
              icon="🛒"
              label={PROMO_CONFIG_TEXT.LABELS.CART_ELIGIBILITY}
            />

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MIN_CART_VAL}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.min_cart_value ?? ""}
                  onChange={(e) =>
                    updateField("min_cart_value", e.target.value)
                  }
                  placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_299}
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm">
                  ₹
                </span>
              </div>
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MAX_CART_VAL}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.max_cart_value ?? ""}
                  onChange={(e) =>
                    updateField("max_cart_value", e.target.value)
                  }
                  placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.OPTIONAL}
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm">
                  ₹
                </span>
              </div>
            </div>

            <SectionLabel
              icon="🔁"
              label={PROMO_CONFIG_TEXT.LABELS.USAGE_LIMITS}
            />

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MAX_USES}
              </label>
              <Input
                type="number"
                value={discountFields.max_uses ?? ""}
                onChange={(e) => updateField("max_uses", e.target.value)}
                placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_1000}
                className={fieldBase}
              />
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MAX_USES_USER}
              </label>
              <Input
                type="number"
                value={discountFields.max_uses_per_customer ?? ""}
                onChange={(e) =>
                  updateField("max_uses_per_customer", e.target.value)
                }
                placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_1}
                className={fieldBase}
              />
            </div>
          </>
        )}

        {/* ──────────── FIXED AMOUNT ──────────── */}
        {promoType === PromotionType.FIXED_AMOUNT && (
          <>
            <SectionLabel
              icon="₹"
              label={PROMO_CONFIG_TEXT.LABELS.DISCOUNT_VAL}
            />

            <div className="col-span-2">
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.AMOUNT_OFF}
              </label>
              <div className="relative max-w-xs">
                <Input
                  type="number"
                  value={discountFields.fixed_amount ?? ""}
                  onChange={(e) => updateField("fixed_amount", e.target.value)}
                  placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_100}
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm">
                  ₹
                </span>
              </div>
            </div>

            <SectionLabel
              icon="🛒"
              label={PROMO_CONFIG_TEXT.LABELS.CART_ELIGIBILITY}
            />

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MIN_CART_VAL}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.min_cart_value ?? ""}
                  onChange={(e) =>
                    updateField("min_cart_value", e.target.value)
                  }
                  placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_499}
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm">
                  ₹
                </span>
              </div>
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MAX_CART_VAL}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.max_cart_value ?? ""}
                  onChange={(e) =>
                    updateField("max_cart_value", e.target.value)
                  }
                  placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.OPTIONAL}
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm">
                  ₹
                </span>
              </div>
            </div>

            <SectionLabel
              icon="🔁"
              label={PROMO_CONFIG_TEXT.LABELS.USAGE_LIMITS}
            />

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MAX_USES}
              </label>
              <Input
                type="number"
                value={discountFields.max_uses ?? ""}
                onChange={(e) => updateField("max_uses", e.target.value)}
                placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_500}
                className={fieldBase}
              />
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MAX_USES_USER}
              </label>
              <Input
                type="number"
                value={discountFields.max_uses_per_customer ?? ""}
                onChange={(e) =>
                  updateField("max_uses_per_customer", e.target.value)
                }
                placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_1}
                className={fieldBase}
              />
            </div>
          </>
        )}

        {/* ──────────── BUY X GET Y ──────────── */}
        {promoType === PromotionType.BUY_X_GET_Y && (
          <>
            <SectionLabel
              icon="🎁"
              label={PROMO_CONFIG_TEXT.LABELS.QUANTITIES}
            />

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.BUY_QTY}
              </label>
              <Input
                type="number"
                min={1}
                value={discountFields.bxgy_buy_qty ?? ""}
                onChange={(e) => updateField("bxgy_buy_qty", e.target.value)}
                placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_2}
                className={fieldBase}
              />
              <HelperText>{PROMO_CONFIG_TEXT.HINTS.MUST_BUY}</HelperText>
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.GET_QTY}
              </label>
              <Input
                type="number"
                min={1}
                value={discountFields.bxgy_get_qty ?? ""}
                onChange={(e) => updateField("bxgy_get_qty", e.target.value)}
                placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_1}
                className={fieldBase}
              />
              <HelperText>{PROMO_CONFIG_TEXT.HINTS.GIVEN_FREE}</HelperText>
            </div>

            <SectionLabel
              icon="📦"
              label={PROMO_CONFIG_TEXT.LABELS.FREE_PRODUCT}
            />

            <div className="col-span-2">
              <VariantSelect
                label={PROMO_CONFIG_TEXT.LABELS.FREE_VARIANT}
                helperText={PROMO_CONFIG_TEXT.HINTS.FREE_VARIANT_DESC}
                value={discountFields.bxgy_variant_id ?? ""}
                variantOptions={variantOptions}
                onValueChange={(val) => updateField("bxgy_variant_id", val)}
                fieldBase={fieldBase}
                labelBase={labelBase}
              />
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.DISC_ON_GET}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={discountFields.bxgy_discount_pct ?? ""}
                  onChange={(e) =>
                    updateField("bxgy_discount_pct", e.target.value)
                  }
                  placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.FULL_FREE}
                  className={fieldBase + " pr-8"}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm font-semibold">
                  %
                </span>
              </div>
              <HelperText>{PROMO_CONFIG_TEXT.HINTS.GIVE_FREE}</HelperText>
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MAX_REDEMPTIONS}
              </label>
              <Input
                type="number"
                value={discountFields.bxgy_max_redemptions ?? ""}
                onChange={(e) =>
                  updateField("bxgy_max_redemptions", e.target.value)
                }
                placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.UNLIMITED}
                className={fieldBase}
              />
            </div>

            <SectionLabel
              icon="🛒"
              label={PROMO_CONFIG_TEXT.LABELS.CART_ELIGIBILITY}
            />

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MIN_CART_VAL}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.min_cart_value ?? ""}
                  onChange={(e) =>
                    updateField("min_cart_value", e.target.value)
                  }
                  placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.OPTIONAL}
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm">
                  ₹
                </span>
              </div>
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MAX_USES}
              </label>
              <Input
                type="number"
                value={discountFields.max_uses ?? ""}
                onChange={(e) => updateField("max_uses", e.target.value)}
                placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_200}
                className={fieldBase}
              />
            </div>
          </>
        )}

        {/* ──────────── BOGO ──────────── */}
        {promoType === PromotionType.BOGO && (
          <>
            <SectionLabel
              icon="2×"
              label={PROMO_CONFIG_TEXT.LABELS.BOGO_CONFIG}
            />

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.BUY_QTY}
              </label>
              <Input
                type="number"
                min={1}
                value={discountFields.bogo_buy_qty ?? ""}
                onChange={(e) => updateField("bogo_buy_qty", e.target.value)}
                placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_1}
                className={fieldBase}
              />
              <HelperText>{PROMO_CONFIG_TEXT.HINTS.BOGO_QTY}</HelperText>
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.FREE_ITEM_QTY}
              </label>
              <Input
                type="number"
                min={1}
                value={discountFields.bogo_free_qty ?? "1"}
                onChange={(e) => updateField("bogo_free_qty", e.target.value)}
                placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_1}
                className={fieldBase}
              />
            </div>

            <SectionLabel
              icon="📦"
              label={PROMO_CONFIG_TEXT.LABELS.FREE_PRODUCT}
            />

            <div className="col-span-2">
              <VariantSelect
                label={PROMO_CONFIG_TEXT.LABELS.FREE_VARIANT}
                helperText={PROMO_CONFIG_TEXT.HINTS.FREE_VARIANT_BOGO}
                value={discountFields.bogo_variant_id ?? ""}
                variantOptions={variantOptions}
                onValueChange={(val) => updateField("bogo_variant_id", val)}
                fieldBase={fieldBase}
                labelBase={labelBase}
              />
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.DISC_ON_FREE}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={discountFields.bogo_discount_pct ?? "100"}
                  onChange={(e) =>
                    updateField("bogo_discount_pct", e.target.value)
                  }
                  placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.HUNDRED}
                  className={fieldBase + " pr-8"}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm font-semibold">
                  %
                </span>
              </div>
              <HelperText>{PROMO_CONFIG_TEXT.HINTS.DEFAULT_100}</HelperText>
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.SAME_PRODUCT}
              </label>
              <Select
                value={discountFields.bogo_same_product ? "yes" : "no"}
                onValueChange={(v) =>
                  updateField("bogo_same_product", v === "yes")
                }
              >
                <SelectTrigger className={`${fieldBase} w-full`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">
                    {PROMO_CONFIG_TEXT.COMMON.YES_SAME_PRODUCT}
                  </SelectItem>
                  <SelectItem value="no">
                    {PROMO_CONFIG_TEXT.COMMON.NO_DIFF_VARIANT}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SectionLabel icon="🔁" label="Usage limits" />

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MAX_USES}
              </label>
              <Input
                type="number"
                value={discountFields.max_uses ?? ""}
                onChange={(e) => updateField("max_uses", e.target.value)}
                placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.OPTIONAL}
                className={fieldBase}
              />
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MAX_USES_USER}
              </label>
              <Input
                type="number"
                value={discountFields.max_uses_per_customer ?? ""}
                onChange={(e) =>
                  updateField("max_uses_per_customer", e.target.value)
                }
                placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_1}
                className={fieldBase}
              />
            </div>
          </>
        )}

        {/* ──────────── FREE SHIPPING ──────────── */}
        {promoType === PromotionType.FREE_SHIPPING && (
          <>
            <SectionLabel
              icon="🚚"
              label={PROMO_CONFIG_TEXT.LABELS.SHIPPING_CONFIG}
            />

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MAX_SHIPPING_WAIVED}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.shipping_max_amount ?? ""}
                  onChange={(e) =>
                    updateField("shipping_max_amount", e.target.value)
                  }
                  placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_100}
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm">
                  ₹
                </span>
              </div>
              <HelperText>
                {PROMO_CONFIG_TEXT.HINTS.MAX_SHIPPING_HINT}
              </HelperText>
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.APPLICABLE_CARRIERS}
              </label>
              <Input
                value={discountFields.shipping_carriers ?? ""}
                onChange={(e) =>
                  updateField("shipping_carriers", e.target.value)
                }
                placeholder="e.g. Delhivery, Bluedart (optional)"
                className={fieldBase}
              />
              <HelperText>{PROMO_CONFIG_TEXT.HINTS.CARRIERS_HINT}</HelperText>
            </div>

            <SectionLabel
              icon="🛒"
              label={PROMO_CONFIG_TEXT.LABELS.CART_ELIGIBILITY}
            />

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MIN_CART_VAL}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.min_cart_value ?? ""}
                  onChange={(e) =>
                    updateField("min_cart_value", e.target.value)
                  }
                  placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_499}
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm">
                  ₹
                </span>
              </div>
            </div>

            <div>
              <label className={labelBase}>Max Uses Per Customer</label>
              <Input
                type="number"
                value={discountFields.max_uses_per_customer ?? ""}
                onChange={(e) =>
                  updateField("max_uses_per_customer", e.target.value)
                }
                placeholder="e.g. 1"
                className={fieldBase}
              />
            </div>
          </>
        )}

        {/* ──────────── TIERED DISCOUNT ──────────── */}
        {promoType === PromotionType.TIERED_DISCOUNT && (
          <>
            <SectionLabel
              icon="📊"
              label={PROMO_CONFIG_TEXT.LABELS.TIER_CONFIG}
            />

            <div className="col-span-2">
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.TIERS}
              </label>
              <TieredDiscountBuilder
                tiers={parsedTiers}
                onChange={handleTiersChange}
              />
              <HelperText>{PROMO_CONFIG_TEXT.HINTS.TIER_HINT}</HelperText>
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.TIER_TYPE}
              </label>
              <Select
                value={discountFields.tier_type ?? "percentage"}
                onValueChange={(v) => updateField("tier_type", v)}
              >
                <SelectTrigger className={`${fieldBase} w-full`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    {PROMO_CONFIG_TEXT.COMMON.TIER_PERCENTAGE}
                  </SelectItem>
                  <SelectItem value="fixed">
                    {PROMO_CONFIG_TEXT.COMMON.TIER_FIXED}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.STACKABLE}
              </label>
              <Select
                value={discountFields.tier_stackable ? "yes" : "no"}
                onValueChange={(v) =>
                  updateField("tier_stackable", v === "yes")
                }
              >
                <SelectTrigger className={`${fieldBase} w-full`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">
                    {PROMO_CONFIG_TEXT.COMMON.STACK_NO}
                  </SelectItem>
                  <SelectItem value="yes">
                    {PROMO_CONFIG_TEXT.COMMON.STACK_YES}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SectionLabel
              icon="🔁"
              label={PROMO_CONFIG_TEXT.LABELS.USAGE_LIMITS}
            />

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MAX_USES}
              </label>
              <Input
                type="number"
                value={discountFields.max_uses ?? ""}
                onChange={(e) => updateField("max_uses", e.target.value)}
                placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.OPTIONAL}
                className={fieldBase}
              />
            </div>

            <div>
              <label className={labelBase}>Max Uses Per Customer</label>
              <Input
                type="number"
                value={discountFields.max_uses_per_customer ?? ""}
                onChange={(e) =>
                  updateField("max_uses_per_customer", e.target.value)
                }
                placeholder="e.g. 1"
                className={fieldBase}
              />
            </div>
          </>
        )}

        {/* ──────────── BUNDLE DEAL ──────────── */}
        {promoType === PromotionType.BUNDLE_DEAL && (
          <>
            <SectionLabel
              icon="📦"
              label={PROMO_CONFIG_TEXT.LABELS.BUNDLE_PRODUCTS}
            />

            <div className="col-span-2">
              <MultiVariantSelect
                label={PROMO_CONFIG_TEXT.LABELS.BUNDLE_VARIANTS}
                helperText={PROMO_CONFIG_TEXT.HINTS.BUNDLE_VARIANTS_HINT}
                selectedIds={bundleIds}
                variantOptions={variantOptions}
                onChange={(ids) =>
                  updateField("bundle_variant_ids", ids.join(","))
                }
                fieldBase={fieldBase}
                labelBase={labelBase}
              />
            </div>

            <SectionLabel
              icon="₹"
              label={PROMO_CONFIG_TEXT.LABELS.BUNDLE_PRICING}
            />

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.BUNDLE_PRICE}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.bundle_price ?? ""}
                  onChange={(e) => updateField("bundle_price", e.target.value)}
                  placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_499}
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm">
                  ₹
                </span>
              </div>
              <HelperText>
                {PROMO_CONFIG_TEXT.HINTS.BUNDLE_PRICE_HINT}
              </HelperText>
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.BUNDLE_DISC_TYPE}
              </label>
              <Select
                value={discountFields.bundle_discount_type ?? "fixed_price"}
                onValueChange={(v) => updateField("bundle_discount_type", v)}
              >
                <SelectTrigger className={`${fieldBase} w-full`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed_price">
                    {PROMO_CONFIG_TEXT.COMMON.BUNDLE_FIXED}
                  </SelectItem>
                  <SelectItem value="percentage_off">
                    {PROMO_CONFIG_TEXT.COMMON.BUNDLE_PCT}
                  </SelectItem>
                  <SelectItem value="amount_off">
                    {PROMO_CONFIG_TEXT.COMMON.BUNDLE_AMT}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {discountFields.bundle_discount_type === "percentage_off" && (
              <div>
                <label className={labelBase}>
                  {PROMO_CONFIG_TEXT.LABELS.BUNDLE_DISC_PCT}
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={discountFields.bundle_discount_pct ?? ""}
                    onChange={(e) =>
                      updateField("bundle_discount_pct", e.target.value)
                    }
                    placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_10}
                    className={fieldBase + " pr-8"}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-theme-body-sm font-semibold">
                    %
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.REQUIRE_ALL}
              </label>
              <Select
                value={
                  discountFields.bundle_require_all !== false ? "yes" : "no"
                }
                onValueChange={(v) =>
                  updateField("bundle_require_all", v === "yes")
                }
              >
                <SelectTrigger className={`${fieldBase} w-full`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">
                    {PROMO_CONFIG_TEXT.COMMON.REQUIRE_ALL_YES}
                  </SelectItem>
                  <SelectItem value="no">
                    {PROMO_CONFIG_TEXT.COMMON.REQUIRE_ALL_NO}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SectionLabel
              icon="🔁"
              label={PROMO_CONFIG_TEXT.LABELS.USAGE_LIMITS}
            />

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MAX_USES}
              </label>
              <Input
                type="number"
                value={discountFields.max_uses ?? ""}
                onChange={(e) => updateField("max_uses", e.target.value)}
                placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.OPTIONAL}
                className={fieldBase}
              />
            </div>

            <div>
              <label className={labelBase}>
                {PROMO_CONFIG_TEXT.LABELS.MAX_USES_USER}
              </label>
              <Input
                type="number"
                value={discountFields.max_uses_per_customer ?? ""}
                onChange={(e) =>
                  updateField("max_uses_per_customer", e.target.value)
                }
                placeholder={PROMO_CONFIG_TEXT.PLACEHOLDERS.EG_1}
                className={fieldBase}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
