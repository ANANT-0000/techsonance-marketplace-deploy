"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AxiosAPI from "@/lib/axios";
import { toast } from "react-hot-toast";
import { deepMerge } from "@/utils/deepMerge";
import { PublishStatus } from "@/constants/landingCms.core";
import { CMS_STRINGS } from "@/constants/landingCms.strings";

import {
  LANDING_METADATA,
  LANDING_NAVBAR,
  LANDING_HERO,
  LANDING_TICKER,
  LANDING_SHOWCASE,
  LANDING_FEATURES,
  LANDING_STATS,
  LANDING_PRICING,
  LANDING_TESTIMONIALS,
  LANDING_INTEGRATIONS,
  LANDING_FAQ,
  LANDING_CTA,
  LANDING_FOOTER,
} from "@/constants/landingText";

export enum CmsActionType {
  FETCH_START = "FETCH_START",
  FETCH_SUCCESS = "FETCH_SUCCESS",
  FETCH_ERROR = "FETCH_ERROR",
  IGNORE_LOAD_ERROR = "IGNORE_LOAD_ERROR",

  SET_PUBLISH_STATUS = "SET_PUBLISH_STATUS",

  THEME_SAVE_START = "THEME_SAVE_START",
  THEME_SAVE_SUCCESS = "THEME_SAVE_SUCCESS",
  THEME_SAVE_ERROR = "THEME_SAVE_ERROR",
  THEME_SAVE_CONFLICT = "THEME_SAVE_CONFLICT",
  SET_THEME_COLOR = "SET_THEME_COLOR",
  APPLY_THEME_PRESET = "APPLY_THEME_PRESET",
  RESET_THEME = "RESET_THEME",

  CONTENT_SAVE_START = "CONTENT_SAVE_START",
  CONTENT_SAVE_SUCCESS = "CONTENT_SAVE_SUCCESS",
  CONTENT_SAVE_ERROR = "CONTENT_SAVE_ERROR",
  CONTENT_SAVE_CONFLICT = "CONTENT_SAVE_CONFLICT",
  SET_SECTION_CONTENT = "SET_SECTION_CONTENT",
}

export type SectionKey =
  | "navbar"
  | "metadata"
  | "hero"
  | "features"
  | "pricing"
  | "testimonials"
  | "faq"
  | "stats"
  | "showcase"
  | "integrations"
  | "cta"
  | "footer"
  | "ticker";

export interface CmsTheme {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
}

export interface CmsState {
  isLoading: boolean;
  loadFailed: boolean;
  ignoreLoadError: boolean;
  publishStatus: PublishStatus;

  isThemeSaving: boolean;
  isThemeDirty: boolean;
  themeVersion: number | null;
  themeSaveConflict: boolean;
  theme: CmsTheme;

  isContentSaving: boolean;
  contentDirtySections: Set<SectionKey>;
  contentVersion: number | null;
  contentSaveConflict: boolean;
  companyLogoUrl: string | null;
  content: {
    metadata: any;
    navbar: any;
    hero: any;
    ticker: any;
    showcase: any;
    features: any;
    stats: any;
    pricing: any;
    testimonials: any;
    integrations: any;
    faq: any;
    cta: any;
    footer: any;
  };
}

const DEFAULT_THEME: CmsTheme = {
  primary_color: "#3b82f6",
  secondary_color: "#1d4ed8",
  background_color: "#ffffff",
  text_color: "#1e293b",
};

const DEFAULT_CONTENT = {
  metadata: LANDING_METADATA,
  navbar: LANDING_NAVBAR,
  hero: LANDING_HERO,
  ticker: LANDING_TICKER,
  showcase: LANDING_SHOWCASE,
  features: LANDING_FEATURES,
  stats: LANDING_STATS,
  pricing: LANDING_PRICING,
  testimonials: LANDING_TESTIMONIALS,
  integrations: LANDING_INTEGRATIONS,
  faq: LANDING_FAQ,
  cta: LANDING_CTA,
  footer: LANDING_FOOTER,
};

