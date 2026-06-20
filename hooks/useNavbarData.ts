"use client";
import { useEffect, useReducer, useCallback } from "react";
import AxiosAPI from "@/lib/axios";
import toast from "react-hot-toast";
import { NAV_LINKS } from "@/constants/customer";
import { LANG_KEY, NAVBAR_CACHE_KEY } from "@/constants";
import {
  CMS_L1_NAV_PAYLOAD,
  CMS_L2_MEGA_PAYLOAD,
} from "@/constants/storefront";
import { UiText } from "@/constants/ui-text";
import {
  getCachedData,
  cacheData,
  subscribeLocaleChange,
  clearCachedData,
  subscribeNavbarChange,
} from "@/utils/cache";
import {
  L1NavbarPayload,
  L2MegaMenuPayload,
  L1NavItem,
  NavItemColType,
  NavItemDisplayType,
  NavLinkItem,
  NavMenuLogoAlignment,
  NavMenuPosition,
} from "@/utils/Types";
import { AxiosResponse } from "axios";

// ─── Enums ───────────────────────────────────────────────────────────────────
export enum NavbarFetchStatus {
  IDLE = "IDLE",
  LOADING = "LOADING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export enum NavbarActionType {
  FETCH_START = "FETCH_START",
  FETCH_SUCCESS = "FETCH_SUCCESS",
  FETCH_ERROR = "FETCH_ERROR",
  SET_LANG = "SET_LANG",
}

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface NavbarApiSettings {
  logo_src?: string;
  logo_alt?: string;
  logo_href?: string;
  logo_alignment?: NavMenuLogoAlignment;
  position?: NavMenuPosition;
  show_shadow?: boolean;
  show_border?: boolean;
  search_visible?: boolean;
  search_placeholder?: string;
  search_endpoint?: string;
  show_account?: boolean;
  show_wishlist?: boolean;
  show_cart?: boolean;
}

interface NavItemMetaApi {
  display_type?: NavItemDisplayType;
  show_category_icons?: boolean;
  parent_category_id?: string;
  col_type?: NavItemColType;
  col_title?: string;
  promo_image_url?: string;
  promo_title?: string;
  promo_subtitle?: string;
  promo_cta_href?: string;
  icon_url?: string;
  product_ids?: string[];
}

interface ApiSubLink {
  id: string;
  label: string;
  href: string;
  icon_url?: string | null;
  iconUrl?: string | null;
  category_id?: string | null;
  categoryId?: string | null;
  children?: ApiSubLink[];
}

interface NavItemApi {
  id: string;
  label: string;
  href: string;
  item_type: string;
  category_id?: string | null;
  has_mega_menu: boolean;
  sort_order: number;
  meta: NavItemMetaApi;
  megaMenuColumns: {
    id: string;
    label: string;
    href: string;
    sort_order: number;
    item_type: string;
    meta: NavItemMetaApi;
    items?: ApiSubLink[];
  }[];
}

interface NavbarApiResponse {
  settings: NavbarApiSettings;
  menu_id: string | null;
  navigationItems: NavItemApi[];
}

interface NavbarState {
  status: NavbarFetchStatus;
  lang: string;
  l1Config: L1NavbarPayload;
  l2Config: L2MegaMenuPayload;
  menuLinks: (L1NavItem | Record<string, string | undefined>)[];
  navbarConfig: NavbarApiResponse | null;
}

type NavbarAction =
  | { type: NavbarActionType.FETCH_START }
  | {
      type: NavbarActionType.FETCH_SUCCESS;
      payload: {
        l1: L1NavbarPayload;
        l2: L2MegaMenuPayload;
        raw: NavbarApiResponse;
      };
    }
  | { type: NavbarActionType.FETCH_ERROR }
  | { type: NavbarActionType.SET_LANG; payload: string };

