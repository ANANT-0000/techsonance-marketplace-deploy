"use client";
import { useState, useEffect, useCallback, useRef, useReducer } from "react";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Globe,
  Languages,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";
import AxiosAPI from "@/lib/axios";
import { authToken } from "@/utils/authToken";
import { BrandingTab } from "@/components/vendor/BrandingTab";
import { fetchProductOptions } from "@/utils/commonAPiClient";

export enum PageType {
  HOME = "home",
  NAVBAR = "navbar",
  FOOTER = "footer",
  ABOUT = "about",
  CONTACT = "contact",
  STORE = "store",
  THEME = "theme",
}

export enum LangType {
  EN = "en",
  ES = "es",
}

interface CmsState {
  page: PageType;
  lang: LangType;
  loading: boolean;
  saving: boolean;
  msg: { text: string; ok: boolean } | null;
  data: any;
}

type CmsAction =
  | { type: "SET_PAGE"; payload: PageType }
  | { type: "SET_LANG"; payload: LangType }
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: any }
  | { type: "FETCH_FAILURE"; payload: string }
  | { type: "SAVE_START" }
  | { type: "SAVE_SUCCESS"; payload: string }
  | { type: "SAVE_FAILURE"; payload: string }
  | { type: "SET_DATA_FIELD"; payload: { key: string; val: any } }
  | { type: "SET_DATA_FULL"; payload: any }
  | { type: "CLEAR_MESSAGE" };

const initialState: CmsState = {
  page: PageType.HOME,
  lang: LangType.EN,
  loading: false,
  saving: false,
  msg: null,
  data: {},
};

function cmsReducer(state: CmsState, action: CmsAction): CmsState {
  switch (action.type) {
    case "SET_PAGE":
      return { ...state, page: action.payload, msg: null };
    case "SET_LANG":
      return { ...state, lang: action.payload, msg: null };
    case "FETCH_START":
      return { ...state, loading: true, msg: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, data: action.payload };
    case "FETCH_FAILURE":
      return {
        ...state,
        loading: false,
        msg: { text: action.payload, ok: false },
      };
    case "SAVE_START":
      return { ...state, saving: true, msg: null };
    case "SAVE_SUCCESS":
      return {
        ...state,
        saving: false,
        msg: { text: action.payload, ok: true },
      };
    case "SAVE_FAILURE":
      return {
        ...state,
        saving: false,
        msg: { text: action.payload, ok: false },
      };
    case "SET_DATA_FIELD":
      return {
        ...state,
        data: { ...state.data, [action.payload.key]: action.payload.val },
      };
    case "SET_DATA_FULL":
      return { ...state, data: action.payload };
    case "CLEAR_MESSAGE":
      return { ...state, msg: null };
    default:
      return state;
  }
}

const PAGES: PageType[] = [
  PageType.HOME,
  PageType.NAVBAR,
  PageType.FOOTER,
  PageType.ABOUT,
  PageType.CONTACT,
  PageType.STORE,
  PageType.THEME,
];

const PAGE_LABELS: Record<PageType, string> = {
  [PageType.HOME]: "Home Page",
  [PageType.NAVBAR]: "Navbar",
  [PageType.FOOTER]: "Footer",
  [PageType.ABOUT]: "About Us",
  [PageType.CONTACT]: "Contact",
  [PageType.STORE]: "Store",
  [PageType.THEME]: "Storefront Theme & Layout",
};

const toDatetimeLocal = (val: string) => {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  } catch {
    return "";
  }
};

function Field({ label, value, onChange, textarea, mono, type }: any) {
  const cls = `w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 ${mono ? "font-mono" : ""}`;
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1.5">
        {label}
      </label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      ) : (
        <input
          type={type || "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
    </div>
  );
}

function ColorField({ label, value, onChange }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 border border-gray-200 rounded-xl cursor-pointer bg-transparent shrink-0"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 font-mono"
        />
      </div>
    </div>
  );
}