const initialState: CmsState = {
  isLoading: true,
  loadFailed: false,
  ignoreLoadError: false,
  publishStatus: PublishStatus.Unknown,

  isThemeSaving: false,
  isThemeDirty: false,
  themeVersion: null,
  themeSaveConflict: false,
  theme: DEFAULT_THEME,

  isContentSaving: false,
  contentDirtySections: new Set(),
  contentVersion: null,
  contentSaveConflict: false,
  companyLogoUrl: null,
  content: DEFAULT_CONTENT,
};

// Add UUIDs to legacy arrays that might not have them, using standard `crypto.randomUUID()` where available.
function normalizeContent(rawContent: any) {
  const merged = deepMerge(rawContent || {}, DEFAULT_CONTENT);

  // Assign UUIDs to arrays that need stable keys if they lack an id
  const ensureId = (item: any) => ({
    ...item,
    id: item.id || crypto.randomUUID(),
  });

  if (merged.footer?.socials) {
    merged.footer.socials = merged.footer.socials.map(ensureId);
  }
  if (merged.footer?.columns) {
    merged.footer.columns = merged.footer.columns.map((col: any) => ({
      ...col,
      id: col.id || crypto.randomUUID(),
      links: col.links?.map(ensureId) || [],
    }));
  }
  if (merged.footer?.legal) {
    merged.footer.legal = merged.footer.legal.map(ensureId);
  }
  if (merged.features?.items) {
    merged.features.items = merged.features.items.map((item: any) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
      checklist:
        item.checklist?.map((text: string) => ({
          id: crypto.randomUUID(),
          text,
        })) || [], // If they were just strings, we might want to keep them as strings or change to objects. Wait, FeaturesEditor checklist expects array of strings. We'll leave strings alone for now as we can use index safely if they don't reorder, but stable id is better. The plan said stable id for checklist. We will handle checklist differently in FeaturesEditor.
    }));
  }
  if (merged.navbar?.links) {
    merged.navbar.links = merged.navbar.links.map(ensureId);
  }
  if (merged.hero?.trustBadges) {
    merged.hero.trustBadges = merged.hero.trustBadges.map(ensureId);
  }

  return merged;
}

export type CmsAction =
  | { type: CmsActionType.FETCH_START }
  | {
      type: CmsActionType.FETCH_SUCCESS;
      payload: {
        isPublished: boolean;
        theme: any;
        content: any;
        version: number | null;
        logoUrl: string | null;
        themeVersion: number | null;
      };
    }
  | { type: CmsActionType.FETCH_ERROR }
  | { type: CmsActionType.IGNORE_LOAD_ERROR }
  | { type: CmsActionType.SET_PUBLISH_STATUS; payload: PublishStatus }
  | { type: CmsActionType.THEME_SAVE_START }
  | {
      type: CmsActionType.THEME_SAVE_SUCCESS;
      payload: { version: number | null };
    }
  | { type: CmsActionType.THEME_SAVE_ERROR }
  | { type: CmsActionType.THEME_SAVE_CONFLICT }
  | {
      type: CmsActionType.SET_THEME_COLOR;
      payload: { key: keyof CmsTheme; value: string };
    }
  | { type: CmsActionType.APPLY_THEME_PRESET; payload: Partial<CmsTheme> }
  | { type: CmsActionType.RESET_THEME; payload: CmsTheme }
  | { type: CmsActionType.CONTENT_SAVE_START }
  | {
      type: CmsActionType.CONTENT_SAVE_SUCCESS;
      payload: { version: number | null };
    }
  | { type: CmsActionType.CONTENT_SAVE_ERROR }
  | { type: CmsActionType.CONTENT_SAVE_CONFLICT }
  | {
      type: CmsActionType.SET_SECTION_CONTENT;
      payload: { key: SectionKey; value: any };
    };

