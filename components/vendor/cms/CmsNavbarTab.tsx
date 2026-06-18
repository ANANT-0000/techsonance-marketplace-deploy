"use client";
import React, { useState, useEffect, useCallback } from "react";
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
} from "@/utils/vendorApiClient";
import { authToken } from "@/utils/authToken";
import { ColumnType } from "@/constants";

// ─── Local Types ─────────────────────────────────────────────────────────────
export enum NavItemType {
  CUSTOM_LINK = "custom_link",
  CATEGORY = "category",
}
export enum NavItemDisplayType {
  CATEGORY_LISTING = "category_listing",
  DYNAMIC_SUBCATEGORIES = "dynamic_subcategories",
  PRODUCT_RANGES = "product_ranges",
}
export enum NavItemColType {
  SUBCATEGORIES = "subcategories",
  BRANDS = "brands",
  PROMOTION = "promotion",
}

export enum NavMenuPosition {
  STICKY = "sticky",
  RELATIVE = "relative",
}
export enum NavMenuLogoAlignment {
  LEFT = "left",
  CENTER = "center",
}
export enum NavMenuType {
  SIMPLE = "simple",
  MEGA = "mega",
}
export enum ColType {
  SUBCATEGORIES = "subcategories",
  BRANDS = "brands",
  PROMOTION = "promotion",
}
interface L2Column {
  id: string;
  label: string;
  href: string;
  sort_order: number;
  meta: NavItemMetaPayload;
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
  { value: ColType.SUBCATEGORIES, label: "Subcategory Links" },
  { value: ColType.BRANDS, label: "Brand Links" },
  { value: ColType.PROMOTION, label: "Promotion Banner" },
];

