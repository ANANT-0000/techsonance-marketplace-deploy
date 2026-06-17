import { CmsDataKey } from "@/constants/cms";
import { CmsSection } from "./Section";
import { InputField } from "./InputField";
import { SelectField } from "./SelectField";
import { UiText } from "@/constants/ui-text";
import { ImageUploadField } from "./ImageUploadField";
import { Trash2, X } from "lucide-react";
import { UILabels } from "@/constants/ui-labels";
import { AddBtn } from "./AddBtn";
export const CmsNavbarTab = ({
  data,
  set,
  makeAutoSave,
  addItem,
  removeItem,
  updateItem,
}: {
  data: any;
  set: (key: string, val: any) => void;
  makeAutoSave: (key: string) => (newUrl: string) => Promise<void>;
  addItem: (key: string, template: any) => void;
  removeItem: (key: string, id: any) => void;
  updateItem: (key: string, id: any, field: string, val: string) => void;
}) => {
  return (
    <>
      {/* ── 1. Logo & Brand Identity ──────────────────────────────── */}
      <CmsSection title={UILabels.SECTIONS.NAVBAR_LOGO}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <ImageUploadField
              label={UILabels.FIELDS.NAV_LOGO_SRC}
              value={data?.[CmsDataKey.NAV_LOGO_SRC] || ""}
              onChange={(v: string) => set(CmsDataKey.NAV_LOGO_SRC, v)}
              onAutoSave={makeAutoSave(CmsDataKey.NAV_LOGO_SRC)}
            />
          </div>
          <InputField
            label={UILabels.FIELDS.NAV_LOGO_ALT}
            value={data?.[CmsDataKey.NAV_LOGO_ALT] || ""}
            onChange={(v: string) => set(CmsDataKey.NAV_LOGO_ALT, v)}
          />
          <InputField
            label={UILabels.FIELDS.NAV_LOGO_HREF}
            value={data?.[CmsDataKey.NAV_LOGO_HREF] || "/"}
            onChange={(v: string) => set(CmsDataKey.NAV_LOGO_HREF, v)}
            mono
          />
          <SelectField
            label={UILabels.FIELDS.NAV_LOGO_ALIGNMENT}
            value={data?.[CmsDataKey.NAV_LOGO_ALIGNMENT] || "LEFT"}
            onChange={(v: string) => set(CmsDataKey.NAV_LOGO_ALIGNMENT, v)}
            options={[
              { value: "LEFT", label: "Left" },
              { value: "CENTER", label: "Center" },
            ]}
          />
        </div>
      </CmsSection>

      {/* ── 2. Navbar Behavior ───────────────────────────────────── */}
      <CmsSection title={UILabels.SECTIONS.NAVBAR_BEHAVIOR}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            label={UILabels.FIELDS.NAV_POSITION}
            value={data?.[CmsDataKey.NAV_POSITION] || "STICKY"}
            onChange={(v: string) => set(CmsDataKey.NAV_POSITION, v)}
            options={[
              { value: "STICKY", label: "Sticky (follows scroll)" },
              { value: "RELATIVE", label: "Static (stays at top)" },
            ]}
          />
          {/* Show Shadow toggle */}
          <div>
            <label className="block text-theme-caption font-bold text-gray-500 mb-1.5">
              {UILabels.FIELDS.NAV_SHOW_SHADOW}
            </label>
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => set(CmsDataKey.NAV_SHOW_SHADOW, val)}
                  className={`flex-1 py-2 rounded-xl text-theme-caption font-bold border transition-all ${
                    (data?.[CmsDataKey.NAV_SHOW_SHADOW] ?? true) === val
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {val ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
          {/* Show Border toggle */}
          <div>
            <label className="block text-theme-caption font-bold text-gray-500 mb-1.5">
              {UILabels.FIELDS.NAV_SHOW_BORDER}
            </label>
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => set(CmsDataKey.NAV_SHOW_BORDER, val)}
                  className={`flex-1 py-2 rounded-xl text-theme-caption font-bold border transition-all ${
                    (data?.[CmsDataKey.NAV_SHOW_BORDER] ?? true) === val
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {val ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CmsSection>

      {/* ── 3. Search Bar ────────────────────────────────────────── */}
      <CmsSection title={UILabels.SECTIONS.NAVBAR_SEARCH_BAR}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Visible toggle */}
          <div>
            <label className="block text-theme-caption font-bold text-gray-500 mb-1.5">
              {UILabels.FIELDS.NAV_SEARCH_VISIBLE}
            </label>
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => set(CmsDataKey.NAV_SEARCH_VISIBLE, val)}
                  className={`flex-1 py-2 rounded-xl text-theme-caption font-bold border transition-all ${
                    (data?.[CmsDataKey.NAV_SEARCH_VISIBLE] ?? true) === val
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {val ? "Visible" : "Hidden"}
                </button>
              ))}
            </div>
          </div>
          <InputField
            label={UILabels.FIELDS.NAV_SEARCH_PLACEHOLDER}
            value={data?.[CmsDataKey.NAV_SEARCH_PLACEHOLDER] || ""}
            onChange={(v: string) => set(CmsDataKey.NAV_SEARCH_PLACEHOLDER, v)}
          />
          <InputField
            label={UILabels.FIELDS.NAV_SEARCH_ENDPOINT}
            value={data?.[CmsDataKey.NAV_SEARCH_ENDPOINT] || "/store/search"}
            onChange={(v: string) => set(CmsDataKey.NAV_SEARCH_ENDPOINT, v)}
            mono
          />
        </div>
      </CmsSection>

      {/* ── 4. Utility Icons ─────────────────────────────────────── */}
      <CmsSection title={UILabels.SECTIONS.NAVBAR_UTILITIES}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(
            [
              {
                key: CmsDataKey.NAV_SHOW_ACCOUNT,
                label: UILabels.FIELDS.NAV_SHOW_ACCOUNT,
                default: true,
              },
              {
                key: CmsDataKey.NAV_SHOW_WISHLIST,
                label: UILabels.FIELDS.NAV_SHOW_WISHLIST,
                default: true,
              },
              {
                key: CmsDataKey.NAV_SHOW_CART,
                label: UILabels.FIELDS.NAV_SHOW_CART,
                default: true,
              },
            ] as { key: CmsDataKey; label: string; default: boolean }[]
          ).map(({ key, label: fieldLabel, default: dflt }) => (
            <div key={key}>
              <label className="block text-theme-caption font-bold text-gray-500 mb-1.5">
                {fieldLabel}
              </label>
              <div className="flex gap-2">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => set(key, val)}
                    className={`flex-1 py-2 rounded-xl text-theme-caption font-bold border transition-all ${
                      (data?.[key] ?? dflt) === val
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    {val ? "Show" : "Hide"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CmsSection>

      {/* ── 5. Navigation Items (L1) ─────────────────────────────── */}
      <CmsSection
        title={UILabels.SECTIONS.NAVBAR_NAVIGATION_ITEMS}
        action={
          <AddBtn
            onClick={() =>
              addItem(CmsDataKey.NAV_ITEMS, {
                label: "",
                href: "",
                hasMegaMenu: false,
              })
            }
            label={UILabels.FIELDS.ADD_NAV_ITEM}
          />
        }
      >
        {(data?.[CmsDataKey.NAV_ITEMS] || []).length === 0 && (
          <p className="text-center text-gray-400 text-theme-body-sm py-8">
            {UiText.NO_LINKS}
          </p>
        )}
        {(data?.[CmsDataKey.NAV_ITEMS] || []).map((item: any, idx: number) => (
          <div
            key={item.id || idx}
            className="flex gap-3 items-start bg-gray-50 p-4 rounded-xl border border-gray-100"
          >
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Label */}
              <InputField
                label={UILabels.FIELDS.NAV_ITEM_LABEL}
                value={item.label || ""}
                onChange={(v: string) =>
                  updateItem(CmsDataKey.NAV_ITEMS, item.id, "label", v)
                }
              />
              {/* Href */}
              <InputField
                label={UILabels.FIELDS.NAV_ITEM_HREF}
                value={item.href || ""}
                onChange={(v: string) =>
                  updateItem(CmsDataKey.NAV_ITEMS, item.id, "href", v)
                }
                mono
              />
              {/* Has Mega-Menu toggle */}
              <div>
                <label className="block text-theme-caption font-bold text-gray-500 mb-1.5">
                  {UILabels.FIELDS.NAV_ITEM_HAS_MEGA}
                </label>
                <div className="flex gap-2">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() =>
                        updateItem(
                          CmsDataKey.NAV_ITEMS,
                          item.id,
                          "hasMegaMenu",
                          val as any,
                        )
                      }
                      className={`flex-1 py-2 rounded-xl text-theme-caption font-bold border transition-all ${
                        (item.hasMegaMenu ?? false) === val
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      {val ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeItem(CmsDataKey.NAV_ITEMS, item.id)}
              className="text-red-400 hover:text-red-600 p-2 mt-5"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </CmsSection>
    </>
  );
};
