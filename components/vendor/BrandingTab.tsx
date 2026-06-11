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

interface ThemePreset {
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  navbar_bg: string;
  navbar_fg: string;
  footer_bg: string;
  footer_fg: string;
  card_style: "standard" | "glassmorphic";
  border_radius: "none" | "sm" | "md" | "lg" | "xl" | "full";
}
const HOME_SECTION_FIELDS: { key: string; label: string; desc: string }[] = [
  {
    key: "hero",
    label: "Interactive Hero Banner",
    desc: "Promotional slider or video background",
  },
  {
    key: "lookbook",
    label: "Shoppable Lookbook",
    desc: "Image with interactive hotspots",
  },
  {
    key: "scarcity",
    label: "Scarcity & Urgency Timer",
    desc: "Flash sales countdown and active promo alerts",
  },
  {
    key: "social_proof",
    label: "Trust & Social Proof",
    desc: "Customer testimonials slider and trust badges",
  },
  {
    key: "curated",
    label: "Curated Discovery Slider",
    desc: "Horizontal scrollable product showcase lists",
  },
  {
    key: "categories",
    label: "Shop Categories Grid",
    desc: "Grid layout of shop categories",
  },
  {
    key: "products",
    label: "Featured Products Grid",
    desc: "Grid layout of featured master products",
  },
  {
    key: "promo",
    label: "Middle Promo Card",
    desc: "Mid-page promotional banner card",
  },
  {
    key: "new_arrivals",
    label: "New Arrivals Block",
    desc: "Showcase of recently launched items",
  },
  {
    key: "newsletter",
    label: "Newsletter Subscription Banner",
    desc: "Signup banner at the footer area",
  },
];
const PRESETS: ThemePreset[] = [
  {
    name: "Techsonance Classic",
    primary_color: "#2563eb",
    secondary_color: "#4f46e5",
    accent_color: "#3b82f6",
    background_color: "#f8fafc",
    text_color: "#0f172a",
    navbar_bg: "#ffffff",
    navbar_fg: "#0f172a",
    footer_bg: "#0f172a",
    footer_fg: "#ffffff",
    card_style: "standard",
    border_radius: "md",
  },
  {
    name: "Emerald Eco",
    primary_color: "#059669",
    secondary_color: "#10b981",
    accent_color: "#34d399",
    background_color: "#f0fdf4",
    text_color: "#064e3b",
    navbar_bg: "#ffffff",
    navbar_fg: "#064e3b",
    footer_bg: "#064e3b",
    footer_fg: "#ffffff",
    card_style: "standard",
    border_radius: "lg",
  },
  {
    name: "Sunset Orange",
    primary_color: "#ea580c",
    secondary_color: "#f97316",
    accent_color: "#fb923c",
    background_color: "#fff7ed",
    text_color: "#431407",
    navbar_bg: "#ffffff",
    navbar_fg: "#431407",
    footer_bg: "#431407",
    footer_fg: "#ffffff",
    card_style: "standard",
    border_radius: "md",
  },
  {
    name: "Midnight Premium",
    primary_color: "#3b82f6",
    secondary_color: "#60a5fa",
    accent_color: "#93c5fd",
    background_color: "#0f172a",
    text_color: "#f8fafc",
    navbar_bg: "#1e293b",
    navbar_fg: "#f8fafc",
    footer_bg: "#0f172a",
    footer_fg: "#f8fafc",
    card_style: "glassmorphic",
    border_radius: "xl",
  },
  {
    name: "Luxury Rose",
    primary_color: "#be185d",
    secondary_color: "#db2777",
    accent_color: "#f472b6",
    background_color: "#fdf2f8",
    text_color: "#500724",
    navbar_bg: "#ffffff",
    navbar_fg: "#500724",
    footer_bg: "#500724",
    footer_fg: "#ffffff",
    card_style: "glassmorphic",
    border_radius: "full",
  },
];

