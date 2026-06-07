'use client';
import { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import { Save, Loader2, Plus, Trash2, Globe, Languages, CheckCircle, ArrowUp, ArrowDown, Palette, LayoutGrid, Upload, Image as ImageIcon } from 'lucide-react';
import AxiosAPI from '@/lib/axios';

type PageType = 'home' | 'navbar' | 'footer' | 'about' | 'contact' | 'store' | 'theme';
type LangType = 'en' | 'es';

interface CmsState {
  page: PageType;
  lang: LangType;
  loading: boolean;
  saving: boolean;
  msg: { text: string; ok: boolean } | null;
  data: any;
}

type CmsAction =
  | { type: 'SET_PAGE'; payload: PageType }
  | { type: 'SET_LANG'; payload: LangType }
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: any }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; payload: string }
  | { type: 'SAVE_FAILURE'; payload: string }
  | { type: 'SET_DATA_FIELD'; payload: { key: string; val: any } }
  | { type: 'SET_DATA_FULL'; payload: any }
  | { type: 'CLEAR_MESSAGE' };

const initialState: CmsState = {
  page: 'home',
  lang: 'en',
  loading: false,
  saving: false,
  msg: null,
  data: {},
};

function cmsReducer(state: CmsState, action: CmsAction): CmsState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, page: action.payload, msg: null };
    case 'SET_LANG':
      return { ...state, lang: action.payload, msg: null };
    case 'FETCH_START':
      return { ...state, loading: true, msg: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, msg: { text: action.payload, ok: false } };
    case 'SAVE_START':
      return { ...state, saving: true, msg: null };
    case 'SAVE_SUCCESS':
      return { ...state, saving: false, msg: { text: action.payload, ok: true } };
    case 'SAVE_FAILURE':
      return { ...state, saving: false, msg: { text: action.payload, ok: false } };
    case 'SET_DATA_FIELD':
      return {
        ...state,
        data: { ...state.data, [action.payload.key]: action.payload.val },
      };
    case 'SET_DATA_FULL':
      return { ...state, data: action.payload };
    case 'CLEAR_MESSAGE':
      return { ...state, msg: null };
    default:
      return state;
  }
}

const PAGES: PageType[] = ['home', 'navbar', 'footer', 'about', 'contact', 'store', 'theme'];

const PAGE_LABELS: Record<PageType, string> = {
  home: 'Home Page', navbar: 'Navbar', footer: 'Footer',
  about: 'About Us', contact: 'Contact', store: 'Store',
  theme: 'Storefront Theme & Layout',
};

function Field({ label, value, onChange, textarea, mono }: any) {
  const cls = `w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 ${mono ? 'font-mono' : ''}`;
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1.5">{label}</label>
      {textarea
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} className={cls} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} className={cls} />}
    </div>
  );
}

function ColorField({ label, value, onChange }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 border border-gray-200 rounded-xl cursor-pointer bg-transparent shrink-0"
        />
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 font-mono"
        />
      </div>
    </div>
  );
}

