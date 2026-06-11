"use client";
import { brandingSchema } from "@/utils/validation";
import {
  fetchCompanyBranding,
  upsertCompanyBranding,
} from "@/utils/vendorApiClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { LogoUploadField } from "./LogoUploadField";
import { ColorField } from "./ColorField";
import { Field } from "./Field";
import { Select } from "./Select";
import { SaveButton } from "./SaveButton";
import { z } from "zod";
import { ArrowUp, ArrowDown } from "lucide-react";
import { BRANDING_TAB_TEXT } from "@/constants/vendorText";

// Replaced constants

export function BrandingTab({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [files, setFiles] = useState<Record<string, File>>({});

  const applyPreset = (preset: any) => {
    setValue("primary_color", preset.primary_color);
    setValue("secondary_color", preset.secondary_color);
    setValue("accent_color", preset.accent_color);
    setValue("background_color", preset.background_color);
    setValue("text_color", preset.text_color);
    setValue("navbar_bg", preset.navbar_bg);
    setValue("navbar_fg", preset.navbar_fg);
    setValue("footer_bg", preset.footer_bg);
    setValue("footer_fg", preset.footer_fg);
    setValue("card_style", preset.card_style);
    setValue("border_radius", preset.border_radius);
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      primary_color: "#000000",
      secondary_color: "",
      accent_color: "",
      font_family: "Inter",
      background_color: "#f8fafc",
      text_color: "#0f172a",
      navbar_bg: "#ffffff",
      navbar_fg: "#0f172a",
      footer_bg: "#0f172a",
      footer_fg: "#ffffff",
      navbar_position: "sticky",
      logo_alignment: "left",
      footer_style: "detailed",
      border_radius: "md",
      card_style: "standard",
      homepage_layout: [
        "hero",
        "categories",
        "products",
        "promo",
        "new_arrivals",
        "newsletter",
      ],
    },
  });

  const homepageLayout = watch("homepage_layout") || [];

  useEffect(() => {
    fetchCompanyBranding(token).then((res) => {
      const d = res?.data?.data ?? res?.data;
      if (d && typeof d === "object") {
        setValue("primary_color", d.primary_color || "#000000");
        setValue("secondary_color", d.secondary_color || "");
        setValue("accent_color", d.accent_color || "");
        setValue("font_family", d.font_family || "Inter");
        setValue("logo_url", d.logo_url || "");
        setValue("logo_dark_url", d.logo_dark_url || "");
        setValue("watermark_url", d.watermark_url || "");
        setValue("favicon_url", d.favicon_url || "");
        setValue("background_color", d.background_color || "#f8fafc");
        setValue("text_color", d.text_color || "#0f172a");
        setValue("navbar_bg", d.navbar_bg || "#ffffff");
        setValue("navbar_fg", d.navbar_fg || "#0f172a");
        setValue("footer_bg", d.footer_bg || "#0f172a");
        setValue("footer_fg", d.footer_fg || "#ffffff");
        setValue("navbar_position", d.navbar_position || "sticky");
        setValue("logo_alignment", d.logo_alignment || "left");
        setValue("footer_style", d.footer_style || "detailed");
        setValue("border_radius", d.border_radius || "md");
        setValue("card_style", d.card_style || "standard");
        setValue(
          "homepage_layout",
          d.homepage_layout || [
            "hero",
            "categories",
            "products",
            "promo",
            "new_arrivals",
            "newsletter",
          ],
        );
      }
    });
  }, [token, setValue]);

  const onSubmit = (data: z.infer<typeof brandingSchema>) => {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          if (Array.isArray(v)) {
            fd.append(k, JSON.stringify(v));
          } else {
            fd.append(k, v as string);
          }
        }
      });
      Object.entries(files).forEach(([k, v]) => fd.append(k, v));
      const res = await upsertCompanyBranding(fd, token);
      if (res?.status === 200 || res?.status === 201 || res?.ok) {
        // Refresh local storefront cache if necessary
        try {
          localStorage.removeItem("techsonance_cms_theme");
        } catch (e) {}
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const layout = [...homepageLayout];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < layout.length) {
      const temp = layout[index];
      layout[index] = layout[targetIndex];
      layout[targetIndex] = temp;
      setValue("homepage_layout", layout);
    }
  };

  const primaryColor = watch("primary_color");
  const secondaryColor = watch("secondary_color");
  const accentColor = watch("accent_color");
  const backgroundColor = watch("background_color");
  const textColor = watch("text_color");
  const navbarBg = watch("navbar_bg");
  const navbarFg = watch("navbar_fg");
  const footerBg = watch("footer_bg");
  const footerFg = watch("footer_fg");