export function BrandingTab({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [files, setFiles] = useState<Record<string, File>>({});

  const applyPreset = (preset: ThemePreset) => {
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

  const FONT_OPTIONS = [
    "Inter",
    "Plus Jakarta Sans",
    "DM Sans",
    "Outfit",
    "Nunito",
    "Poppins",
    "Raleway",
    "Lato",
    "Source Sans Pro",
    "IBM Plex Sans",
  ];

  const SECTION_LABELS: Record<string, string> = {
    hero: "Interactive Hero Banner",
    lookbook: "Shoppable Lookbook (Hotspots)",
    scarcity: "Scarcity & Urgency (Countdown)",
    social_proof: "Trust & Social Proof (Testimonials)",
    curated: "Curated Discovery Slider",
    categories: "Shop Categories Grid",
    products: "Featured Products Grid",
    promo: "Middle Promo Card",
    new_arrivals: "New Arrivals Block",
    newsletter: "Newsletter Subscription Banner",
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 pb-10 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-[70vh] overflow-y-auto pr-2"
    >
      {/* Logos section */}
      <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
          Logos & Brand Assets
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <LogoUploadField
            label="Primary Logo"
            fieldName="logo"
            value={watch("logo_url")}
            onFileSelect={(name, file) =>
              setFiles((prev) => ({ ...prev, [name]: file }))
            }
            hint="Used in headers and invoices"
          />
          <LogoUploadField
            label="Dark Variant"
            fieldName="logo_dark"
            value={watch("logo_dark_url")}
            onFileSelect={(name, file) =>
              setFiles((prev) => ({ ...prev, [name]: file }))
            }
            hint="For dark-themed PDF documents"
          />
          <LogoUploadField
            label="Watermark"
            fieldName="watermark"
            value={watch("watermark_url")}
            onFileSelect={(name, file) =>
              setFiles((prev) => ({ ...prev, [name]: file }))
            }
            hint="Faint stamp printed behind content"
          />
          <LogoUploadField
            label="Favicon"
            fieldName="favicon"
            value={watch("favicon_url")}
            onFileSelect={(name, file) =>
              setFiles((prev) => ({ ...prev, [name]: file }))
            }
            hint="Appears on browser tabs/emails"
          />
        </div>
      </section>

      {/* Colors Section */}
      <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
          Color Theme Customization
        </h3>

        <div className="border-b border-gray-100 pb-4">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2.5">
            Quick Style Presets
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
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
            Accent Palette
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ColorField
              label="Primary Accent"
              value={primaryColor || ""}
              onChange={(v) => setValue("primary_color", v)}
              error={errors.primary_color?.message}
            />
            <ColorField
              label="Secondary Accent"
              value={secondaryColor || ""}
              onChange={(v) => setValue("secondary_color", v)}
              error={errors.secondary_color?.message}
            />
            <ColorField
              label="Accent Color"
              value={accentColor || ""}
              onChange={(v) => setValue("accent_color", v)}
              error={errors.accent_color?.message}
            />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Layout Background & Text
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorField
              label="Page Background Color"
              value={backgroundColor || ""}
              onChange={(v) => setValue("background_color", v)}
              error={errors.background_color?.message}
            />
            <ColorField
              label="Text Color"
              value={textColor || ""}
              onChange={(v) => setValue("text_color", v)}
              error={errors.text_color?.message}
            />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Navbar & Footer Palette
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <ColorField
              label="Navbar Background"
              value={navbarBg || ""}
              onChange={(v) => setValue("navbar_bg", v)}
              error={errors.navbar_bg?.message}
            />
            <ColorField
              label="Navbar Text/Foreground"
              value={navbarFg || ""}
              onChange={(v) => setValue("navbar_fg", v)}
              error={errors.navbar_fg?.message}
            />
            <ColorField
              label="Footer Background"
              value={footerBg || ""}
              onChange={(v) => setValue("footer_bg", v)}
              error={errors.footer_bg?.message}
            />
            <ColorField
              label="Footer Text/Foreground"
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
          Storefront Layout & Typography
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Field
            label="Typography Font Family"
            hint="Loaded dynamically on storefront"
          >
            <Select {...register("font_family")}>
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Navbar Position" hint="Header behaviour on scroll">
            <Select {...register("navbar_position")}>
              <option value="sticky">Sticky (Follow scroll)</option>
              <option value="static">Static (Stay at top)</option>
            </Select>
          </Field>

          <Field
            label="Header Logo Alignment"
            hint="Brand positioning in navbar"
          >
            <Select {...register("logo_alignment")}>
              <option value="left">Left Aligned</option>
              <option value="center">Center Aligned</option>
            </Select>
          </Field>

          <Field label="Footer Style" hint="Amount of details in footer">
            <Select {...register("footer_style")}>
              <option value="detailed">Detailed Multi-Column</option>
              <option value="simple">Simple Center Row</option>
            </Select>
          </Field>

          <Field label="Border Radius" hint="Curves on buttons, inputs & cards">
            <Select {...register("border_radius")}>
              <option value="none">Sharp Corners (0px)</option>
              <option value="sm">Small (4px)</option>
              <option value="md">Medium (8px)</option>
              <option value="lg">Large (12px)</option>
              <option value="xl">Extra Large (16px)</option>
              <option value="full">Rounded / Pill (24px)</option>
            </Select>
          </Field>

          <Field label="Card Display Style" hint="Aesthetic styling of cards">
            <Select {...register("card_style")}>
              <option value="standard">Standard Flat Bordered</option>
              <option value="glassmorphic">Glassmorphic Blur</option>
            </Select>
          </Field>
        </div>
      </section>

      {/* Homepage Sections Manager */}
      <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
            Homepage Section Manager
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Toggle which modular sections are active on your home page, and
            order them to design your custom landing page.
          </p>
        </div>

        <div className="space-y-3 max-w-2xl">
          {HOME_SECTION_FIELDS.map((section) => {
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
                        Active (Pos: {activeIdx + 1})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[9px] font-black tracking-wider uppercase bg-gray-200/50 text-gray-500 rounded-md">
                        Inactive
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
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItemByKey(section.key, "down")}
                        disabled={activeIdx === homepageLayout.length - 1}
                        className="p-1.5 rounded bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 shadow-sm transition-all cursor-pointer"
                        title="Move Down"
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
