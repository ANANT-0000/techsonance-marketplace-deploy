"use client";
import React, { useState, useReducer, useEffect } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Save,
  LayoutPanelLeft,
  ShoppingCart,
  User,
  Link as LinkIcon,
  Heart,
  FolderTree,
  Grid3X3,
  MousePointerClick,
  Info,
  AlertTriangle,
  CheckCircle2,
  Search,
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
  UpsertNavMenuPayload,
  CreateNavItemPayload,
  NavItemMetaPayload,
  fetchVendorActiveProducts,
} from "@/utils/vendorApiClient";
import { authToken } from "@/utils/authToken";
import { dispatchNavbarChange } from "@/utils/cache";
import toast from "react-hot-toast";
import {
  NavItemColType,
  NavItemType,
  NavMenuLogoAlignment,
  NavMenuPosition,
  SiteMap,
  NavLayoutType,
} from "@/utils/Types";
import { CmsNavbarConfig } from "@/constants";

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
  layout_type?: NavLayoutType;
  target_route?: string | null;
  root_category_id?: string | null;
}

interface NavbarData {
  settings: UpsertNavMenuPayload;
  menu_id: string | null;
  navigationItems: L1Item[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
export interface CatOption {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}
const LAYOUT_OPTIONS = [
  {
    value: NavLayoutType.NONE,
    icon: MousePointerClick,
    label: "Simple Link",
    description: "A plain navigation link. Optionally add a mega-menu below.",
    color: "border-gray-200 bg-white",
    activeColor: "border-purple-500 bg-purple-50 text-purple-900",
  },
  {
    value: NavLayoutType.DIRECTORY,
    icon: FolderTree,
    label: "Category Directory",
    description:
      "Auto-generates a full category tree from your selected root category.",
    color: "border-gray-200 bg-white",
    activeColor: "border-indigo-500 bg-indigo-50 text-indigo-900",
  },
  {
    value: NavLayoutType.GRID,
    icon: Grid3X3,
    label: "Category Grid",
    description:
      "Auto-generates a visual grid layout from your selected root category.",
    color: "border-gray-200 bg-white",
    activeColor: "border-emerald-500 bg-emerald-50 text-emerald-900",
  },
];

const COL_TYPE_OPTIONS = [
  { value: NavItemColType.SUBCATEGORIES, label: "Subcategory Links" },
  { value: NavItemColType.BRANDS, label: "Brand Links" },
  { value: NavItemColType.PROMOTION, label: "Promotion Banner" },
  { value: NavItemColType.PRODUCTS, label: "Manual Product Picks" },
];

const ALIGNMENT_OPTIONS = [
  { value: NavMenuLogoAlignment.LEFT, label: "Left" },
  { value: NavMenuLogoAlignment.CENTER, label: "Center" },
];
const POSITION_OPTIONS = [
  { value: NavMenuPosition.STICKY, label: "Sticky (follows scroll)" },
  { value: NavMenuPosition.RELATIVE, label: "Static (stays at top)" },
];

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
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

/** Resolves a category's display path — "Electronics › Audio › Headphones" */
function buildCategoryPath(id: string, cats: CatOption[]): string {
  const safeCats = Array.isArray(cats) ? cats : [];
  const map = new Map(safeCats.map((c) => [c.id, c]));
  const parts: string[] = [];
  let current: CatOption | undefined = map.get(id);
  const visited = new Set<string>();
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    parts.unshift(current.name);
    current = current.parent_id ? map.get(current.parent_id) : undefined;
  }
  return parts.join(" › ");
}

/** Builds an indented flat list for category selects */
function buildIndentedCategoryOptions(cats: CatOption[]) {
  const safeCats = Array.isArray(cats) ? cats : [];
  const byParent = new Map<string | null, CatOption[]>();
  safeCats.forEach((c) => {
    const key = c.parent_id;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  });
  const options: { value: string; label: string }[] = [];
  const visited = new Set<string>();
  const walk = (parentId: string | null, depth: number) => {
    (byParent.get(parentId) ?? []).forEach((c) => {
      if (visited.has(c.id)) return;
      visited.add(c.id);
      options.push({
        value: c.id,
        label: `${"—".repeat(depth)}${depth ? " " : ""}${c.name}`,
      });
      walk(c.id, depth + 1);
      visited.delete(c.id);
    });
  };
  walk(null, 0);
  return options;
}

// ─── Searchable Category Picker ───────────────────────────────────────────────
/** Inline searchable picker for root category — replaces the plain <SelectField> */
function SearchableCategoryPicker({
  value,
  onChange,
  categories,
}: {
  value: string;
  onChange: (id: string | null) => void;
  categories: CatOption[];
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);
    return () => clearTimeout(handler);
  }, [query]);

  const options = buildIndentedCategoryOptions(categories);
  const filtered = debouncedQuery.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(debouncedQuery.toLowerCase()),
      )
    : options;

  const maxDisplay = 100;
  const displayed = filtered.slice(0, maxDisplay);

  const selectedLabel = value
    ? (options.find((o) => o.value === value)?.label ?? "Unknown")
    : "";

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search categories…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Scrollable list */}
      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white divide-y divide-gray-50">
        {/* Clear option */}
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`w-full text-left px-3 py-2 text-xs transition-colors ${
            !value
              ? "bg-amber-100 text-amber-800 font-semibold"
              : "text-gray-400 hover:bg-gray-50"
          }`}
        >
          — All active categories —
        </button>

        {filtered.length > maxDisplay && (
          <p className="px-3 py-1.5 text-[10px] text-amber-600 bg-amber-50 font-medium">
            Showing first {maxDisplay} of {filtered.length} categories. Refine
            your search to find more.
          </p>
        )}

        {displayed.length === 0 && (
          <p className="px-3 py-3 text-xs text-gray-400">
            No categories match your search.
          </p>
        )}

        {displayed.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setQuery("");
              }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                isSelected
                  ? "bg-amber-100 text-amber-800 font-semibold"
                  : "text-gray-700 hover:bg-amber-50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Selected breadcrumb */}
      {selectedLabel && (
        <p className="text-[11px] text-amber-700 font-medium truncate">
          ✓ {buildCategoryPath(value, categories)}
        </p>
      )}
    </div>
  );
}

