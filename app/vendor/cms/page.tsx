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
import { motion, AnimatePresence } from "motion/react";
import AxiosAPI from "@/lib/axios";
import { authToken } from "@/utils/authToken";
import { useVendorTour } from "@/components/vendor/VendorTourProvider";
import { useAppSelector } from "@/hooks/reduxHooks";
import { VendorUser } from "@/utils/Types";
import { BrandingTab } from "@/components/vendor/BrandingTab";
import {
  HeroLayout,
  HeroBgStyle,
} from "@/components/customer/homepage/InteractiveHero";
import { CmsDataKey } from "@/constants/cms";
import { NAVBAR_CACHE_KEY } from "@/constants";
import { UILabels } from "@/constants/ui-labels";
import { UiText } from "@/constants/ui-text";
import {
  CmsSection,
  AddBtn,
  ListCard,
  ProductPreviewCard,
  SelectField,
  ColorField,
  SlideQueryPicker,
  InputField,
  ImageUploadField,
} from "@/components/vendor/cms";
import { CmsHomeTab } from "@/components/vendor/cms/CmsHomeTab";
import { toDatetimeLocal } from "@/lib/utils";

import { CmsFooterTab } from "@/components/vendor/cms/CmsFooterTab";
import { CmsStoreTab } from "@/components/vendor/cms/CmsStoreTab";
import { CmsAboutTab } from "@/components/vendor/cms/CmsAboutTab";
import { CmsContactTab } from "@/components/vendor/cms/CmsContactTab";
import { CmsNavbarTab } from "@/components/vendor/cms/CmsNavbarTab";

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

export enum MoveDirection {
  UP = "up",
  DOWN = "down",
}

export type CmsDataPayload = Record<string, any>;

interface CmsState {
  page: PageType;
  lang: LangType;
  loading: boolean;
  saving: boolean;
  msg: { text: string; ok: boolean } | null;
  data: CmsDataPayload;
}

export enum CmsActionType {
  SET_PAGE = "SET_PAGE",
  SET_LANG = "SET_LANG",
  FETCH_START = "FETCH_START",
  FETCH_SUCCESS = "FETCH_SUCCESS",
  FETCH_FAILURE = "FETCH_FAILURE",
  SAVE_START = "SAVE_START",
  SAVE_SUCCESS = "SAVE_SUCCESS",
  SAVE_FAILURE = "SAVE_FAILURE",
  SET_DATA_FIELD = "SET_DATA_FIELD",
  SET_DATA_FULL = "SET_DATA_FULL",
  CLEAR_MESSAGE = "CLEAR_MESSAGE",
}

export interface SetDataFieldPayload {
  key: string;
  val: any;
}

type CmsAction =
  | { type: CmsActionType.SET_PAGE; payload: PageType }
  | { type: CmsActionType.SET_LANG; payload: LangType }
  | { type: CmsActionType.FETCH_START }
  | { type: CmsActionType.FETCH_SUCCESS; payload: CmsDataPayload }
  | { type: CmsActionType.FETCH_FAILURE; payload: string }
  | { type: CmsActionType.SAVE_START }
  | { type: CmsActionType.SAVE_SUCCESS; payload: string }
  | { type: CmsActionType.SAVE_FAILURE; payload: string }
  | { type: CmsActionType.SET_DATA_FIELD; payload: SetDataFieldPayload }
  | { type: CmsActionType.SET_DATA_FULL; payload: CmsDataPayload }
  | { type: CmsActionType.CLEAR_MESSAGE };

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
    case CmsActionType.SET_PAGE:
      return { ...state, page: action.payload, msg: null };
    case CmsActionType.SET_LANG:
      return { ...state, lang: action.payload, msg: null };
    case CmsActionType.FETCH_START:
      return { ...state, loading: true, msg: null };
    case CmsActionType.FETCH_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case CmsActionType.FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        msg: { text: action.payload, ok: false },
      };
    case CmsActionType.SAVE_START:
      return { ...state, saving: true, msg: null };
    case CmsActionType.SAVE_SUCCESS:
      return {
        ...state,
        saving: false,
        msg: { text: action.payload, ok: true },
      };
    case CmsActionType.SAVE_FAILURE:
      return {
        ...state,
        saving: false,
        msg: { text: action.payload, ok: false },
      };
    case CmsActionType.SET_DATA_FIELD:
      return {
        ...state,
        data: { ...state.data, [action.payload.key]: action.payload.val },
      };
    case CmsActionType.SET_DATA_FULL:
      return { ...state, data: action.payload };
    case CmsActionType.CLEAR_MESSAGE:
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

// ── Slide Query Picker ─────────────────────────────────────────────────────
// Fetches real categories + product names from the server and presents them
// as clickable tag chips.  No typing = no typos.  Vendor just clicks.

interface CmsManagementPageProps {
  labels?: typeof UiText;
}

