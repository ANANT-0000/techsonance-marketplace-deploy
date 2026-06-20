"use client";
import React, {
  useState,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Save,
  LayoutPanelLeft,
  Settings,
  Image as ImageIcon,
  Search,
  ShoppingCart,
  User,
  Heart,
  Link as LinkIcon,
} from "lucide-react";
import { CmsSection } from "./Section";
import { InputField } from "./InputField";
import { SelectField } from "./SelectField";
import { ImageUploadField } from "./ImageUploadField";
import AxiosAPI from "@/lib/axios";
import {
  upsertNavbarMenu,
  createNavbarItem,
  updateNavbarItem,
  deleteNavbarItem,
  reorderNavbarItems,
  UpsertNavMenuPayload,
  CreateNavItemPayload,
  NavItemMetaPayload,
  fetchVendorActiveProducts,
} from "@/utils/vendorApiClient";
import { authToken } from "@/utils/authToken";
import { dispatchNavbarChange } from "@/utils/cache";
import toast from "react-hot-toast";
import {
  LinkMode,
  NavItemColType,
  NavItemDisplayType,
  NavItemType,
  NavMenuLogoAlignment,
  NavMenuPosition,
  NavMenuType,
  SiteMap,
} from "@/utils/Types";
import { CmsNavbarConfig } from "@/constants";

// ─── Local Types ─────────────────────────────────────────────────────────────
/** @deprecated Use NavItemColType */
export enum ColType {
  SUBCATEGORIES = "subcategories",
  BRANDS = "brands",
  PROMOTION = "promotion",
  PRODUCTS = "products",
}
interface L2Column {
  id: string;
  label: string;
  href: string;
  sort_order: number;
  meta: NavItemMetaPayload;
  category_id?: string | null;
  item_type?: NavItemType;
}

interface L1Item {
  id: string;
  label: string;
  href: string;
  item_type: NavItemType;
  category_id?: string | null;
  has_mega_menu: boolean;
  sort_order: number;
  meta: NavItemMetaPayload;
  megaMenuColumns: L2Column[];
}

