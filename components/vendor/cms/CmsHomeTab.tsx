import { CmsDataKey } from "@/constants/cms";

import { CmsSection } from "./Section";
import { AddBtn } from "./AddBtn";

import { HeroBgStyle, HeroLayout } from "@/components/customer/homepage";
import { ListCard } from "./ListCard";
import { InputField } from "./InputField";
import { SelectField } from "./SelectField";
import { UiText } from "@/constants/ui-text";
import { ColorField } from "./ColorField";
import { SlideQueryPicker } from "./SlideQueryPicker";
import { ImageUploadField } from "./ImageUploadField";
import { Trash2, X } from "lucide-react";
import { ProductPreviewCard } from "./ProductPreviewCard";
import { UILabels } from "@/constants/ui-labels";
import { useEffect, useState } from "react";
import AxiosAPI from "@/lib/axios";
import { toDatetimeLocal } from "@/lib/utils";

export const CmsHomeTab = ({
  data,
  set,
  removeItem,
  addItem,
  updateItem,
  makeAutoSave,
  handleImageClick,
  selectedHotspotId,
  setSelectedHotspotId,
}: {
  data: any;
  set: (key: string, val: any) => void;
  removeItem: (key: string, id: string) => void;
  addItem: (key: string, val: any) => void;
  updateItem: (key: string, id: string, field: string, val: any) => void;
  makeAutoSave: (key: string) => (newUrl: string) => Promise<void>;
  handleImageClick: (id: any) => void;
  selectedHotspotId: any;
  setSelectedHotspotId: (id: any) => void;
}) => {
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    AxiosAPI.get("/v1/products/options")
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data?.data ?? []);
        setProducts(list);
      })
      .catch(() => setProducts([]));
  }, []);
  return (
    <>
      <CmsSection
        title={UILabels.SECTIONS.HERO_CAROUSEL_SLIDES}
        action={
          <AddBtn
            onClick={() =>
              addItem(CmsDataKey.HERO_SLIDES, {
                image_url: "",
                title: "",
                subtitle: "",
                btn_text: "Shop Now",
                search_query: "",
                layout: HeroLayout.CENTER_OVERLAY,
                bg_style: HeroBgStyle.GRADIENT,
                bg_color: "",
              })
            }
            label={UILabels.FIELDS.ADD_SLIDE}
          />
        }
      >
        {(data?.[CmsDataKey.HERO_SLIDES] || []).length === 0 && (
          <p className="text-center text-gray-400 text-theme-body-sm py-8">
            {UiText.NO_SLIDES}
          </p>
        )}
        {(data?.[CmsDataKey.HERO_SLIDES] || []).map(
          (slide: any, idx: number) => (
            <ListCard
              key={slide.id}
              onRemove={() => removeItem(CmsDataKey.HERO_SLIDES, slide.id)}
            >
              <div className="md:col-span-2">
                <p className="text-theme-tiny font-bold text-purple-500 uppercase tracking-widest mb-1">
                  Slide {idx + 1}
                </p>
              </div>
              <InputField
                label={UILabels.FIELDS.TITLE}
                value={slide.title || ""}
                onChange={(v: string) =>
                  updateItem(CmsDataKey.HERO_SLIDES, slide.id, "title", v)
                }
              />
              <InputField
                label={UILabels.FIELDS.SUBTITLE_SMALL_LABEL_ABOVE_TITLE}
                value={slide.subtitle || ""}
                onChange={(v: string) =>
                  updateItem(CmsDataKey.HERO_SLIDES, slide.id, "subtitle", v)
                }
              />
              <InputField
                label={UILabels.FIELDS.BUTTON_TEXT}
                value={slide.btn_text || ""}
                onChange={(v: string) =>
                  updateItem(CmsDataKey.HERO_SLIDES, slide.id, "btn_text", v)
                }
              />

              <SelectField
                label={UILabels.FIELDS.LAYOUT_STYLE}
                value={slide.layout || HeroLayout.CENTER_OVERLAY}
                onChange={(v: string) =>
                  updateItem(CmsDataKey.HERO_SLIDES, slide.id, "layout", v)
                }
                options={[
                  {
                    value: HeroLayout.CENTER_OVERLAY,
                    label: UiText.LAYOUTS.CENTER_OVERLAY,
                  },
                  {
                    value: HeroLayout.LEFT_CONTENT_RIGHT_IMAGE,
                    label: UiText.LAYOUTS.LEFT_SPLIT,
                  },
                  {
                    value: HeroLayout.RIGHT_CONTENT_LEFT_IMAGE,
                    label: UiText.LAYOUTS.RIGHT_SPLIT,
                  },
                ]}
              />
              <SelectField
                label={UILabels.FIELDS.BACKGROUND_STYLE}
                value={slide.bg_style || HeroBgStyle.GRADIENT}
                onChange={(v: string) =>
                  updateItem(CmsDataKey.HERO_SLIDES, slide.id, "bg_style", v)
                }
                options={[
                  {
                    value: HeroBgStyle.GRADIENT,
                    label: UiText.BG_STYLES.GRADIENT,
                  },
                  {
                    value: HeroBgStyle.SOLID,
                    label: UiText.BG_STYLES.SOLID,
                  },
                  {
                    value: "custom",
                    label: UiText.BG_STYLES.CUSTOM,
                  },
                ]}
              />

              <ColorField
                label={
                  UILabels.FIELDS
                    .SLIDE_BACKGROUND_COLOR_USED_WHEN_STYLE_IS_CUSTOM
                }
                value={slide.bg_color || ""}
                onChange={(v: string) =>
                  updateItem(CmsDataKey.HERO_SLIDES, slide.id, "bg_color", v)
                }
              />

              <SlideQueryPicker
                value={slide.search_query || ""}
                onChange={(v: string) =>
                  updateItem(
                    CmsDataKey.HERO_SLIDES,
                    slide.id,
                    "search_query",
                    v,
                  )
                }
              />
              <div className="md:col-span-2">
                <ImageUploadField
                  label={UILabels.FIELDS.SLIDE_BANNER_IMAGE}
                  value={slide.image_url || ""}
                  onChange={(v: string) =>
                    updateItem(CmsDataKey.HERO_SLIDES, slide.id, "image_url", v)
                  }
                />
              </div>
            </ListCard>
          ),
        )}
      </CmsSection>

      <CmsSection title={UILabels.SECTIONS.MIDDLE_PROMO_BANNER}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={UILabels.FIELDS.SUBTITLE}
            value={data?.[CmsDataKey.MIDDLE_BANNER_SUBTITLE] || ""}
            onChange={(v: string) => set(CmsDataKey.MIDDLE_BANNER_SUBTITLE, v)}
          />
          <InputField
            label={UILabels.FIELDS.BUTTON_TEXT}
            value={data?.[CmsDataKey.MIDDLE_BANNER_BTN_TEXT] || ""}
            onChange={(v: string) => set(CmsDataKey.MIDDLE_BANNER_BTN_TEXT, v)}
          />
          <div className="md:col-span-2">
            <InputField
              label={UILabels.FIELDS.TITLE}
              value={data?.[CmsDataKey.MIDDLE_BANNER_TITLE] || ""}
              onChange={(v: string) => set(CmsDataKey.MIDDLE_BANNER_TITLE, v)}
            />
          </div>
          <div className="md:col-span-2">
            <InputField
              label={UILabels.FIELDS.DESCRIPTION}
              value={data?.[CmsDataKey.MIDDLE_BANNER_DESC] || ""}
              onChange={(v: string) => set(CmsDataKey.MIDDLE_BANNER_DESC, v)}
              textarea
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label={UILabels.FIELDS.PROMO_BANNER_IMAGE}
              value={data?.[CmsDataKey.MIDDLE_BANNER_IMAGE_URL] || ""}
              onChange={(v: string) =>
                set(CmsDataKey.MIDDLE_BANNER_IMAGE_URL, v)
              }
              onAutoSave={makeAutoSave(CmsDataKey.MIDDLE_BANNER_IMAGE_URL)}
            />
          </div>
        </div>
      </CmsSection>
      <CmsSection title={UILabels.SECTIONS.NEW_ARRIVALS__4_GRID_LAYOUT}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className="border border-gray-200 p-4 rounded-lg bg-gray-50 flex flex-col gap-4"
            >
              <h4 className="font-bold text-theme-body-sm text-gray-700">
                Card {num}
              </h4>

              <ImageUploadField
                label={`Image`}
                value={data[`new_arrivals_card_${num}_image_url`] || ""}
                onChange={(v: string) =>
                  set(`new_arrivals_card_${num}_image_url`, v)
                }
                onAutoSave={(newUrl) =>
                  makeAutoSave(`new_arrivals_card_${num}_image_url`)(newUrl)
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label={UILabels.FIELDS.TITLE}
                  value={data[`new_arrivals_card_${num}_title`] || ""}
                  onChange={(v: string) =>
                    set(`new_arrivals_card_${num}_title`, v)
                  }
                />
                <InputField
                  label={UILabels.FIELDS.SUBTITLE}
                  value={data[`new_arrivals_card_${num}_subtitle`] || ""}
                  onChange={(v: string) =>
                    set(`new_arrivals_card_${num}_subtitle`, v)
                  }
                />
              </div>

              <ColorField
                label={
                  UILabels.FIELDS.CARD_BACKGROUND_COLOR_OVERRIDES_AUTODETECT
                }
                value={data[`new_arrivals_card_${num}_bg_color`] || ""}
                onChange={(v: string) =>
                  set(`new_arrivals_card_${num}_bg_color`, v)
                }
              />
            </div>
          ))}
        </div>
      </CmsSection>
      <CmsSection title={UILabels.SECTIONS.NEWSLETTER_BLOCK}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={UILabels.FIELDS.NEWSLETTER_TITLE}
            value={data?.[CmsDataKey.NEWSLETTER_TITLE] || ""}
            onChange={(v: string) => set(CmsDataKey.NEWSLETTER_TITLE, v)}
          />
          <InputField
            label={UILabels.FIELDS.NEWSLETTER_BUTTON_TEXT}
            value={data?.[CmsDataKey.NEWSLETTER_BTN_TEXT] || ""}
            onChange={(v: string) => set(CmsDataKey.NEWSLETTER_BTN_TEXT, v)}
          />
          <InputField
            label={UILabels.FIELDS.NEWSLETTER_EYEBROW__TAG}
            value={data?.[CmsDataKey.NEWSLETTER_EYEBROW] || ""}
            onChange={(v: string) => set(CmsDataKey.NEWSLETTER_EYEBROW, v)}
          />
          <InputField
            label={UILabels.FIELDS.NEWSLETTER_SUCCESS_MESSAGE}
            value={data?.[CmsDataKey.NEWSLETTER_SUCCESS_TEXT] || ""}
            onChange={(v: string) => set(CmsDataKey.NEWSLETTER_SUCCESS_TEXT, v)}
          />
          <div className="md:col-span-2">
            <InputField
              label={UILabels.FIELDS.NEWSLETTER_DESCRIPTION}
              value={data?.[CmsDataKey.NEWSLETTER_DESC] || ""}
              onChange={(v: string) => set(CmsDataKey.NEWSLETTER_DESC, v)}
              textarea
            />
          </div>
          <div className="md:col-span-2">
            <InputField
              label={UILabels.FIELDS.NEWSLETTER_TERMS_DISCLAIMER}
              value={data?.[CmsDataKey.NEWSLETTER_DISCLAIMER] || ""}
              onChange={(v: string) => set(CmsDataKey.NEWSLETTER_DISCLAIMER, v)}
            />
          </div>
        </div>
      </CmsSection>

      <CmsSection
        title={UILabels.SECTIONS.BRAND_HIGHLIGHT_BLOCK}
        action={
          <AddBtn
            onClick={() =>
              addItem("brand_highlight_stats", {
                value: "",
                label: "",
              })
            }
            label={UILabels.FIELDS.ADD_STAT}
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={UILabels.FIELDS.HIGHLIGHT_EYEBROW__SUBTITLE}
            value={data?.[CmsDataKey.BRAND_HIGHLIGHT_EYEBROW] || ""}
            onChange={(v: string) => set(CmsDataKey.BRAND_HIGHLIGHT_EYEBROW, v)}
          />
          <InputField
            label={UILabels.FIELDS.HIGHLIGHT_BUTTON_TEXT}
            value={data?.[CmsDataKey.BRAND_HIGHLIGHT_BTN_TEXT] || ""}
            onChange={(v: string) =>
              set(CmsDataKey.BRAND_HIGHLIGHT_BTN_TEXT, v)
            }
          />
          <div className="md:col-span-2">
            <InputField
              label={UILabels.FIELDS.HIGHLIGHT_TITLE}
              value={data?.[CmsDataKey.BRAND_HIGHLIGHT_TITLE] || ""}
              onChange={(v: string) => set(CmsDataKey.BRAND_HIGHLIGHT_TITLE, v)}
            />
          </div>
          <div className="md:col-span-2">
            <InputField
              label={UILabels.FIELDS.HIGHLIGHT_DESCRIPTION}
              value={data?.[CmsDataKey.BRAND_HIGHLIGHT_DESC] || ""}
              onChange={(v: string) => set(CmsDataKey.BRAND_HIGHLIGHT_DESC, v)}
              textarea
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label={UILabels.FIELDS.HIGHLIGHT_BANNER_IMAGE}
              value={data?.[CmsDataKey.BRAND_HIGHLIGHT_IMAGE_URL] || ""}
              onChange={(v: string) =>
                set(CmsDataKey.BRAND_HIGHLIGHT_IMAGE_URL, v)
              }
              onAutoSave={makeAutoSave(CmsDataKey.BRAND_HIGHLIGHT_IMAGE_URL)}
            />
          </div>
          <div className="md:col-span-2">
            <ColorField
              label={
                UILabels.FIELDS
                  .CARD_BACKGROUND_COLOR_OVERRIDES_AUTODETECT_FROM_IMAGE
              }
              value={data?.[CmsDataKey.BRAND_HIGHLIGHT_BG_COLOR] || ""}
              onChange={(v: string) =>
                set(CmsDataKey.BRAND_HIGHLIGHT_BG_COLOR, v)
              }
            />
          </div>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <h4 className="text-theme-caption font-bold text-gray-500 uppercase mb-3">
            {UiText.KEY_STATS}
          </h4>
          <div className="space-y-3">
            {(data.brand_highlight_stats || []).map(
              (stat: any, sIdx: number) => (
                <div
                  key={stat.id || sIdx}
                  className="flex gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-150 relative"
                >
                  <button
                    type="button"
                    onClick={() => removeItem("brand_highlight_stats", stat.id)}
                    className="absolute right-3 top-3 text-red-400 hover:text-red-650"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <InputField
                      label={UILabels.FIELDS.STAT_VALUE_EG_500}
                      value={stat.value || ""}
                      onChange={(v: string) =>
                        updateItem("brand_highlight_stats", stat.id, "value", v)
                      }
                    />
                    <InputField
                      label={UILabels.FIELDS.STAT_LABEL_EG_PRODUCTS}
                      value={stat.label || ""}
                      onChange={(v: string) =>
                        updateItem("brand_highlight_stats", stat.id, "label", v)
                      }
                    />
                  </div>
                </div>
              ),
            )}
            {!(data.brand_highlight_stats || []).length && (
              <p className="text-center text-theme-caption text-gray-400 py-3">
                {UiText.NO_STATS}
              </p>
            )}
          </div>
        </div>
      </CmsSection>

      <CmsSection title={UILabels.SECTIONS.INTERACTIVE_HERO_OPTIONS_ENHANCED}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label={UILabels.FIELDS.BANNER_DISPLAY_TYPE}
            value={data?.[CmsDataKey.HERO_BANNER_TYPE] || "carousel"}
            onChange={(v: string) => set(CmsDataKey.HERO_BANNER_TYPE, v)}
            options={[
              {
                value: "carousel",
                label: UiText.BANNER_TYPES.CAROUSEL,
              },
              { value: "video", label: UiText.BANNER_TYPES.VIDEO },
            ]}
          />
          <InputField
            label={UILabels.FIELDS.VIDEO_BACKGROUND_URL_MP4_FORMAT}
            value={data?.[CmsDataKey.HERO_VIDEO_URL] || ""}
            onChange={(v: string) => set(CmsDataKey.HERO_VIDEO_URL, v)}
            mono
          />

          <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
            <h4 className="text-theme-caption font-bold text-gray-500 uppercase mb-3">
              {UiText.VIDEO_OVERLAY_CONTENT}
            </h4>
          </div>
          <InputField
            label={UILabels.FIELDS.VIDEO_HERO_EYEBROW__TAG}
            value={data?.[CmsDataKey.HERO_VIDEO_EYEBROW] || ""}
            onChange={(v: string) => set(CmsDataKey.HERO_VIDEO_EYEBROW, v)}
          />
          <InputField
            label={UILabels.FIELDS.VIDEO_HERO_BUTTON_TEXT}
            value={data?.[CmsDataKey.HERO_VIDEO_BTN_TEXT] || ""}
            onChange={(v: string) => set(CmsDataKey.HERO_VIDEO_BTN_TEXT, v)}
          />
          <InputField
            label={UILabels.FIELDS.VIDEO_HERO_TITLE}
            value={data?.[CmsDataKey.HERO_VIDEO_TITLE] || ""}
            onChange={(v: string) => set(CmsDataKey.HERO_VIDEO_TITLE, v)}
          />
          <InputField
            label={UILabels.FIELDS.VIDEO_HERO_BUTTON_LINK_URL}
            value={data?.[CmsDataKey.HERO_VIDEO_BTN_LINK] || ""}
            onChange={(v: string) => set(CmsDataKey.HERO_VIDEO_BTN_LINK, v)}
            mono
          />
          <div className="md:col-span-2">
            <InputField
              label={UILabels.FIELDS.VIDEO_HERO_DESCRIPTION}
              value={data?.[CmsDataKey.HERO_VIDEO_DESC] || ""}
              onChange={(v: string) => set(CmsDataKey.HERO_VIDEO_DESC, v)}
              textarea
            />
          </div>
        </div>
      </CmsSection>

      <CmsSection title={UILabels.SECTIONS.SHOPPABLE_LOOKBOOK_SECTION}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={UILabels.FIELDS.LOOKBOOK_SECTION_TITLE}
            value={data?.[CmsDataKey.LOOKBOOK_TITLE] || ""}
            onChange={(v: string) => set(CmsDataKey.LOOKBOOK_TITLE, v)}
          />
          <InputField
            label={UILabels.FIELDS.LOOKBOOK_SUBTITLE__DESCRIPTION}
            value={data?.[CmsDataKey.LOOKBOOK_SUBTITLE] || ""}
            onChange={(v: string) => set(CmsDataKey.LOOKBOOK_SUBTITLE, v)}
          />
          <div className="md:col-span-2">
            <ImageUploadField
              label={UILabels.FIELDS.MAIN_LOOKBOOK_IMAGE}
              value={data?.[CmsDataKey.LOOKBOOK_IMAGE_URL] || ""}
              onChange={(v: string) => set(CmsDataKey.LOOKBOOK_IMAGE_URL, v)}
              onAutoSave={makeAutoSave(CmsDataKey.LOOKBOOK_IMAGE_URL)}
            />
          </div>
          <div className="md:col-span-2">
            <ColorField
              label={
                UILabels.FIELDS
                  .SECTION_BACKGROUND_COLOR_FALLBACK_IF_NO_IMAGE_OR_TRANSPARENT
              }
              value={data?.[CmsDataKey.LOOKBOOK_BG_COLOR] || ""}
              onChange={(v: string) => set(CmsDataKey.LOOKBOOK_BG_COLOR, v)}
            />
          </div>
        </div>

        <div className="mt-6 border-t border-gray-150 pt-6">
          {data?.[CmsDataKey.LOOKBOOK_IMAGE_URL] ? (
            <div className="mb-6 border border-gray-200 rounded-2xl p-4 bg-white shadow-sm">
              <h4 className="text-theme-caption font-bold text-gray-500 uppercase mb-2">
                {UiText.VISUAL_PREVIEW_TITLE}
              </h4>
              <p className="text-theme-tiny text-gray-400 mb-3">
                {UiText.VISUAL_PREVIEW_INSTRUCTIONS}
              </p>
              <div
                onClick={handleImageClick}
                className="relative max-w-74 max-h-74 aspect-[16/9] bg-slate-50 border border-slate-100 rounded-xl overflow-hidden cursor-crosshair select-none group"
              >
                <img
                  src={data?.[CmsDataKey.LOOKBOOK_IMAGE_URL]}
                  alt={UiText.LOOKBOOK_MAP_ALT}
                  className="w-full h-full object-cover pointer-events-none"
                />
                {(data?.[CmsDataKey.LOOKBOOK_HOTSPOTS] || []).map(
                  (spot: any, sIdx: number) => {
                    const isSelected = spot.id === selectedHotspotId;
                    return (
                      <div
                        key={spot.id || sIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHotspotId(spot.id);
                        }}
                        style={{
                          left: `${spot.x}%`,
                          top: `${spot.y}%`,
                        }}
                        className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-white flex items-center justify-center text-theme-tiny font-black shadow-md cursor-pointer transition-all ${
                          isSelected
                            ? "bg-purple-600 text-white scale-125 ring-2 ring-purple-400 ring-offset-1"
                            : "bg-black/60 text-white hover:bg-black/85"
                        }`}
                      >
                        {sIdx + 1}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center text-theme-caption text-gray-400">
              {UiText.UPLOAD_LOOKBOOK_PROMPT}
            </div>
          )}

          <div className="flex justify-between items-center mb-3">
            <h4 className="text-theme-caption font-bold text-gray-500 uppercase">
              Interactive Hotspots
            </h4>
            <AddBtn
              onClick={() => {
                const newId = Date.now();
                set(CmsDataKey.LOOKBOOK_HOTSPOTS, [
                  ...(data?.[CmsDataKey.LOOKBOOK_HOTSPOTS] || []),
                  {
                    id: newId,
                    x: 50,
                    y: 50,
                    productId: "",
                    product_id: "",
                  },
                ]);
                setSelectedHotspotId(newId);
              }}
              label={UILabels.FIELDS.ADD_HOTSPOT}
            />
          </div>
          <div className="space-y-3">
            {(data?.[CmsDataKey.LOOKBOOK_HOTSPOTS] || []).map(
              (hs: any, hIdx: number) => {
                const isSelected = hs.id === selectedHotspotId;
                return (
                  <div
                    key={hs.id || hIdx}
                    onClick={() => setSelectedHotspotId(hs.id)}
                    className={`flex flex-col gap-3 p-4 rounded-xl border relative cursor-pointer transition-all ${
                      isSelected
                        ? "bg-purple-50/40 border-purple-300 ring-1 ring-purple-300 shadow-sm"
                        : "bg-gray-50 border-gray-150 hover:bg-gray-100/70"
                    }`}
                  >
                    <div className="absolute right-3 top-3 flex items-center gap-2">
                      <span className="text-theme-tiny font-black bg-gray-200/80 text-gray-600 px-2 py-0.5 rounded-full">
                        #{hIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedHotspotId === hs.id) {
                            setSelectedHotspotId(null);
                          }
                          set(
                            "lookbook_hotspots",
                            data?.[CmsDataKey.LOOKBOOK_HOTSPOTS].filter(
                              (h: any) => h.id !== hs.id,
                            ),
                          );
                        }}
                        className="text-red-400 hover:text-red-650"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-theme-tiny font-bold text-gray-400 mb-1">
                          X Coord (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={hs.x}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            set(
                              "lookbook_hotspots",
                              data?.[CmsDataKey.LOOKBOOK_HOTSPOTS].map(
                                (h: any) =>
                                  h.id === hs.id
                                    ? {
                                        ...h,
                                        x: parseFloat(e.target.value) || 0,
                                      }
                                    : h,
                              ),
                            )
                          }
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-theme-caption focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-theme-tiny font-bold text-gray-400 mb-1">
                          Y Coord (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={hs.y}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            set(
                              "lookbook_hotspots",
                              data?.[CmsDataKey.LOOKBOOK_HOTSPOTS].map(
                                (h: any) =>
                                  h.id === hs.id
                                    ? {
                                        ...h,
                                        y: parseFloat(e.target.value) || 0,
                                      }
                                    : h,
                              ),
                            )
                          }
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-theme-caption focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-theme-tiny font-bold text-gray-400 mb-1">
                          Product
                        </label>
                        <select
                          value={hs.productId || hs.product_id || ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const pId = e.target.value;
                            set(
                              "lookbook_hotspots",
                              data?.[CmsDataKey.LOOKBOOK_HOTSPOTS].map(
                                (h: any) =>
                                  h.id === hs.id
                                    ? {
                                        ...h,
                                        productId: pId,
                                        product_id: pId,
                                      }
                                    : h,
                              ),
                            );
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-theme-caption focus:outline-none"
                        >
                          <option value="">{UiText.SELECT_PRODUCT}</option>
                          {products.map((p: any) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {(hs.productId || hs.product_id) && (
                      <ProductPreviewCard
                        productId={hs.productId || hs.product_id}
                      />
                    )}
                  </div>
                );
              },
            )}
            {!(data?.[CmsDataKey.LOOKBOOK_HOTSPOTS] || []).length && (
              <p className="text-center text-theme-caption text-gray-400 py-3">
                {UiText.NO_HOTSPOTS}
              </p>
            )}
          </div>
        </div>
      </CmsSection>

      <CmsSection title={UILabels.SECTIONS.SCARCITY__URGENCY_TIMER_BLOCK}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={UILabels.FIELDS.TIMER_HEADING_TITLE}
            value={data?.[CmsDataKey.SCARCITY_TIMER_TITLE] || ""}
            onChange={(v: string) => set(CmsDataKey.SCARCITY_TIMER_TITLE, v)}
          />
          <InputField
            label={UILabels.FIELDS.EXPIRATION_DATE__TIME}
            value={toDatetimeLocal(
              data?.[CmsDataKey.SCARCITY_EXPIRES_AT] || "",
            )}
            onChange={(v: string) => set(CmsDataKey.SCARCITY_EXPIRES_AT, v)}
            type="datetime-local"
          />
          <InputField
            label={UILabels.FIELDS.CTA_ACTION_BUTTON_TEXT}
            value={data?.[CmsDataKey.SCARCITY_BTN_TEXT] || ""}
            onChange={(v: string) => set(CmsDataKey.SCARCITY_BTN_TEXT, v)}
          />
          <InputField
            label={UILabels.FIELDS.CTA_ACTION_BUTTON_LINK_URL}
            value={data?.[CmsDataKey.SCARCITY_BTN_LINK] || ""}
            onChange={(v: string) => set(CmsDataKey.SCARCITY_BTN_LINK, v)}
            mono
          />

          <div className="md:col-span-2">
            <InputField
              label={UILabels.FIELDS.MARKETING_ALERT_TEXT_MESSAGE}
              value={data?.[CmsDataKey.SCARCITY_ALERT_TEXT] || ""}
              onChange={(v: string) => set(CmsDataKey.SCARCITY_ALERT_TEXT, v)}
            />
          </div>

          <ColorField
            label={UILabels.FIELDS.ALERT_BAR_BACKGROUND_COLOR}
            value={data?.[CmsDataKey.SCARCITY_ALERT_BG]}
            onChange={(v: string) => set(CmsDataKey.SCARCITY_ALERT_BG, v)}
          />
          <ColorField
            label={UILabels.FIELDS.ALERT_BAR_TEXT_COLOR}
            value={data?.[CmsDataKey.SCARCITY_ALERT_TEXT_COLOR]}
            onChange={(v: string) =>
              set(CmsDataKey.SCARCITY_ALERT_TEXT_COLOR, v)
            }
          />
        </div>
      </CmsSection>

      <CmsSection title={UILabels.SECTIONS.TRUST__SOCIAL_PROOF_SECTION}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={UILabels.FIELDS.SOCIAL_PROOF_HEADER_TITLE}
            value={data?.[CmsDataKey.SOCIAL_PROOF_TITLE] || ""}
            onChange={(v: string) => set(CmsDataKey.SOCIAL_PROOF_TITLE, v)}
          />
          <InputField
            label={UILabels.FIELDS.EYEBROW_TAG__SUBTEXT}
            value={data?.[CmsDataKey.SOCIAL_PROOF_EYEBROW] || ""}
            onChange={(v: string) => set(CmsDataKey.SOCIAL_PROOF_EYEBROW, v)}
          />
        </div>

        <div className="mt-5 border-t border-gray-100 pt-5">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-theme-caption font-bold text-gray-500 uppercase">
              {UiText.CUSTOMER_TESTIMONIALS}
            </h4>

            <AddBtn
              onClick={() =>
                set(CmsDataKey.SOCIAL_PROOF_TESTIMONIALS, [
                  ...(data?.[CmsDataKey.SOCIAL_PROOF_TESTIMONIALS] || []),
                  {
                    id: Date.now(),
                    name: "",
                    location: "",
                    text: "",
                    rating: 5,
                    avatar: "",
                  },
                ])
              }
              label={UILabels.FIELDS.ADD_TESTIMONIAL}
            />
          </div>
          <div className="space-y-4">
            {(data?.[CmsDataKey.SOCIAL_PROOF_TESTIMONIALS] || []).map(
              (t: any, tIdx: number) => (
                <div
                  key={t.id || tIdx}
                  className="bg-gray-50 border border-gray-100 rounded-xl p-4 relative"
                >
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "social_proof_testimonials",
                        data?.[CmsDataKey.SOCIAL_PROOF_TESTIMONIALS].filter(
                          (x: any) => x.id !== t.id,
                        ),
                      )
                    }
                    className="absolute right-3 top-3 text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label={UILabels.FIELDS.CUSTOMER_NAME}
                      value={t.name}
                      onChange={(v: string) =>
                        set(
                          "social_proof_testimonials",
                          data?.[CmsDataKey.SOCIAL_PROOF_TESTIMONIALS].map(
                            (x: any) => (x.id === t.id ? { ...x, name: v } : x),
                          ),
                        )
                      }
                    />
                    <InputField
                      label={UILabels.FIELDS.LOCATION}
                      value={t.location}
                      onChange={(v: string) =>
                        set(
                          "social_proof_testimonials",
                          data?.[CmsDataKey.SOCIAL_PROOF_TESTIMONIALS].map(
                            (x: any) =>
                              x.id === t.id ? { ...x, location: v } : x,
                          ),
                        )
                      }
                    />
                    <div>
                      <label className="block text-theme-caption font-bold text-gray-500 mb-1.5">
                        {UiText.RATING_1_5}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={t.rating}
                        onChange={(e) =>
                          set(
                            "social_proof_testimonials",
                            data?.[CmsDataKey.SOCIAL_PROOF_TESTIMONIALS].map(
                              (x: any) =>
                                x.id === t.id
                                  ? {
                                      ...x,
                                      rating: parseInt(e.target.value) || 5,
                                    }
                                  : x,
                            ),
                          )
                        }
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-theme-caption focus:outline-none"
                      />
                    </div>
                    <InputField
                      label={UILabels.FIELDS.AVATAR_IMAGE_URL_OPTIONAL}
                      value={t.avatar}
                      onChange={(v: string) =>
                        set(
                          "social_proof_testimonials",
                          data?.[CmsDataKey.SOCIAL_PROOF_TESTIMONIALS].map(
                            (x: any) =>
                              x.id === t.id ? { ...x, avatar: v } : x,
                          ),
                        )
                      }
                    />
                    <div className="md:col-span-2">
                      <InputField
                        label={UILabels.FIELDS.TESTIMONIAL_QUOTE__TEXT}
                        value={t.text}
                        onChange={(v: string) =>
                          set(
                            "social_proof_testimonials",
                            data?.[CmsDataKey.SOCIAL_PROOF_TESTIMONIALS].map(
                              (x: any) =>
                                x.id === t.id ? { ...x, text: v } : x,
                            ),
                          )
                        }
                        textarea
                      />
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="mt-5 border-t border-gray-100 pt-5">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-theme-caption font-bold text-gray-500 uppercase">
              {UiText.TRUST_BADGE_STRIP}
            </h4>
            <AddBtn
              onClick={() =>
                set(CmsDataKey.SOCIAL_PROOF_BADGES, [
                  ...(data?.[CmsDataKey.SOCIAL_PROOF_BADGES] || []),
                  {
                    id: Date.now(),
                    icon: "security",
                    title: "",
                    desc: "",
                  },
                ])
              }
              label={UILabels.FIELDS.ADD_TRUST_BADGE}
            />
          </div>
          <div className="space-y-4">
            {(data?.[CmsDataKey.SOCIAL_PROOF_BADGES] || []).map(
              (bg: any, bIdx: number) => (
                <div
                  key={bg.id || bIdx}
                  className="flex gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-150 relative"
                >
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "social_proof_badges",
                        data?.[CmsDataKey.SOCIAL_PROOF_BADGES].filter(
                          (x: any) => x.id !== bg.id,
                        ),
                      )
                    }
                    className="absolute right-3 top-3 text-red-400 hover:text-red-650"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <SelectField
                      label={UiText.SELECT_ICON}
                      value={bg.icon}
                      onChange={(v: string) =>
                        set(
                          "social_proof_badges",
                          data?.[CmsDataKey.SOCIAL_PROOF_BADGES].map(
                            (x: any) =>
                              x.id === bg.id ? { ...x, icon: v } : x,
                          ),
                        )
                      }
                      options={[
                        {
                          value: "shipping",
                          label: UiText.ICONS.SHIPPING,
                        },
                        {
                          value: "security",
                          label: UiText.ICONS.SECURITY,
                        },
                        {
                          value: "quality",
                          label: UiText.ICONS.QUALITY,
                        },
                        {
                          value: "support",
                          label: UiText.ICONS.SUPPORT,
                        },
                        {
                          value: "default",
                          label: UiText.ICONS.DEFAULT,
                        },
                      ]}
                    />
                    <InputField
                      label={UILabels.FIELDS.BADGE_TITLE}
                      value={bg.title}
                      onChange={(v: string) =>
                        set(
                          "social_proof_badges",
                          data?.[CmsDataKey.SOCIAL_PROOF_BADGES].map(
                            (x: any) =>
                              x.id === bg.id ? { ...x, title: v } : x,
                          ),
                        )
                      }
                    />
                    <InputField
                      label={UILabels.FIELDS.SHORT_DESCRIPTION}
                      value={bg.desc}
                      onChange={(v: string) =>
                        set(
                          "social_proof_badges",
                          data?.[CmsDataKey.SOCIAL_PROOF_BADGES].map(
                            (x: any) =>
                              x.id === bg.id ? { ...x, desc: v } : x,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </CmsSection>

      <CmsSection title={UILabels.SECTIONS.CURATED_DISCOVERY_PRODUCTS_SLIDER}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={UILabels.FIELDS.DISCOVERY_SECTION_HEADING}
            value={data?.[CmsDataKey.CURATED_TITLE] || ""}
            onChange={(v: string) => set(CmsDataKey.CURATED_TITLE, v)}
          />
          <InputField
            label={UILabels.FIELDS.SUBTITLE__TAGLINE}
            value={data?.[CmsDataKey.CURATED_SUBTITLE] || ""}
            onChange={(v: string) => set(CmsDataKey.CURATED_SUBTITLE, v)}
          />

          <SelectField
            label={UILabels.FIELDS.CURATION_CATEGORY_TYPE}
            value={data?.[CmsDataKey.CURATED_TYPE] || "trending"}
            onChange={(v: string) => set(CmsDataKey.CURATED_TYPE, v)}
            options={[
              {
                value: "trending",
                label: UiText.CURATION_TYPES.TRENDING,
              },
              {
                value: "new_arrivals",
                label: UiText.CURATION_TYPES.NEW_ARRIVALS,
              },
              {
                value: "curated",
                label: UiText.CURATION_TYPES.CURATED,
              },
            ]}
          />

          <div>
            <label className="block text-theme-caption font-bold text-gray-500 mb-1.5 font-sans">
              Curated Custom Products
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(Array.isArray(data?.[CmsDataKey.CURATED_PRODUCT_IDS])
                ? data?.[CmsDataKey.CURATED_PRODUCT_IDS]
                : []
              ).map((productId: string) => {
                const p = products.find((x) => x.id === productId);
                return (
                  <div
                    key={productId}
                    className="flex items-center gap-1.5 bg-purple-50 text-purple-700 text-theme-caption font-bold px-3 py-1.5 rounded-full border border-purple-100 shadow-sm"
                  >
                    <span>{p ? p.name : productId}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = (
                          data?.[CmsDataKey.CURATED_PRODUCT_IDS] || []
                        ).filter((id: string) => id !== productId);
                        set(CmsDataKey.CURATED_PRODUCT_IDS, filtered);
                      }}
                      className="text-purple-400 hover:text-purple-650 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
              {(!data?.[CmsDataKey.CURATED_PRODUCT_IDS] ||
                data?.[CmsDataKey.CURATED_PRODUCT_IDS].length === 0) && (
                <span className="text-theme-caption text-gray-400">
                  No custom products selected.
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const currentIds = Array.isArray(
                    data?.[CmsDataKey.CURATED_PRODUCT_IDS],
                  )
                    ? data?.[CmsDataKey.CURATED_PRODUCT_IDS]
                    : [];
                  if (!currentIds.includes(val)) {
                    set(CmsDataKey.CURATED_PRODUCT_IDS, [...currentIds, val]);
                  }
                  e.target.value = "";
                }}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-theme-body-sm focus:outline-none focus:border-purple-400"
                defaultValue=""
              >
                <option value="" disabled>
                  {UiText.ADD_PRODUCT_TO_CURATED}
                </option>
                {products
                  .filter((p) => {
                    const currentIds = Array.isArray(
                      data?.[CmsDataKey.CURATED_PRODUCT_IDS],
                    )
                      ? data?.[CmsDataKey.CURATED_PRODUCT_IDS]
                      : [];
                    return !currentIds.includes(p.id);
                  })
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="md:col-span-2">
            <ColorField
              label={UILabels.FIELDS.SECTION_BACKGROUND_COLOR}
              value={data?.[CmsDataKey.CURATED_BG_COLOR] || ""}
              onChange={(v: string) => set(CmsDataKey.CURATED_BG_COLOR, v)}
            />
          </div>
        </div>
      </CmsSection>
    </>
  );
};