// ─── Constants/Config ────────────────────────────────────────────────────────
export const NavbarConfig = {
  DEFAULT_LOCALE: "en",
  ERROR_USER_MESSAGE: "We couldn't load navigation menu right now. Please try again in a moment.",
} as const;

// ─── Transform Helper ────────────────────────────────────────────────────────
function transformApiResponse(data: NavbarApiResponse): {
  l1: L1NavbarPayload;
  l2: L2MegaMenuPayload;
} {
  const s = data.settings;

  const l1: L1NavbarPayload = {
    logo: {
      src: s.logo_src || CMS_L1_NAV_PAYLOAD.logo.src,
      alt: s.logo_alt || CMS_L1_NAV_PAYLOAD.logo.alt,
      href: s.logo_href || CMS_L1_NAV_PAYLOAD.logo.href,
      alignment:
        s.logo_alignment?.toLowerCase() === "center"
          ? NavMenuLogoAlignment.CENTER
          : NavMenuLogoAlignment.LEFT,
    },
    navbar: {
      position:
        s.position?.toLowerCase() === "relative"
          ? NavMenuPosition.RELATIVE
          : NavMenuPosition.STICKY,
      showBottomBorder: s.show_border ?? true,
      showShadow: s.show_shadow ?? true,
    },
    searchBar: {
      isVisible: s.search_visible ?? true,
      placeholder:
        s.search_placeholder || CMS_L1_NAV_PAYLOAD.searchBar.placeholder,
      searchEndpoint:
        s.search_endpoint || CMS_L1_NAV_PAYLOAD.searchBar.searchEndpoint,
    },
    utilities: {
      showAccount: s.show_account ?? true,
      showWishlist: s.show_wishlist ?? true,
      showCart: s.show_cart ?? true,
    },
    navigationItems: data.navigationItems.map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      itemType: item.item_type,
      hasMegaMenu: item.has_mega_menu,
      displayType: item.meta?.display_type,
    })),
  };

  const l2: L2MegaMenuPayload = { ...CMS_L2_MEGA_PAYLOAD };
  data.navigationItems.forEach((item) => {
    if (!item.has_mega_menu || !item.megaMenuColumns?.length) return;

    l2[item.id] = item.megaMenuColumns.map((col) => {
      const m = col.meta;
      const colType =
        m.col_type?.toLowerCase() === NavItemColType.BRANDS
          ? NavItemColType.BRANDS
          : m.col_type?.toLowerCase() === NavItemColType.PROMOTION
            ? NavItemColType.PROMOTION
            : m.col_type?.toLowerCase() === NavItemColType.PRODUCTS
              ? NavItemColType.PRODUCTS
              : NavItemColType.SUBCATEGORIES;
      const href = col.href || "/";
      const itemType = col.item_type;
      if (colType === NavItemColType.PROMOTION) {
        return {
          id: col.id,
          type: NavItemColType.PROMOTION,
          title: m.col_title || col.label,
          promotion: {
            imageUrl: m.promo_image_url || "",
            title: m.promo_title || col.label,
            subtitle: m.promo_subtitle || "",
            ctaText: UiText.SHOP_NOW,
            ctaHref: m.promo_cta_href || "/store",
          },
        };
      }

      return {
        id: col.id,
        type: colType,
        title: m.col_title || col.label,
        href: href,
        itemType: itemType,
        items: (col.items || []).map((subLink: ApiSubLink): NavLinkItem => ({
          id: subLink.id,
          label: subLink.label,
          href: subLink.href,
          iconUrl: subLink.icon_url || subLink.iconUrl || null,
          categoryId: subLink.category_id || subLink.categoryId || null,
          children: (subLink.children || []).map((l3: ApiSubLink): NavLinkItem => ({
            id: l3.id,
            label: l3.label,
            href: l3.href,
            iconUrl: l3.icon_url || l3.iconUrl || null,
            categoryId: l3.category_id || l3.categoryId || null,
            children: [],
          })),
        })),
        iconUrl: m.icon_url || null,
      };
    });
  });

  return { l1, l2 };
}