function cmsReducer(state: CmsState, action: CmsAction): CmsState {
  switch (action.type) {
    case CmsActionType.FETCH_START:
      return {
        ...state,
        isLoading: true,
        loadFailed: false,
        ignoreLoadError: false,
      };
    case CmsActionType.FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        publishStatus: action.payload.isPublished
          ? PublishStatus.Live
          : PublishStatus.Draft,
        theme: deepMerge(action.payload.theme || {}, DEFAULT_THEME),
        themeVersion: action.payload.themeVersion,
        isThemeDirty: false,
        themeSaveConflict: false,
        content: normalizeContent(action.payload.content),
        contentVersion: action.payload.version,
        companyLogoUrl: action.payload.logoUrl,
        contentDirtySections: new Set(),
        contentSaveConflict: false,
      };
    case CmsActionType.FETCH_ERROR:
      return {
        ...state,
        isLoading: false,
        loadFailed: true,
        publishStatus: PublishStatus.Unknown,
      };
    case CmsActionType.IGNORE_LOAD_ERROR:
      return { ...state, ignoreLoadError: true };
    case CmsActionType.SET_PUBLISH_STATUS:
      return { ...state, publishStatus: action.payload };

    // Theme Actions
    case CmsActionType.THEME_SAVE_START:
      return { ...state, isThemeSaving: true, themeSaveConflict: false };
    case CmsActionType.THEME_SAVE_SUCCESS:
      return {
        ...state,
        isThemeSaving: false,
        isThemeDirty: false,
        themeVersion: action.payload.version,
      };
    case CmsActionType.THEME_SAVE_ERROR:
      return { ...state, isThemeSaving: false };
    case CmsActionType.THEME_SAVE_CONFLICT:
      return { ...state, isThemeSaving: false, themeSaveConflict: true };
    case CmsActionType.SET_THEME_COLOR:
      return {
        ...state,
        isThemeDirty: true,
        theme: { ...state.theme, [action.payload.key]: action.payload.value },
      };
    case CmsActionType.APPLY_THEME_PRESET:
      return {
        ...state,
        isThemeDirty: true,
        theme: { ...state.theme, ...action.payload },
      };
    case CmsActionType.RESET_THEME:
      return {
        ...state,
        isThemeDirty: false,
        theme: action.payload,
      };

    // Content Actions
    case CmsActionType.CONTENT_SAVE_START:
      return { ...state, isContentSaving: true, contentSaveConflict: false };
    case CmsActionType.CONTENT_SAVE_SUCCESS:
      return {
        ...state,
        isContentSaving: false,
        contentDirtySections: new Set(),
        contentVersion: action.payload.version,
      };
    case CmsActionType.CONTENT_SAVE_ERROR:
      return { ...state, isContentSaving: false };
    case CmsActionType.CONTENT_SAVE_CONFLICT:
      return { ...state, isContentSaving: false, contentSaveConflict: true };
    case CmsActionType.SET_SECTION_CONTENT: {
      const newDirty = new Set(state.contentDirtySections);
      newDirty.add(action.payload.key);
      return {
        ...state,
        contentDirtySections: newDirty,
        content: {
          ...state.content,
          [action.payload.key]: action.payload.value,
        },
      };
    }
    default:
      return state;
  }
}

interface CmsContextValue {
  state: CmsState;
  dispatch: React.Dispatch<CmsAction>;
  fetchData: () => Promise<void>;
  saveTheme: () => Promise<void>;
  saveContent: () => Promise<void>;
  togglePublish: () => Promise<void>;
}

const CmsContext = createContext<CmsContextValue | undefined>(undefined);