// Replaced FONT_OPTIONS and SECTION_LABELS

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 pb-10 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-[70vh] overflow-y-auto pr-2"
    >
      <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
          {BRANDING_TAB_TEXT.SECTIONS.LOGOS}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <LogoUploadField
            label={BRANDING_TAB_TEXT.FIELDS.PRIMARY_LOGO_LBL}
            fieldName="logo"
            value={watch("logo_url")}
            onFileSelect={(name, file) =>
              setFiles((prev) => ({ ...prev, [name]: file }))
            }
            hint={BRANDING_TAB_TEXT.FIELDS.PRIMARY_LOGO_HINT}
          />
          <LogoUploadField
            label={BRANDING_TAB_TEXT.FIELDS.DARK_VARIANT_LBL}
            fieldName="logo_dark"
            value={watch("logo_dark_url")}
            onFileSelect={(name, file) =>
              setFiles((prev) => ({ ...prev, [name]: file }))
            }
            hint={BRANDING_TAB_TEXT.FIELDS.DARK_VARIANT_HINT}
          />
          <LogoUploadField
            label={BRANDING_TAB_TEXT.FIELDS.WATERMARK_LBL}
            fieldName="watermark"
            value={watch("watermark_url")}
            onFileSelect={(name, file) =>
              setFiles((prev) => ({ ...prev, [name]: file }))
            }
            hint={BRANDING_TAB_TEXT.FIELDS.WATERMARK_HINT}
          />
          <LogoUploadField
            label={BRANDING_TAB_TEXT.FIELDS.FAVICON_LBL}
            fieldName="favicon"
            value={watch("favicon_url")}
            onFileSelect={(name, file) =>
              setFiles((prev) => ({ ...prev, [name]: file }))
            }
            hint={BRANDING_TAB_TEXT.FIELDS.FAVICON_HINT}
          />
        </div>
      </section>

      {/* Colors Section */}
      <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
          {BRANDING_TAB_TEXT.SECTIONS.COLORS}
        </h3>

        <div className="border-b border-gray-100 pb-4">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2.5">
            {BRANDING_TAB_TEXT.FIELDS.QUICK_PRESETS}
          </span>
          <div className="flex flex-wrap gap-2">
            {BRANDING_TAB_TEXT.PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/20 text-xs font-bold text-gray-700 transition-all cursor-pointer"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                  style={{ backgroundColor: preset.primary_color }}
                />
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {BRANDING_TAB_TEXT.FIELDS.ACCENT_PALETTE}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ColorField
              label={BRANDING_TAB_TEXT.FIELDS.PRIMARY_ACCENT}
              value={primaryColor || ""}
              onChange={(v) => setValue("primary_color", v)}
              error={errors.primary_color?.message}
            />
            <ColorField
              label={BRANDING_TAB_TEXT.FIELDS.SECONDARY_ACCENT}
              value={secondaryColor || ""}
              onChange={(v) => setValue("secondary_color", v)}
              error={errors.secondary_color?.message}
            />
            <ColorField
              label={BRANDING_TAB_TEXT.FIELDS.ACCENT_COLOR}
              value={accentColor || ""}
              onChange={(v) => setValue("accent_color", v)}
              error={errors.accent_color?.message}
            />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {BRANDING_TAB_TEXT.FIELDS.LAYOUT_BG_TEXT}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorField
              label={BRANDING_TAB_TEXT.FIELDS.PAGE_BG_COLOR}
              value={backgroundColor || ""}
              onChange={(v) => setValue("background_color", v)}
              error={errors.background_color?.message}
            />
            <ColorField
              label={BRANDING_TAB_TEXT.FIELDS.TEXT_COLOR}
              value={textColor || ""}
              onChange={(v) => setValue("text_color", v)}
              error={errors.text_color?.message}
            />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {BRANDING_TAB_TEXT.FIELDS.NAVBAR_FOOTER_PALETTE}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <ColorField
              label={BRANDING_TAB_TEXT.FIELDS.NAVBAR_BG}
              value={navbarBg || ""}
              onChange={(v) => setValue("navbar_bg", v)}
              error={errors.navbar_bg?.message}
            />
            <ColorField
              label={BRANDING_TAB_TEXT.FIELDS.NAVBAR_FG}
              value={navbarFg || ""}
              onChange={(v) => setValue("navbar_fg", v)}
              error={errors.navbar_fg?.message}
            />
            <ColorField
              label={BRANDING_TAB_TEXT.FIELDS.FOOTER_BG}
              value={footerBg || ""}
              onChange={(v) => setValue("footer_bg", v)}
              error={errors.footer_bg?.message}
            />
            <ColorField
              label={BRANDING_TAB_TEXT.FIELDS.FOOTER_FG}
              value={footerFg || ""}
              onChange={(v) => setValue("footer_fg", v)}
              error={errors.footer_fg?.message}
            />
          </div>
        </div>
      </section>

      {/* Typography & Layout Selection */}
      <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
          {BRANDING_TAB_TEXT.SECTIONS.TYPOGRAPHY}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Field
            label={BRANDING_TAB_TEXT.FIELDS.TYPO_FONT_FAMILY}
            hint={BRANDING_TAB_TEXT.FIELDS.TYPO_HINT}
          >
            <Select {...register("font_family")}>
              {BRANDING_TAB_TEXT.FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={BRANDING_TAB_TEXT.FIELDS.NAVBAR_POS} hint={BRANDING_TAB_TEXT.FIELDS.NAVBAR_POS_HINT}>
            <Select {...register("navbar_position")}>
              <option value="sticky">{BRANDING_TAB_TEXT.FIELDS.NAVBAR_STICKY}</option>
              <option value="static">{BRANDING_TAB_TEXT.FIELDS.NAVBAR_STATIC}</option>
            </Select>
          </Field>

          <Field
            label={BRANDING_TAB_TEXT.FIELDS.LOGO_ALIGN}
            hint={BRANDING_TAB_TEXT.FIELDS.LOGO_ALIGN_HINT}
          >
            <Select {...register("logo_alignment")}>
              <option value="left">{BRANDING_TAB_TEXT.FIELDS.LEFT_ALIGNED}</option>
              <option value="center">{BRANDING_TAB_TEXT.FIELDS.CENTER_ALIGNED}</option>
            </Select>
          </Field>

          <Field label={BRANDING_TAB_TEXT.FIELDS.FOOTER_STYLE} hint={BRANDING_TAB_TEXT.FIELDS.FOOTER_STYLE_HINT}>
            <Select {...register("footer_style")}>
              <option value="detailed">{BRANDING_TAB_TEXT.FIELDS.DETAILED_FOOTER}</option>
              <option value="simple">{BRANDING_TAB_TEXT.FIELDS.SIMPLE_FOOTER}</option>
            </Select>
          </Field>

          <Field label={BRANDING_TAB_TEXT.FIELDS.BORDER_RADIUS} hint={BRANDING_TAB_TEXT.FIELDS.BORDER_RADIUS_HINT}>
            <Select {...register("border_radius")}>
              <option value="none">{BRANDING_TAB_TEXT.FIELDS.SHARP_CORNERS}</option>
              <option value="sm">{BRANDING_TAB_TEXT.FIELDS.SMALL_CORNERS}</option>
              <option value="md">{BRANDING_TAB_TEXT.FIELDS.MEDIUM_CORNERS}</option>
              <option value="lg">{BRANDING_TAB_TEXT.FIELDS.LARGE_CORNERS}</option>
              <option value="xl">{BRANDING_TAB_TEXT.FIELDS.XL_CORNERS}</option>
              <option value="full">{BRANDING_TAB_TEXT.FIELDS.ROUNDED_CORNERS}</option>
            </Select>
          </Field>

          <Field label={BRANDING_TAB_TEXT.FIELDS.CARD_STYLE} hint={BRANDING_TAB_TEXT.FIELDS.CARD_STYLE_HINT}>
            <Select {...register("card_style")}>
              <option value="standard">{BRANDING_TAB_TEXT.FIELDS.STANDARD_CARD}</option>
              <option value="glassmorphic">{BRANDING_TAB_TEXT.FIELDS.GLASSMORPHIC_CARD}</option>
            </Select>
          </Field>
        </div>
      </section>

      {/* Homepage Sections Manager */}
      <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
            {BRANDING_TAB_TEXT.SECTIONS.HOMEPAGE}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {BRANDING_TAB_TEXT.FIELDS.HOMEPAGE_DESC}
          </p>
        </div>

        <div className="space-y-3 max-w-2xl">
          {BRANDING_TAB_TEXT.HOME_SECTION_FIELDS.map((section) => {
            const isEnabled = homepageLayout.includes(section.key);
            const activeIdx = homepageLayout.indexOf(section.key);

            const toggleSection = (key: string) => {
              const layout = [...homepageLayout];
              const idx = layout.indexOf(key);
              if (idx > -1) {
                layout.splice(idx, 1);
              } else {
                layout.push(key);
              }
              setValue("homepage_layout", layout);
            };

            const moveItemByKey = (key: string, direction: "up" | "down") => {
              const layout = [...homepageLayout];
              const idx = layout.indexOf(key);
              if (idx === -1) return;
              const targetIdx = direction === "up" ? idx - 1 : idx + 1;
              if (targetIdx >= 0 && targetIdx < layout.length) {
                const temp = layout[idx];
                layout[idx] = layout[targetIdx];
                layout[targetIdx] = temp;
                setValue("homepage_layout", layout);
              }
            };

            return (
              <div
                key={section.key}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  isEnabled
                    ? "bg-blue-50/10 border-blue-100 shadow-sm"
                    : "bg-gray-50/50 border-gray-200 opacity-60"
                }`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-gray-800">
                      {section.label}
                    </span>
                    {isEnabled ? (
                      <span className="px-2 py-0.5 text-[9px] font-black tracking-wider uppercase bg-green-500/10 text-green-600 border border-green-500/25 rounded-md">
                        {BRANDING_TAB_TEXT.FIELDS.ACTIVE_POS}{activeIdx + 1})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[9px] font-black tracking-wider uppercase bg-gray-200/50 text-gray-500 rounded-md">
                        {BRANDING_TAB_TEXT.FIELDS.INACTIVE}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {section.desc}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Reordering Controls */}
                  {isEnabled && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveItemByKey(section.key, "up")}
                        disabled={activeIdx === 0}
                        className="p-1.5 rounded bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 shadow-sm transition-all cursor-pointer"
                        title={BRANDING_TAB_TEXT.FIELDS.MOVE_UP}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItemByKey(section.key, "down")}
                        disabled={activeIdx === homepageLayout.length - 1}
                        className="p-1.5 rounded bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 shadow-sm transition-all cursor-pointer"
                        title={BRANDING_TAB_TEXT.FIELDS.MOVE_DOWN}
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  )}

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                      isEnabled ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        isEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <SaveButton isPending={isPending} saved={saved} />
      </div>
    </form>
  );
}