const DISPLAY_TYPE_OPTIONS = [
  {
    value: NavItemDisplayType.CATEGORY_LISTING,
    label: "Curated Category List",
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
  menuId,
  token,
  onSaved,
  onDeleted,
}: {
  col: L2Column;
  categories: { id: string; name: string }[];
  menuId: string;
  token: string;
  onSaved: (updated: L2Column) => void;
  onDeleted: (id: string) => void;
}) {
  const [draft, setDraft] = useState<L2Column>(col);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const patch = (field: keyof L2Column, val: any) =>
    setDraft((p) => ({ ...p, [field]: val }));
  const patchMeta = (field: keyof NavItemMetaPayload, val: any) =>
    setDraft((p) => ({ ...p, meta: { ...p.meta, [field]: val } }));

  const save = async () => {
    setSaving(true);
    const res = await updateNavbarItem(
      col.id,
      {
        label: draft.label,
        href: draft.href,
        sort_order: draft.sort_order,
        meta: draft.meta,
      },
      token,
    );
    setSaving(false);
    if (res?.success !== false) onSaved({ ...draft, id: col.id });
  };

  const remove = async () => {
    if (!confirm(`Delete column "${col.label}"?`)) return;
    await deleteNavbarItem(col.id, token);
    onDeleted(col.id);
  };

  const isPromo = draft.meta.col_type === ColumnType.PROMOTION;

  return (
    <div className="border border-gray-100 rounded-xl bg-gray-50 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2">
        <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
        <span className="flex-1 text-xs font-semibold text-gray-700 truncate">
          {draft.label || "Unnamed Column"}
        </span>
        <span className="text-[10px] bg-purple-100 text-purple-600 font-bold px-2 py-0.5 rounded-full uppercase">
          {draft.meta.col_type || ColumnType.SUBCATEGORIES}
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
              value={draft.meta.col_type || ColumnType.SUBCATEGORIES}
              onChange={(v: string) => patchMeta("col_type", v)}
              options={COL_TYPE_OPTIONS}
            />
          </div>

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
          ) : (
            <InputField
              label="Section Link (href)"
              value={draft.href}
              onChange={(v: string) => patch("href", v)}
              mono
            />
          )}

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
  categories,
  menuId,
  token,
  onSaved,
  onDeleted,
}: {
  item: L1Item;
  categories: { id: string; name: string }[];
  menuId: string;
  token: string;
  onSaved: (updated: L1Item) => void;
  onDeleted: (id: string) => void;
}) {
  const [draft, setDraft] = useState<L1Item>(item);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [addingCol, setAddingCol] = useState(false);

  const patch = (field: keyof L1Item, val: any) =>
    setDraft((p) => ({ ...p, [field]: val }));
  const patchMeta = (field: keyof NavItemMetaPayload, val: any) =>
    setDraft((p) => ({ ...p, meta: { ...p.meta, [field]: val } }));

  const save = async () => {
    setSaving(true);
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
    if (res?.success !== false) onSaved({ ...draft, id: item.id });
  };

  const remove = async () => {
    if (
      !confirm(
        `Delete "${item.label}"? All mega-menu columns will also be removed.`,
      )
    )
      return;
    await deleteNavbarItem(item.id, token);
    onDeleted(item.id);
  };

  const addColumn = async () => {
    setAddingCol(true);
    const newCol: CreateNavItemPayload = {
      menu_id: menuId,
      parent_id: item.id,
      label: "New Column",
      href: "/store",
      item_type: NavItemType.CUSTOM_LINK,
      has_mega_menu: false,
      sort_order: draft.megaMenuColumns.length,
      meta: { col_type: ColumnType.SUBCATEGORIES, col_title: "New Column" },
    };
    const res = await createNavbarItem(newCol, token);
    setAddingCol(false);

    const newColData = res?.data?.data || res?.data;
    if (newColData && newColData.id) {
      setDraft((p) => ({
        ...p,
        megaMenuColumns: [...p.megaMenuColumns, newColData as L2Column],
      }));
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
              value={draft.item_type}
              onChange={(v: string) => patch("item_type", v as any)}
              options={ITEM_TYPE_OPTIONS}
            />
            {draft.item_type === "category" ? (
              <SelectField
                label="Category"
                value={draft.category_id || ""}
                onChange={(v: string) => patch("category_id", v)}
                options={[
                  { value: "", label: "— Select Category —" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            ) : (
              <InputField
                label="URL / Path"
                value={draft.href}
                onChange={(v: string) => patch("href", v)}
                mono
              />
            )}
          </div>

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
                  value={draft.meta.display_type || "CATEGORY_LISTING"}
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
                {draft.meta.display_type ===
                  NavItemDisplayType.CATEGORY_LISTING && (
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
                  onSaved={onColSaved}
                  onDeleted={onColDeleted}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Tab Component ───────────────────────────────────────────────────────

export function CmsNavbarTab() {
  const token = authToken();

  const [data, setData] = useState<NavbarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );

  // Scalar settings draft (separate from item tree so saves are isolated)
  const [settings, setSettings] = useState<UpsertNavMenuPayload>({});
  const [savingSettings, setSavingSettings] = useState(false);

  // Local item tree (mutated by add/remove/reorder actions)
  const [items, setItems] = useState<L1Item[]>([]);
  const [addingItem, setAddingItem] = useState(false);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [navRes, catRes] = await Promise.all([
        AxiosAPI.get("/v1/navbar").catch(() => null),
        AxiosAPI.get("/v1/categories?limit=200").catch(() => null),
      ]);

      if (navRes?.data) {
        const d: NavbarData = navRes.data?.data ?? navRes.data;
        setData(d);
        setSettings(d.settings ?? {});
        setItems(d.navigationItems ?? []);
      }
      if (catRes?.data) {
        const list = catRes.data?.data ?? catRes.data ?? [];
        setCategories(list);
      }
      setLoading(false);
    };
    load();
  }, []);

  // ── Patch helpers ────────────────────────────────────────────────────────────
  const patchSettings = (field: keyof UpsertNavMenuPayload, val: any) =>
    setSettings((p) => ({ ...p, [field]: val }));

  // ── Save scalar settings ────────────────────────────────────────────────────
  const saveSettings = async () => {
    if (!token) return;
    setSavingSettings(true);
    await upsertNavbarMenu(settings, token);
    setSavingSettings(false);
  };
  const makeAutoSave = async (newUrl: string) => {
    if (!token) return;
    const updatedSettings = { ...settings, logo_src: newUrl };
    setSettings(updatedSettings);
    await upsertNavbarMenu(updatedSettings, token);
  };

  // ── Add a new L1 item ───────────────────────────────────────────────────────
  const addL1Item = async () => {
    if (!data?.menu_id || !token) return;
    setAddingItem(true);
    const res = await createNavbarItem(
      {
        menu_id: data.menu_id,
        label: "New Link",
        href: "/store",
        item_type: NavItemType.CUSTOM_LINK,
        has_mega_menu: false,
        sort_order: items.length,
        meta: {},
      },
      token,
    );
    setAddingItem(false);
    if (res?.data) setItems((p) => [...p, res.data as L1Item]);
  };

  const onItemSaved = (updated: L1Item) =>
    setItems((p) => p.map((i) => (i.id === updated.id ? updated : i)));

  const onItemDeleted = (id: string) =>
    setItems((p) => p.filter((i) => i.id !== id));

  // ─── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  // ─── Empty state (no menu_id yet) ──────────────────────────────────────────
  const menuId = data?.menu_id;

  return (
    <div className="space-y-6">
      {/* ── 1. Logo & Branding ──────────────────────────────────────────────── */}
      <CmsSection
        title="Logo & Branding"
        action={
          <SaveBtn
            onClick={saveSettings}
            saving={savingSettings}
            label="Save All Settings"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <ImageUploadField
              label="Logo Image (Cloudinary / CDN URL)"
              value={settings.logo_src || ""}
              onChange={(v: string) => patchSettings("logo_src", v)}
              onAutoSave={makeAutoSave}
            />
          </div>
          <InputField
            label="Logo Alt Text"
            value={settings.logo_alt || ""}
            onChange={(v: string) => patchSettings("logo_alt", v)}
          />
          <InputField
            label="Logo Link (href)"
            value={settings.logo_href || "/"}
            onChange={(v: string) => patchSettings("logo_href", v)}
          />
          <SelectField
            label="Logo Alignment"
            value={settings.logo_alignment || "LEFT"}
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
            value={settings.position || "STICKY"}
            onChange={(v: string) => patchSettings("position", v as any)}
            options={POSITION_OPTIONS}
          />
          <div className="space-y-1 col-span-2">
            <Toggle
              label="Show drop-shadow"
              value={settings.show_shadow ?? true}
              onChange={(v) => patchSettings("show_shadow", v)}
            />
            <Toggle
              label="Show bottom border"
              value={settings.show_border ?? true}
              onChange={(v) => patchSettings("show_border", v)}
            />
          </div>
        </div>
      </CmsSection>

      {/* ── 3. Search Bar ───────────────────────────────────────────────────── */}
      <CmsSection title="Search Bar">
        <Toggle
          label="Show search bar"
          value={settings.search_visible ?? true}
          onChange={(v) => patchSettings("search_visible", v)}
        />
        {settings.search_visible !== false && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <InputField
              label="Placeholder Text"
              value={settings.search_placeholder || ""}
              onChange={(v: string) => patchSettings("search_placeholder", v)}
            />
            <InputField
              label="Search Endpoint"
              value={settings.search_endpoint || "/store/search"}
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
                value={settings.show_account ?? true}
                onChange={(v) => patchSettings("show_account", v)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3">
            <Heart className="w-4 h-4 text-gray-400" />
            <div className="flex-1">
              <Toggle
                label="Wishlist"
                value={settings.show_wishlist ?? true}
                onChange={(v) => patchSettings("show_wishlist", v)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3">
            <ShoppingCart className="w-4 h-4 text-gray-400" />
            <div className="flex-1">
              <Toggle
                label="Cart"
                value={settings.show_cart ?? true}
                onChange={(v) => patchSettings("show_cart", v)}
              />
            </div>
          </div>
        </div>
      </CmsSection>

      {/* ── 5. Navigation Items (L1) ────────────────────────────────────────── */}
      <CmsSection
        title={`Navigation Links (${items.length})`}
        action={
          menuId ? (
            <button
              onClick={addL1Item}
              disabled={addingItem}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {addingItem ? "Adding…" : "Add Link"}
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
              disabled={savingSettings}
              className="mt-3 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {savingSettings ? "Saving…" : "Save Settings & Unlock"}
            </button>
          </div>
        )}

        {menuId && items.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
            <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No navigation links yet — add your first link above.</p>
          </div>
        )}

        <div className="space-y-3">
          {items.map((item) => (
            <L1ItemEditor
              key={item.id}
              item={item}
              categories={categories}
              menuId={menuId!}
              token={token!}
              onSaved={onItemSaved}
              onDeleted={onItemDeleted}
            />
          ))}
        </div>
      </CmsSection>
    </div>
  );
}