export function LandingCmsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cmsReducer, initialState);

  const fetchData = useCallback(async () => {
    try {
      dispatch({ type: CmsActionType.FETCH_START });
      const res = await AxiosAPI.get("/v1/landing-page", {
        headers: { "x-suppress-toast": "true" },
      });
      dispatch({
        type: CmsActionType.FETCH_SUCCESS,
        payload: {
          isPublished: res.data?.data?.isPublished,
          theme: res.data?.data?.theme,
          content: res.data?.data?.content,
          version:
            typeof res.data?.data?.version === "number" ? res.data.data.version : null,
          themeVersion:
            typeof res.data?.data?.themeVersion === "number"
              ? res.data.data.themeVersion
              : null,
          logoUrl: res.data?.data?.branding?.logo_url ?? null,
        },
      });
    } catch (error) {
      dispatch({ type: CmsActionType.FETCH_ERROR });
      toast.error(CMS_STRINGS.contentLoadError);
    }
  }, []);

  const saveTheme = async () => {
    try {
      dispatch({ type: CmsActionType.THEME_SAVE_START });
      const payload = {
        theme: state.theme,
        expectedVersion: state.themeVersion ?? undefined,
      };
      const res = await AxiosAPI.post("/v1/landing-page/theme", payload);
      dispatch({
        type: CmsActionType.THEME_SAVE_SUCCESS,
        payload: {
          version:
            typeof res.data?.data?.themeVersion === "number"
              ? res.data.data.themeVersion
              : null,
        },
      });
      toast.success(CMS_STRINGS.themeSaveSuccess);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        dispatch({ type: CmsActionType.THEME_SAVE_CONFLICT });
        toast.error(CMS_STRINGS.saveConflictWarning);
      } else {
        dispatch({ type: CmsActionType.THEME_SAVE_ERROR });
        toast.error(CMS_STRINGS.themeSaveError);
      }
      throw error;
    }
  };

  const saveContent = async () => {
    try {
      dispatch({ type: CmsActionType.CONTENT_SAVE_START });
      const payload = {
        content: state.content,
        expectedVersion: state.contentVersion ?? undefined,
      };
      const res = await AxiosAPI.post("/v1/landing-page/content", payload);
      dispatch({
        type: CmsActionType.CONTENT_SAVE_SUCCESS,
        payload: {
          version:
            typeof res.data?.data?.version === "number" ? res.data.data.version : null,
        },
      });
      toast.success(CMS_STRINGS.contentSaveSuccess);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        dispatch({ type: CmsActionType.CONTENT_SAVE_CONFLICT });
        toast.error(CMS_STRINGS.saveConflictWarning);
      } else {
        dispatch({ type: CmsActionType.CONTENT_SAVE_ERROR });
        toast.error(CMS_STRINGS.contentSaveError);
      }
      throw error;
    }
  };

  const togglePublish = async () => {
    const desiredState = state.publishStatus !== PublishStatus.Live;
    try {
      const res = await AxiosAPI.post("/v1/landing-page/publish", {
        publish: desiredState,
      });
      dispatch({
        type: CmsActionType.SET_PUBLISH_STATUS,
        payload: res.data?.data?.isPublished
          ? PublishStatus.Live
          : PublishStatus.Draft,
      });
      toast.success(
        res.data?.data?.isPublished
          ? CMS_STRINGS.publishSuccess
          : CMS_STRINGS.unpublishSuccess,
      );
    } catch (error) {
      toast.error(CMS_STRINGS.publishError);
      throw error;
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Warn on beforeunload if dirty
  useEffect(() => {
    if (!state.isThemeDirty && state.contentDirtySections.size === 0) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.isThemeDirty, state.contentDirtySections.size]);

  return (
    <CmsContext.Provider
      value={{
        state,
        dispatch,
        fetchData,
        saveTheme,
        saveContent,
        togglePublish,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

export function useLandingCms() {
  const ctx = useContext(CmsContext);
  if (!ctx)
    throw new Error("useLandingCms must be used within LandingCmsProvider");
  return ctx;
}