interface NavbarData {
  settings: UpsertNavMenuPayload;
  menu_id: string | null;
  navigationItems: L1Item[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALIGNMENT_OPTIONS = [
  { value: NavMenuLogoAlignment.LEFT, label: "Left" },
  { value: NavMenuLogoAlignment.CENTER, label: "Center" },
];

const POSITION_OPTIONS = [
  { value: NavMenuPosition.STICKY, label: "Sticky (follows scroll)" },
  { value: NavMenuPosition.RELATIVE, label: "Static (stays at top)" },
];

const ITEM_TYPE_OPTIONS = [
  { value: NavItemType.CUSTOM_LINK, label: "Custom Link" },
  { value: NavItemType.CATEGORY, label: "Category Page" },
];

const COL_TYPE_OPTIONS = [
  { value: NavItemColType.SUBCATEGORIES, label: "Subcategory Links" },
  { value: NavItemColType.BRANDS, label: "Brand Links" },
  { value: NavItemColType.PROMOTION, label: "Promotion Banner" },
  { value: NavItemColType.PRODUCTS, label: "Manual Product Picks" },
];
const DISPLAY_TYPE_OPTIONS = [
  {
    value: NavItemDisplayType.CATEGORY_LISTING,
    label: "Curated Category List (Apple-Style)",
  },
  {
    value: NavItemDisplayType.CATEGORY_LISTING_VISUAL,
    label: "Curated Visual Grid (boAt-Style)",
  },
  {
    value: NavItemDisplayType.DYNAMIC_SUBCATEGORIES,
    label: "Dynamic Subcategories (Auto)",
  },
  { value: NavItemDisplayType.PRODUCT_RANGES, label: "Manual Product Ranges" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-theme-body-sm text-gray-700 font-medium">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          value ? "bg-purple-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function SaveBtn({
  onClick,
  saving,
  label = "Save",
}: {
  onClick: () => void;
  saving: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
    >
      <Save className="w-3.5 h-3.5" />
      {saving ? "Saving…" : label}
    </button>
  );
}

// ─── L2 Column Editor ─────────────────────────────────────────────────────────

function L2ColumnEditor({
  col,
  categories,
  products,
  parentRouteKey, // ← passed from L1ItemEditor
  siteMaps,
  menuId,
  token,
  onSaved,
  onDeleted,
}: {
  col: L2Column;
  categories: {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
  }[];
  products: { id: string; name: string }[];
  parentRouteKey: string;
  siteMaps: SiteMap[];
  menuId: string;
  token: string;
  onSaved: (updated: L2Column) => void;
  onDeleted: (id: string) => void;
}) {
  const [draft, setDraft] = useState<L2Column>({
    ...col,
    meta: col.meta || {},
  });
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (field: keyof L2Column, val: any) =>
    setDraft((p) => ({ ...p, [field]: val }));
  const patchMeta = (field: keyof NavItemMetaPayload, val: any) =>
    setDraft((p) => ({ ...p, meta: { ...p.meta, [field]: val } }));
  const activeRoute =
    siteMaps.find((r) => r.key === parentRouteKey) ??
    siteMaps.find((r) => r.key === "category");
  const selectedCategory = categories.find((c) => c.id === draft.category_id);
  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await updateNavbarItem(
        col.id,
        {
          label: draft.label,
          href: draft.href,
          sort_order: draft.sort_order,
          meta: draft.meta,
          category_id: draft.category_id || undefined,
          item_type: draft.category_id
            ? NavItemType.CATEGORY
            : NavItemType.CUSTOM_LINK,
        },
        token,
      );
      setSaving(false);
      if (res?.success === false) {
        const errorMsg = res?.message || CmsNavbarConfig.ERROR_SAVE_COLUMN;
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Save column error (developer details):", res);
        return;
      }
      toast.success(CmsNavbarConfig.SUCCESS_SAVE_COLUMN);
      onSaved({ ...draft, id: col.id });
    } catch (err) {
      setSaving(false);
      setError(CmsNavbarConfig.ERROR_SAVE_COLUMN);
      toast.error(CmsNavbarConfig.ERROR_SAVE_COLUMN);
      console.error("Save column exception (developer details):", err);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete column "${col.label}"?`)) return;
    try {
      const res = await deleteNavbarItem(col.id, token);
      if (res?.success === false) {
        toast.error(res?.message || CmsNavbarConfig.ERROR_DELETE_COLUMN);
        console.error("Delete column error (developer details):", res);
        return;
      }
      toast.success(CmsNavbarConfig.SUCCESS_DELETE_COLUMN);
      onDeleted(col.id);
    } catch (err) {
      toast.error(CmsNavbarConfig.ERROR_DELETE_COLUMN);
      console.error("Delete column exception (developer details):", err);
    }
  };

  const isPromo = draft.meta.col_type === NavItemColType.PROMOTION;
  const isSubcat = draft.meta.col_type === NavItemColType.SUBCATEGORIES;
  const isProducts = draft.meta.col_type === NavItemColType.PRODUCTS;

  return (
    <div className="border border-gray-100 rounded-xl bg-gray-50 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
        <span className="flex-1 text-xs font-semibold text-gray-700 truncate">
          {draft.label || "Unnamed Column"}
        </span>
        <span className="text-[10px] bg-purple-100 text-purple-600 font-bold px-2 py-0.5 rounded-full uppercase">
          {draft.meta.col_type || NavItemColType.SUBCATEGORIES}
        </span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-1 text-gray-400 hover:text-gray-700"
        >
          {open ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={remove}
          className="p-1 text-red-400 hover:text-red-600"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Column Heading"
              value={draft.label}
              onChange={(v: string) => patch("label", v)}
            />
            <SelectField
              label="Column Type"
              value={draft.meta.col_type || NavItemColType.SUBCATEGORIES}
              onChange={(v: string) => patchMeta("col_type", v)}
              options={COL_TYPE_OPTIONS}
            />
          </div>

          {isSubcat && (
            <SelectField
              label="Linked Category (auto-fills its subcategories as links)"
              value={draft.category_id || ""}
              onChange={(v: string) => {
                const cat = categories.find((c) => c.id === v);
                setDraft((p) => ({
                  ...p,
                  category_id: v || null,
                  label:
                    !p.label ||
                    p.label === "Unnamed Column" ||
                    p.label === "New Column"
                      ? cat?.name || p.label
                      : p.label,
                }));
              }}
              options={[
                { value: "", label: "— No category (manual links) —" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          )}

          {isProducts && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">
                Products in this column
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 bg-white">
                {products.length === 0 && (
                  <p className="text-xs text-gray-400 px-3 py-3">
                    No active products found for this store.
                  </p>
                )}
                {products.map((p) => {
                  const checked = (draft.meta.product_ids || []).includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const current = draft.meta.product_ids || [];
                          const next = e.target.checked
                            ? [...current, p.id]
                            : current.filter((id) => id !== p.id);
                          patchMeta("product_ids", next);
                        }}
                      />
                      <span className="truncate">{p.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {isPromo ? (
            <>
              <ImageUploadField
                label="Promo Image"
                value={draft.meta.promo_image_url || ""}
                onChange={(v: string) => patchMeta("promo_image_url", v)}
                onAutoSave={async () => {}}
              />
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Promo Title"
                  value={draft.meta.promo_title || ""}
                  onChange={(v: string) => patchMeta("promo_title", v)}
                />
                <InputField
                  label="CTA Link"
                  value={draft.meta.promo_cta_href || ""}
                  onChange={(v: string) => patchMeta("promo_cta_href", v)}
                  mono
                />
              </div>
              <InputField
                label="Promo Subtitle"
                value={draft.meta.promo_subtitle || ""}
                onChange={(v: string) => patchMeta("promo_subtitle", v)}
                textarea
              />
            </>
          ) : isProducts ? null : selectedCategory && activeRoute ? (
            <p className="text-xs text-gray-500 font-mono bg-gray-100 rounded-lg px-3 py-2">
              Resolves to: {activeRoute.base_path}
              {activeRoute.default_query_param
                ? `?${activeRoute.default_query_param}=`
                : ""}
              {selectedCategory.slug}
            </p>
          ) : (
            <InputField
              label="Section Link (href)"
              value={draft.href}
              onChange={(v: string) => patch("href", v)}
              mono
            />
          )}

          {error && <p className="text-xs font-medium text-red-500">{error}</p>}

          <div className="flex justify-end">
            <SaveBtn onClick={save} saving={saving} label="Save Column" />
          </div>
        </div>
      )}
    </div>
  );
}
// ─── L1 Item Editor ───────────────────────────────────────────────────────────
function deriveLinkMode(item: L1Item): LinkMode {
  if (item.has_mega_menu) return LinkMode.MEGA_MENU;
  if (item.item_type === NavItemType.CATEGORY) return LinkMode.CATEGORY_QUERY;
  return LinkMode.STATIC_PAGE;
}
function L1ItemEditor({
  item,
  categories,
  siteMaps,
  mapsLoading,
  products,
  menuId,
  token,
  onSaved,
  onDeleted,
}: {
  item: L1Item;
  categories: {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
  }[];
  siteMaps: SiteMap[];
  mapsLoading: boolean;
  products: { id: string; name: string }[];
  menuId: string;
  token: string;
  onSaved: (updated: L1Item) => void;
  onDeleted: (id: string) => void;
}) {
  const [draft, setDraft] = useState<L1Item>({
    ...item,
    meta: item.meta || {},
    megaMenuColumns: item.megaMenuColumns || [],
  });
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [addingCol, setAddingCol] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const categoryOptions = useMemo(
    () => buildIndentedCategoryOptions(categories),
    [categories],
  );

  const defaultRouteKey =
    siteMaps.find((r) => r.key === "store")?.key ?? siteMaps[0]?.key ?? "";
  const activeRouteKey = draft.meta.route_key || defaultRouteKey;
  const activeRoute = siteMaps.find((r) => r.key === activeRouteKey);
  const selectedCategory = categories.find((c) => c.id === draft.category_id);
  const childCountMap = useMemo(() => {
    const m = new Map<string, number>();
    categories.forEach((c) => {
      if (c.parent_id) m.set(c.parent_id, (m.get(c.parent_id) ?? 0) + 1);
    });
    return m;
  }, [categories]);
  const linkMode = deriveLinkMode(draft);
  const selectedHasChildren =
    !!draft.category_id && (childCountMap.get(draft.category_id) ?? 0) > 0;

  // auto-revert if the source category stops qualifying (e.g. admin re-picks a leaf)
  useEffect(() => {
    if (draft.has_mega_menu && !selectedHasChildren) {
      setDraft((p) => ({ ...p, has_mega_menu: false }));
    }
  }, [selectedHasChildren]);

  function handleLinkModeChange(mode: LinkMode) {
    setDraft((p) => {
      if (mode === LinkMode.STATIC_PAGE)
        return {
          ...p,
          item_type: NavItemType.CUSTOM_LINK,
          has_mega_menu: false,
        };
      if (mode === LinkMode.CATEGORY_QUERY)
        return { ...p, item_type: NavItemType.CATEGORY, has_mega_menu: false };
      if (mode === LinkMode.CATEGORY_DIRECTORY)
        return {
          ...p,
          item_type: NavItemType.CUSTOM_LINK,
          category_id: null,
          has_mega_menu: true,
          meta: {
            ...p.meta,
            display_type: NavItemDisplayType.CATEGORY_DIRECTORY,
            parent_category_id: undefined,
          },
        };
      return {
        ...p,
        item_type: NavItemType.CATEGORY,
        has_mega_menu: true,
        meta: {
          ...p.meta,
          display_type: NavItemDisplayType.DYNAMIC_SUBCATEGORIES,
          parent_category_id: p.category_id || "",
        },
      };
    });
  }
  const patch = (field: keyof L1Item, val: any) =>
    setDraft((p) => ({ ...p, [field]: val }));
  const patchMeta = (field: keyof NavItemMetaPayload, val: any) =>
    setDraft((p) => ({ ...p, meta: { ...p.meta, [field]: val } }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await updateNavbarItem(
        item.id,
        {
          label: draft.label,
          href: draft.href,
          item_type: draft.item_type,
          category_id: draft.category_id || undefined,
          has_mega_menu: draft.has_mega_menu,
          sort_order: draft.sort_order,
          meta: draft.meta,
        },
        token,
      );
      setSaving(false);
      if (res?.success === false) {
        const errorMsg = res?.message || CmsNavbarConfig.ERROR_SAVE_LINK;
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Save link error (developer details):", res);
        return;
      }
      toast.success(CmsNavbarConfig.SUCCESS_SAVE_LINK);
      onSaved({ ...draft, id: item.id });
      dispatchNavbarChange();
    } catch (err) {
      setSaving(false);
      setError(CmsNavbarConfig.ERROR_SAVE_LINK);
      toast.error(CmsNavbarConfig.ERROR_SAVE_LINK);
      console.error("Save link exception (developer details):", err);
    }
  };

  const addColumn = async () => {
    setAddingCol(true);
    setError(null);
    try {
      const newCol: CreateNavItemPayload = {
        menu_id: menuId,
        parent_id: item.id,
        label: "New Column",
        href: "/store",
        item_type: NavItemType.CUSTOM_LINK,
        has_mega_menu: false,
        sort_order: draft.megaMenuColumns.length,
        meta: {
          col_type: NavItemColType.SUBCATEGORIES,
          col_title: "New Column",
        },
      };
      const res = await createNavbarItem(newCol, token);
      setAddingCol(false);

      if (res?.success === false) {
        const errorMsg = res?.message || CmsNavbarConfig.ERROR_ADD_COLUMN;
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Add column error (developer details):", res);
        return;
      }
      const newColData = res?.data?.data || res?.data;
      if (newColData?.id) {
        toast.success(CmsNavbarConfig.SUCCESS_ADD_COLUMN);
        setDraft((p) => ({
          ...p,
          megaMenuColumns: [...p.megaMenuColumns, newColData as L2Column],
        }));
      } else {
        setError("Column was not created — please retry.");
        toast.error("Column was not created — please retry.");
      }
    } catch (err) {
      setAddingCol(false);
      setError(CmsNavbarConfig.ERROR_ADD_COLUMN);
      toast.error(CmsNavbarConfig.ERROR_ADD_COLUMN);
      console.error("Add column exception (developer details):", err);
    }
  };
  const remove = async () => {
    if (
      !confirm(
        `Delete "${item.label}"? All mega-menu columns will also be removed.`,
      )
    )
      return;
    try {
      const res = await deleteNavbarItem(item.id, token);
      if (res?.success === false) {
        toast.error(res?.message || CmsNavbarConfig.ERROR_DELETE_LINK);
        console.error("Delete link error (developer details):", res);
        return;
      }
      toast.success(CmsNavbarConfig.SUCCESS_DELETE_LINK);
      onDeleted(item.id);
    } catch (err) {
      toast.error(CmsNavbarConfig.ERROR_DELETE_LINK);
      console.error("Delete link exception (developer details):", err);
    }
  };

  const onColSaved = (updated: L2Column) =>
    setDraft((p) => ({
      ...p,
      megaMenuColumns: p.megaMenuColumns.map((c) =>
        c.id === updated.id ? updated : c,
      ),
    }));

  const onColDeleted = (id: string) =>
    setDraft((p) => ({
      ...p,
      megaMenuColumns: p.megaMenuColumns.filter((c) => c.id !== id),
    }));

  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* L1 Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <GripVertical className="w-4 h-4 text-gray-300 cursor-grab shrink-0" />
        <span className="flex-1 font-semibold text-sm text-gray-800 truncate">
          {draft.label || "Unnamed Item"}
        </span>
        {draft.has_mega_menu && (
          <span className="text-[10px] bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
            MEGA MENU
          </span>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          {open ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={remove}
          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {open && (
        <div className="p-4 space-y-5">
          {/* Link config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField
              label="Label"
              value={draft.label}
              onChange={(v: string) => patch("label", v)}
            />

            <SelectField
              label="Link Type"
              value={linkMode}
              onChange={(v: string) => handleLinkModeChange(v as LinkMode)}
              options={[
                { value: LinkMode.CATEGORY_QUERY, label: "Category Query" },
                { value: LinkMode.STATIC_PAGE, label: "Static Page" },
                {
                  value: LinkMode.MEGA_MENU,
                  label: "Dynamic Mega Menu (Auto-Tree)",
                },
                {
                  value: LinkMode.CATEGORY_DIRECTORY,
                  label: "All Categories (Directory)",
                },
              ]}
            />

            {linkMode === "static_page" ? (
              <InputField
                label="URL / Path"
                value={draft.href}
                onChange={(v: string) => patch("href", v)}
                mono
              />
            ) : linkMode !== "category_directory" ? (
              // ↓ THE ONLY category selector that exists anywhere in this form now.
              // No separate "Source Parent Category" block — ever.
              <SelectField
                label="Category"
                value={draft.category_id || ""}
                onChange={(v: string) => {
                  patch("category_id", v);
                  patchMeta("parent_category_id", v); // kept in sync silently, never shown twice
                }}
                options={[
                  { value: "", label: "— Select Category —" },
                  ...categoryOptions,
                ]}
              />
            ) : null}
          </div>

          {linkMode !== "static_page" && (
            <>
              {mapsLoading ? (
                <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <SelectField
                  label="Target Page"
                  value={activeRouteKey} // ← never blank once routes load
                  onChange={(v: string) => patchMeta("route_key", v)}
                  options={siteMaps.map((r) => ({
                    value: r.key,
                    label: `${r.label} (${r.base_path})`,
                  }))}
                />
              )}
            </>
          )}

          {linkMode === "category_directory" && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-700">
              Every top-level category becomes its own column automatically — no
              selection needed. New root categories appear here the moment
              they're created.
            </div>
          )}

          {linkMode === "mega_menu" && draft.category_id && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-700">
              Columns are generated from every subcategory of{" "}
              <strong>
                {categories.find((c) => c.id === draft.category_id)?.name}
              </strong>
              .
            </div>
          )}

          {/* Mega menu toggle */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
            <Toggle
              label="Enable Mega Menu panel for this link"
              value={draft.has_mega_menu}
              onChange={(v) => patch("has_mega_menu", v)}
            />
            {draft.has_mega_menu && (
              <div className="mt-3 pt-3 border-t border-indigo-100">
                <SelectField
                  label="Mega Menu Display Mode"
                  value={
                    draft.meta.display_type ||
                    NavItemDisplayType.CATEGORY_LISTING
                  }
                  onChange={(v: string) => patchMeta("display_type", v as any)}
                  options={DISPLAY_TYPE_OPTIONS}
                />
                {draft.meta.display_type ===
                  NavItemDisplayType.DYNAMIC_SUBCATEGORIES && (
                  <div className="mt-3">
                    <SelectField
                      label="Source Parent Category (auto-populates children)"
                      value={draft.meta.parent_category_id || ""}
                      onChange={(v: string) =>
                        patchMeta("parent_category_id", v)
                      }
                      options={[
                        { value: "", label: "— Select Parent Category —" },
                        ...categories.map((c) => ({
                          value: c.id,
                          label: c.name,
                        })),
                      ]}
                    />
                  </div>
                )}
                {(draft.meta.display_type ===
                  NavItemDisplayType.CATEGORY_LISTING ||
                  draft.meta.display_type ===
                    NavItemDisplayType.CATEGORY_LISTING_VISUAL) && (
                  <div className="mt-2">
                    <Toggle
                      label="Show category icons"
                      value={draft.meta.show_category_icons ?? true}
                      onChange={(v) => patchMeta("show_category_icons", v)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Save L1 */}
          <div className="flex justify-end">
            <SaveBtn onClick={save} saving={saving} label="Save Link" />
          </div>

          {/* L2 Columns */}
          {draft.has_mega_menu && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Mega Menu Columns ({draft.megaMenuColumns.length})
                </p>
                <button
                  onClick={addColumn}
                  disabled={addingCol}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {addingCol ? "Adding…" : "Add Column"}
                </button>
              </div>
              {draft.megaMenuColumns.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No columns yet — add your first mega-menu column above
                </div>
              )}
              {draft.megaMenuColumns.map((col) => (
                <L2ColumnEditor
                  key={col.id}
                  col={col}
                  categories={categories}
                  menuId={menuId}
                  token={token}
                  parentRouteKey={activeRouteKey}
                  siteMaps={siteMaps}
                  onSaved={onColSaved}
                  onDeleted={onColDeleted}
                  products={products}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function buildIndentedCategoryOptions(
  cats: { id: string; name: string; parent_id: string | null }[],
) {
  const byParent = new Map<string | null, typeof cats>();
  cats.forEach((c) => {
    const key = c.parent_id;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  });
  const options: { value: string; label: string }[] = [];
  const walk = (parentId: string | null, depth: number) => {
    (byParent.get(parentId) ?? []).forEach((c) => {
      options.push({
        value: c.id,
        label: `${"—".repeat(depth)}${depth ? " " : ""}${c.name}`,
      });
      walk(c.id, depth + 1);
    });
  };
  walk(null, 0);
  return options;
}
// ─── Main Tab Component ───────────────────────────────────────────────────────

interface CmsNavbarState {
  data: NavbarData | null;
  loading: boolean;
  products: { id: string; name: string }[];
  settings: UpsertNavMenuPayload;
  savingSettings: boolean;
  items: L1Item[];
  addingItem: boolean;
  categories: {
    id: string;
    name: string;
    parent_id: string | null;
    slug: string;
  }[];
  siteMaps: SiteMap[];
  mapsLoading: boolean;
}

const initialCmsNavbarState: CmsNavbarState = {
  data: null,
  loading: true,
  products: [],
  settings: {},
  savingSettings: false,
  items: [],
  addingItem: false,
  categories: [],
  siteMaps: [],
  mapsLoading: true,
};

enum CmsNavbarActionType {
  SET_LOADING = "SET_LOADING",
  SET_MAPS_LOADING = "SET_MAPS_LOADING",
  SET_INITIAL_DATA = "SET_INITIAL_DATA",
  PATCH_SETTINGS = "PATCH_SETTINGS",
  SET_SAVING_SETTINGS = "SET_SAVING_SETTINGS",
  SET_ADDING_ITEM = "SET_ADDING_ITEM",
  SET_ITEMS = "SET_ITEMS",
  ADD_ITEM = "ADD_ITEM",
  SAVE_ITEM = "SAVE_ITEM",
  DELETE_ITEM = "DELETE_ITEM",
}

type CmsNavbarAction =
  | { type: CmsNavbarActionType.SET_LOADING; payload: boolean }
  | { type: CmsNavbarActionType.SET_MAPS_LOADING; payload: boolean }
  | {
      type: CmsNavbarActionType.SET_INITIAL_DATA;
      payload: {
        data: NavbarData | null;
        settings: UpsertNavMenuPayload;
        items: L1Item[];
        categories: {
          id: string;
          name: string;
          parent_id: string | null;
          slug: string;
        }[];
        products: { id: string; name: string }[];
        siteMaps: SiteMap[];
      };
    }
  | {
      type: CmsNavbarActionType.PATCH_SETTINGS;
      payload: { field: keyof UpsertNavMenuPayload; value: any };
    }
  | { type: CmsNavbarActionType.SET_SAVING_SETTINGS; payload: boolean }
  | { type: CmsNavbarActionType.SET_ADDING_ITEM; payload: boolean }
  | { type: CmsNavbarActionType.SET_ITEMS; payload: L1Item[] }
  | { type: CmsNavbarActionType.ADD_ITEM; payload: L1Item }
  | { type: CmsNavbarActionType.SAVE_ITEM; payload: L1Item }
  | { type: CmsNavbarActionType.DELETE_ITEM; payload: string };

function cmsNavbarReducer(
  state: CmsNavbarState,
  action: CmsNavbarAction,
): CmsNavbarState {
  switch (action.type) {
    case CmsNavbarActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case CmsNavbarActionType.SET_MAPS_LOADING:
      return { ...state, mapsLoading: action.payload };
    case CmsNavbarActionType.SET_INITIAL_DATA:
      return {
        ...state,
        data: action.payload.data,
        settings: action.payload.settings,
        items: action.payload.items,
        categories: action.payload.categories,
        products: action.payload.products,
        siteMaps: action.payload.siteMaps,
      };
    case CmsNavbarActionType.PATCH_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.field]: action.payload.value,
        },
      };
    case CmsNavbarActionType.SET_SAVING_SETTINGS:
      return { ...state, savingSettings: action.payload };
    case CmsNavbarActionType.SET_ADDING_ITEM:
      return { ...state, addingItem: action.payload };
    case CmsNavbarActionType.SET_ITEMS:
      return { ...state, items: action.payload };
    case CmsNavbarActionType.ADD_ITEM:
      return { ...state, items: [...state.items, action.payload] };
    case CmsNavbarActionType.SAVE_ITEM:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        ),
      };
    case CmsNavbarActionType.DELETE_ITEM:
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    default: {
      const _exhaustiveCheck: never = action;
      return state;
    }
  }
}

export function CmsNavbarTab() {
  const token = authToken();
  const [state, dispatch] = useReducer(cmsNavbarReducer, initialCmsNavbarState);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      dispatch({ type: CmsNavbarActionType.SET_LOADING, payload: true });
      try {
        const [navRes, catRes, prodRes, MapsRes] = await Promise.all([
          AxiosAPI.get("/v1/navbar").catch((err) => {
            console.error("Navbar GET error (developer details):", err);
            return null;
          }),
          AxiosAPI.get("/v1/categories?limit=200").catch((err) => {
            console.error("Categories GET error (developer details):", err);
            return null;
          }),
          token
            ? fetchVendorActiveProducts(token).catch((err) => {
                console.error(
                  "Vendor products fetch error (developer details):",
                  err,
                );
                return null;
              })
            : Promise.resolve(null),
          AxiosAPI.get("/v1/site-maps").catch((err) => {
            console.error("Site maps GET error (developer details):", err);
            return null;
          }),
        ]);

        let d: NavbarData | null = null;
        let setts: UpsertNavMenuPayload = {};
        let itms: L1Item[] = [];
        let cats: {
          id: string;
          name: string;
          parent_id: string | null;
          slug: string;
        }[] = [];
        let prods: { id: string; name: string }[] = [];
        let sMaps: SiteMap[] = [];

        if (navRes?.data) {
          d = navRes.data?.data ?? navRes.data;
          setts = d?.settings ?? {};
          itms = d?.navigationItems ?? [];
        }
        if (catRes?.data) {
          cats = catRes.data?.data ?? catRes.data ?? [];
        }
        if (prodRes?.data) {
          const list = (prodRes.data?.data ?? prodRes.data ?? []) as any[];
          prods = list.map((p) => ({ id: p.id, name: p.name }));
        }
        if (MapsRes?.data) {
          sMaps = MapsRes.data?.data ?? MapsRes.data ?? [];
        }

        dispatch({
          type: CmsNavbarActionType.SET_INITIAL_DATA,
          payload: {
            data: d,
            settings: setts,
            items: itms,
            categories: cats,
            products: prods,
            siteMaps: sMaps,
          },
        });
      } catch (err) {
        toast.error(CmsNavbarConfig.ERROR_LOAD_DATA);
        console.error("Initial load error (developer details):", err);
      } finally {
        dispatch({
          type: CmsNavbarActionType.SET_MAPS_LOADING,
          payload: false,
        });
        dispatch({ type: CmsNavbarActionType.SET_LOADING, payload: false });
      }
    };
    load();
  }, [token]);

  // ── Patch helpers ────────────────────────────────────────────────────────────
  const patchSettings = (field: keyof UpsertNavMenuPayload, val: any) =>
    dispatch({
      type: CmsNavbarActionType.PATCH_SETTINGS,
      payload: { field, value: val },
    });

  // ── Save scalar settings ────────────────────────────────────────────────────
  const saveSettings = async () => {
    if (!token) return;
    dispatch({ type: CmsNavbarActionType.SET_SAVING_SETTINGS, payload: true });
    try {
      const res = await upsertNavbarMenu(state.settings, token);
      dispatch({
        type: CmsNavbarActionType.SET_SAVING_SETTINGS,
        payload: false,
      });
      if (res?.success === false) {
        toast.error(res?.message || CmsNavbarConfig.ERROR_SAVE_SETTINGS);
        console.error("Save settings error (developer details):", res);
        return;
      }
      toast.success(CmsNavbarConfig.SUCCESS_SAVE_SETTINGS);
      dispatchNavbarChange();
    } catch (err) {
      dispatch({
        type: CmsNavbarActionType.SET_SAVING_SETTINGS,
        payload: false,
      });
      toast.error(CmsNavbarConfig.ERROR_SAVE_SETTINGS);
      console.error("Save settings exception (developer details):", err);
    }
  };

  const makeAutoSave = async (newUrl: string) => {
    if (!token) return;
    const updatedSettings = { ...state.settings, logo_src: newUrl };
    dispatch({
      type: CmsNavbarActionType.PATCH_SETTINGS,
      payload: { field: "logo_src", value: newUrl },
    });
    try {
      const res = await upsertNavbarMenu(updatedSettings, token);
      if (res?.success === false) {
        toast.error(res?.message || CmsNavbarConfig.ERROR_SAVE_SETTINGS);
        console.error("Auto save logo error (developer details):", res);
      } else {
        toast.success("Logo auto-saved successfully.");
      }
    } catch (err) {
      toast.error(CmsNavbarConfig.ERROR_SAVE_SETTINGS);
      console.error("Auto save logo exception (developer details):", err);
    }
  };

  // ── Add a new L1 item ───────────────────────────────────────────────────────
  const addL1Item = async () => {
    if (!state.data?.menu_id || !token) return;
    dispatch({ type: CmsNavbarActionType.SET_ADDING_ITEM, payload: true });
    try {
      const res = await createNavbarItem(
        {
          menu_id: state.data.menu_id,
          label: "New Link",
          href: "/store",
          item_type: NavItemType.CUSTOM_LINK,
          has_mega_menu: false,
          sort_order: state.items.length,
          meta: {},
        },
        token,
      );
      dispatch({ type: CmsNavbarActionType.SET_ADDING_ITEM, payload: false });
      if (res?.success === false) {
        toast.error(res?.message || CmsNavbarConfig.ERROR_ADD_LINK);
        console.error("Add link error (developer details):", res);
        return;
      }
      const newItemData = res?.data?.data || res?.data;
      if (newItemData?.id) {
        toast.success(CmsNavbarConfig.SUCCESS_ADD_LINK);
        dispatch({
          type: CmsNavbarActionType.ADD_ITEM,
          payload: newItemData as L1Item,
        });
      } else {
        toast.error("Link was not created — please retry.");
      }
    } catch (err) {
      dispatch({ type: CmsNavbarActionType.SET_ADDING_ITEM, payload: false });
      toast.error(CmsNavbarConfig.ERROR_ADD_LINK);
      console.error("Add link exception (developer details):", err);
    }
  };

  const onItemSaved = (updated: L1Item) =>
    dispatch({ type: CmsNavbarActionType.SAVE_ITEM, payload: updated });

  const onItemDeleted = (id: string) =>
    dispatch({ type: CmsNavbarActionType.DELETE_ITEM, payload: id });

  // ─── Loading skeleton ───────────────────────────────────────────────────────
  if (state.loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  // ─── Empty state (no menu_id yet) ──────────────────────────────────────────
  const menuId = state.data?.menu_id;
  return (
    <div className="space-y-6">
      {/* ── 1. Logo & Branding ──────────────────────────────────────────────── */}
      <CmsSection
        title="Logo & Branding"
        action={
          <SaveBtn
            onClick={saveSettings}
            saving={state.savingSettings}
            label="Save All Settings"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <ImageUploadField
              label="Logo Image (Cloudinary / CDN URL)"
              value={state.settings.logo_src || ""}
              onChange={(v: string) => patchSettings("logo_src", v)}
              onAutoSave={makeAutoSave}
            />
          </div>
          <InputField
            label="Logo Alt Text"
            value={state.settings.logo_alt || ""}
            onChange={(v: string) => patchSettings("logo_alt", v)}
          />
          <InputField
            label="Logo Link (href)"
            value={state.settings.logo_href || "/"}
            onChange={(v: string) => patchSettings("logo_href", v)}
          />
          <SelectField
            label="Logo Alignment"
            value={state.settings.logo_alignment || "LEFT"}
            onChange={(v: string) => patchSettings("logo_alignment", v as any)}
            options={ALIGNMENT_OPTIONS}
          />
        </div>
      </CmsSection>

      {/* ── 2. Behavior ─────────────────────────────────────────────────────── */}
      <CmsSection title="Navbar Behavior">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            label="Scroll Position"
            value={state.settings.position || "STICKY"}
            onChange={(v: string) => patchSettings("position", v as any)}
            options={POSITION_OPTIONS}
          />
          <div className="space-y-1 col-span-2">
            <Toggle
              label="Show drop-shadow"
              value={state.settings.show_shadow ?? true}
              onChange={(v) => patchSettings("show_shadow", v)}
            />
            <Toggle
              label="Show bottom border"
              value={state.settings.show_border ?? true}
              onChange={(v) => patchSettings("show_border", v)}
            />
          </div>
        </div>
      </CmsSection>

      {/* ── 3. Search Bar ───────────────────────────────────────────────────── */}
      <CmsSection title="Search Bar">
        <Toggle
          label="Show search bar"
          value={state.settings.search_visible ?? true}
          onChange={(v) => patchSettings("search_visible", v)}
        />
        {state.settings.search_visible !== false && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <InputField
              label="Placeholder Text"
              value={state.settings.search_placeholder || ""}
              onChange={(v: string) => patchSettings("search_placeholder", v)}
            />
            <InputField
              label="Search Endpoint"
              value={state.settings.search_endpoint || "/store/search"}
              onChange={(v: string) => patchSettings("search_endpoint", v)}
              mono
            />
          </div>
        )}
      </CmsSection>

      {/* ── 4. Utility Icons ────────────────────────────────────────────────── */}
      <CmsSection title="Utility Icons (right rail)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3">
            <User className="w-4 h-4 text-gray-400" />
            <div className="flex-1">
              <Toggle
                label="Account"
                value={state.settings.show_account ?? true}
                onChange={(v) => patchSettings("show_account", v)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3">
            <Heart className="w-4 h-4 text-gray-400" />
            <div className="flex-1">
              <Toggle
                label="Wishlist"
                value={state.settings.show_wishlist ?? true}
                onChange={(v) => patchSettings("show_wishlist", v)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3">
            <ShoppingCart className="w-4 h-4 text-gray-400" />
            <div className="flex-1">
              <Toggle
                label="Cart"
                value={state.settings.show_cart ?? true}
                onChange={(v) => patchSettings("show_cart", v)}
              />
            </div>
          </div>
        </div>
      </CmsSection>

      {/* ── 5. Navigation Items (L1) ────────────────────────────────────────── */}
      <CmsSection
        title={`Navigation Links (${state.items.length})`}
        action={
          menuId ? (
            <button
              onClick={addL1Item}
              disabled={state.addingItem}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {state.addingItem ? "Adding…" : "Add Link"}
            </button>
          ) : undefined
        }
      >
        {!menuId && (
          <div className="text-center py-8 text-gray-400 text-sm">
            <LayoutPanelLeft className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>
              Save your settings first to unlock the navigation item editor.
            </p>
            <button
              onClick={saveSettings}
              disabled={state.savingSettings}
              className="mt-3 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {state.savingSettings ? "Saving…" : "Save Settings & Unlock"}
            </button>
          </div>
        )}

        {menuId && state.items.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
            <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No navigation links yet — add your first link above.</p>
          </div>
        )}

        <div className="space-y-3">
          {state.items.map((item, idx) => (
            <L1ItemEditor
              key={idx}
              item={item}
              categories={state.categories}
              siteMaps={state.siteMaps}
              mapsLoading={state.mapsLoading}
              menuId={menuId!}
              token={token!}
              onSaved={onItemSaved}
              onDeleted={onItemDeleted}
              products={state.products}
            />
          ))}
        </div>
      </CmsSection>
    </div>
  );
}