// ─── Reducer with Exhaustive Check ───────────────────────────────────────────
function navbarReducer(state: NavbarState, action: NavbarAction): NavbarState {
  switch (action.type) {
    case NavbarActionType.FETCH_START:
      return {
        ...state,
        status: NavbarFetchStatus.LOADING,
      };
    case NavbarActionType.FETCH_SUCCESS:
      return {
        ...state,
        status: NavbarFetchStatus.SUCCESS,
        l1Config: action.payload.l1,
        l2Config: action.payload.l2,
        navbarConfig: action.payload.raw,
        menuLinks: action.payload.l1.navigationItems,
      };
    case NavbarActionType.FETCH_ERROR:
      return {
        ...state,
        status: NavbarFetchStatus.ERROR,
      };
    case NavbarActionType.SET_LANG:
      return {
        ...state,
        lang: action.payload,
      };
    default:
      const _exhaustiveCheck: never = action;
      return state;
  }
}

// ─── Initial State ───────────────────────────────────────────────────────────
const initialNavbarState: NavbarState = {
  status: NavbarFetchStatus.IDLE,
  lang: NavbarConfig.DEFAULT_LOCALE,
  l1Config: CMS_L1_NAV_PAYLOAD,
  l2Config: CMS_L2_MEGA_PAYLOAD,
  menuLinks: NAV_LINKS,
  navbarConfig: null,
};

// ─── Refactored useNavbarData Hook ───────────────────────────────────────────
export function useNavbarData() {
  const [state, dispatch] = useReducer(navbarReducer, initialNavbarState);

  // Sync locale with localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem(LANG_KEY) || NavbarConfig.DEFAULT_LOCALE;
      dispatch({ type: NavbarActionType.SET_LANG, payload: savedLang });
    }
    const unsubscribe = subscribeLocaleChange((newLang) => {
      dispatch({ type: NavbarActionType.SET_LANG, payload: newLang });
    });
    return unsubscribe;
  }, []);

  const fetchNavbar = useCallback(async (currentLang: string, forceRefresh = false) => {
    dispatch({ type: NavbarActionType.FETCH_START });
    const cacheKey = `${NAVBAR_CACHE_KEY}_relational_${currentLang}`;

    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        dispatch({
          type: NavbarActionType.FETCH_SUCCESS,
          payload: {
            l1: cached.l1,
            l2: cached.l2,
            raw: cached.raw,
          },
        });
        return;
      }
    } else {
      clearCachedData(cacheKey);
    }

    try {
      const res: AxiosResponse<NavbarApiResponse> = await AxiosAPI.get(`/v1/navbar`);
      const data: NavbarApiResponse = res.data;
      if (data?.navigationItems) {
        const { l1, l2 } = transformApiResponse(data);
        dispatch({
          type: NavbarActionType.FETCH_SUCCESS,
          payload: { l1, l2, raw: data },
        });
        cacheData(cacheKey, { l1, l2, raw: data });
      } else {
        dispatch({ type: NavbarActionType.FETCH_ERROR });
      }
    } catch (error) {
      // Tier 1: User-Facing Error feedback
      toast.error(NavbarConfig.ERROR_USER_MESSAGE);
      // Tier 2: Developer Visibility logs
      console.error("Navbar fetch error (developer details):", error);
      dispatch({ type: NavbarActionType.FETCH_ERROR });
    }
  }, []);

  useEffect(() => {
    fetchNavbar(state.lang, true);
    const unsubscribe = subscribeNavbarChange(() => {});
    return unsubscribe;
  }, [state.lang, fetchNavbar]);

  return {
    navbarConfig: state.navbarConfig,
    l1Config: state.l1Config,
    l2Config: state.l2Config,
    menuLinks: state.menuLinks,
    isLoading: state.status === NavbarFetchStatus.LOADING,
  };
}