function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = authToken();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await AxiosAPI.post("/v1/cms/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data?.data?.secure_url) {
        onChange(res.data.data.secure_url);
      } else {
        throw new Error("Upload succeeded but no URL returned.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
        {value ? (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm shrink-0">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-white text-gray-400 shrink-0">
            <ImageIcon size={16} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <label className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-250 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer transition-all">
            {uploading ? (
              <>
                <Loader2 size={12} className="animate-spin text-purple-600" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={12} className="text-gray-500" />
                <span>Upload Image</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
          {!error && value && (
            <p
              className="text-[10px] text-emerald-600 mt-1 truncate"
              title={value}
            >
              ✓ Cloudinary Image Attached
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400 font-semibold text-gray-750"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Slide Query Picker ─────────────────────────────────────────────────────
// Fetches real categories + product names from the server and presents them
// as clickable tag chips.  No typing = no typos.  Vendor just clicks.
function SlideQueryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [categories, setCategories] = useState<string[]>([]);
  const [productTags, setProductTags] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>(() =>
    value ? value.split(" ").filter(Boolean) : [],
  );
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const didFetch = useRef(false);

  // Fetch categories + product names once
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    (async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          AxiosAPI.get("/v1/categories"),
          AxiosAPI.get("/v1/products?limit=100"),
        ]);
        // Categories
        const cats: string[] = (catRes.data?.data ?? catRes.data ?? [])
          .map((c: any) => c.name)
          .filter(Boolean);
        // Product names (take first word of each, deduplicated, max 40 tags)
        const rawProds: any[] = prodRes.data?.data ?? [];
        const words = new Set<string>();
        rawProds.forEach((p: any) => {
          if (p.name) {
            // Add full name as a tag
            words.add(p.name.trim());
            // Also split into individual keywords (≥4 chars)
            p.name.split(/\s+/).forEach((w: string) => {
              if (w.length >= 4) words.add(w.toLowerCase());
            });
          }
          if (p.category?.name) words.add(p.category.name.trim());
        });
        const prodArr = Array.from(words).slice(0, 50);
        setCategories(cats);
        setProductTags(prodArr);
      } catch {
        setCategories([]);
        setProductTags([]);
      } finally {
        setFetching(false);
      }
    })();
  }, []);

  // Sync inbound value → selected chips (if parent changes)
  useEffect(() => {
    const incoming = value ? value.split(" ").filter(Boolean) : [];
    setSelected(incoming);
  }, [value]);

  const toggle = useCallback(
    (tag: string) => {
      setSelected((prev) => {
        const next = prev.includes(tag)
          ? prev.filter((t) => t !== tag)
          : [...prev, tag];
        onChange(next.join(" "));
        return next;
      });
    },
    [onChange],
  );

  const clear = () => {
    setSelected([]);
    onChange("");
  };

  // Filter by search input
  const allTags = [...new Set([...categories, ...productTags])];
  const visible = search.trim()
    ? allTags.filter((t) => t.toLowerCase().includes(search.toLowerCase()))
    : allTags;

  return (
    <div className="md:col-span-2">
      <label className="block text-xs font-bold text-gray-500 mb-1.5">
        Slide Promotion — Pick what products to show
      </label>
      <p className="text-[10px] text-gray-400 mb-3">
        Click tags below to build the search query. Customers clicking the slide
        button will see matching products.
      </p>

      {/* Search filter */}
      <input
        type="text"
        placeholder="Filter tags…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs mb-3 focus:outline-none focus:border-purple-400"
      />

      {/* Tag cloud */}
      {fetching ? (
        <div className="flex items-center gap-2 text-xs text-gray-400 py-3">
          <span className="animate-spin border-2 border-purple-400 border-t-transparent rounded-full w-4 h-4 inline-block" />
          Loading products from your store…
        </div>
      ) : visible.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">
          No matching tags. Try a different search.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
          {visible.map((tag) => {
            const active = selected.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all duration-150 ${
                  active
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-700"
                }`}
              >
                {active ? "✓ " : ""}
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected summary */}
      <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        {selected.length === 0 ? (
          <p className="text-xs text-gray-400">
            No tags selected — all products will show.
          </p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Selected ({selected.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {selected.map((t) => (
                    <span
                      key={t}
                      className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={clear}
                className="text-[10px] text-red-400 hover:text-red-600 font-semibold mt-0.5 flex-shrink-0"
              >
                Clear all
              </button>
            </div>
            <p className="text-[10px] text-emerald-600 mt-2 font-mono">
              ↳ /store?search={encodeURIComponent(selected.join(" "))}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const ProductPreviewCard = ({ productId }: { productId: string }) => {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      return;
    }
    let active = true;
    setLoading(true);
    AxiosAPI.get(`/v1/products/${productId}`)
      .then((res) => {
        if (active) {
          setProduct(res.data?.data ?? res.data);
        }
      })
      .catch(() => {
        if (active) setProduct(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="text-[10px] text-slate-400 mt-1 animate-pulse">
        Loading product preview...
      </div>
    );
  }

  if (!product) return null;

  const imageUrl =
    product.variants?.[0]?.images?.[0]?.image_url ??
    product.images?.[0]?.image_url ??
    "";
  const price = product.base_price ?? product.basePrice ?? 0;

  return (
    <div className="flex items-center gap-2 mt-1 bg-white p-2 rounded-lg border border-slate-100 animate-fadeIn">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={product.name}
          className="w-8 h-8 rounded object-cover border border-slate-100 shrink-0"
        />
      )}
      <div className="text-[10px] leading-tight text-slate-500">
        <span className="font-bold text-slate-700 block truncate">
          {product.name}
        </span>
        <span>₹{Number(price).toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
};

export default function CmsManagementPage() {
  const [state, dispatch] = useReducer(cmsReducer, initialState);
  const { page, lang, loading, saving, msg, data } = state;

  const [products, setProducts] = useState<{id: string; name: string;}[]>([]);
  const [selectedHotspotId, setSelectedHotspotId] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchProductOptions()
        setProducts(res ?? []);
      } catch {
        // ignore
      }
    })();
  }, []);

  const token = authToken() || "";

  const load = async () => {
    if (page === PageType.THEME) {
      dispatch({ type: "FETCH_SUCCESS", payload: {} });
      return;
    }
    dispatch({ type: "FETCH_START" });
    try {
      const res = await AxiosAPI.get(`/v1/cms/${page}?lang=${lang}`);
      // Backend wraps: { data: { content: '...' }, status, message }
      // Must unwrap the envelope before reading content
      const cmsRow = res.data?.data ?? res.data;
      const raw = cmsRow?.content;
      let parsed = typeof raw === "string" ? JSON.parse(raw) : (raw ?? {});
      dispatch({ type: "FETCH_SUCCESS", payload: parsed });
    } catch {
      dispatch({ type: "FETCH_SUCCESS", payload: {} });
    }
  };

  useEffect(() => {
    load();
  }, [page, lang]);

  const set = (key: string, val: any) =>
    dispatch({ type: "SET_DATA_FIELD", payload: { key, val } });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SAVE_START" });
    const payload = {
      page_content_type: page,
      language: lang,
      title: `${PAGE_LABELS[page]} (${lang.toUpperCase()})`,
      content: JSON.stringify(data),
      seo_meta: {},
    };
    try {
      await AxiosAPI.post("/v1/cms", payload);
      // Clear ALL cache variants so the storefront picks up fresh data immediately
      localStorage.removeItem(`techsonance_cms_${page}_${lang}`);
      localStorage.removeItem(`techsonance_cms_${page}`); // legacy key format
      dispatch({
        type: "SAVE_SUCCESS",
        payload: "Saved! Storefront will reflect changes on next page load.",
      });
    } catch (err: any) {
      dispatch({
        type: "SAVE_FAILURE",
        payload: `Save failed: ${err?.response?.data?.message || "Try again."}`,
      });
    }
  };

  const addItem = (key: string, template: any) => {
    const nextArr = [...(data[key] || []), { id: Date.now(), ...template }];
    dispatch({ type: "SET_DATA_FIELD", payload: { key, val: nextArr } });
  };

  const removeItem = (key: string, id: any) => {
    const nextArr = (data[key] || []).filter((i: any) => i.id !== id);
    dispatch({ type: "SET_DATA_FIELD", payload: { key, val: nextArr } });
  };

  const updateItem = (key: string, id: any, field: string, val: string) => {
    const nextArr = (data[key] || []).map((i: any) =>
      i.id === id ? { ...i, [field]: val } : i,
    );
    dispatch({ type: "SET_DATA_FIELD", payload: { key, val: nextArr } });
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const layout = [...(data.homepage_layout || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < layout.length) {
      const temp = layout[index];
      layout[index] = layout[targetIndex];
      layout[targetIndex] = temp;
      dispatch({
        type: "SET_DATA_FIELD",
        payload: { key: "homepage_layout", val: layout },
      });
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    if (selectedHotspotId !== null && selectedHotspotId !== undefined) {
      const updated = (data.lookbook_hotspots || []).map((h: any) =>
        h.id === selectedHotspotId ? { ...h, x: clampedX, y: clampedY } : h
      );
      set("lookbook_hotspots", updated);
    } else {
      const newId = Date.now();
      const newHotspot = {
        id: newId,
        x: clampedX,
        y: clampedY,
        productId: "",
        product_id: "",
      };
      set("lookbook_hotspots", [...(data.lookbook_hotspots || []), newHotspot]);
      setSelectedHotspotId(newId);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-6 lg:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Storefront CMS Manager
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
            Manage all storefront content dynamically
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      {/* Tab + Lang selectors */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-8 flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">
            Page / Section
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PAGES.map((p) => (
              <button
                key={p}
                onClick={() => dispatch({ type: "SET_PAGE", payload: p })}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all ${page === p ? "bg-purple-600 text-white border-purple-600" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300"}`}
              >
                {PAGE_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        {page !== PageType.THEME && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">
              Language
            </p>
            <div className="flex gap-1.5">
              {([LangType.EN, LangType.ES] as LangType[]).map((l) => (
                <button
                  key={l}
                  onClick={() => dispatch({ type: "SET_LANG", payload: l })}
                  className={`flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded-lg border transition-all ${lang === l ? "bg-purple-600 text-white border-purple-600" : "bg-gray-50 text-gray-600 border-gray-200"}`}
                >
                  {l === LangType.EN ? (
                    <>
                      <Globe size={12} /> English
                    </>
                  ) : (
                    <>
                      <Languages size={12} /> Español
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {msg && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl mb-6 border text-sm font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}
        >
          <CheckCircle size={18} /> {msg.text}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border p-20 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-purple-600" />
        </div>
      ) : page === PageType.THEME ? (
        <div className="space-y-6">
          <BrandingTab token={token} />
        </div>
      ) : (
        <form
          onSubmit={save}
          className="space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-[70vh] overflow-y-auto pr-2"
        >
          {/* HOME */}
          {page === PageType.HOME && (
            <>
              <Section
                title="Hero Carousel Slides"
                action={
                  <AddBtn
                    onClick={() =>
                      addItem("hero_slides", {
                        image_url: "",
                        title: "",
                        subtitle: "",
                        btn_text: "Shop Now",
                        search_query: "",
                        layout: "center-overlay",
                        bg_style: "gradient",
                      })
                    }
                    label="Add Slide"
                  />
                }
              >
                {(data.hero_slides || []).length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">
                    No slides yet. Click <strong>Add Slide</strong> to add hero
                    carousel images. Each slide can link to a product search on
                    the shop page.
                  </p>
                )}
                {(data.hero_slides || []).map((slide: any, idx: number) => (
                  <ListCard
                    key={slide.id}
                    onRemove={() => removeItem("hero_slides", slide.id)}
                  >
                    <div className="md:col-span-2">
                      <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">
                        Slide {idx + 1}
                      </p>
                    </div>
                    <Field
                      label="Title"
                      value={slide.title || ""}
                      onChange={(v: string) =>
                        updateItem("hero_slides", slide.id, "title", v)
                      }
                    />
                    <Field
                      label="Subtitle (small label above title)"
                      value={slide.subtitle || ""}
                      onChange={(v: string) =>
                        updateItem("hero_slides", slide.id, "subtitle", v)
                      }
                    />
                    <Field
                      label="Button Text"
                      value={slide.btn_text || ""}
                      onChange={(v: string) =>
                        updateItem("hero_slides", slide.id, "btn_text", v)
                      }
                    />

                    <SelectField
                      label="Layout Style"
                      value={slide.layout || "center-overlay"}
                      onChange={(v: string) =>
                        updateItem("hero_slides", slide.id, "layout", v)
                      }
                      options={[
                        {
                          value: "center-overlay",
                          label: "Centered Text Overlay",
                        },
                        {
                          value: "left-content-right-image",
                          label: "Text Left, Image Right (Split)",
                        },
                        {
                          value: "right-content-left-image",
                          label: "Image Left, Text Right (Split)",
                        },
                      ]}
                    />
                    <SelectField
                      label="Background Style"
                      value={slide.bg_style || "gradient"}
                      onChange={(v: string) =>
                        updateItem("hero_slides", slide.id, "bg_style", v)
                      }
                      options={[
                        { value: "gradient", label: "Automatic Edge Gradient" },
                        { value: "solid", label: "Automatic Edge Solid Color" },
                      ]}
                    />

                    <SlideQueryPicker
                      value={slide.search_query || ""}
                      onChange={(v: string) =>
                        updateItem("hero_slides", slide.id, "search_query", v)
                      }
                    />
                    <div className="md:col-span-2">
                      <ImageUploadField
                        label="Slide Banner Image"
                        value={slide.image_url || ""}
                        onChange={(v: string) =>
                          updateItem("hero_slides", slide.id, "image_url", v)
                        }
                      />
                    </div>
                  </ListCard>
                ))}
              </Section>
              <Section title="Hero Block (Legacy — used if no carousel slides above)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Subtitle"
                    value={data.hero_subtitle || ""}
                    onChange={(v: string) => set("hero_subtitle", v)}
                  />
                  <Field
                    label="Button Text"
                    value={data.hero_btn_text || ""}
                    onChange={(v: string) => set("hero_btn_text", v)}
                  />
                  <SelectField
                    label="Layout Style"
                    value={data.hero_layout || "center-overlay"}
                    onChange={(v: string) => set("hero_layout", v)}
                    options={[
                      {
                        value: "center-overlay",
                        label: "Centered Text Overlay",
                      },
                      {
                        value: "left-content-right-image",
                        label: "Text Left, Image Right (Split)",
                      },
                      {
                        value: "right-content-left-image",
                        label: "Image Left, Text Right (Split)",
                      },
                    ]}
                  />
                  <SelectField
                    label="Background Style"
                    value={data.hero_bg_style || "gradient"}
                    onChange={(v: string) => set("hero_bg_style", v)}
                    options={[
                      { value: "gradient", label: "Automatic Edge Gradient" },
                      { value: "solid", label: "Automatic Edge Solid Color" },
                    ]}
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Title"
                      value={data.hero_title || ""}
                      onChange={(v: string) => set("hero_title", v)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Field
                      label="Description"
                      value={data.hero_desc || ""}
                      onChange={(v: string) => set("hero_desc", v)}
                      textarea
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImageUploadField
                      label="Hero Banner Image"
                      value={data.hero_image_url || ""}
                      onChange={(v: string) => set("hero_image_url", v)}
                    />
                  </div>
                </div>
              </Section>

              <Section title="Middle Promo Banner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Subtitle"
                    value={data.middle_banner_subtitle || ""}
                    onChange={(v: string) => set("middle_banner_subtitle", v)}
                  />
                  <Field
                    label="Button Text"
                    value={data.middle_banner_btn_text || ""}
                    onChange={(v: string) => set("middle_banner_btn_text", v)}
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Title"
                      value={data.middle_banner_title || ""}
                      onChange={(v: string) => set("middle_banner_title", v)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Field
                      label="Description"
                      value={data.middle_banner_desc || ""}
                      onChange={(v: string) => set("middle_banner_desc", v)}
                      textarea
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImageUploadField
                      label="Promo Banner Image"
                      value={data.middle_banner_image_url || ""}
                      onChange={(v: string) =>
                        set("middle_banner_image_url", v)
                      }
                    />
                  </div>
                </div>
              </Section>
              <Section title="New Arrivals — 4 Grid Layout">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Loop or write out the 4 card fields */}
                  {[1, 2, 3, 4].map((num) => (
                    <div
                      key={num}
                      className="border border-gray-200 p-4 rounded-lg bg-gray-50 flex flex-col gap-4"
                    >
                      <h4 className="font-bold text-sm text-gray-700">
                        Card {num}
                      </h4>

                      <ImageUploadField
                        label={`Image`}
                        value={data[`new_arrivals_card_${num}_image_url`] || ""}
                        onChange={(v: string) =>
                          set(`new_arrivals_card_${num}_image_url`, v)
                        }
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <Field
                          label="Title"
                          value={data[`new_arrivals_card_${num}_title`] || ""}
                          onChange={(v: string) =>
                            set(`new_arrivals_card_${num}_title`, v)
                          }
                        />
                        <Field
                          label="Subtitle"
                          value={
                            data[`new_arrivals_card_${num}_subtitle`] || ""
                          }
                          onChange={(v: string) =>
                            set(`new_arrivals_card_${num}_subtitle`, v)
                          }
                        />
                      </div>

                      <ColorField
                        label="Card Background Color (overrides auto-detect)"
                        value={data[`new_arrivals_card_${num}_bg_color`] || ""}
                        onChange={(v: string) =>
                          set(`new_arrivals_card_${num}_bg_color`, v)
                        }
                      />
                    </div>
                  ))}
                </div>
              </Section>
              <Section title="Newsletter Block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Newsletter Title"
                    value={data.newsletter_title || ""}
                    onChange={(v: string) => set("newsletter_title", v)}
                  />
                  <Field
                    label="Newsletter Button Text"
                    value={data.newsletter_btn_text || ""}
                    onChange={(v: string) => set("newsletter_btn_text", v)}
                  />
                  <Field
                    label="Newsletter Eyebrow / Tag"
                    value={data.newsletter_eyebrow || ""}
                    onChange={(v: string) => set("newsletter_eyebrow", v)}
                  />
                  <Field
                    label="Newsletter Success Message"
                    value={data.newsletter_success_text || ""}
                    onChange={(v: string) => set("newsletter_success_text", v)}
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Newsletter Description"
                      value={data.newsletter_desc || ""}
                      onChange={(v: string) => set("newsletter_desc", v)}
                      textarea
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Field
                      label="Newsletter Terms Disclaimer"
                      value={data.newsletter_disclaimer || ""}
                      onChange={(v: string) => set("newsletter_disclaimer", v)}
                    />
                  </div>
                </div>
              </Section>

              <Section
                title="Brand Highlight Block"
                action={
                  <AddBtn
                    onClick={() =>
                      addItem("brand_highlight_stats", {
                        value: "",
                        label: "",
                      })
                    }
                    label="Add Stat"
                  />
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Highlight Eyebrow / Subtitle"
                    value={data.brand_highlight_eyebrow || ""}
                    onChange={(v: string) => set("brand_highlight_eyebrow", v)}
                  />
                  <Field
                    label="Highlight Button Text"
                    value={data.brand_highlight_btn_text || ""}
                    onChange={(v: string) => set("brand_highlight_btn_text", v)}
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Highlight Title"
                      value={data.brand_highlight_title || ""}
                      onChange={(v: string) => set("brand_highlight_title", v)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Field
                      label="Highlight Description"
                      value={data.brand_highlight_desc || ""}
                      onChange={(v: string) => set("brand_highlight_desc", v)}
                      textarea
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImageUploadField
                      label="Highlight Banner Image"
                      value={data.brand_highlight_image_url || ""}
                      onChange={(v: string) => set("brand_highlight_image_url", v)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ColorField
                      label="Card Background Color (overrides auto-detect from image)"
                      value={data.brand_highlight_bg_color || ""}
                      onChange={(v: string) => set("brand_highlight_bg_color", v)}
                    />
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
                    Key Stats (Max 3 Recommended)
                  </h4>
                  <div className="space-y-3">
                    {(data.brand_highlight_stats || []).map((stat: any, sIdx: number) => (
                      <div
                        key={stat.id || sIdx}
                        className="flex gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-150 relative"
                      >
                        <button
                          type="button"
                          onClick={() => removeItem("brand_highlight_stats", stat.id)}
                          className="absolute right-3 top-3 text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <Field
                            label="Stat Value (e.g. 500+)"
                            value={stat.value || ""}
                            onChange={(v: string) =>
                              updateItem("brand_highlight_stats", stat.id, "value", v)
                            }
                          />
                          <Field
                            label="Stat Label (e.g. Products)"
                            value={stat.label || ""}
                            onChange={(v: string) =>
                              updateItem("brand_highlight_stats", stat.id, "label", v)
                            }
                          />
                        </div>
                      </div>
                    ))}
                    {!(data.brand_highlight_stats || []).length && (
                      <p className="text-center text-xs text-gray-400 py-3">
                        No stats added. Default promise stats will be shown on the storefront.
                      </p>
                    )}
                  </div>
                </div>
              </Section>

              <Section title="Interactive Hero Options (Enhanced)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Banner Display Type"
                    value={data.hero_banner_type || "carousel"}
                    onChange={(v: string) => set("hero_banner_type", v)}
                    options={[
                      { value: "carousel", label: "Image Carousel Slider" },
                      { value: "video", label: "Video Background Banner" },
                    ]}
                  />
                  <Field
                    label="Video Background URL (MP4 Format)"
                    value={data.hero_video_url || ""}
                    onChange={(v: string) => set("hero_video_url", v)}
                    mono
                  />

                  <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
                      Video Background Overlay Content
                    </h4>
                  </div>
                  <Field
                    label="Video Hero Eyebrow / Tag"
                    value={data.hero_video_eyebrow || ""}
                    onChange={(v: string) => set("hero_video_eyebrow", v)}
                  />
                  <Field
                    label="Video Hero Button Text"
                    value={data.hero_video_btn_text || ""}
                    onChange={(v: string) => set("hero_video_btn_text", v)}
                  />
                  <Field
                    label="Video Hero Title"
                    value={data.hero_video_title || ""}
                    onChange={(v: string) => set("hero_video_title", v)}
                  />
                  <Field
                    label="Video Hero Button Link (URL)"
                    value={data.hero_video_btn_link || ""}
                    onChange={(v: string) => set("hero_video_btn_link", v)}
                    mono
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Video Hero Description"
                      value={data.hero_video_desc || ""}
                      onChange={(v: string) => set("hero_video_desc", v)}
                      textarea
                    />
                  </div>
                </div>
              </Section>

              <Section title="Shoppable Lookbook Section">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Lookbook Section Title"
                    value={data.lookbook_title || ""}
                    onChange={(v: string) => set("lookbook_title", v)}
                  />
                  <Field
                    label="Lookbook Subtitle / Description"
                    value={data.lookbook_subtitle || ""}
                    onChange={(v: string) => set("lookbook_subtitle", v)}
                  />
                  <div className="md:col-span-2">
                    <ImageUploadField
                      label="Main Lookbook Image"
                      value={data.lookbook_image_url || ""}
                      onChange={(v: string) => set("lookbook_image_url", v)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ColorField
                      label="Section Background Color (fallback if no image or transparent)"
                      value={data.lookbook_bg_color || ""}
                      onChange={(v: string) => set("lookbook_bg_color", v)}
                    />
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-150 pt-6">
                  {/* Visual Preview Map */}
                  {data.lookbook_image_url ? (
                    <div className="mb-6 border border-gray-200 rounded-2xl p-4 bg-white shadow-sm">
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                        Visual Preview & Placement
                      </h4>
                      <p className="text-[10px] text-gray-400 mb-3">
                        1. Select a hotspot card from the list below (it will highlight in purple).<br/>
                        2. Click anywhere on the image preview to position the selected hotspot. If no card is selected, clicking will add a new hotspot.
                      </p>
                      <div
                        onClick={handleImageClick}
                        className="relative w-full aspect-[16/9] bg-slate-50 border border-slate-100 rounded-xl overflow-hidden cursor-crosshair select-none group"
                      >
                        <img
                          src={data.lookbook_image_url}
                          alt="Lookbook Interactive Map"
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        {(data.lookbook_hotspots || []).map((spot: any, sIdx: number) => {
                          const isSelected = spot.id === selectedHotspotId;
                          return (
                            <div
                              key={spot.id || sIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedHotspotId(spot.id);
                              }}
                              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                              className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-white flex items-center justify-center text-[10px] font-black shadow-md cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-purple-600 text-white scale-125 ring-2 ring-purple-400 ring-offset-1"
                                  : "bg-black/60 text-white hover:bg-black/85"
                              }`}
                            >
                              {sIdx + 1}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center text-xs text-gray-400">
                      Upload a Main Lookbook Image to enable visual hotspot placement.
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase">
                      Interactive Hotspots
                    </h4>
                    <AddBtn
                      onClick={() => {
                        const newId = Date.now();
                        set("lookbook_hotspots", [
                          ...(data.lookbook_hotspots || []),
                          { id: newId, x: 50, y: 50, productId: "", product_id: "" },
                        ]);
                        setSelectedHotspotId(newId);
                      }}
                      label="Add Hotspot"
                    />
                  </div>
                  <div className="space-y-3">
                    {(data.lookbook_hotspots || []).map(
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
                              <span className="text-[10px] font-black bg-gray-200/80 text-gray-600 px-2 py-0.5 rounded-full">
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
                                    data.lookbook_hotspots.filter(
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
                                <label className="block text-[10px] font-bold text-gray-400 mb-1">
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
                                      data.lookbook_hotspots.map((h: any) =>
                                        h.id === hs.id
                                          ? {
                                              ...h,
                                              x: parseFloat(e.target.value) || 0,
                                            }
                                          : h,
                                      ),
                                    )
                                  }
                                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-1">
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
                                      data.lookbook_hotspots.map((h: any) =>
                                        h.id === hs.id
                                          ? {
                                              ...h,
                                              y: parseFloat(e.target.value) || 0,
                                            }
                                          : h,
                                      ),
                                    )
                                  }
                                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-1">
                                  Product
                                </label>
                                <select
                                  value={hs.productId || hs.product_id || ""}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const pId = e.target.value;
                                    set(
                                      "lookbook_hotspots",
                                      data.lookbook_hotspots.map((h: any) =>
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
                                  className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                                >
                                  <option value="">-- Select Product --</option>
                                  {products.map((p: any) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {(hs.productId || hs.product_id) && (
                              <ProductPreviewCard productId={hs.productId || hs.product_id} />
                            )}
                          </div>
                        );
                      }
                    )}
                    {!(data.lookbook_hotspots || []).length && (
                      <p className="text-center text-xs text-gray-400 py-3">
                        No hotspots added. Press Add Hotspot or click the image above to place interactive tags.
                      </p>
                    )}
                  </div>
                </div>
              </Section>

              <Section title="Scarcity & Urgency Timer Block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Timer Heading Title"
                    value={data.scarcity_timer_title || ""}
                    onChange={(v: string) => set("scarcity_timer_title", v)}
                  />
                  <Field
                    label="Expiration Date & Time"
                    value={toDatetimeLocal(data.scarcity_expires_at || "")}
                    onChange={(v: string) => set("scarcity_expires_at", v)}
                    type="datetime-local"
                  />
                  <Field
                    label="CTA Action Button Text"
                    value={data.scarcity_btn_text || ""}
                    onChange={(v: string) => set("scarcity_btn_text", v)}
                  />
                  <Field
                    label="CTA Action Button Link (URL)"
                    value={data.scarcity_btn_link || ""}
                    onChange={(v: string) => set("scarcity_btn_link", v)}
                    mono
                  />

                  <div className="md:col-span-2">
                    <Field
                      label="Marketing Alert Text Message"
                      value={data.scarcity_alert_text || ""}
                      onChange={(v: string) => set("scarcity_alert_text", v)}
                    />
                  </div>

                  <ColorField
                    label="Alert Bar Background Color"
                    value={data.scarcity_alert_bg}
                    onChange={(v: string) => set("scarcity_alert_bg", v)}
                  />
                  <ColorField
                    label="Alert Bar Text Color"
                    value={data.scarcity_alert_text_color}
                    onChange={(v: string) =>
                      set("scarcity_alert_text_color", v)
                    }
                  />
                </div>
              </Section>

              <Section title="Trust & Social Proof Section">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Social Proof Header Title"
                    value={data.social_proof_title || ""}
                    onChange={(v: string) => set("social_proof_title", v)}
                  />
                  <Field
                    label="Eyebrow Tag / Subtext"
                    value={data.social_proof_eyebrow || ""}
                    onChange={(v: string) => set("social_proof_eyebrow", v)}
                  />
                </div>

                <div className="mt-5 border-t border-gray-100 pt-5">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase">
                      Customer Testimonials
                    </h4>
                    <AddBtn
                      onClick={() =>
                        set("social_proof_testimonials", [
                          ...(data.social_proof_testimonials || []),
                          {
                            id: Date.now(),
                            name: "",
                            role: "",
                            text: "",
                            rating: 5,
                            avatar: "",
                          },
                        ])
                      }
                      label="Add Testimonial"
                    />
                  </div>
                  <div className="space-y-4">
                    {(data.social_proof_testimonials || []).map(
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
                                data.social_proof_testimonials.filter(
                                  (x: any) => x.id !== t.id,
                                ),
                              )
                            }
                            className="absolute right-3 top-3 text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field
                              label="Customer Name"
                              value={t.name}
                              onChange={(v: string) =>
                                set(
                                  "social_proof_testimonials",
                                  data.social_proof_testimonials.map(
                                    (x: any) =>
                                      x.id === t.id ? { ...x, name: v } : x,
                                  ),
                                )
                              }
                            />
                            <Field
                              label="Role / Designation"
                              value={t.role}
                              onChange={(v: string) =>
                                set(
                                  "social_proof_testimonials",
                                  data.social_proof_testimonials.map(
                                    (x: any) =>
                                      x.id === t.id ? { ...x, role: v } : x,
                                  ),
                                )
                              }
                            />
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1.5">
                                Rating (1-5)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="5"
                                value={t.rating}
                                onChange={(e) =>
                                  set(
                                    "social_proof_testimonials",
                                    data.social_proof_testimonials.map(
                                      (x: any) =>
                                        x.id === t.id
                                          ? {
                                              ...x,
                                              rating:
                                                parseInt(e.target.value) || 5,
                                            }
                                          : x,
                                    ),
                                  )
                                }
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                              />
                            </div>
                            <Field
                              label="Avatar Image URL (Optional)"
                              value={t.avatar}
                              onChange={(v: string) =>
                                set(
                                  "social_proof_testimonials",
                                  data.social_proof_testimonials.map(
                                    (x: any) =>
                                      x.id === t.id ? { ...x, avatar: v } : x,
                                  ),
                                )
                              }
                            />
                            <div className="md:col-span-2">
                              <Field
                                label="Testimonial Quote / Text"
                                value={t.text}
                                onChange={(v: string) =>
                                  set(
                                    "social_proof_testimonials",
                                    data.social_proof_testimonials.map(
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
                    <h4 className="text-xs font-bold text-gray-500 uppercase">
                      Trust Badge Strip
                    </h4>
                    <AddBtn
                      onClick={() =>
                        set("social_proof_badges", [
                          ...(data.social_proof_badges || []),
                          {
                            id: Date.now(),
                            icon: "Shield",
                            title: "",
                            desc: "",
                          },
                        ])
                      }
                      label="Add Trust Badge"
                    />
                  </div>
                  <div className="space-y-4">
                    {(data.social_proof_badges || []).map(
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
                                data.social_proof_badges.filter(
                                  (x: any) => x.id !== bg.id,
                                ),
                              )
                            }
                            className="absolute right-3 top-3 text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            <Field
                              label="Lucide Icon Name"
                              value={bg.icon}
                              onChange={(v: string) =>
                                set(
                                  "social_proof_badges",
                                  data.social_proof_badges.map((x: any) =>
                                    x.id === bg.id ? { ...x, icon: v } : x,
                                  ),
                                )
                              }
                              mono
                            />
                            <Field
                              label="Badge Title"
                              value={bg.title}
                              onChange={(v: string) =>
                                set(
                                  "social_proof_badges",
                                  data.social_proof_badges.map((x: any) =>
                                    x.id === bg.id ? { ...x, title: v } : x,
                                  ),
                                )
                              }
                            />
                            <Field
                              label="Short Description"
                              value={bg.desc}
                              onChange={(v: string) =>
                                set(
                                  "social_proof_badges",
                                  data.social_proof_badges.map((x: any) =>
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
              </Section>

              <Section title="Curated Discovery Products Slider">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Discovery Section Heading"
                    value={data.curated_title || ""}
                    onChange={(v: string) => set("curated_title", v)}
                  />
                  <Field
                    label="Subtitle / Tagline"
                    value={data.curated_subtitle || ""}
                    onChange={(v: string) => set("curated_subtitle", v)}
                  />

                  <SelectField
                    label="Curation Category Type"
                    value={data.curated_type || "trending"}
                    onChange={(v: string) => set("curated_type", v)}
                    options={[
                      { value: "trending", label: "Trending Masterpieces" },
                      { value: "new_arrivals", label: "New Arrivals" },
                      {
                        value: "curated",
                        label: "Curated Custom Products (IDs Below)",
                      },
                    ]}
                  />

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 font-sans">
                      Curated Custom Products
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(Array.isArray(data.curated_product_ids) ? data.curated_product_ids : [])
                        .map((productId: string) => {
                          const p = products.find((x) => x.id === productId);
                          return (
                            <div
                              key={productId}
                              className="flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-100 shadow-sm"
                            >
                              <span>{p ? p.name : productId}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = (data.curated_product_ids || []).filter(
                                    (id: string) => id !== productId
                                  );
                                  set("curated_product_ids", filtered);
                                }}
                                className="text-purple-400 hover:text-purple-650 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          );
                        })}
                      {(!data.curated_product_ids || data.curated_product_ids.length === 0) && (
                        <span className="text-xs text-gray-400">No custom products selected.</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const currentIds = Array.isArray(data.curated_product_ids)
                            ? data.curated_product_ids
                            : [];
                          if (!currentIds.includes(val)) {
                            set("curated_product_ids", [...currentIds, val]);
                          }
                          e.target.value = "";
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400"
                        defaultValue=""
                      >
                        <option value="" disabled>-- Add Product to Curated List --</option>
                        {products
                          .filter((p) => {
                            const currentIds = Array.isArray(data.curated_product_ids)
                              ? data.curated_product_ids
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
                      label="Section Background Color"
                      value={data.curated_bg_color || ""}
                      onChange={(v: string) => set("curated_bg_color", v)}
                    />
                  </div>
                </div>
              </Section>
            </>
          )}

          {/* NAVBAR */}
          {page === PageType.NAVBAR && (
            <Section
              title="Navigation Links"
              action={
                <AddBtn
                  onClick={() => addItem("links", { label: "", href: "" })}
                  label="Add Link"
                />
              }
            >
              {(data.links || []).map((link: any) => (
                <div
                  key={link.id}
                  className="flex gap-3 items-end bg-gray-50 p-3 rounded-xl border border-gray-100"
                >
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <Field
                      label="Label"
                      value={link.label}
                      onChange={(v: string) =>
                        updateItem("links", link.id, "label", v)
                      }
                    />
                    <Field
                      label="URL Path"
                      value={link.href}
                      onChange={(v: string) =>
                        updateItem("links", link.id, "href", v)
                      }
                      mono
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem("links", link.id)}
                    className="text-red-400 hover:text-red-600 p-2 mb-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {!(data.links || []).length && (
                <p className="text-center text-gray-400 text-sm py-8">
                  No links yet. Click Add Link.
                </p>
              )}
            </Section>
          )}

          {/* FOOTER */}
          {page === PageType.FOOTER && (
            <>
              <Section title="Copyright / Bottom Text">
                <Field
                  label="Bottom Text"
                  value={data.bottom_text || ""}
                  onChange={(v: string) => set("bottom_text", v)}
                />
              </Section>
              <Section
                title="Footer Columns"
                action={
                  <AddBtn
                    onClick={() =>
                      addItem("content", { header: "", links: [] })
                    }
                    label="Add Column"
                  />
                }
              >
                {(data.content || []).map((col: any, ci: number) => (
                  <div
                    key={col.id || ci}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex-1">
                        <Field
                          label="Column Header"
                          value={col.header}
                          onChange={(v: string) =>
                            set(
                              "content",
                              data.content.map((c: any, i: number) =>
                                i === ci ? { ...c, header: v } : c,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="flex gap-2 self-end mb-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              "content",
                              data.content.map((c: any, i: number) =>
                                i === ci
                                  ? {
                                      ...c,
                                      links: [
                                        ...(c.links || []),
                                        { id: Date.now(), title: "", url: "" },
                                      ],
                                    }
                                  : c,
                              ),
                            )
                          }
                          className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1"
                        >
                          <Plus size={12} /> Link
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              "content",
                              data.content.filter(
                                (_: any, i: number) => i !== ci,
                              ),
                            )
                          }
                          className="text-red-400 hover:text-red-600 p-1.5 border border-red-200 rounded-lg"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 pl-3 border-l-2 border-purple-100">
                      {(col.links || []).map((lnk: any, li: number) => (
                        <div
                          key={lnk.id || li}
                          className="flex gap-3 items-end bg-white border border-gray-100 p-2.5 rounded-lg"
                        >
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input
                              placeholder="Label"
                              value={lnk.title}
                              onChange={(e) =>
                                set(
                                  "content",
                                  data.content.map((c: any, i: number) =>
                                    i === ci
                                      ? {
                                          ...c,
                                          links: c.links.map(
                                            (l: any, j: number) =>
                                              j === li
                                                ? {
                                                    ...l,
                                                    title: e.target.value,
                                                  }
                                                : l,
                                          ),
                                        }
                                      : c,
                                  ),
                                )
                              }
                              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs"
                            />
                            <input
                              placeholder="/path"
                              value={lnk.url}
                              onChange={(e) =>
                                set(
                                  "content",
                                  data.content.map((c: any, i: number) =>
                                    i === ci
                                      ? {
                                          ...c,
                                          links: c.links.map(
                                            (l: any, j: number) =>
                                              j === li
                                                ? { ...l, url: e.target.value }
                                                : l,
                                          ),
                                        }
                                      : c,
                                  ),
                                )
                              }
                              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              set(
                                "content",
                                data.content.map((c: any, i: number) =>
                                  i === ci
                                    ? {
                                        ...c,
                                        links: c.links.filter(
                                          (_: any, j: number) => j !== li,
                                        ),
                                      }
                                    : c,
                                ),
                              )
                            }
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </Section>
            </>
          )}

          {/* ABOUT */}
          {page === PageType.ABOUT && (
            <>
              <Section title="Hero Block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Hero Title"
                    value={data.heroTitle || ""}
                    onChange={(v: string) => set("heroTitle", v)}
                  />
                  <Field
                    label="Hero Subtitle"
                    value={data.heroDesc || ""}
                    onChange={(v: string) => set("heroDesc", v)}
                  />
                  <div className="md:col-span-2">
                    <ImageUploadField
                      label="Hero Background Image"
                      value={data.heroImg || ""}
                      onChange={(v: string) => set("heroImg", v)}
                    />
                  </div>
                </div>
              </Section>
              <Section title="Thoughts & Founder">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Section Title"
                    value={data.ownThoughtsTitle || ""}
                    onChange={(v: string) => set("ownThoughtsTitle", v)}
                  />
                  <ImageUploadField
                    label="Section Image"
                    value={data.ownThoughtsImg || ""}
                    onChange={(v: string) => set("ownThoughtsImg", v)}
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Description"
                      value={data.ownThoughtsDesc || ""}
                      onChange={(v: string) => set("ownThoughtsDesc", v)}
                      textarea
                    />
                  </div>
                  <Field
                    label="Founder Name"
                    value={data.founderName || ""}
                    onChange={(v: string) => set("founderName", v)}
                  />
                  <Field
                    label="Founder Title / Role"
                    value={data.founderTitle || ""}
                    onChange={(v: string) => set("founderTitle", v)}
                  />
                  <div className="md:col-span-2">
                    <ImageUploadField
                      label="Founder Photo"
                      value={data.founderImg || ""}
                      onChange={(v: string) => set("founderImg", v)}
                    />
                  </div>
                </div>
              </Section>
              <Section title="Core Values Banner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Section Title"
                    value={data.coreValuesTitle || ""}
                    onChange={(v: string) => set("coreValuesTitle", v)}
                  />
                  <ImageUploadField
                    label="Background Image"
                    value={data.coreValuesImg || ""}
                    onChange={(v: string) => set("coreValuesImg", v)}
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Description"
                      value={data.coreValuesDesc || ""}
                      onChange={(v: string) => set("coreValuesDesc", v)}
                    />
                  </div>
                </div>
              </Section>
              <Section
                title="Core Values List"
                action={
                  <AddBtn
                    onClick={() =>
                      addItem("coreValues", {
                        title: "",
                        tagline: "",
                        description: "",
                      })
                    }
                    label="Add Value"
                  />
                }
              >
                {(data.coreValues || []).map((v: any) => (
                  <ListCard
                    key={v.id}
                    onRemove={() => removeItem("coreValues", v.id)}
                  >
                    <Field
                      label="Title"
                      value={v.title}
                      onChange={(val: string) =>
                        updateItem("coreValues", v.id, "title", val)
                      }
                    />
                    <Field
                      label="Tagline"
                      value={v.tagline}
                      onChange={(val: string) =>
                        updateItem("coreValues", v.id, "tagline", val)
                      }
                    />
                    <div className="md:col-span-2">
                      <Field
                        label="Description"
                        value={v.description}
                        onChange={(val: string) =>
                          updateItem("coreValues", v.id, "description", val)
                        }
                      />
                    </div>
                  </ListCard>
                ))}
              </Section>
              <Section title="Mission Section">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Mission Title"
                    value={data.missionTitle || ""}
                    onChange={(v: string) => set("missionTitle", v)}
                  />
                  <ImageUploadField
                    label="Mission Image"
                    value={data.missionImg || ""}
                    onChange={(v: string) => set("missionImg", v)}
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Mission Statement"
                      value={data.missionDesc || ""}
                      onChange={(v: string) => set("missionDesc", v)}
                      textarea
                    />
                  </div>
                </div>
              </Section>
              <Section
                title="Mission Deliverables"
                action={
                  <AddBtn
                    onClick={() =>
                      addItem("missionToDeliver", {
                        title: "",
                        tagline: "",
                        description: "",
                      })
                    }
                    label="Add Card"
                  />
                }
              >
                {(data.missionToDeliver || []).map((m: any) => (
                  <ListCard
                    key={m.id}
                    onRemove={() => removeItem("missionToDeliver", m.id)}
                  >
                    <Field
                      label="Title"
                      value={m.title}
                      onChange={(val: string) =>
                        updateItem("missionToDeliver", m.id, "title", val)
                      }
                    />
                    <Field
                      label="Tagline"
                      value={m.tagline}
                      onChange={(val: string) =>
                        updateItem("missionToDeliver", m.id, "tagline", val)
                      }
                    />
                    <div className="md:col-span-2">
                      <Field
                        label="Description"
                        value={m.description}
                        onChange={(val: string) =>
                          updateItem(
                            "missionToDeliver",
                            m.id,
                            "description",
                            val,
                          )
                        }
                      />
                    </div>
                  </ListCard>
                ))}
              </Section>
            </>
          )}

          {/* CONTACT */}
          {page === PageType.CONTACT && (
            <>
              <Section title="Hero Block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Hero Title"
                    value={data.hero?.heroTitle || ""}
                    onChange={(v: string) =>
                      set("hero", { ...data.hero, heroTitle: v })
                    }
                  />
                  <Field
                    label="Hero Subtitle"
                    value={data.hero?.heroDesc || ""}
                    onChange={(v: string) =>
                      set("hero", { ...data.hero, heroDesc: v })
                    }
                  />
                  <div className="md:col-span-2">
                    <ImageUploadField
                      label="Hero Background Image"
                      value={data.hero?.heroImg || ""}
                      onChange={(v: string) =>
                        set("hero", { ...data.hero, heroImg: v })
                      }
                    />
                  </div>
                </div>
              </Section>
              <Section
                title="Contact Methods"
                action={
                  <AddBtn
                    onClick={() =>
                      addItem("list", {
                        type: "phone",
                        title: "",
                        description: "",
                        icon: "phone",
                      })
                    }
                    label="Add Method"
                  />
                }
              >
                {(data.list || []).map((c: any) => (
                  <ListCard
                    key={c.id}
                    onRemove={() => removeItem("list", c.id)}
                  >
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">
                        Type
                      </label>
                      <select
                        value={c.type}
                        onChange={(e) =>
                          updateItem("list", c.id, "type", e.target.value)
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      >
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                        <option value="address">Address</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <Field
                      label="Title"
                      value={c.title}
                      onChange={(v: string) =>
                        updateItem("list", c.id, "title", v)
                      }
                    />
                    <Field
                      label="Icon (Lucide name)"
                      value={c.icon}
                      onChange={(v: string) =>
                        updateItem("list", c.id, "icon", v)
                      }
                      mono
                    />
                    <Field
                      label="Details / Value"
                      value={c.description}
                      onChange={(v: string) =>
                        updateItem("list", c.id, "description", v)
                      }
                    />
                  </ListCard>
                ))}
              </Section>
            </>
          )}

          {/* storefront */}
          {page === PageType.STORE && (
            <>
              <Section title="Store Page Promotional Banner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Banner Title"
                    value={data.promo_banner_title || ""}
                    onChange={(v: string) => set("promo_banner_title", v)}
                  />
                  <Field
                    label="Banner Action Link (URL)"
                    value={data.promo_banner_link || ""}
                    onChange={(v: string) => set("promo_banner_link", v)}
                    mono
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Banner Description"
                      value={data.promo_banner_desc || ""}
                      onChange={(v: string) => set("promo_banner_desc", v)}
                      textarea
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ImageUploadField
                      label="Promo Card Background Image"
                      value={data.promo_banner_image_url || ""}
                      onChange={(v: string) => set("promo_banner_image_url", v)}
                    />
                  </div>
                </div>
              </Section>
              <Section title="Urgent Promo & Countdown Timer">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Timer Heading Title"
                    value={data.promo_timer_title || ""}
                    onChange={(v: string) => set("promo_timer_title", v)}
                    placeholder="e.g. FLASH SALE ENDS IN"
                  />

                  <Field
                    label="Expiration Date & Time"
                    value={toDatetimeLocal(data.promo_expires_at || "")}
                    onChange={(v: string) => set("promo_expires_at", v)}
                    type="datetime-local"
                  />

                  <Field
                    label="Action Button Text"
                    value={data.promo_btn_text || ""}
                    onChange={(v: string) => set("promo_btn_text", v)}
                    placeholder="e.g. Shop the Sale"
                  />

                  <Field
                    label="Action Button Link (URL)"
                    value={data.promo_btn_link || ""}
                    onChange={(v: string) => set("promo_btn_link", v)}
                    placeholder="e.g. /store"
                    mono
                  />

                  <div className="md:col-span-2">
                    <Field
                      label="Marketing Alert Banner Text"
                      value={data.promo_alert_text || ""}
                      onChange={(v: string) => set("promo_alert_text", v)}
                      placeholder="e.g. Use coupon FIRST10 for an extra 10% off!"
                    />
                  </div>

                  <ColorField
                    label="Alert Bar Background Color"
                    value={data.promo_alert_bg || "#ef4444"}
                    onChange={(v: string) => set("promo_alert_bg", v)}
                  />

                  <ColorField
                    label="Alert Bar Text Color"
                    value={data.promo_alert_text_color || "#ffffff"}
                    onChange={(v: string) => set("promo_alert_text_color", v)}
                  />
                </div>
              </Section>
            </>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <button
              type="button"
              onClick={load}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded-xl transition-all"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase rounded-xl shadow-md disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          {title}
        </h3>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 text-xs font-bold rounded-lg border border-purple-200"
    >
      <Plus size={12} /> {label}
    </button>
  );
}

function ListCard({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 text-red-400 hover:text-red-600 p-1"
      >
        <Trash2 size={14} />
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">
        {children}
      </div>
    </div>
  );
}
