import React, { useEffect, useCallback } from 'react';
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
import { PromotionType } from '@/utils/Types';
import { authToken } from '@/utils/authToken';
import { RootState } from '@/lib/store';
import { useAppSelector } from '@/hooks/reduxHooks';
import { fetchVendorProductsOptions } from '@/utils/vendorApiClient';

// ── Reusable Styles ──
const fieldBase =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-white";
const labelBase =
  "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5";

// Helper: small helper text below a field
const HelperText = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-1 text-xs text-gray-400">{children}</p>
);

// Helper: section divider with title inside the form
const SectionLabel = ({ icon, label }: { icon: string; label: string }) => (
  <div className="col-span-2 flex items-center gap-2 pt-1 pb-0.5">
    <span className="text-base">{icon}</span>
    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
      {label}
    </span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

const PROMOTION_TYPE_OPTIONS = [
  { value: PromotionType.PERCENTAGE,      label: "Percentage (%)",       icon: "%" },
  { value: PromotionType.FIXED_AMOUNT,    label: "Fixed Amount (₹)",     icon: "₹" },
  { value: PromotionType.BUY_X_GET_Y,    label: "Buy X Get Y",          icon: "🎁" },
  { value: PromotionType.BOGO,            label: "Buy 1 Get 1 (BOGO)",   icon: "2×" },
  { value: PromotionType.FREE_SHIPPING,   label: "Free Shipping",        icon: "🚚" },
  { value: PromotionType.TIERED_DISCOUNT, label: "Tiered Discount",      icon: "📊" },
  { value: PromotionType.BUNDLE_DEAL,     label: "Bundle Deal",          icon: "📦" },
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
          <p className="px-3 py-2 text-xs text-gray-400 italic">
            Loading variants…
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
                  className="text-sm font-medium text-gray-800 truncate"
                  title={opt.name}
                >
                  {opt.name}
                </p>
                {(opt.sku || opt.price !== undefined) && (
                  <p className="text-xs text-gray-400 truncate">
                    {opt.sku && `SKU: ${opt.sku}`}
                    {opt.sku && opt.price !== undefined && " · "}
                    {opt.price !== undefined && `₹${opt.price}`}
                  </p>
                )}
              </div>
              {opt.stock !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    opt.stock > 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {opt.stock > 0 ? `${opt.stock} left` : "Out"}
                </span>
              )}
            </label>
          );
        })}
      </div>
      {selectedIds.length > 0 && (
        <p className="mt-1.5 text-xs text-blue-500 font-medium">
          {selectedIds.length} variant{selectedIds.length > 1 ? "s" : ""}{" "}
          selected
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
  const addTier = () =>
    onChange([...tiers, { min_cart: "", percent: "" }]);

  const removeTier = (i: number) =>
    onChange(tiers.filter((_, idx) => idx !== i));

  const updateTier = (i: number, key: keyof Tier, val: string) => {
    const next = tiers.map((t, idx) =>
      idx === i ? { ...t, [key]: val } : t
    );
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
            <label className={labelBase}>Min Cart (₹)</label>
            <Input
              type="number"
              value={tier.min_cart}
              onChange={(e) => updateTier(i, "min_cart", e.target.value)}
              placeholder="e.g. 500"
              className={fieldBase}
            />
          </div>
          <div>
            <label className={labelBase}>Discount (%)</label>
            <Input
              type="number"
              value={tier.percent ?? ""}
              onChange={(e) => updateTier(i, "percent", e.target.value)}
              placeholder="e.g. 10"
              className={fieldBase}
            />
          </div>
          <button
            type="button"
            onClick={() => removeTier(i)}
            className="mb-0.5 h-9 w-9 flex items-center justify-center rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition-colors text-lg"
            title="Remove tier"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addTier}
        className="w-full py-2 rounded-xl border border-dashed border-blue-300 text-blue-500 text-xs font-semibold hover:bg-blue-50 transition-colors"
      >
        + Add tier
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
          <SelectValue placeholder="Select a variant…" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {variantOptions.length === 0 && (
              <SelectItem value="__loading__" disabled>
                Loading…
              </SelectItem>
            )}
            {variantOptions.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                <div className="flex items-center justify-between gap-4 w-full">
                  <span className="truncate max-w-[180px]" title={opt.name}>
                    {opt.name}
                  </span>
                  {opt.price !== undefined && (
                    <span className="text-xs text-gray-400 flex-shrink-0">
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
        <div className="mt-1.5 flex gap-3 text-xs text-gray-500">
          {selected.sku && <span>SKU: {selected.sku}</span>}
          {selected.price !== undefined && <span>Price: ₹{selected.price}</span>}
          {selected.stock !== undefined && (
            <span
              className={
                selected.stock > 0 ? "text-green-600" : "text-red-500"
              }
            >
              {selected.stock > 0
                ? `${selected.stock} in stock`
                : "Out of stock"}
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
  const { user } = useAppSelector((state: RootState) => state.auth);
  const token = authToken();
  const [variantOptions, setVariantOptions] = React.useState<VariantOption[]>([]);
  const [loadingVariants, setLoadingVariants] = React.useState(false);

  // Parse tiers from JSON string or array
  const parsedTiers: Tier[] = React.useMemo(() => {
    if (!discountFields.tiers_json) return [];
    if (Array.isArray(discountFields.tiers_json)) return discountFields.tiers_json;
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
    [updateField]
  );

  // Parse bundle variant IDs from comma string or array
  const bundleIds: string[] = React.useMemo(() => {
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
    if (!token || variantOptions.length > 0) return;
    setLoadingVariants(true);
    try {
      const res = await fetchVendorProductsOptions(token);
      setVariantOptions(res.data ?? []);
    } catch (err) {
      console.error("Failed to fetch variants", err);
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
        <label className={labelBase}>Promotion Type *</label>
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
            <SectionLabel icon="%" label="Discount value" />

            <div>
              <label className={labelBase}>Discount Percentage *</label>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={discountFields.pct_value ?? ""}
                  onChange={(e) => updateField("pct_value", e.target.value)}
                  placeholder="e.g. 20"
                  className={fieldBase + " pr-8"}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                  %
                </span>
              </div>
              <HelperText>Enter a value between 1 – 100.</HelperText>
            </div>

            <div>
              <label className={labelBase}>Max Discount Cap (₹)</label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.pct_cap ?? ""}
                  onChange={(e) => updateField("pct_cap", e.target.value)}
                  placeholder="e.g. 500"
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </span>
              </div>
              <HelperText>Leave blank for no cap.</HelperText>
            </div>

            <SectionLabel icon="🛒" label="Cart eligibility" />

            <div>
              <label className={labelBase}>Minimum Cart Value (₹)</label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.min_cart_value ?? ""}
                  onChange={(e) =>
                    updateField("min_cart_value", e.target.value)
                  }
                  placeholder="e.g. 299"
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </span>
              </div>
            </div>

            <div>
              <label className={labelBase}>Maximum Cart Value (₹)</label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.max_cart_value ?? ""}
                  onChange={(e) =>
                    updateField("max_cart_value", e.target.value)
                  }
                  placeholder="Optional"
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </span>
              </div>
            </div>

            <SectionLabel icon="🔁" label="Usage limits" />

            <div>
              <label className={labelBase}>Max Uses (total)</label>
              <Input
                type="number"
                value={discountFields.max_uses ?? ""}
                onChange={(e) => updateField("max_uses", e.target.value)}
                placeholder="e.g. 1000"
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

        {/* ──────────── FIXED AMOUNT ──────────── */}
        {promoType === PromotionType.FIXED_AMOUNT && (
          <>
            <SectionLabel icon="₹" label="Discount amount" />

            <div className="col-span-2">
              <label className={labelBase}>Amount Off (₹) *</label>
              <div className="relative max-w-xs">
                <Input
                  type="number"
                  value={discountFields.fixed_amount ?? ""}
                  onChange={(e) =>
                    updateField("fixed_amount", e.target.value)
                  }
                  placeholder="e.g. 100"
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </span>
              </div>
            </div>

            <SectionLabel icon="🛒" label="Cart eligibility" />

            <div>
              <label className={labelBase}>Minimum Cart Value (₹)</label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.min_cart_value ?? ""}
                  onChange={(e) =>
                    updateField("min_cart_value", e.target.value)
                  }
                  placeholder="e.g. 499"
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </span>
              </div>
            </div>

            <div>
              <label className={labelBase}>Maximum Cart Value (₹)</label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.max_cart_value ?? ""}
                  onChange={(e) =>
                    updateField("max_cart_value", e.target.value)
                  }
                  placeholder="Optional"
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </span>
              </div>
            </div>

            <SectionLabel icon="🔁" label="Usage limits" />

            <div>
              <label className={labelBase}>Max Uses (total)</label>
              <Input
                type="number"
                value={discountFields.max_uses ?? ""}
                onChange={(e) => updateField("max_uses", e.target.value)}
                placeholder="e.g. 500"
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

        {/* ──────────── BUY X GET Y ──────────── */}
        {promoType === PromotionType.BUY_X_GET_Y && (
          <>
            <SectionLabel icon="🎁" label="Quantities" />

            <div>
              <label className={labelBase}>Buy Quantity *</label>
              <Input
                type="number"
                min={1}
                value={discountFields.bxgy_buy_qty ?? ""}
                onChange={(e) =>
                  updateField("bxgy_buy_qty", e.target.value)
                }
                placeholder="e.g. 2"
                className={fieldBase}
              />
              <HelperText>Customer must buy this many items.</HelperText>
            </div>

            <div>
              <label className={labelBase}>Get Quantity *</label>
              <Input
                type="number"
                min={1}
                value={discountFields.bxgy_get_qty ?? ""}
                onChange={(e) =>
                  updateField("bxgy_get_qty", e.target.value)
                }
                placeholder="e.g. 1"
                className={fieldBase}
              />
              <HelperText>Items given free or discounted.</HelperText>
            </div>

            <SectionLabel icon="📦" label="Free product" />

            <div className="col-span-2">
              <VariantSelect
                label="Free Product Variant *"
                helperText="The product variant the customer receives for free (or at discount)."
                value={discountFields.bxgy_variant_id ?? ""}
                variantOptions={variantOptions}
                onValueChange={(val) =>
                  updateField("bxgy_variant_id", val)
                }
                fieldBase={fieldBase}
                labelBase={labelBase}
              />
            </div>

            <div>
              <label className={labelBase}>
                Discount % on Get Items
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
                  placeholder="100 = fully free"
                  className={fieldBase + " pr-8"}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                  %
                </span>
              </div>
              <HelperText>Set 100 to give items completely free.</HelperText>
            </div>

            <div>
              <label className={labelBase}>Max Redemptions Per Order</label>
              <Input
                type="number"
                value={discountFields.bxgy_max_redemptions ?? ""}
                onChange={(e) =>
                  updateField("bxgy_max_redemptions", e.target.value)
                }
                placeholder="Leave blank = unlimited"
                className={fieldBase}
              />
            </div>

            <SectionLabel icon="🛒" label="Cart eligibility" />

            <div>
              <label className={labelBase}>Minimum Cart Value (₹)</label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.min_cart_value ?? ""}
                  onChange={(e) =>
                    updateField("min_cart_value", e.target.value)
                  }
                  placeholder="Optional"
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </span>
              </div>
            </div>

            <div>
              <label className={labelBase}>Max Uses (total)</label>
              <Input
                type="number"
                value={discountFields.max_uses ?? ""}
                onChange={(e) => updateField("max_uses", e.target.value)}
                placeholder="e.g. 200"
                className={fieldBase}
              />
            </div>
          </>
        )}

        {/* ──────────── BOGO ──────────── */}
        {promoType === PromotionType.BOGO && (
          <>
            <SectionLabel icon="2×" label="BOGO config" />

            <div>
              <label className={labelBase}>Buy Quantity *</label>
              <Input
                type="number"
                min={1}
                value={discountFields.bogo_buy_qty ?? ""}
                onChange={(e) =>
                  updateField("bogo_buy_qty", e.target.value)
                }
                placeholder="e.g. 1"
                className={fieldBase}
              />
              <HelperText>
                Typically 1 for "Buy 1 Get 1" — adjust for variants.
              </HelperText>
            </div>

            <div>
              <label className={labelBase}>Free Item Quantity</label>
              <Input
                type="number"
                min={1}
                value={discountFields.bogo_free_qty ?? "1"}
                onChange={(e) =>
                  updateField("bogo_free_qty", e.target.value)
                }
                placeholder="e.g. 1"
                className={fieldBase}
              />
            </div>

            <SectionLabel icon="📦" label="Free product" />

            <div className="col-span-2">
              <VariantSelect
                label="Free Product Variant *"
                helperText="Which variant does the customer get for free?"
                value={discountFields.bogo_variant_id ?? ""}
                variantOptions={variantOptions}
                onValueChange={(val) =>
                  updateField("bogo_variant_id", val)
                }
                fieldBase={fieldBase}
                labelBase={labelBase}
              />
            </div>

            <div>
              <label className={labelBase}>
                Discount on Free Item (%)
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
                  placeholder="100"
                  className={fieldBase + " pr-8"}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                  %
                </span>
              </div>
              <HelperText>Default 100 = fully free.</HelperText>
            </div>

            <div>
              <label className={labelBase}>Same Product Only?</label>
              <Select
                value={
                  discountFields.bogo_same_product
                    ? "yes"
                    : "no"
                }
                onValueChange={(v) =>
                  updateField("bogo_same_product", v === "yes")
                }
              >
                <SelectTrigger className={`${fieldBase} w-full`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">
                    Yes — free item must be same product
                  </SelectItem>
                  <SelectItem value="no">
                    No — can pick a different variant
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SectionLabel icon="🔁" label="Usage limits" />

            <div>
              <label className={labelBase}>Max Uses (total)</label>
              <Input
                type="number"
                value={discountFields.max_uses ?? ""}
                onChange={(e) => updateField("max_uses", e.target.value)}
                placeholder="Optional"
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

        {/* ──────────── FREE SHIPPING ──────────── */}
        {promoType === PromotionType.FREE_SHIPPING && (
          <>
            <SectionLabel icon="🚚" label="Shipping config" />

            <div>
              <label className={labelBase}>Max Shipping Waived (₹) *</label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.shipping_max_amount ?? ""}
                  onChange={(e) =>
                    updateField("shipping_max_amount", e.target.value)
                  }
                  placeholder="e.g. 100"
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </span>
              </div>
              <HelperText>
                Maximum shipping cost that will be waived. Leave blank to
                cover any amount.
              </HelperText>
            </div>

            <div>
              <label className={labelBase}>Applicable Carriers</label>
              <Input
                value={discountFields.shipping_carriers ?? ""}
                onChange={(e) =>
                  updateField("shipping_carriers", e.target.value)
                }
                placeholder="e.g. Delhivery, Bluedart (optional)"
                className={fieldBase}
              />
              <HelperText>
                Comma-separated. Leave blank to apply to all carriers.
              </HelperText>
            </div>

            <SectionLabel icon="🛒" label="Cart eligibility" />

            <div>
              <label className={labelBase}>Minimum Cart Value (₹)</label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.min_cart_value ?? ""}
                  onChange={(e) =>
                    updateField("min_cart_value", e.target.value)
                  }
                  placeholder="e.g. 499"
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
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
            <SectionLabel icon="📊" label="Discount tiers" />

            <div className="col-span-2">
              <label className={labelBase}>Tiers *</label>
              <TieredDiscountBuilder
                tiers={parsedTiers}
                onChange={handleTiersChange}
              />
              <HelperText>
                Each tier applies when the cart value meets the minimum
                threshold.
              </HelperText>
            </div>

            <div>
              <label className={labelBase}>Tier Type</label>
              <Select
                value={discountFields.tier_type ?? "percentage"}
                onValueChange={(v) => updateField("tier_type", v)}
              >
                <SelectTrigger className={`${fieldBase} w-full`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    Percentage (%) off cart
                  </SelectItem>
                  <SelectItem value="fixed">
                    Fixed (₹) off cart
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={labelBase}>Stack With Other Promos?</label>
              <Select
                value={
                  discountFields.tier_stackable ? "yes" : "no"
                }
                onValueChange={(v) =>
                  updateField("tier_stackable", v === "yes")
                }
              >
                <SelectTrigger className={`${fieldBase} w-full`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">
                    No — use only this promotion
                  </SelectItem>
                  <SelectItem value="yes">
                    Yes — can stack with other codes
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SectionLabel icon="🔁" label="Usage limits" />

            <div>
              <label className={labelBase}>Max Uses (total)</label>
              <Input
                type="number"
                value={discountFields.max_uses ?? ""}
                onChange={(e) => updateField("max_uses", e.target.value)}
                placeholder="Optional"
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
            <SectionLabel icon="📦" label="Bundle products" />

            <div className="col-span-2">
              <MultiVariantSelect
                label="Bundle Variants * (select all that apply)"
                helperText="Select all variants that must be in the cart together."
                selectedIds={bundleIds}
                variantOptions={variantOptions}
                onChange={(ids) =>
                  updateField("bundle_variant_ids", ids.join(","))
                }
                fieldBase={fieldBase}
                labelBase={labelBase}
              />
            </div>

            <SectionLabel icon="₹" label="Bundle pricing" />

            <div>
              <label className={labelBase}>Bundle Price (₹) *</label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountFields.bundle_price ?? ""}
                  onChange={(e) =>
                    updateField("bundle_price", e.target.value)
                  }
                  placeholder="e.g. 799"
                  className={fieldBase + " pl-7"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </span>
              </div>
              <HelperText>Final price when all bundle items are in cart.</HelperText>
            </div>

            <div>
              <label className={labelBase}>Bundle Discount Type</label>
              <Select
                value={discountFields.bundle_discount_type ?? "fixed_price"}
                onValueChange={(v) =>
                  updateField("bundle_discount_type", v)
                }
              >
                <SelectTrigger className={`${fieldBase} w-full`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed_price">
                    Fixed bundle price
                  </SelectItem>
                  <SelectItem value="percentage_off">
                    Percentage off bundle
                  </SelectItem>
                  <SelectItem value="amount_off">
                    Amount off bundle
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {discountFields.bundle_discount_type === "percentage_off" && (
              <div>
                <label className={labelBase}>Bundle Discount (%)</label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={discountFields.bundle_discount_pct ?? ""}
                    onChange={(e) =>
                      updateField("bundle_discount_pct", e.target.value)
                    }
                    placeholder="e.g. 15"
                    className={fieldBase + " pr-8"}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                    %
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className={labelBase}>Require All Items?</label>
              <Select
                value={
                  discountFields.bundle_require_all !== false
                    ? "yes"
                    : "no"
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
                    Yes — all selected variants must be in cart
                  </SelectItem>
                  <SelectItem value="no">
                    No — discount triggers with any subset
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SectionLabel icon="🔁" label="Usage limits" />

            <div>
              <label className={labelBase}>Max Uses (total)</label>
              <Input
                type="number"
                value={discountFields.max_uses ?? ""}
                onChange={(e) => updateField("max_uses", e.target.value)}
                placeholder="Optional"
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
      </div>
    </div>
  );
}