function L2ColumnEditor({
  col,
  categories: rawCategories,
  products: rawProducts,
  menuId,
  token,
  onSaved,
  onDeleted,
}: {
  col: L2Column;
  categories: CatOption[];
  products: { id: string; name: string }[];
  menuId: string;
  token: string;
  onSaved: (updated: L2Column) => void;
  onDeleted: (id: string) => void;
}) {
  const categories = Array.isArray(rawCategories) ? rawCategories : [];
  const products = Array.isArray(rawProducts) ? rawProducts : [];
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
        return;
      }
      toast.success(CmsNavbarConfig.SUCCESS_SAVE_COLUMN);
      onSaved({ ...draft, id: col.id });
      dispatchNavbarChange();
    } catch {
      setSaving(false);
      setError(CmsNavbarConfig.ERROR_SAVE_COLUMN);
      toast.error(CmsNavbarConfig.ERROR_SAVE_COLUMN);
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
      dispatchNavbarChange();
    } catch (err) {
      toast.error(CmsNavbarConfig.ERROR_DELETE_COLUMN);
      console.error("Delete column exception (developer details):", err);
    }
  };

  const isPromo = draft.meta.col_type === NavItemColType.PROMOTION;
  const isSubcat = draft.meta.col_type === NavItemColType.SUBCATEGORIES;
  const isProducts = draft.meta.col_type === NavItemColType.PRODUCTS;
  const colTypeLabel =
    COL_TYPE_OPTIONS.find((o) => o.value === draft.meta.col_type)?.label ??
    "Subcategory Links";

  return (
    <div className="border border-gray-100 rounded-xl bg-gray-50 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
        <span className="flex-1 text-xs font-semibold text-gray-700 truncate">
          {draft.label || "Unnamed Column"}
        </span>
        <span className="text-[10px] bg-purple-100 text-purple-600 font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
          {colTypeLabel}
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
              label="Source Category (auto-fills its subcategories)"
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
                ...buildIndentedCategoryOptions(categories),
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

          {isPromo && (
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
                  label="CTA Label (e.g. Shop Now)"
                  value={draft.meta.promo_title || ""}
                  onChange={(v: string) => patchMeta("promo_title", v)}
                />
              </div>
              <InputField
                label="Promo Subtitle"
                value={draft.meta.promo_subtitle || ""}
                onChange={(v: string) => patchMeta("promo_subtitle", v)}
                textarea
              />
            </>
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
function L1ItemEditor({
  item,
  categories: rawCategories,
  siteMaps: rawSiteMaps,
  mapsLoading,
  products: rawProducts,
  menuId,
  token,
  onSaved,
  onDeleted,
}: {
  item: L1Item;
  categories: CatOption[];
  siteMaps: SiteMap[];
  mapsLoading: boolean;
  products: { id: string; name: string }[];
  menuId: string;
  token: string;
  onSaved: (updated: L1Item) => void;
  onDeleted: (id: string) => void;
}) {
  const categories = Array.isArray(rawCategories) ? rawCategories : [];
  const siteMaps = Array.isArray(rawSiteMaps) ? rawSiteMaps : [];
  const products = Array.isArray(rawProducts) ? rawProducts : [];
  const [draft, setDraft] = useState<L1Item>({
    ...item,
    meta: item.meta || {},
    megaMenuColumns: item.megaMenuColumns || [],
    layout_type: item.layout_type || NavLayoutType.NONE,
    target_route:
      item.target_route ||
      siteMaps.find((r) => r.key === "store")?.key ||
      siteMaps[0]?.key ||
      "",
    root_category_id: item.root_category_id || null,
  });
  console.log("draft", draft);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [addingCol, setAddingCol] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const layoutType = (draft.layout_type || NavLayoutType.NONE) as NavLayoutType;
  const isAutoTree = layoutType !== NavLayoutType.NONE;
  const hasMegaMenu = isAutoTree || draft.has_mega_menu;
  const selectedRoute =
    siteMaps.find((r) => r.key === draft.target_route) ??
    siteMaps.find((r) => r.key === "store");

  const patch = (field: keyof L1Item, val: any) =>
    setDraft((p) => ({ ...p, [field]: val }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const layoutTypeVal = layoutType;
      const hasMegaMenuVal = isAutoTree ? true : draft.has_mega_menu;
      const targetRouteVal =
        draft.target_route || selectedRoute?.key || "store";
      const resolvedHref = selectedRoute?.base_path || "/";


      const res = await updateNavbarItem(
        item.id,
        {
          label: draft.label,
          href: resolvedHref,
          item_type: NavItemType.CUSTOM_LINK,
          category_id: undefined,
          has_mega_menu: hasMegaMenuVal,
          layout_type: layoutTypeVal,
          root_category_id: isAutoTree
            ? (draft.root_category_id ?? null)
            : null,
          target_route: targetRouteVal,
          sort_order: draft.sort_order,
          meta: (() => {
            const { route_key, ...rest } = draft.meta || {};
            return rest;
          })(),
        },
        token,
      );
      setSaving(false);
      if (res?.success === false) {
        const msg = res?.message || CmsNavbarConfig.ERROR_SAVE_LINK;
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success(CmsNavbarConfig.SUCCESS_SAVE_LINK);
      onSaved({
        ...draft,
        has_mega_menu: hasMegaMenuVal,
        layout_type: layoutTypeVal,
        root_category_id: draft.root_category_id || null,
        target_route: targetRouteVal,
        id: item.id,
      });
      dispatchNavbarChange();
    } catch {
      setSaving(false);
      setError(CmsNavbarConfig.ERROR_SAVE_LINK);
      toast.error(CmsNavbarConfig.ERROR_SAVE_LINK);
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
        href: selectedRoute?.base_path ?? "/",
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
        return;
      }
      toast.success(CmsNavbarConfig.SUCCESS_DELETE_LINK);
      onDeleted(item.id);
      dispatchNavbarChange();
    } catch {
      toast.error(CmsNavbarConfig.ERROR_DELETE_LINK);
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

  const badge = hasMegaMenu ? badgeFor(layoutType, draft.has_mega_menu) : null;
  function badgeFor(lt: NavLayoutType, hasMega: boolean) {
    if (lt === NavLayoutType.DIRECTORY)
      return { label: "DIRECTORY", cls: "bg-emerald-100 text-emerald-700" };
    if (lt === NavLayoutType.GRID)
      return { label: "GRID", cls: "bg-orange-100 text-orange-700" };
    if (hasMega)
      return { label: "MEGA MENU", cls: "bg-indigo-100 text-indigo-700" };
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <GripVertical className="w-4 h-4 text-gray-300 cursor-grab shrink-0" />
        <span className="flex-1 font-semibold text-sm text-gray-800 truncate">
          {draft.label || "Unnamed Item"}
        </span>
        {badge && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${badge.cls}`}
          >
            {badge.label}
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
        <div className="p-5 space-y-5">
          {/* ── Step 1: Label ── */}
          <div>
            <InputField
              label="Navigation Label"
              value={draft.label}
              onChange={(v: string) => patch("label", v)}
            />
            <p className="text-xs text-gray-400 mt-1.5">
              This is the text shown in the navbar.
            </p>
          </div>

          {/* ── Step 2: Destination ── */}
          <div>
            {mapsLoading ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500">
                  Destination
                </label>
                <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            ) : (
              <SelectField
                label="Destination"
                value={draft.target_route || ""}
                onChange={(v: string) => patch("target_route", v)}
                options={siteMaps.map((route) => ({
                  value: route.key,
                  label: route.label,
                }))}
              />
            )}
          </div>

          {/* ── Step 3: Layout Type ── */}
          <div>
            <SelectField
              label="Menu Style"
              value={layoutType}
              onChange={(v: string) =>
                setDraft((p) => ({
                  ...p,
                  layout_type: v as NavLayoutType,
                  has_mega_menu:
                    v !== NavLayoutType.NONE ? true : p.has_mega_menu,
                  root_category_id:
                    v === NavLayoutType.NONE ? null : p.root_category_id,
                }))
              }
              options={LAYOUT_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />
            <p className="text-xs text-gray-500 mt-1.5 ml-1">
              {LAYOUT_OPTIONS.find((o) => o.value === layoutType)?.description}
            </p>
          </div>

          {/* ── Step 4a: Root Category (DIRECTORY / GRID only) ── */}
          {isAutoTree && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800">
                    Root Category (Optional)
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Select a root category to restrict the menu to a specific
                    branch. If none is selected, the menu will auto-generate
                    from all top-level parent categories.
                  </p>
                </div>
              </div>
              {/* Deleted root warning */}
              {draft.root_category_id &&
                categories.length > 0 &&
                !categories.find((c) => c.id === draft.root_category_id) && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">
                      The previously selected root category no longer exists or
                      has been deleted. Please select a new one.
                    </p>
                  </div>
                )}

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">
                  Root Category
                </label>
                <SearchableCategoryPicker
                  value={draft.root_category_id || ""}
                  onChange={(v) => patch("root_category_id", v)}
                  categories={categories}
                />
              </div>
            </div>
          )}

          {/* ── Step 4b: Mega-menu toggle (NONE layout only) ── */}
          {!isAutoTree && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
              <Toggle
                label="Enable Mega-Menu Panel"
                description="Adds a dropdown panel with curated columns below this link."
                value={draft.has_mega_menu}
                onChange={(v) => patch("has_mega_menu", v)}
              />
            </div>
          )}

          {/* Save L1 */}
          <div className="flex justify-end pt-2">
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}
          </div>
          <div className="flex justify-end pt-1">
            <SaveBtn onClick={save} saving={saving} label="Save Link" />
          </div>

          {/* ── Mega-menu columns ── */}
          {draft.has_mega_menu && !isAutoTree && (
            <div className="space-y-3 pt-3 border-t border-gray-100">
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

interface CmsNavbarState {
  data: NavbarData | null;
  loading: boolean;
  products: { id: string; name: string }[];
  settings: UpsertNavMenuPayload;
  savingSettings: boolean;
  items: L1Item[];
  addingItem: boolean;
  categories: CatOption[];
  siteMaps: SiteMap[];
  mapsLoading: boolean;
}

// ─── State Management ─────────────────────────────────────────────────────────

const initialState: CmsNavbarState = {
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

enum ActionType {
  SET_LOADING = "SET_LOADING",
  SET_MAPS_LOADING = "SET_MAPS_LOADING",
  SET_INITIAL_DATA = "SET_INITIAL_DATA",
  PATCH_SETTINGS = "PATCH_SETTINGS",
  SET_SAVING_SETTINGS = "SET_SAVING_SETTINGS",
  SET_ADDING_ITEM = "SET_ADDING_ITEM",

  ADD_ITEM = "ADD_ITEM",
  SAVE_ITEM = "SAVE_ITEM",
  DELETE_ITEM = "DELETE_ITEM",
}

type NavbarAction =
  | { type: ActionType.SET_LOADING; payload: boolean }
  | { type: ActionType.SET_MAPS_LOADING; payload: boolean }
  | {
      type: ActionType.SET_INITIAL_DATA;
      payload: Omit<
        CmsNavbarState,
        "loading" | "savingSettings" | "addingItem" | "mapsLoading"
      >;
    }
  | {
      type: ActionType.PATCH_SETTINGS;
      payload: { field: keyof UpsertNavMenuPayload; value: any };
    }
  | { type: ActionType.SET_SAVING_SETTINGS; payload: boolean }
  | { type: ActionType.SET_ADDING_ITEM; payload: boolean }
  | { type: ActionType.ADD_ITEM; payload: L1Item }
  | { type: ActionType.SAVE_ITEM; payload: L1Item }
  | { type: ActionType.DELETE_ITEM; payload: string };

function reducer(state: CmsNavbarState, action: NavbarAction): CmsNavbarState {
  switch (action.type) {
    case ActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionType.SET_MAPS_LOADING:
      return { ...state, mapsLoading: action.payload };
    case ActionType.SET_INITIAL_DATA:
      return {
        ...state,
        data: action.payload.data,
        settings: action.payload.settings,
        items: action.payload.items,
        categories: action.payload.categories,
        products: action.payload.products,
        siteMaps: action.payload.siteMaps,
      };
    case ActionType.PATCH_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.field]: action.payload.value,
        },
      };
    case ActionType.SET_SAVING_SETTINGS:
      return { ...state, savingSettings: action.payload };
    case ActionType.SET_ADDING_ITEM:
      return { ...state, addingItem: action.payload };
    case ActionType.ADD_ITEM:
      return { ...state, items: [...state.items, action.payload] };
    case ActionType.SAVE_ITEM:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        ),
      };
    case ActionType.DELETE_ITEM:
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
      };
    default:
      return state;
  }
}

export function CmsNavbarTab() {
  const token = authToken();
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Data load ────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      dispatch({ type: ActionType.SET_LOADING, payload: true });
      try {
        const [navRes, catRes, prodRes, mapsRes] = await Promise.all([
          AxiosAPI.get("/v1/navbar").catch(() => null),
          AxiosAPI.get("/v1/categories?limit=500").catch(() => null),
          token
            ? fetchVendorActiveProducts(token).catch(() => null)
            : Promise.resolve(null),
          AxiosAPI.get("/v1/site-maps").catch(() => null),
        ]);

        const d: NavbarData | null = navRes?.data?.data ?? navRes?.data ?? null;
        const setts: UpsertNavMenuPayload = d?.settings ?? {};
        const itms: L1Item[] = d?.navigationItems ?? [];
        const cats: CatOption[] = Array.isArray(catRes?.data?.data)
          ? catRes.data.data
          : Array.isArray(catRes?.data)
            ? catRes.data
            : [];
        const prodList = Array.isArray(prodRes?.data?.data)
          ? prodRes.data.data
          : Array.isArray(prodRes?.data)
            ? prodRes.data
            : [];
        const prods = prodList.map((p: any) => ({ id: p.id, name: p.name }));
        const sMaps: SiteMap[] = Array.isArray(mapsRes?.data?.data)
          ? mapsRes.data.data
          : Array.isArray(mapsRes?.data)
            ? mapsRes.data
            : [];

        dispatch({
          type: ActionType.SET_INITIAL_DATA,
          payload: {
            data: d,
            settings: setts,
            items: itms,
            categories: cats,
            products: prods,
            siteMaps: sMaps,
          },
        });
      } catch {
        toast.error(CmsNavbarConfig.ERROR_LOAD_DATA);
      } finally {
        dispatch({ type: ActionType.SET_MAPS_LOADING, payload: false });
        dispatch({ type: ActionType.SET_LOADING, payload: false });
      }
    };
    load();
  }, [token]);

  // ── Patch helpers ────────────────────────────────────────────────────────────
  const patchSettings = (field: keyof UpsertNavMenuPayload, val: any) =>
    dispatch({
      type: ActionType.PATCH_SETTINGS,
      payload: { field, value: val },
    });

  // ── Save scalar settings ────────────────────────────────────────────────────
  const saveSettings = async () => {
    if (!token) return;
    dispatch({ type: ActionType.SET_SAVING_SETTINGS, payload: true });
    try {
      const res = await upsertNavbarMenu(state.settings, token);
      dispatch({
        type: ActionType.SET_SAVING_SETTINGS,
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
        type: ActionType.SET_SAVING_SETTINGS,
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
      type: ActionType.PATCH_SETTINGS,
      payload: { field: "logo_src", value: newUrl },
    });
    try {
      const res = await upsertNavbarMenu(updatedSettings, token);
      if (res?.success === false)
        toast.error(res?.message || CmsNavbarConfig.ERROR_SAVE_SETTINGS);
      else toast.success("Logo saved.");
    } catch {
      toast.error(CmsNavbarConfig.ERROR_SAVE_SETTINGS);
    }
  };

  // ── Add a new L1 item ───────────────────────────────────────────────────────
  const addL1Item = async () => {
    if (!state.data?.menu_id || !token) return;
    dispatch({ type: ActionType.SET_ADDING_ITEM, payload: true });
    try {
      const defaultRoute =
        state.siteMaps.find((r) => r.key === "store") ?? state.siteMaps[0];
      const res = await createNavbarItem(
        {
          menu_id: state.data.menu_id,
          label: "New Link",
          href: defaultRoute?.base_path || "/",
          item_type: NavItemType.CUSTOM_LINK,
          has_mega_menu: false,
          target_route: defaultRoute?.key || "store",
          sort_order: state.items.length,
          meta: {},
        },
        token,
      );
      dispatch({ type: ActionType.SET_ADDING_ITEM, payload: false });
      if (res?.success === false) {
        toast.error(res?.message || CmsNavbarConfig.ERROR_ADD_LINK);

        return;
      }
      const newItem = res?.data?.data || res?.data;
      if (newItem?.id) {
        toast.success(CmsNavbarConfig.SUCCESS_ADD_LINK);
        dispatch({
          type: ActionType.ADD_ITEM,
          payload: newItem as L1Item,
        });
        dispatchNavbarChange();
      } else {
        toast.error("Link was not created — please retry.");
      }
    } catch (err) {
      dispatch({ type: ActionType.SET_ADDING_ITEM, payload: false });
      toast.error(CmsNavbarConfig.ERROR_ADD_LINK);
    }
  };

  // ─── Loading skeleton ───────────────────────────────────────────────────────
  if (state.loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="h-24 bg-gray-100 rounded-2xl" />
        <div className="h-24 bg-gray-100 rounded-2xl" />
        <div className="h-24 bg-gray-100 rounded-2xl" />
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
            label="Save Settings"
          />
        }
      >
        <div className="space-y-4">
          <ImageUploadField
            label="Logo Image"
            value={state.settings.logo_src || ""}
            onChange={(v: string) => patchSettings("logo_src", v)}
            onAutoSave={makeAutoSave}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Logo Alt Text"
              value={state.settings.logo_alt || ""}
              onChange={(v: string) => patchSettings("logo_alt", v)}
            />
            <SelectField
              label="Logo Alignment"
              value={state.settings.logo_alignment || NavMenuLogoAlignment.LEFT}
              onChange={(v: string) =>
                patchSettings("logo_alignment", v as any)
              }
              options={ALIGNMENT_OPTIONS}
            />
          </div>
        </div>
      </CmsSection>

      {/* ── 2. Behavior ─────────────────────────────────────────────────────── */}
      <CmsSection title="Navbar Behavior">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            label="Scroll Behavior"
            value={state.settings.position || NavMenuPosition.STICKY}
            onChange={(v: string) => patchSettings("position", v as any)}
            options={POSITION_OPTIONS}
          />
          <div className="pt-3 space-y-1 divide-y divide-gray-100">
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
          <div className="pt-3">
            <InputField
              label="Placeholder Text"
              value={state.settings.search_placeholder || ""}
              onChange={(v: string) => patchSettings("search_placeholder", v)}
            />
          </div>
        )}
      </CmsSection>

      {/* ── Section 4: Utility Icons ── */}
      <CmsSection title="Utility Icons (right side)">
        <div className="divide-y divide-gray-100 space-y-1">
          <div className="flex items-center gap-3 py-1">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div className="flex-1">
              <Toggle
                label="Account"
                value={state.settings.show_account ?? true}
                onChange={(v) => patchSettings("show_account", v)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 py-1">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <Heart className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div className="flex-1">
              <Toggle
                label="Wishlist"
                value={state.settings.show_wishlist ?? true}
                onChange={(v) => patchSettings("show_wishlist", v)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 py-1">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-3.5 h-3.5 text-gray-500" />
            </div>
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
          <div className="text-center py-10 text-gray-400">
            <LayoutPanelLeft className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              Save your settings first to unlock navigation links.
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
          <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-xl">
            <LinkIcon className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              No navigation links yet — add your first link above.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {state.items.map((item, idx) => (
            <L1ItemEditor
              key={item.id || idx}
              item={item}
              categories={state.categories}
              siteMaps={state.siteMaps}
              mapsLoading={state.mapsLoading}
              menuId={menuId!}
              token={token!}
              onSaved={(updated) =>
                dispatch({ type: ActionType.SAVE_ITEM, payload: updated })
              }
              onDeleted={(id) =>
                dispatch({ type: ActionType.DELETE_ITEM, payload: id })
              }
              products={state.products}
            />
          ))}
        </div>
      </CmsSection>
    </div>
  );
}
