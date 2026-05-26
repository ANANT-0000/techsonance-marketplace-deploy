"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Image as ImageIcon,
  Layout,
  X,
  Loader2,
  Save,
  ToggleLeft,
  ToggleRight,
  Info,
  Calendar,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AxiosAPI from "@/lib/axios";
import { Input } from "@/components/vendor/Input";
import { Textarea } from "@/components/vendor/TextArea";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { bannerSchema } from "@/utils/validation";
import { authToken } from "@/utils/authToken";
import { useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";

// ─────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────
export enum BannerPlacement {
  HOMEPAGE_HERO       = "homepage_hero",
  HOMEPAGE_SECONDARY  = "homepage_secondary",
  CATEGORY_TOP        = "category_top",
  PRODUCT_PAGE        = "product_page",
  CART_SIDEBAR        = "cart_sidebar",
  CHECKOUT_TOP        = "checkout_top",
  MY_OFFERS_PAGE      = "my_offers_page",
}

// Human-readable labels + recommended image dimensions per placement
const PLACEMENT_META: Record<
  BannerPlacement,
  { label: string; desktopSize: string; mobileSize: string; description: string }
> = {
  [BannerPlacement.HOMEPAGE_HERO]:      { label: "Homepage — Hero",       desktopSize: "1440×500", mobileSize: "768×400",  description: "Full-width hero banner at the top of the home page." },
  [BannerPlacement.HOMEPAGE_SECONDARY]: { label: "Homepage — Secondary",  desktopSize: "1440×300", mobileSize: "768×250",  description: "Below-fold secondary banner strip on the home page." },
  [BannerPlacement.CATEGORY_TOP]:       { label: "Category — Top",        desktopSize: "1200×200", mobileSize: "768×160",  description: "Top banner shown on category listing pages." },
  [BannerPlacement.PRODUCT_PAGE]:       { label: "Product Page",          desktopSize: "800×200",  mobileSize: "375×150",  description: "Inline banner shown on individual product pages." },
  [BannerPlacement.CART_SIDEBAR]:       { label: "Cart — Sidebar",        desktopSize: "300×400",  mobileSize: "375×200",  description: "Sidebar slot displayed in the shopping cart." },
  [BannerPlacement.CHECKOUT_TOP]:       { label: "Checkout — Top",        desktopSize: "1200×120", mobileSize: "768×100",  description: "Slim banner above the checkout flow." },
  [BannerPlacement.MY_OFFERS_PAGE]:     { label: "My Offers Page",        desktopSize: "1440×300", mobileSize: "768×250",  description: "Banner shown on the customer's offers/deals page." },
};

const HEADLINE_MAX    = 80;
const SUBHEADLINE_MAX = 180;

interface PromotionOption { id: string; name: string; }

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const fieldBase =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-white";
const labelBase =
  "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5";
const sectionContainer =
  "border border-gray-100 rounded-2xl p-5 bg-gray-50/50";
const sectionTitle =
  "w-full flex items-center gap-2 mb-4 font-bold text-sm text-gray-800";
const errorText = "mt-1 text-xs text-red-500";

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Pill showing recommended image dimensions */
function DimensionBadge({ size, label }: { size: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
      <ImageIcon size={10} />
      {label}: {size}
    </span>
  );
}

/** Character counter — turns red when near limit */
function CharCount({ current, max }: { current: number; max: number }) {
  const near = current >= max * 0.85;
  const over = current > max;
  return (
    <span
      className={`text-xs ${
        over ? "text-red-500 font-semibold" : near ? "text-amber-500" : "text-gray-400"
      }`}
    >
      {current}/{max}
    </span>
  );
}

/** Toggle switch for boolean fields */
function ToggleField({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean | undefined;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-start gap-3   text-left"
    >
      {checked ? (
        <ToggleRight size={28} className="text-blue-500 flex-shrink-0" />
      ) : (
        <ToggleLeft size={28} className="text-gray-300 flex-shrink-0" />
      )}
      <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {description && (
          <p className="text-xs text-gray-400">{description}</p>
        )}
      </div>
    </button>
  );
}

/** Image drop zone / preview card */
function ImageSlot({
  label,
  preview,
  onFile,
  onRemove,
  desktopSize,
  mobileSize,
  dimensionLabel,
}: {
  label: string;
  preview: string | null;
  onFile: (file: File) => void;
  onRemove: () => void;
  desktopSize?: string;
  mobileSize?: string;
  dimensionLabel: "Desktop" | "Mobile";
}) {
  const size = dimensionLabel === "Desktop" ? desktopSize : mobileSize;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className={labelBase}>{label}</label>
        {size && <DimensionBadge size={size} label={dimensionLabel} />}
      </div>

      {!preview ? (
        <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
          <div className="p-2 bg-gray-100 rounded-full mb-2 group-hover:bg-blue-100 transition-colors">
            <ImageIcon className="text-gray-400 group-hover:text-blue-500 transition-colors" size={20} />
          </div>
          <span className="text-xs font-semibold text-gray-500 group-hover:text-blue-600 transition-colors">
            Click to upload
          </span>
          <span className="text-[11px] text-gray-400 mt-0.5">
            PNG, JPG, WebP · max 5 MB
          </span>
          <input
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
            }}
          />
        </label>
      ) : (
        <div className="relative h-36 rounded-xl overflow-hidden border border-gray-200 group shadow-sm">
          <img
            src={preview}
            alt={`${label} preview`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
            title="Remove image"
          >
            <X size={13} />
          </button>
          <span className="absolute bottom-2 left-2 text-[11px] bg-black/50 text-white px-2 py-0.5 rounded-full">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function BannerForm() {
  const bannerId     = useSearchParams().get("id");
  const router       = useRouter();
  const isEdit       = !!bannerId;
  const token        = authToken();

  const { user } = useAppSelector((state: RootState) => state.auth);
  const userId =
    user && "user_id" in user
      ? user.user_id
      : user && "id" in user
      ? user.id
      : "";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      placement:        BannerPlacement.HOMEPAGE_HERO,
      promotion_id:     "",
      is_active:        true,
      display_order:    0,
      image_alt_text:   "",
      headline:         "",
      sub_headline:     "",
      cta_label:        "",
      cta_url:          "",
      valid_from:       "",
      valid_to:         "",
      // internal image-removal flags
      remove_image_url:        false,
      remove_image_url_mobile: false,
    },
  });

  const [loading,          setLoading]          = useState(false);
  const [fetching,         setFetching]         = useState(false);
  const [promotionOptions, setPromotionOptions] = useState<PromotionOption[]>([]);

  // Previews stored as object URLs (blobs) or server URLs
  const [previews, setPreviews] = useState<{
    desktop: string | null;
    mobile:  string | null;
  }>({ desktop: null, mobile: null });

  // Track which previews are blob URLs so we can revoke them on cleanup
  const blobUrls = useRef<Set<string>>(new Set());

  const watchedHeadline    = watch("headline")    ?? "";
  const watchedSubheadline = watch("sub_headline") ?? "";
  const watchedPlacement   = watch("placement") as BannerPlacement;
  const watchedIsActive    = watch("is_active");
  const placementMeta      = PLACEMENT_META[watchedPlacement] ?? PLACEMENT_META[BannerPlacement.HOMEPAGE_HERO];

  // ── Fetch promotions ──
  useEffect(() => {
    (async () => {
      try {
        const { data } = await AxiosAPI.get("/v1/promotions/options");
        setPromotionOptions(data.data ?? []);
      } catch {
        toast.error("Failed to load promotion options");
      }
    })();
  }, []);

  // ── Fetch existing banner for edit ──
  const fetchBanner = useCallback(async () => {
    if (!isEdit) return;
    setFetching(true);
    try {
      const { data } = await AxiosAPI.get(`/v1/banners/${bannerId}`);
      // Reset form with server data — image_url fields come back as strings (server URLs)
      reset({
        placement:      data.placement,
        promotion_id:   data.promotion_id ?? "",
        is_active:      data.is_active ?? true,
        display_order:  data.display_order ?? 0,
        image_alt_text: data.image_alt_text ?? "",
        headline:       data.headline ?? "",
        sub_headline:   data.sub_headline ?? "",
        cta_label:      data.cta_label ?? "",
        cta_url:        data.cta_url ?? "",
        valid_from:     data.valid_from ? new Date(data.valid_from).toISOString().slice(0, 16) : "",
        valid_to:       data.valid_to   ? new Date(data.valid_to).toISOString().slice(0, 16)   : "",
        remove_image_url:        false,
        remove_image_url_mobile: false,
      });
      setPreviews({
        desktop: data.image_url        ?? null,
        mobile:  data.image_url_mobile ?? null,
      });
    } catch {
      toast.error("Failed to load banner");
    } finally {
      setFetching(false);
    }
  }, [bannerId, isEdit, reset]);

  useEffect(() => { fetchBanner(); }, [fetchBanner]);

  // ── Cleanup blob URLs on unmount ──
  useEffect(() => {
    const blobs = blobUrls.current;
    return () => { blobs.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);

  // ── Image handlers ──
  const handleFileChange = (file: File, key: "desktop" | "mobile") => {
    // Revoke previous blob if one exists
    const current = previews[key];
    if (current && blobUrls.current.has(current)) {
      URL.revokeObjectURL(current);
      blobUrls.current.delete(current);
    }
    const url = URL.createObjectURL(file);
    blobUrls.current.add(url);
    setPreviews((p) => ({ ...p, [key]: url }));
    setValue(
      key === "desktop" ? "image_url" : "image_url_mobile",
      file as any
    );
    // Clear any removal flag
    setValue(
      key === "desktop" ? "remove_image_url" : "remove_image_url_mobile",
      false
    );
  };

  const removeImage = (key: "desktop" | "mobile") => {
    const current = previews[key];
    if (current && blobUrls.current.has(current)) {
      URL.revokeObjectURL(current);
      blobUrls.current.delete(current);
    }
    setPreviews((p) => ({ ...p, [key]: null }));
    setValue(key === "desktop" ? "image_url" : "image_url_mobile", null as any);
    setValue(
      key === "desktop" ? "remove_image_url" : "remove_image_url_mobile",
      true
    );
  };

  // ── Submit ──
  const onSubmit = async (data: any) => {
    setLoading(true);
    const formData = new FormData();

    if (data.image_url        instanceof File) formData.append("image_url",        data.image_url);
    if (data.image_url_mobile instanceof File) formData.append("image_url_mobile", data.image_url_mobile);

    const payload = { ...data };
    delete payload.image_url;
    delete payload.image_url_mobile;

    // Normalise empty dates to null
    if (!payload.valid_from) payload.valid_from = null;
    if (!payload.valid_to)   payload.valid_to   = null;
    if (!payload.promotion_id) payload.promotion_id = null;

    formData.append("formData", JSON.stringify(payload));

    try {
      if (isEdit) {
        await AxiosAPI.patch(`/v1/banners/${bannerId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Banner updated");
      } else {
        await AxiosAPI.post(`/v1/banners/${userId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Banner created");
      }
      router.back();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save banner");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  if (fetching)
    return (
      <div className="p-20 text-center">
        <Loader2 className="animate-spin mx-auto text-blue-600" />
      </div>
    );

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
            <Layout size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">
              {isEdit ? "Edit Banner" : "Create New Banner"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Define placement, visual assets, and content for your banner.
            </p>
          </div>
        </div>

        {/* Active toggle — prominent in header */}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Placement & Promotion ── */}
        <section className={sectionContainer}>
          <div className={sectionTitle}>
            <Tag size={16} /> Placement &amp; Promotion
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Placement */}
            <div>
              <label className={labelBase}>Placement *</label>
              <Controller
                name="placement"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={fieldBase}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(BannerPlacement).map((p) => (
                        <SelectItem key={p} value={p}>
                          {PLACEMENT_META[p as BannerPlacement].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.placement && (
                <p className={errorText}>{String(errors.placement.message)}</p>
              )}
              {/* Placement hint */}
              <p className="mt-1.5 text-xs text-gray-400 flex items-start gap-1">
                <Info size={11} className="mt-0.5 flex-shrink-0" />
                {placementMeta.description}
              </p>
            </div>

            {/* Promotion */}
            <div>
              <label className={labelBase}>Linked Promotion</label>
              <Controller
                name="promotion_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) =>
                      field.onChange(v === "__none__" ? "" : v)
                    }
                  >
                    <SelectTrigger className={fieldBase}>
                      <SelectValue placeholder="No linked promotion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">
                        <span className="text-gray-400">
                          No linked promotion
                        </span>
                      </SelectItem>
                      {promotionOptions.length === 0 ? (
                        <SelectItem value="__loading__" disabled>
                          Loading…
                        </SelectItem>
                      ) : (
                        promotionOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.promotion_id && (
                <p className={errorText}>
                  {String(errors.promotion_id.message)}
                </p>
              )}
              <p className="mt-1.5 text-xs text-gray-400 flex items-start gap-1">
                <Info size={11} className="mt-0.5 flex-shrink-0" />
                Clicking the banner CTA will activate this promotion for the
                customer.
              </p>
            </div>

            {/* Display order */}
            <div>
              <label className={labelBase}>Display Order</label>
              <Input
                type="number"
                min={0}
                {...register("display_order", { valueAsNumber: true })}
                className={fieldBase}
                placeholder="0"
              />
              <p className="mt-1 text-xs text-gray-400">
                Lower number = shown first when multiple banners share the
                same placement.
              </p>
              {errors.display_order && (
                <p className={errorText}>
                  {String(errors.display_order.message)}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Schedule ── */}
        <section className={sectionContainer}>
          <div className={ `  ${sectionTitle} justify-between gap-6 items-start `}>
            <div className="flex items-center gap-2">
            <Calendar size={16} /> Schedule

            </div>
<Controller 
          name="is_active"
          control={control}
          render={({ field }) => (
            <ToggleField
              checked={field.value}
              onChange={field.onChange}
              label={field.value ? "Active" : "Inactive"}
              description={
                field.value
                  ? "Banner is live and visible to customers"
                  : "Banner is hidden from customers"
              }
            />
          )}
        />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Show From</label>
              <Input
                type="datetime-local"
                {...register("valid_from")}
                className={fieldBase}
              />
              <p className="mt-1 text-xs text-gray-400">
                Leave blank to show immediately.
              </p>
            </div>
            <div>
              <label className={labelBase}>Show Until</label>
              <Input
                type="datetime-local"
                {...register("valid_to")}
                className={fieldBase}
              />
              <p className="mt-1 text-xs text-gray-400">
                Leave blank for no expiry.
              </p>
            </div>
          </div>
        </section>

        {/* ── Assets ── */}
        <section className={sectionContainer}>
          <div className={sectionTitle}>
            <ImageIcon size={16} /> Assets
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageSlot
              label="Desktop Image"
              preview={previews.desktop}
              onFile={(f) => handleFileChange(f, "desktop")}
              onRemove={() => removeImage("desktop")}
              desktopSize={placementMeta.desktopSize}
              mobileSize={placementMeta.mobileSize}
              dimensionLabel="Desktop"
            />
            <ImageSlot
              label="Mobile Image"
              preview={previews.mobile}
              onFile={(f) => handleFileChange(f, "mobile")}
              onRemove={() => removeImage("mobile")}
              desktopSize={placementMeta.desktopSize}
              mobileSize={placementMeta.mobileSize}
              dimensionLabel="Mobile"
            />
          </div>

          <div className="mt-4">
            <label className={labelBase}>Alt Text</label>
            <Input
              {...register("image_alt_text")}
              className={fieldBase}
              placeholder="Description for screen readers and SEO"
            />
            {errors.image_alt_text && (
              <p className={errorText}>
                {String(errors.image_alt_text.message)}
              </p>
            )}
          </div>
        </section>

        {/* ── Content ── */}
        <section className={sectionContainer}>
          <div className={sectionTitle}>
            <Layout size={16} /> Content
          </div>

          <div className="space-y-4">
            {/* Headline */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelBase + " mb-0"}>Headline</label>
                <CharCount
                  current={watchedHeadline.length}
                  max={HEADLINE_MAX}
                />
              </div>
              <Input
                {...register("headline")}
                className={fieldBase}
                placeholder="e.g. Up to 50% off Summer Essentials"
                maxLength={HEADLINE_MAX}
              />
              {errors.headline && (
                <p className={errorText}>{String(errors.headline.message)}</p>
              )}
            </div>

            {/* Sub-headline */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelBase + " mb-0"}>Sub-headline</label>
                <CharCount
                  current={watchedSubheadline.length}
                  max={SUBHEADLINE_MAX}
                />
              </div>
              <Textarea
                {...register("sub_headline")}
                className={fieldBase}
                rows={2}
                placeholder="Supporting copy shown below the headline"
                maxLength={SUBHEADLINE_MAX}
              />
              {errors.sub_headline && (
                <p className={errorText}>
                  {String(errors.sub_headline.message)}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelBase}>CTA Button Label</label>
                <Input
                  {...register("cta_label")}
                  className={fieldBase}
                  placeholder="e.g. Shop Now"
                />
                {errors.cta_label && (
                  <p className={errorText}>
                    {String(errors.cta_label.message)}
                  </p>
                )}
              </div>
              <div>
                <label className={labelBase}>CTA URL</label>
                <Input
                  {...register("cta_url")}
                  className={fieldBase}
                  placeholder="e.g. /sale or https://…"
                />
                {errors.cta_url && (
                  <p className={errorText}>
                    {String(errors.cta_url.message)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="rounded-xl px-5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 flex items-center gap-2 shadow-md shadow-blue-100"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {loading ? "Saving…" : isEdit ? "Update Banner" : "Create Banner"}
          </Button>
        </div>
      </form>
    </div>
  );
}