function ImageUploadField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await AxiosAPI.post('/v1/cms/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.data?.secure_url) {
        onChange(res.data.data.secure_url);
      } else {
        throw new Error('Upload succeeded but no URL returned.');
      }
    } catch (err: any) {
      console.error('[CMS Image Upload] Failed:', err);
      setError(err?.response?.data?.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1.5">{label}</label>
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
        {value ? (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm shrink-0">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
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
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="hidden" />
          </label>
          {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
          {!error && value && (
            <p className="text-[10px] text-emerald-600 mt-1 truncate" title={value}>
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
      <label className="block text-xs font-bold text-gray-500 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400 font-semibold text-gray-750"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Slide Query Picker ─────────────────────────────────────────────────────
// Fetches real categories + product names from the server and presents them
// as clickable tag chips.  No typing = no typos.  Vendor just clicks.
function SlideQueryPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [categories, setCategories]   = useState<string[]>([]);
  const [productTags, setProductTags] = useState<string[]>([]);
  const [selected, setSelected]       = useState<string[]>(() =>
    value ? value.split(' ').filter(Boolean) : []
  );
  const [fetching, setFetching] = useState(true);
  const [search, setSearch]     = useState('');
  const didFetch = useRef(false);

  // Fetch categories + product names once
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    (async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          AxiosAPI.get('/v1/categories'),
          AxiosAPI.get('/v1/products?limit=100'),
        ]);
        // Categories
        const cats: string[] = (catRes.data?.data ?? catRes.data ?? []).map((c: any) => c.name).filter(Boolean);
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
    const incoming = value ? value.split(' ').filter(Boolean) : [];
    setSelected(incoming);
  }, [value]);

  const toggle = useCallback((tag: string) => {
    setSelected(prev => {
      const next = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag];
      onChange(next.join(' '));
      return next;
    });
  }, [onChange]);

  const clear = () => { setSelected([]); onChange(''); };

  // Filter by search input
  const allTags = [...new Set([...categories, ...productTags])];
  const visible = search.trim()
    ? allTags.filter(t => t.toLowerCase().includes(search.toLowerCase()))
    : allTags;

  return (
    <div className="md:col-span-2">
      <label className="block text-xs font-bold text-gray-500 mb-1.5">
        Slide Promotion — Pick what products to show
      </label>
      <p className="text-[10px] text-gray-400 mb-3">
        Click tags below to build the search query. Customers clicking the slide button will see matching products.
      </p>

      {/* Search filter */}
      <input
        type="text"
        placeholder="Filter tags…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs mb-3 focus:outline-none focus:border-purple-400"
      />

      {/* Tag cloud */}
      {fetching ? (
        <div className="flex items-center gap-2 text-xs text-gray-400 py-3">
          <span className="animate-spin border-2 border-purple-400 border-t-transparent rounded-full w-4 h-4 inline-block" />
          Loading products from your store…
        </div>
      ) : visible.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">No matching tags. Try a different search.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
          {visible.map(tag => {
            const active = selected.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all duration-150 ${
                  active
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-700'
                }`}
              >
                {active ? '✓ ' : ''}{tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected summary */}
      <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        {selected.length === 0 ? (
          <p className="text-xs text-gray-400">No tags selected — all products will show.</p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Selected ({selected.length})</p>
                <div className="flex flex-wrap gap-1">
                  {selected.map(t => (
                    <span key={t} className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
              <button type="button" onClick={clear} className="text-[10px] text-red-400 hover:text-red-600 font-semibold mt-0.5 flex-shrink-0">
                Clear all
              </button>
            </div>
            <p className="text-[10px] text-emerald-600 mt-2 font-mono">
              ↳ /store?search={encodeURIComponent(selected.join(' '))}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function CmsManagementPage() {
  const [state, dispatch] = useReducer(cmsReducer, initialState);
  const { page, lang, loading, saving, msg, data } = state;

  const load = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await AxiosAPI.get(`/v1/cms/${page}?lang=${lang}`);
      // Backend wraps: { data: { content: '...' }, status, message }
      // Must unwrap the envelope before reading content
      const cmsRow = res.data?.data ?? res.data;
      const raw = cmsRow?.content;
      let parsed = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? {});
      if (page === 'theme' && (!parsed || Object.keys(parsed).length === 0)) {
        parsed = {
          primary_color: "#2563eb",
          secondary_color: "#4f46e5",
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
          homepage_layout: ["hero", "categories", "products", "promo", "new_arrivals", "newsletter"]
        };
      }
      dispatch({ type: 'FETCH_SUCCESS', payload: parsed });
    } catch { 
      if (page === 'theme') {
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            primary_color: "#2563eb",
            secondary_color: "#4f46e5",
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
            homepage_layout: ["hero", "categories", "products", "promo", "new_arrivals", "newsletter"]
          }
        });
      } else {
        dispatch({ type: 'FETCH_SUCCESS', payload: {} });
      }
    }
  };

  useEffect(() => { load(); }, [page, lang]);

  const set = (key: string, val: any) => dispatch({ type: 'SET_DATA_FIELD', payload: { key, val } });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SAVE_START' });
    const payload = {
      page_content_type: page, language: lang,
      title: `${PAGE_LABELS[page]} (${lang.toUpperCase()})`,
      content: JSON.stringify(data), seo_meta: {},
    };
    console.log('[CMS Save] Sending payload to /v1/cms:', payload);
    try {
      const res = await AxiosAPI.post('/v1/cms', payload);
      console.log('[CMS Save] Server response:', res.data);
      // Clear ALL cache variants so the storefront picks up fresh data immediately
      localStorage.removeItem(`techsonance_cms_${page}_${lang}`);
      localStorage.removeItem(`techsonance_cms_${page}`);  // legacy key format
      dispatch({ type: 'SAVE_SUCCESS', payload: 'Saved! Storefront will reflect changes on next page load.' });
    } catch (err: any) {
      console.error('[CMS Save] Failed:', err?.response?.data || err?.message);
      dispatch({ type: 'SAVE_FAILURE', payload: `Save failed: ${err?.response?.data?.message || 'Try again.'}` });
    }
  };

  const addItem = (key: string, template: any) => {
    const nextArr = [...(data[key] || []), { id: Date.now(), ...template }];
    dispatch({ type: 'SET_DATA_FIELD', payload: { key, val: nextArr } });
  };

  const removeItem = (key: string, id: any) => {
    const nextArr = (data[key] || []).filter((i: any) => i.id !== id);
    dispatch({ type: 'SET_DATA_FIELD', payload: { key, val: nextArr } });
  };

  const updateItem = (key: string, id: any, field: string, val: string) => {
    const nextArr = (data[key] || []).map((i: any) => i.id === id ? { ...i, [field]: val } : i);
    dispatch({ type: 'SET_DATA_FIELD', payload: { key, val: nextArr } });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const layout = [...(data.homepage_layout || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < layout.length) {
      const temp = layout[index];
      layout[index] = layout[targetIndex];
      layout[targetIndex] = temp;
      dispatch({ type: 'SET_DATA_FIELD', payload: { key: 'homepage_layout', val: layout } });
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-6 lg:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Storefront CMS Manager</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Manage all storefront content dynamically</p>
        </div>
        <button onClick={save} disabled={saving || loading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      {/* Tab + Lang selectors */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-8 flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Page / Section</p>
          <div className="flex flex-wrap gap-1.5">
            {PAGES.map(p => (
              <button key={p} onClick={() => dispatch({ type: 'SET_PAGE', payload: p })}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all ${page === p ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300'}`}>
                {PAGE_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Language</p>
          <div className="flex gap-1.5">
            {(['en', 'es'] as LangType[]).map(l => (
              <button key={l} onClick={() => dispatch({ type: 'SET_LANG', payload: l })}
                className={`flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded-lg border transition-all ${lang === l ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {l === 'en' ? <><Globe size={12} /> English</> : <><Languages size={12} /> Español</>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 p-4 rounded-xl mb-6 border text-sm font-semibold ${msg.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          <CheckCircle size={18} /> {msg.text}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border p-20 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-purple-600" />
        </div>
      ) : (
        <form onSubmit={save} className="space-y-6">

          {/* HOME */}
          {page === 'home' && (
            <>
              <Section title="Hero Carousel Slides"
                action={<AddBtn onClick={() => addItem('hero_slides', {
                  image_url: '',
                  title: '',
                  subtitle: '',
                  btn_text: 'Shop Now',
                  search_query: '',
                })} label="Add Slide" />}>
                {(data.hero_slides || []).length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">
                    No slides yet. Click <strong>Add Slide</strong> to add hero carousel images.
                    Each slide can link to a product search on the shop page.
                  </p>
                )}
                {(data.hero_slides || []).map((slide: any, idx: number) => (
                  <ListCard key={slide.id} onRemove={() => removeItem('hero_slides', slide.id)}>
                    <div className="md:col-span-2">
                      <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">
                        Slide {idx + 1}
                      </p>
                    </div>
                    <Field label="Title" value={slide.title || ''} onChange={(v: string) => updateItem('hero_slides', slide.id, 'title', v)} />
                    <Field label="Subtitle (small label above title)" value={slide.subtitle || ''} onChange={(v: string) => updateItem('hero_slides', slide.id, 'subtitle', v)} />
                    <Field label="Button Text" value={slide.btn_text || ''} onChange={(v: string) => updateItem('hero_slides', slide.id, 'btn_text', v)} />
                    <SlideQueryPicker
                      value={slide.search_query || ''}
                      onChange={(v: string) => updateItem('hero_slides', slide.id, 'search_query', v)}
                    />
                    <div className="md:col-span-2">
                      <ImageUploadField label="Slide Banner Image" value={slide.image_url || ''} onChange={(v: string) => updateItem('hero_slides', slide.id, 'image_url', v)} />
                    </div>
                  </ListCard>
                ))}
              </Section>
              <Section title="Hero Block (Legacy — used if no carousel slides above)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Subtitle" value={data.hero_subtitle || ''} onChange={(v: string) => set('hero_subtitle', v)} />
                  <Field label="Button Text" value={data.hero_btn_text || ''} onChange={(v: string) => set('hero_btn_text', v)} />
                  <div className="md:col-span-2"><Field label="Title" value={data.hero_title || ''} onChange={(v: string) => set('hero_title', v)} /></div>
                  <div className="md:col-span-2"><Field label="Description" value={data.hero_desc || ''} onChange={(v: string) => set('hero_desc', v)} textarea /></div>
                  <div className="md:col-span-2"><ImageUploadField label="Hero Banner Image" value={data.hero_image_url || ''} onChange={(v: string) => set('hero_image_url', v)} /></div>
                </div>
              </Section>

              <Section title="Middle Promo Banner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Subtitle" value={data.middle_banner_subtitle || ''} onChange={(v: string) => set('middle_banner_subtitle', v)} />
                  <Field label="Button Text" value={data.middle_banner_btn_text || ''} onChange={(v: string) => set('middle_banner_btn_text', v)} />
                  <div className="md:col-span-2"><Field label="Title" value={data.middle_banner_title || ''} onChange={(v: string) => set('middle_banner_title', v)} /></div>
                  <div className="md:col-span-2"><Field label="Description" value={data.middle_banner_desc || ''} onChange={(v: string) => set('middle_banner_desc', v)} textarea /></div>
                  <div className="md:col-span-2"><ImageUploadField label="Promo Banner Image" value={data.middle_banner_image_url || ''} onChange={(v: string) => set('middle_banner_image_url', v)} /></div>
                </div>
              </Section>
              <Section title="New Arrivals — Left Card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Subtitle" value={data.new_arrivals_left_subtitle || ''} onChange={(v: string) => set('new_arrivals_left_subtitle', v)} />
                  <Field label="Button Text" value={data.new_arrivals_left_btn_text || ''} onChange={(v: string) => set('new_arrivals_left_btn_text', v)} />
                  <div className="md:col-span-2"><Field label="Title" value={data.new_arrivals_left_title || ''} onChange={(v: string) => set('new_arrivals_left_title', v)} /></div>
                  <div className="md:col-span-2"><Field label="Description" value={data.new_arrivals_left_desc || ''} onChange={(v: string) => set('new_arrivals_left_desc', v)} /></div>
                  <div className="md:col-span-2"><ImageUploadField label="Left Card Cover Image" value={data.new_arrivals_left_image_url || ''} onChange={(v: string) => set('new_arrivals_left_image_url', v)} /></div>
                </div>
              </Section>
              <Section title="New Arrivals — Right Cards">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageUploadField label="Top Card Banner Image" value={data.new_arrivals_right_top_image_url || ''} onChange={(v: string) => set('new_arrivals_right_top_image_url', v)} />
                  <ImageUploadField label="Bottom Card Banner Image" value={data.new_arrivals_right_bottom_image_url || ''} onChange={(v: string) => set('new_arrivals_right_bottom_image_url', v)} />
                  <div className="md:col-span-2">
                    <Field label="Top Card Title" value={data.new_arrivals_right_top_title || ''} onChange={(v: string) => set('new_arrivals_right_top_title', v)} />
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Bottom Card Title" value={data.new_arrivals_right_bottom_title || ''} onChange={(v: string) => set('new_arrivals_right_bottom_title', v)} />
                  </div>
                </div>
              </Section>
              <Section title="Newsletter Block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Title" value={data.newsletter_title || ''} onChange={(v: string) => set('newsletter_title', v)} />
                  <Field label="Button Text" value={data.newsletter_btn_text || ''} onChange={(v: string) => set('newsletter_btn_text', v)} />
                  <div className="md:col-span-2"><Field label="Description" value={data.newsletter_desc || ''} onChange={(v: string) => set('newsletter_desc', v)} /></div>
                </div>
              </Section>
            </>
          )}

          {/* NAVBAR */}
          {page === 'navbar' && (
            <Section title="Navigation Links"
              action={<AddBtn onClick={() => addItem('links', { label: '', href: '' })} label="Add Link" />}>
              {(data.links || []).map((link: any) => (
                <div key={link.id} className="flex gap-3 items-end bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <Field label="Label" value={link.label} onChange={(v: string) => updateItem('links', link.id, 'label', v)} />
                    <Field label="URL Path" value={link.href} onChange={(v: string) => updateItem('links', link.id, 'href', v)} mono />
                  </div>
                  <button type="button" onClick={() => removeItem('links', link.id)} className="text-red-400 hover:text-red-600 p-2 mb-1"><Trash2 size={15} /></button>
                </div>
              ))}
              {!(data.links || []).length && <p className="text-center text-gray-400 text-sm py-8">No links yet. Click Add Link.</p>}
            </Section>
          )}

          {/* FOOTER */}
          {page === 'footer' && (
            <>
              <Section title="Copyright / Bottom Text">
                <Field label="Bottom Text" value={data.bottom_text || ''} onChange={(v: string) => set('bottom_text', v)} />
              </Section>
              <Section title="Footer Columns"
                action={<AddBtn onClick={() => addItem('content', { header: '', links: [] })} label="Add Column" />}>
                {(data.content || []).map((col: any, ci: number) => (
                  <div key={col.id || ci} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex-1">
                        <Field label="Column Header" value={col.header}
                          onChange={(v: string) => set('content', data.content.map((c: any, i: number) => i === ci ? { ...c, header: v } : c))} />
                      </div>
                      <div className="flex gap-2 self-end mb-0.5">
                        <button type="button" onClick={() => set('content', data.content.map((c: any, i: number) => i === ci ? { ...c, links: [...(c.links || []), { id: Date.now(), title: '', url: '' }] } : c))}
                          className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1"><Plus size={12} /> Link</button>
                        <button type="button" onClick={() => set('content', data.content.filter((_: any, i: number) => i !== ci))}
                          className="text-red-400 hover:text-red-600 p-1.5 border border-red-200 rounded-lg"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <div className="space-y-2 pl-3 border-l-2 border-purple-100">
                      {(col.links || []).map((lnk: any, li: number) => (
                        <div key={lnk.id || li} className="flex gap-3 items-end bg-white border border-gray-100 p-2.5 rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input placeholder="Label" value={lnk.title} onChange={e => set('content', data.content.map((c: any, i: number) => i === ci ? { ...c, links: c.links.map((l: any, j: number) => j === li ? { ...l, title: e.target.value } : l) } : c))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs" />
                            <input placeholder="/path" value={lnk.url} onChange={e => set('content', data.content.map((c: any, i: number) => i === ci ? { ...c, links: c.links.map((l: any, j: number) => j === li ? { ...l, url: e.target.value } : l) } : c))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono" />
                          </div>
                          <button type="button" onClick={() => set('content', data.content.map((c: any, i: number) => i === ci ? { ...c, links: c.links.filter((_: any, j: number) => j !== li) } : c))}
                            className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </Section>
            </>
          )}

          {/* ABOUT */}
          {page === 'about' && (
            <>
              <Section title="Hero Block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Hero Title" value={data.heroTitle || ''} onChange={(v: string) => set('heroTitle', v)} />
                  <Field label="Hero Subtitle" value={data.heroDesc || ''} onChange={(v: string) => set('heroDesc', v)} />
                  <div className="md:col-span-2"><ImageUploadField label="Hero Background Image" value={data.heroImg || ''} onChange={(v: string) => set('heroImg', v)} /></div>
                </div>
              </Section>
              <Section title="Thoughts & Founder">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Section Title" value={data.ownThoughtsTitle || ''} onChange={(v: string) => set('ownThoughtsTitle', v)} />
                  <ImageUploadField label="Section Image" value={data.ownThoughtsImg || ''} onChange={(v: string) => set('ownThoughtsImg', v)} />
                  <div className="md:col-span-2"><Field label="Description" value={data.ownThoughtsDesc || ''} onChange={(v: string) => set('ownThoughtsDesc', v)} textarea /></div>
                  <Field label="Founder Name" value={data.founderName || ''} onChange={(v: string) => set('founderName', v)} />
                  <Field label="Founder Title / Role" value={data.founderTitle || ''} onChange={(v: string) => set('founderTitle', v)} />
                  <div className="md:col-span-2"><ImageUploadField label="Founder Photo" value={data.founderImg || ''} onChange={(v: string) => set('founderImg', v)} /></div>
                </div>
              </Section>
              <Section title="Core Values Banner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Section Title" value={data.coreValuesTitle || ''} onChange={(v: string) => set('coreValuesTitle', v)} />
                  <ImageUploadField label="Background Image" value={data.coreValuesImg || ''} onChange={(v: string) => set('coreValuesImg', v)} />
                  <div className="md:col-span-2"><Field label="Description" value={data.coreValuesDesc || ''} onChange={(v: string) => set('coreValuesDesc', v)} /></div>
                </div>
              </Section>
              <Section title="Core Values List"
                action={<AddBtn onClick={() => addItem('coreValues', { title: '', tagline: '', description: '' })} label="Add Value" />}>
                {(data.coreValues || []).map((v: any) => (
                  <ListCard key={v.id} onRemove={() => removeItem('coreValues', v.id)}>
                    <Field label="Title" value={v.title} onChange={(val: string) => updateItem('coreValues', v.id, 'title', val)} />
                    <Field label="Tagline" value={v.tagline} onChange={(val: string) => updateItem('coreValues', v.id, 'tagline', val)} />
                    <div className="md:col-span-2"><Field label="Description" value={v.description} onChange={(val: string) => updateItem('coreValues', v.id, 'description', val)} /></div>
                  </ListCard>
                ))}
              </Section>
              <Section title="Mission Section">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Mission Title" value={data.missionTitle || ''} onChange={(v: string) => set('missionTitle', v)} />
                  <ImageUploadField label="Mission Image" value={data.missionImg || ''} onChange={(v: string) => set('missionImg', v)} />
                  <div className="md:col-span-2"><Field label="Mission Statement" value={data.missionDesc || ''} onChange={(v: string) => set('missionDesc', v)} textarea /></div>
                </div>
              </Section>
              <Section title="Mission Deliverables"
                action={<AddBtn onClick={() => addItem('missionToDeliver', { title: '', tagline: '', description: '' })} label="Add Card" />}>
                {(data.missionToDeliver || []).map((m: any) => (
                  <ListCard key={m.id} onRemove={() => removeItem('missionToDeliver', m.id)}>
                    <Field label="Title" value={m.title} onChange={(val: string) => updateItem('missionToDeliver', m.id, 'title', val)} />
                    <Field label="Tagline" value={m.tagline} onChange={(val: string) => updateItem('missionToDeliver', m.id, 'tagline', val)} />
                    <div className="md:col-span-2"><Field label="Description" value={m.description} onChange={(val: string) => updateItem('missionToDeliver', m.id, 'description', val)} /></div>
                  </ListCard>
                ))}
              </Section>
            </>
          )}

          {/* CONTACT */}
          {page === 'contact' && (
            <>
              <Section title="Hero Block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Hero Title" value={data.hero?.heroTitle || ''} onChange={(v: string) => set('hero', { ...data.hero, heroTitle: v })} />
                  <Field label="Hero Subtitle" value={data.hero?.heroDesc || ''} onChange={(v: string) => set('hero', { ...data.hero, heroDesc: v })} />
                  <div className="md:col-span-2"><ImageUploadField label="Hero Background Image" value={data.hero?.heroImg || ''} onChange={(v: string) => set('hero', { ...data.hero, heroImg: v })} /></div>
                </div>
              </Section>
              <Section title="Contact Methods"
                action={<AddBtn onClick={() => addItem('list', { type: 'phone', title: '', description: '', icon: 'phone' })} label="Add Method" />}>
                {(data.list || []).map((c: any) => (
                  <ListCard key={c.id} onRemove={() => removeItem('list', c.id)}>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">Type</label>
                      <select value={c.type} onChange={e => updateItem('list', c.id, 'type', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm">
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                        <option value="address">Address</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <Field label="Title" value={c.title} onChange={(v: string) => updateItem('list', c.id, 'title', v)} />
                    <Field label="Icon (Lucide name)" value={c.icon} onChange={(v: string) => updateItem('list', c.id, 'icon', v)} mono />
                    <Field label="Details / Value" value={c.description} onChange={(v: string) => updateItem('list', c.id, 'description', v)} />
                  </ListCard>
                ))}
              </Section>
            </>
          )}

          {/* storefront */}
          {page === 'store' && (
            <Section title="Store Page Promotional Banner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Banner Title" value={data.promo_banner_title || ''} onChange={(v: string) => set('promo_banner_title', v)} />
                <Field label="Banner Action Link (URL)" value={data.promo_banner_link || ''} onChange={(v: string) => set('promo_banner_link', v)} mono />
                <div className="md:col-span-2"><Field label="Banner Description" value={data.promo_banner_desc || ''} onChange={(v: string) => set('promo_banner_desc', v)} textarea /></div>
                <div className="md:col-span-2"><ImageUploadField label="Promo Card Background Image" value={data.promo_banner_image_url || ''} onChange={(v: string) => set('promo_banner_image_url', v)} /></div>
              </div>
            </Section>
          )}

          {/* STOREFRONT THEME & LAYOUT CUSTOMIZER */}
          {page === 'theme' && (
            <>
              <Section title="Storefront Color Palette & Theme">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <ColorField label="Primary Accent Color" value={data.primary_color} onChange={(v: string) => set('primary_color', v)} />
                  <ColorField label="Secondary Accent Color" value={data.secondary_color} onChange={(v: string) => set('secondary_color', v)} />
                  <ColorField label="Page Background Color" value={data.background_color} onChange={(v: string) => set('background_color', v)} />
                  <ColorField label="Text Primary Color" value={data.text_color} onChange={(v: string) => set('text_color', v)} />
                </div>
              </Section>

              <Section title="Header & Footer Branding Colors">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <ColorField label="Navbar Background" value={data.navbar_bg} onChange={(v: string) => set('navbar_bg', v)} />
                  <ColorField label="Navbar Text/Links" value={data.navbar_fg} onChange={(v: string) => set('navbar_fg', v)} />
                  <ColorField label="Footer Background" value={data.footer_bg} onChange={(v: string) => set('footer_bg', v)} />
                  <ColorField label="Footer Text/Links" value={data.footer_fg} onChange={(v: string) => set('footer_fg', v)} />
                </div>
              </Section>

              <Section title="Component Layout Choices">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SelectField
                    label="Navbar Layout Type"
                    value={data.navbar_position || 'sticky'}
                    onChange={(v: string) => set('navbar_position', v)}
                    options={[
                      { value: 'sticky', label: 'Sticky / Fixed (Scrolls with page)' },
                      { value: 'static', label: 'Static (Remains at the top)' },
                    ]}
                  />
                  <SelectField
                    label="Navbar Logo Position"
                    value={data.logo_alignment || 'left'}
                    onChange={(v: string) => set('logo_alignment', v)}
                    options={[
                      { value: 'left', label: 'Left Aligned' },
                      { value: 'center', label: 'Center Aligned' },
                    ]}
                  />
                  <SelectField
                    label="Footer Layout Style"
                    value={data.footer_style || 'detailed'}
                    onChange={(v: string) => set('footer_style', v)}
                    options={[
                      { value: 'detailed', label: 'Detailed Columns & Links' },
                      { value: 'simple', label: 'Minimal Simple Row' },
                    ]}
                  />
                  <SelectField
                    label="Borders Roundedness"
                    value={data.border_radius || 'md'}
                    onChange={(v: string) => set('border_radius', v)}
                    options={[
                      { value: 'none', label: 'Sharp Corners (0px)' },
                      { value: 'sm', label: 'Soft Corners (4px)' },
                      { value: 'md', label: 'Medium Corners (8px)' },
                      { value: 'lg', label: 'Rounded Corners (12px)' },
                      { value: 'xl', label: 'Highly Rounded (16px)' },
                      { value: 'full', label: 'Pill / Fully Round (24px)' },
                    ]}
                  />
                  <SelectField
                    label="Product Card Style"
                    value={data.card_style || 'standard'}
                    onChange={(v: string) => set('card_style', v)}
                    options={[
                      { value: 'standard', label: 'Standard Clean Border' },
                      { value: 'glassmorphic', label: 'Glassmorphic (Blur & Shadow)' },
                    ]}
                  />
                </div>
              </Section>

              <Section title="Homepage Section Layout Order (Position Customization)">
                <p className="text-xs text-gray-400 mb-4 font-medium">
                  Rearrange the display order of the storefront homepage panels. Click the arrows to shift positions.
                </p>
                <div className="space-y-2.5 bg-gray-50 p-4 rounded-2xl border border-gray-150 max-w-2xl">
                  {(data.homepage_layout || []).map((sectionKey: string, idx: number) => {
                    const labels: Record<string, string> = {
                      hero: 'Hero Slider / Banner',
                      categories: 'Shop Categories Grid',
                      products: 'Featured Products Grid',
                      promo: 'Middle Promo Card',
                      new_arrivals: 'New Arrivals Block',
                      newsletter: 'Newsletter Subscription Banner',
                    };
                    return (
                      <div
                        key={sectionKey}
                        className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-purple-250 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-xs font-bold text-purple-700">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                            {labels[sectionKey] || sectionKey}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveItem(idx, 'up')}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 disabled:opacity-30 transition-colors"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (data.homepage_layout || []).length - 1}
                            onClick={() => moveItem(idx, 'down')}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 disabled:opacity-30 transition-colors"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            </>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <button type="button" onClick={load}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded-xl transition-all">
              Reset
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase rounded-xl shadow-md disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h3>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1 bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 text-xs font-bold rounded-lg border border-purple-200">
      <Plus size={12} /> {label}
    </button>
  );
}

function ListCard({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 relative">
      <button type="button" onClick={onRemove}
        className="absolute right-3 top-3 text-red-400 hover:text-red-600 p-1">
        <Trash2 size={14} />
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">{children}</div>
    </div>
  );
}
