"use client";
import { useState, useEffect, useCallback } from "react";
import AxiosAPI from "@/lib/axios";
import { NAV_LINKS } from "@/constants/customer";

import { LANG_KEY, NAVBAR_CACHE_KEY } from "@/constants";
import {
  CMS_L1_NAV_PAYLOAD,
  CMS_L2_MEGA_PAYLOAD,
  L1NavbarPayload,
  L2MegaMenuPayload,
  LogoAlignmentEnum,
  NavbarPositionEnum,
} from "@/constants/storefront";
import {
  ColType,
  NavItemDisplayType,
} from "@/components/vendor/cms/CmsNavbarTab";
import { UiText } from "@/constants/ui-text";
import {
  getCachedData,
  cacheData,
  subscribeLocaleChange,
  clearCachedData,
  subscribeNavbarChange,
} from "@/utils/cache";

// ─── Response shape returned by GET /v1/navbar ───────────────────────────────
interface NavbarApiSettings {
  logo_src?: string;
  logo_alt?: string;
  logo_href?: string;
  logo_alignment?: "left" | "center";
  position?: "sticky" | "relative";
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
  col_type?: ColType;
  col_title?: string;
  promo_image_url?: string;
  promo_title?: string;
  promo_subtitle?: string;
  promo_cta_href?: string;
  icon_url?: string;
  product_ids?: string[];
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
    meta: NavItemMetaApi;
    items?: { label: string; href: string; iconUrl?: string }[];
  }[];
}

interface NavbarApiResponse {
  settings: NavbarApiSettings;
  menu_id: string | null;
  navigationItems: NavItemApi[];
}

// ─── Transform the relational API response into the shape Navbar.tsx expects ──
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
          ? LogoAlignmentEnum.CENTER
          : LogoAlignmentEnum.LEFT,
    },
    navbar: {
      position:
        s.position?.toLowerCase() === "relative"
          ? NavbarPositionEnum.RELATIVE
          : NavbarPositionEnum.STICKY,
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
      hasMegaMenu: item.has_mega_menu,
    })),
  };

  // Build L2 mega-menu payload from the nested megaMenuColumns
  const l2: L2MegaMenuPayload = { ...CMS_L2_MEGA_PAYLOAD };
  data.navigationItems.forEach((item) => {
    if (!item.has_mega_menu || !item.megaMenuColumns?.length) return;

    l2[item.id] = item.megaMenuColumns.map((col) => {
      const m = col.meta;
      const colType =
        m.col_type?.toLowerCase() === ColType.BRANDS
          ? ColType.BRANDS
          : m.col_type?.toLowerCase() === ColType.PROMOTION
            ? ColType.PROMOTION
            : m.col_type?.toLowerCase() === ColType.PRODUCTS
              ? ColType.PRODUCTS
              : ColType.SUBCATEGORIES;

      if (colType === ColType.PROMOTION) {
        return {
          type: ColType.PROMOTION,
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
        type: colType,
        title: m.col_title || col.label,
        items: col.items || [], // Map resolved sub-items forwarded by the API
      };
    });
  });

  return { l1, l2 };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useNavbarData() {
  const [lang, setLang] = useState<string>("en");
  const [l1Config, setL1Config] = useState<L1NavbarPayload>(CMS_L1_NAV_PAYLOAD);
  const [l2Config, setL2Config] =
    useState<L2MegaMenuPayload>(CMS_L2_MEGA_PAYLOAD);
  const [menuLinks, setMenuLinks] = useState<any[]>(NAV_LINKS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // navbarConfig kept for backward compat with any consumers that read it
  const [navbarConfig, setNavbarConfig] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem(LANG_KEY) || "en";
      setLang(savedLang);
    }
    const unsubscribe = subscribeLocaleChange((newLang) => setLang(newLang));
    return unsubscribe;
  }, []);

  const fetchNavbar = useCallback(
    async (currentLang: string, forceRefresh = false) => {
      setIsLoading(true);
      const cacheKey = `${NAVBAR_CACHE_KEY}_relational_${currentLang}`;

      if (!forceRefresh) {
        const cached = getCachedData(cacheKey);
        if (cached) {
          setL1Config(cached.l1);
          setL2Config(cached.l2);
          setNavbarConfig(cached.raw);
          setMenuLinks(cached.l1.navigationItems);
          setIsLoading(false);
          return;
        }
      } else {
        clearCachedData(cacheKey);
      }

      try {
        const res = await AxiosAPI.get(`/v1/navbar`);
        const data: NavbarApiResponse = res.data?.data ?? res.data;

        if (data?.navigationItems) {
          const { l1, l2 } = transformApiResponse(data);
          setL1Config(l1);
          setL2Config(l2);
          setNavbarConfig(data);
          setMenuLinks(l1.navigationItems);
          cacheData(cacheKey, { l1, l2, raw: data });
        }
      } catch {
        // On fetch failure keep defaults already set in state
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = subscribeNavbarChange(() => {
      fetchNavbar(lang, true);
    });
    return unsubscribe;
  }, [lang, fetchNavbar]);

  // Return everything the existing Navbar.tsx + any other consumers expect
  return { navbarConfig, l1Config, l2Config, menuLinks, isLoading };
}