export default function CmsManagementPage({
  labels = UiText,
}: CmsManagementPageProps) {
  const [state, dispatch] = useReducer(cmsReducer, initialState);
  const { page, lang, loading, saving, msg, data } = state;

  const [selectedHotspotId, setSelectedHotspotId] = useState<any>(null);
  
  const { startVendorTour } = useVendorTour();
  const user = useAppSelector((state) => state.auth.user) as VendorUser | undefined;

  useEffect(() => {
    if (user && user.preferences && Array.isArray(user.preferences.completed_tours)) {
      if (!user.preferences.completed_tours.includes("cms")) {
        const timer = setTimeout(() => {
          startVendorTour("cms");
        }, 800);
        return () => clearTimeout(timer);
      }
    } else if (user && !user.preferences) {
      const timer = setTimeout(() => {
        startVendorTour("cms");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user, startVendorTour]);

  const load = async () => {
    if (page === PageType.THEME) {
      dispatch({ type: CmsActionType.FETCH_SUCCESS, payload: {} });
      return;
    }
    dispatch({ type: CmsActionType.FETCH_START });
    try {
      const res = await AxiosAPI.get(`/v1/cms/${page}?lang=${lang}`);
      const cmsRow = res.data?.data ?? res.data;
      const raw = cmsRow?.content;
      let parsed = typeof raw === "string" ? JSON.parse(raw) : (raw ?? {});
      dispatch({ type: CmsActionType.FETCH_SUCCESS, payload: parsed });
    } catch {
      dispatch({ type: CmsActionType.FETCH_SUCCESS, payload: {} });
    }
  };

  useEffect(() => {
    load();
  }, [page, lang]);

  const set = (key: string, val: any) =>
    dispatch({ type: CmsActionType.SET_DATA_FIELD, payload: { key, val } });

  const saveDataNow = async (overrides?: { key: string; val: any }) => {
    // Merge optional override (e.g. a freshly uploaded URL that hasn't hit state yet)
    const payload = {
      page_content_type: page,
      language: lang,
      title: `${PAGE_LABELS[page]} (${lang.toUpperCase()})`,
      content: JSON.stringify(
        overrides ? { ...data, [overrides.key]: overrides.val } : data,
      ),
      seo_meta: {},
    };
    await AxiosAPI.post("/v1/cms", payload);
    localStorage.removeItem(`techsonance_cms_${page}_${lang}`);
    localStorage.removeItem(`techsonance_cms_${page}`);
    // Clear storefront navbar cache so changes reflect immediately
    if (page === PageType.NAVBAR) {
      localStorage.removeItem(`${NAVBAR_CACHE_KEY}_${lang}`);
      localStorage.removeItem(NAVBAR_CACHE_KEY);
    }
  };

  // Factory: creates an onAutoSave callback bound to a specific flat CMS data key.
  // When an image is uploaded to that field, the new URL is saved immediately to the
  // backend (before React's state batch resolves) so it survives a page reload.
  const makeAutoSave =
    (key: string) =>
    async (newUrl: string): Promise<void> => {
      await saveDataNow({ key, val: newUrl });
    };

  const save = async (e: React.SubmitEvent) => {
    e.preventDefault();
    dispatch({ type: CmsActionType.SAVE_START });
    try {
      await saveDataNow();
      dispatch({
        type: CmsActionType.SAVE_SUCCESS,
        payload: labels.SAVE_SUCCESS,
      });
    } catch (err: any) {
      dispatch({
        type: CmsActionType.SAVE_FAILURE,
        payload: `${labels.SAVE_FAILED_PREFIX}${err?.response?.data?.message || labels.TRY_AGAIN}`,
      });
    }
  };

  const addItem = (key: string, template: any) => {
    const nextArr = [...(data[key] || []), { id: Date.now(), ...template }];
    dispatch({
      type: CmsActionType.SET_DATA_FIELD,
      payload: { key, val: nextArr },
    });
  };

  const removeItem = (key: string, id: any) => {
    const nextArr = (data[key] || []).filter((i: any) => i.id !== id);
    dispatch({
      type: CmsActionType.SET_DATA_FIELD,
      payload: { key, val: nextArr },
    });
  };

  const updateItem = (key: string, id: any, field: string, val: any) => {
    const nextArr = (data[key] || []).map((i: any) =>
      i.id === id ? { ...i, [field]: val } : i,
    );
    dispatch({
      type: CmsActionType.SET_DATA_FIELD,
      payload: { key, val: nextArr },
    });
  };

  const moveItem = (index: number, direction: MoveDirection) => {
    const layout = [...(data.homepage_layout || [])];
    const targetIndex = direction === MoveDirection.UP ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < layout.length) {
      const temp = layout[index];
      layout[index] = layout[targetIndex];
      layout[targetIndex] = temp;
      dispatch({
        type: CmsActionType.SET_DATA_FIELD,
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
      const updated = (data?.[CmsDataKey.LOOKBOOK_HOTSPOTS] || []).map(
        (h: any) =>
          h.id === selectedHotspotId ? { ...h, x: clampedX, y: clampedY } : h,
      );
      set(CmsDataKey.LOOKBOOK_HOTSPOTS, updated);
    } else {
      const newId = Date.now();
      const newHotspot = {
        id: newId,
        x: clampedX,
        y: clampedY,
        productId: "",
        product_id: "",
      };
      set(CmsDataKey.LOOKBOOK_HOTSPOTS, [
        ...(data?.[CmsDataKey.LOOKBOOK_HOTSPOTS] || []),
        newHotspot,
      ]);
      setSelectedHotspotId(newId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 min-w-0 bg-gray-50/50 p-6 lg:p-10 min-h-screen max-h-screen overflow-y-scroll overflow-x-hidden"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-theme-h4 font-bold text-gray-900">
            {labels.TITLE}
          </h1>
          <p className="text-theme-caption text-gray-400 mt-1 uppercase tracking-wider">
            {labels.SUBTITLE}
          </p>
        </div>
        <button
          type="submit"
          onSubmit={save}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-theme-body-sm px-6 py-2.5 rounded-xl shadow disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? labels.SAVING : labels.SAVE_CHANGES}
        </button>
      </div>
      {/* Tab + Lang selectors */}
      <div id="tour-cms-tabs" className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-sm p-5 mb-8 flex flex-col lg:flex-row gap-6 sticky top-0 z-10">
        <div className="flex-1">
          <p className="text-theme-caption font-bold text-gray-400 uppercase mb-2">
            {labels.PAGE_SECTION}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PAGES.map((p) => (
              <button
                key={p}
                onClick={() =>
                  dispatch({ type: CmsActionType.SET_PAGE, payload: p })
                }
                className={`px-4 py-1.5 text-theme-caption font-bold rounded-lg border transition-all ${page === p ? "bg-purple-600 text-white border-purple-600" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300"}`}
              >
                {PAGE_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        {page !== PageType.THEME && page !== PageType.NAVBAR && (
          <div id="tour-cms-lang">
            <p className="text-theme-caption font-bold text-gray-400 uppercase mb-2">
              {labels.LANGUAGE}
            </p>
            <div className="flex gap-1.5">
              {([LangType.EN, LangType.ES] as LangType[]).map((l) => (
                <button
                  key={l}
                  onClick={() =>
                    dispatch({ type: CmsActionType.SET_LANG, payload: l })
                  }
                  className={`flex items-center gap-1 px-4 py-1.5 text-theme-caption font-bold rounded-lg border transition-all ${lang === l ? "bg-purple-600 text-white border-purple-600" : "bg-gray-50 text-gray-600 border-gray-200"}`}
                >
                  {l === LangType.EN ? (
                    <>
                      <Globe size={12} /> {labels.ENGLISH}
                    </>
                  ) : (
                    <>
                      <Languages size={12} /> {labels.ESPANOL}
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
          className={`flex items-center gap-2 p-4 rounded-xl mb-6 border text-theme-body-sm font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}
        >
          <CheckCircle size={18} /> {msg.text}
        </div>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border p-20 flex items-center justify-center"
          >
            <Loader2 size={36} className="animate-spin text-purple-600" />
          </motion.div>
        ) : page === PageType.THEME ? (
          <motion.div
            key="theme"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 pb-20"
          >
            <BrandingTab />
          </motion.div>
        ) : page === PageType.NAVBAR ? (
          /* Relational navbar tab — self-fetching, manages its own saves.
             Rendered outside the legacy CMS form so the global Save button
             doesn't attempt a JSON-blob write for the navbar page. */
          <motion.div
            key="navbar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 pb-20"
          >
            <CmsNavbarTab />
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={save}
            className="space-y-8 pb-20"
          >
            {/* HOME */}
            {page === PageType.HOME && (
              <CmsHomeTab
                data={data}
                set={set}
                removeItem={removeItem}
                addItem={addItem}
                updateItem={updateItem}
                makeAutoSave={makeAutoSave}
                handleImageClick={handleImageClick}
                selectedHotspotId={selectedHotspotId}
                setSelectedHotspotId={setSelectedHotspotId}
              />
            )}

            {/* NAVBAR — handled by the branch above, never reaches here */}

            {/* FOOTER */}
            {page === PageType.FOOTER && (
              <CmsFooterTab data={data} addItem={addItem} set={set} />
            )}

            {/* ABOUT */}
            {page === PageType.ABOUT && (
              <CmsAboutTab
                data={data}
                addItem={addItem}
                set={set}
                removeItem={removeItem}
                updateItem={updateItem}
                makeAutoSave={makeAutoSave}
              />
            )}

            {/* CONTACT */}
            {page === PageType.CONTACT && (
              <CmsContactTab
                data={data}
                addItem={addItem}
                set={set}
                removeItem={removeItem}
                updateItem={updateItem}
                makeAutoSave={makeAutoSave}
              />
            )}

            {/* storefront */}
            {page === PageType.STORE && (
              <CmsStoreTab set={set} data={data} makeAutoSave={makeAutoSave} />
            )}

            {/* Footer Actions */}
            <div className="flex justify-end gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <button
                type="button"
                onClick={load}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-theme-caption font-bold uppercase rounded-xl transition-all"
              >
                {labels.RESET}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-theme-caption font-bold uppercase rounded-xl shadow-md disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? labels.SAVING : labels.SAVE_CONFIGURATION}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
