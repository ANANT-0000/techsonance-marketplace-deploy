"use client";

import { useEffect, useState, useRef, useReducer } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  User,
  ChevronDown,
  LogOut,
  LogIn,
  MapPin,
  HelpCircle,
  ShoppingCart,
  ChevronRight,
  X,
  Menu,
} from "lucide-react";
import { SearchBar } from "@/components/customer/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "motion/react";
import { RootState } from "@/lib/store";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { useThemeData } from "@/hooks/useThemeData";
import { openLoginModal, logOut } from "@/lib/features/auth/authSlice";
import { toggleCartSidebar } from "@/lib/features/CartSidebar";
import {
  PROFILE_SIDEBAR_TEXT,
  NAVBAR_TEXT,
  NavbarConfig,
  NAVBAR_UI_TEXT,
} from "@/constants/customerText";
import { BRAND_LOGO } from "@/constants/common";
import { useNavbarData } from "@/hooks/useNavbarData";
import {
  NavItemColType,
  NavMenuLogoAlignment,
  NavMenuPosition,
  NavLinkItem,
  MegaMenuColumnData,
  PromotionData,
  NavMegaColumn,
  NavItemDisplayType,
  NavLayoutType,
} from "@/utils/Types";

// UI Text Constants (strictly preventing hardcoded keys/texts in component logic)

// Mega menu layout tuning
const MEGA_MENU_ITEM_LIMIT = NavbarConfig.LIMITS.MEGA_MENU_ITEM;
const MEGA_MENU_SKELETON_COLUMNS = NavbarConfig.LIMITS.SKELETON_COLUMNS;
const MEGA_MENU_SKELETON_ROWS = NavbarConfig.LIMITS.SKELETON_ROWS;

function MegaMenuSkeleton() {
  return (
    <div
      className="grid gap-x-12 gap-y-8 p-9"
      style={{
        gridTemplateColumns: `repeat(${MEGA_MENU_SKELETON_COLUMNS}, minmax(190px, 230px))`,
      }}
    >
      {Array.from({ length: MEGA_MENU_SKELETON_COLUMNS }).map((_, colIdx) => (
        <div key={`skeleton-col-${colIdx}`} className="flex flex-col gap-3.5">
          <Skeleton className="h-3 w-16 rounded-full mb-1" />
          {Array.from({ length: MEGA_MENU_SKELETON_ROWS }).map((_, rowIdx) => (
            <div
              key={`skeleton-row-${rowIdx}`}
              className="flex items-center gap-2.5"
            >
              <Skeleton className="h-5 w-5 rounded-md shrink-0" />
              <Skeleton
                className={`h-3.5 rounded-full ${rowIdx % 2 === 0 ? "w-28" : "w-20"}`}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
function SubLinkBranch({
  link,
  depth = 0,
}: {
  link: NavLinkItem;
  depth?: number;
}) {
  return (
    <li className="w-full">
      <Link
        href={link.href}
        className="text-sm font-medium text-slate-700 hover:text-theme-primary transition-colors flex items-center gap-2.5 group"
      >
        {link.iconUrl && (
          <img
            src={link.iconUrl}
            alt=""
            className="w-5 h-5 object-contain shrink-0 rounded group-hover:scale-105 transition-transform"
          />
        )}
        <span className="leading-snug">{link.label}</span>
      </Link>
      {link.children?.length > 0 && (
        <ul className="flex flex-col gap-1.5 pl-3 mt-1.5 ml-2 border-l-2 border-slate-100 list-none">
          {link.children.map((child) => (
            <SubLinkBranch key={child.id} link={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

function MegaMenuColumn({
  col,
  cIdx,
  itemId,
  expandedColumns,
  toggleColumnExpand,
}: {
  col: NavMegaColumn;
  cIdx: number;
  itemId: string;
  expandedColumns: Set<string>;
  toggleColumnExpand: (key: string) => void;
}) {
  const colKey = `${itemId}-${cIdx}`;
  const isExpanded = expandedColumns.has(colKey);
  const allItems = col.items || [];
  const hasOverflow = allItems.length > MEGA_MENU_ITEM_LIMIT;
  const visibleItems = isExpanded
    ? allItems
    : allItems.slice(0, MEGA_MENU_ITEM_LIMIT);

  if (allItems.length === 0) return null; // nothing to render for this column

  return (
    <div className="flex flex-col min-w-[180px] max-w-[240px] shrink-0">
      <Link
        href={col.href || "#"}
        className={`text-xs font-bold tracking-wider uppercase pb-2.5 mb-2 border-b border-slate-100 ${
          col.href
            ? "text-slate-900 hover:text-theme-primary transition-colors"
            : "text-slate-400 pointer-events-none"
        }`}
      >
        {col.title || "\u00a0"}
      </Link>

      <ul
        className={`flex flex-col gap-2.5 list-none p-0 m-0 ${
          isExpanded ? "max-h-[280px] overflow-y-auto pr-2" : ""
        }`}
      >
        {visibleItems.map((subLink) => (
          <SubLinkBranch key={subLink.id} link={subLink} />
        ))}
        {hasOverflow && (
          <li>
            <button
              type="button"
              onClick={() => toggleColumnExpand(colKey)}
              className="text-xs font-semibold text-theme-primary/70 hover:text-theme-primary mt-1 bg-transparent border-none p-0 cursor-pointer"
            >
              {isExpanded
                ? "Show less"
                : `+${allItems.length - MEGA_MENU_ITEM_LIMIT} more`}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

function PromoCard({ promo }: { promo: PromotionData }) {
  return (
    <div className="bg-slate-50/60 p-4 rounded-2xl flex flex-col h-full border border-slate-100/50 min-w-[200px] max-w-[260px]">
      <img
        src={promo.imageUrl}
        alt={promo.title}
        className="w-full h-32 object-cover rounded-xl mb-3.5 shadow-xs"
      />
      <h4 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">
        {promo.title}
      </h4>
      <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
        {promo.subtitle}
      </p>
      <Link
        href={promo.ctaHref}
        className="text-xs font-bold text-theme-primary hover:text-theme-primary/85 flex items-center gap-1 mt-auto"
      >
        <span>{promo.ctaText}</span>
        <ChevronRight size={13} />
      </Link>
    </div>
  );
}
function NavbarSkeleton() {
  return (
    <header className="hidden lg:block w-full sticky top-0 bg-white border-b border-slate-100 shadow-sm z-50">
      <nav className="relative flex items-center justify-between xl:px-16 lg:px-8 py-4 w-full">
        {/* Logo skeleton */}
        <div className="flex-shrink-0 flex items-center">
          <Skeleton className="h-8 w-28 rounded-xl bg-slate-200" />
        </div>

        {/* L1 Links skeletons */}
        <div className="ml-8 mr-auto flex items-center space-x-8">
          <Skeleton className="h-4 w-16 rounded-md bg-slate-200" />
          <Skeleton className="h-4 w-20 rounded-md bg-slate-200" />
          <Skeleton className="h-4 w-24 rounded-md bg-slate-200" />
          <Skeleton className="h-4 w-16 rounded-md bg-slate-200" />
        </div>

        {/* Search bar skeleton */}
        <div className="flex-1 max-w-[440px] mx-6">
          <Skeleton className="h-10 w-full rounded-full bg-slate-100" />
        </div>

        {/* Utilities skeletons */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
          <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
          <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
        </div>
      </nav>
    </header>
  );
}

export enum NavbarState {
  CLOSED = "CLOSED",
  OPENING = "OPENING",
  OPEN = "OPEN",
  CLOSING = "CLOSING",
}

export enum NavbarActionType {
  HOVER_ENTER = "HOVER_ENTER",
  HOVER_LEAVE = "HOVER_LEAVE",
  TIMEOUT_OPEN = "TIMEOUT_OPEN",
  TIMEOUT_CLOSE = "TIMEOUT_CLOSE",
  FORCE_CLOSE = "FORCE_CLOSE",
  TOGGLE_PROFILE = "TOGGLE_PROFILE",
  SET_PROFILE_OPEN = "SET_PROFILE_OPEN",
  SET_SEARCH_QUERY = "SET_SEARCH_QUERY",
  TOGGLE_COLUMN_EXPAND = "TOGGLE_COLUMN_EXPAND",
  SET_MOBILE_MENU_OPEN = "SET_MOBILE_MENU_OPEN",
  SET_MOBILE_STACK = "SET_MOBILE_STACK",
  PUSH_MOBILE_STACK = "PUSH_MOBILE_STACK",
  POP_MOBILE_STACK = "POP_MOBILE_STACK",
}

export interface MobileStackItem {
  title: string;
  items: Array<{
    id: string;
    label: string;
    href: string;
    hasChildren: boolean;
    children?: NavLinkItem[];
  }>;
}

export interface State {
  status: NavbarState;
  activeMenuId: string | null;
  isProfileOpen: boolean;
  searchQuery: string;
  expandedColumns: Set<string>;
  isMobileMenuOpen: boolean;
  mobileStack: MobileStackItem[];
}

export type NavbarAction =
  | {
      type: NavbarActionType.HOVER_ENTER;
      payload: { itemId: string; hasMegaMenu: boolean };
    }
  | { type: NavbarActionType.HOVER_LEAVE }
  | { type: NavbarActionType.TIMEOUT_OPEN }
  | { type: NavbarActionType.TIMEOUT_CLOSE }
  | { type: NavbarActionType.FORCE_CLOSE }
  | { type: NavbarActionType.TOGGLE_PROFILE }
  | { type: NavbarActionType.SET_PROFILE_OPEN; payload: boolean }
  | { type: NavbarActionType.SET_SEARCH_QUERY; payload: string }
  | { type: NavbarActionType.TOGGLE_COLUMN_EXPAND; payload: string }
  | { type: NavbarActionType.SET_MOBILE_MENU_OPEN; payload: boolean }
  | { type: NavbarActionType.SET_MOBILE_STACK; payload: MobileStackItem[] }
  | { type: NavbarActionType.PUSH_MOBILE_STACK; payload: MobileStackItem }
  | { type: NavbarActionType.POP_MOBILE_STACK };

const navbarReducer = (state: State, action: NavbarAction): State => {
  switch (action.type) {
    case NavbarActionType.HOVER_ENTER:
      if (!action.payload.hasMegaMenu) {
        return { ...state, status: NavbarState.CLOSED, activeMenuId: null };
      }
      if (state.status === NavbarState.CLOSED) {
        return {
          ...state,
          status: NavbarState.OPENING,
          activeMenuId: action.payload.itemId,
        };
      }
      if (state.status === NavbarState.OPENING) {
        return { ...state, activeMenuId: action.payload.itemId };
      }
      if (state.status === NavbarState.OPEN) {
        return { ...state, activeMenuId: action.payload.itemId };
      }
      if (state.status === NavbarState.CLOSING) {
        return {
          ...state,
          status: NavbarState.OPEN,
          activeMenuId: action.payload.itemId,
        };
      }
      return state;

    case NavbarActionType.HOVER_LEAVE:
      if (state.status === NavbarState.OPENING) {
        return { ...state, status: NavbarState.CLOSED, activeMenuId: null };
      }
      if (state.status === NavbarState.OPEN) {
        return { ...state, status: NavbarState.CLOSING };
      }
      return state;

    case NavbarActionType.TIMEOUT_OPEN:
      if (state.status === NavbarState.OPENING) {
        return { ...state, status: NavbarState.OPEN };
      }
      return state;

    case NavbarActionType.TIMEOUT_CLOSE:
      if (state.status === NavbarState.CLOSING) {
        return { ...state, status: NavbarState.CLOSED, activeMenuId: null };
      }
      return state;

    case NavbarActionType.FORCE_CLOSE:
      return { ...state, status: NavbarState.CLOSED, activeMenuId: null };

    case NavbarActionType.TOGGLE_PROFILE:
      return { ...state, isProfileOpen: !state.isProfileOpen };

    case NavbarActionType.SET_PROFILE_OPEN:
      return { ...state, isProfileOpen: action.payload };

    case NavbarActionType.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };

    case NavbarActionType.TOGGLE_COLUMN_EXPAND:
      const nextCols = new Set(state.expandedColumns);
      if (nextCols.has(action.payload)) {
        nextCols.delete(action.payload);
      } else {
        nextCols.add(action.payload);
      }
      return { ...state, expandedColumns: nextCols };

    case NavbarActionType.SET_MOBILE_MENU_OPEN:
      return { ...state, isMobileMenuOpen: action.payload };

    case NavbarActionType.SET_MOBILE_STACK:
      return { ...state, mobileStack: action.payload };

    case NavbarActionType.PUSH_MOBILE_STACK:
      return { ...state, mobileStack: [...state.mobileStack, action.payload] };

    case NavbarActionType.POP_MOBILE_STACK:
      if (state.mobileStack.length <= 1) return state;
      return { ...state, mobileStack: state.mobileStack.slice(0, -1) };

    default:
      const _exhaustiveCheck: never = action;
      return state;
  }
};

export function Navbar({
  styles = "",
}: {
  styles?: string;
  menuLinks?: { [key: string]: string | null }[];
}) {
  const path = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { themeData } = useThemeData();

  // Redux States
  const { items } = useAppSelector((state: RootState) => state.cart);
  const { wishItems } = useAppSelector((state: RootState) => state.wishlist);
  const { user } = useAppSelector((state: RootState) => state.auth);

  // Load configuration directly from the hook — transformation is done there.
  const { l1Config, l2Config, isLoading } = useNavbarData();

  // Isolated interactive states combined into single reducer for State Management Rule
  const [menuState, dispatchMenuState] = useReducer(navbarReducer, {
    status: NavbarState.CLOSED,
    activeMenuId: null,
    isProfileOpen: false,
    searchQuery: "",
    expandedColumns: new Set<string>(),
    isMobileMenuOpen: false,
    mobileStack: [],
  });

  const {
    activeMenuId,
    isProfileOpen,
    searchQuery,
    expandedColumns,
    isMobileMenuOpen,
    mobileStack,
  } = menuState;

  // Initialize mobile stack
  useEffect(() => {
    if (l1Config.navigationItems) {
      dispatchMenuState({
        type: NavbarActionType.SET_MOBILE_STACK,
        payload: [
          {
            title: NavbarConfig.STRINGS.MENU,
            items: l1Config.navigationItems.map((item) => {
              const hasChildren =
                item.hasMegaMenu &&
                !!l2Config?.[item.id] &&
                l2Config[item.id].some(
                  (col) => col.type !== NavItemColType.PROMOTION,
                );
              return {
                id: item.id,
                label: item.label,
                href: item.href,
                hasChildren,
              };
            }),
          },
        ],
      });
    }
  }, [l1Config, l2Config]);

  // Reset mobile stack when menu closes
  useEffect(() => {
    if (!isMobileMenuOpen && l1Config.navigationItems) {
      dispatchMenuState({
        type: NavbarActionType.SET_MOBILE_STACK,
        payload: [
          {
            title: NavbarConfig.STRINGS.MENU,
            items: l1Config.navigationItems.map((item) => {
              const hasChildren =
                item.hasMegaMenu &&
                !!l2Config?.[item.id] &&
                l2Config[item.id].some(
                  (col) => col.type !== NavItemColType.PROMOTION,
                );
              return {
                id: item.id,
                label: item.label,
                href: item.href,
                hasChildren,
              };
            }),
          },
        ],
      });
    }
  }, [isMobileMenuOpen, l1Config, l2Config]);

  const handleDrillDown = (item: {
    id: string;
    label: string;
    href: string;
    children?: NavLinkItem[];
  }) => {
    const currentDepth = mobileStack.length;
    let nextItems: any[] = [];
    if (currentDepth === 1) {
      const columns = l2Config?.[item.id] || [];
      nextItems = columns
        .filter((col) => col.type !== NavItemColType.PROMOTION)
        .map((col) => ({
          id: col.id,
          label: col.title,
          href: col.href || "#",
          hasChildren: col.items && col.items.length > 0,
          children: col.items,
        }));
    } else {
      const subcategories = item.children || [];
      nextItems = subcategories.map((child) => ({
        id: child.id,
        label: child.label,
        href: child.href,
        hasChildren: child.children && child.children.length > 0,
        children: child.children,
      }));
    }

    if (currentDepth + 1 === 5) {
      nextItems = nextItems.map((n) => ({ ...n, hasChildren: false }));
    }

    dispatchMenuState({
      type: NavbarActionType.PUSH_MOBILE_STACK,
      payload: {
        title: item.label,
        items: nextItems,
      },
    });
  };

  const handleBack = () => {
    dispatchMenuState({ type: NavbarActionType.POP_MOBILE_STACK });
  };

  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const menuDataLoading = isLoading;

  // Watch hover transitions and manage timeouts in useEffect
  useEffect(() => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

    if (menuState.status === NavbarState.OPENING) {
      openTimeoutRef.current = setTimeout(() => {
        dispatchMenuState({ type: NavbarActionType.TIMEOUT_OPEN });
      }, 150);
    } else if (menuState.status === NavbarState.CLOSING) {
      closeTimeoutRef.current = setTimeout(() => {
        dispatchMenuState({ type: NavbarActionType.TIMEOUT_CLOSE });
      }, 250);
    }

    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [menuState.status, menuState.activeMenuId]);

  // Mobile menu focus trap
  useEffect(() => {
    if (isMobileMenuOpen) {
      const focusableElements = drawerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        firstElement.focus();
      }
    } else {
      hamburgerRef.current?.focus();
    }
  }, [isMobileMenuOpen]);

  const handleDrawerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === NavbarConfig.KEYS.TAB && drawerRef.current) {
      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
    if (e.key === NavbarConfig.KEYS.ESCAPE) {
      dispatchMenuState({
        type: NavbarActionType.SET_MOBILE_MENU_OPEN,
        payload: false,
      });
    }
  };

  // Escape listener to close desktop menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === NavbarConfig.KEYS.ESCAPE) {
        dispatchMenuState({ type: NavbarActionType.FORCE_CLOSE });
        dispatchMenuState({
          type: NavbarActionType.SET_PROFILE_OPEN,
          payload: false,
        });
      }
    };
    document.addEventListener(NavbarConfig.EVENTS.KEYDOWN, handleKeyDown);
    return () =>
      document.removeEventListener(NavbarConfig.EVENTS.KEYDOWN, handleKeyDown);
  }, []);

  // Force close menus on path changes
  useEffect(() => {
    dispatchMenuState({ type: NavbarActionType.FORCE_CLOSE });
    dispatchMenuState({
      type: NavbarActionType.SET_MOBILE_MENU_OPEN,
      payload: false,
    });
  }, [path]);

  // Click outside listener for profile dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        dispatchMenuState({
          type: NavbarActionType.SET_PROFILE_OPEN,
          payload: false,
        });
      }
    };
    document.addEventListener(
      NavbarConfig.EVENTS.MOUSEDOWN,
      handleClickOutside,
    );
    return () =>
      document.removeEventListener(
        NavbarConfig.EVENTS.MOUSEDOWN,
        handleClickOutside,
      );
  }, []);

  // Hide header in Admin, Vendor, or Checkout contexts
  if (
    path &&
    (path.startsWith("/admin") ||
      path.startsWith("/vendor") ||
      path.includes("checkout"))
  ) {
    return null;
  }

  // Jitter-free Menu Hover Management via state machine
  const handleMouseEnter = (itemId: string, hasMegaMenu: boolean) => {
    dispatchMenuState({
      type: NavbarActionType.HOVER_ENTER,
      payload: { itemId, hasMegaMenu },
    });
  };

  const handleMouseLeave = () => {
    dispatchMenuState({ type: NavbarActionType.HOVER_LEAVE });
  };

  const handleBackdropClick = () => {
    dispatchMenuState({ type: NavbarActionType.FORCE_CLOSE });
  };

  const toggleColumnExpand = (colKey: string) => {
    dispatchMenuState({
      type: NavbarActionType.TOGGLE_COLUMN_EXPAND,
      payload: colKey,
    });
  };

  const handleOrdersClick = () => {
    dispatchMenuState({
      type: NavbarActionType.SET_PROFILE_OPEN,
      payload: false,
    });
    if (!user?.id) {
      dispatch(openLoginModal(NavbarConfig.ROUTES.ORDERS));
    } else {
      router.push(NavbarConfig.ROUTES.ORDERS);
    }
  };

  const handleCartClick = () => {
    dispatchMenuState({
      type: NavbarActionType.SET_PROFILE_OPEN,
      payload: false,
    });
    if (!user?.id) {
      dispatch(openLoginModal("/customer/cart"));
    } else {
      router.push("/customer/cart");
    }
  };

  const handleAddressesClick = () => {
    dispatchMenuState({
      type: NavbarActionType.SET_PROFILE_OPEN,
      payload: false,
    });
    if (!user?.id) {
      dispatch(openLoginModal("/customer/addresses"));
    } else {
      router.push("/customer/addresses");
    }
  };

  const handleSupportClick = () => {
    dispatchMenuState({
      type: NavbarActionType.SET_PROFILE_OPEN,
      payload: false,
    });
    if (user?.id) {
      router.push("/customer/support");
    } else {
      router.push("/contact");
    }
  };

  const handleAuthClick = () => {
    dispatchMenuState({
      type: NavbarActionType.SET_PROFILE_OPEN,
      payload: false,
    });
    if (user?.id) {
      dispatch(logOut());
      router.push("/");
    } else {
      dispatch(openLoginModal(null));
    }
  };

  // Brand Logo URL Resolver
  const logoUrl =
    l1Config.logo.src ||
    themeData.logo_url ||
    themeData.logo_dark_url ||
    BRAND_LOGO;

  const isSticky = l1Config.navbar.position === NavMenuPosition.STICKY;
  const isLogoLeft = l1Config.logo.alignment === NavMenuLogoAlignment.LEFT;
  if (menuDataLoading) {
    return <NavbarSkeleton />;
  }

  return (
    <header className={`w-full z-50 ${isSticky ? "sticky top-0" : "relative"}`}>
      {/* MOBILE HEADER (lg:hidden) */}
      <div className="lg:hidden block w-full bg-navbar text-navbar-foreground border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 h-[60px] w-full">
          {/* Hamburger Menu Icon */}
          <button
            ref={hamburgerRef}
            onClick={() =>
              dispatchMenuState({
                type: NavbarActionType.SET_MOBILE_MENU_OPEN,
                payload: true,
              })
            }
            aria-expanded={isMobileMenuOpen}
            aria-haspopup="dialog"
            className="p-2 -ml-2 text-navbar-foreground/80 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <div className="flex-1 flex justify-center">
            <Link href={l1Config.logo.href}>
              <img
                src={logoUrl}
                alt={l1Config.logo.alt || NAVBAR_UI_TEXT.LOGO_ALT}
                className="h-9 object-contain rounded-2xl font-black"
              />
            </Link>
          </div>

          {/* Utilities */}
          <div className="flex items-center gap-2">
            {l1Config.utilities.showWishlist && user && (
              <Link
                href="/customer/wishlist"
                className="p-2 text-navbar-foreground/80 hover:bg-slate-100 rounded-full transition-colors"
                aria-label={NAVBAR_UI_TEXT.WISH_ARIA_LABEL}
              >
                <Heart size={20} strokeWidth={1.7} />
              </Link>
            )}

            {l1Config.utilities.showCart && (
              <button
                onClick={() => dispatch(toggleCartSidebar("open"))}
                className="relative p-2 text-navbar-foreground/80 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                aria-label={NAVBAR_UI_TEXT.CART_ARIA_LABEL}
              >
                {items.length > 0 && (
                  <span className="absolute top-0 right-0 text-[9px] font-bold bg-theme-primary text-theme-primary-foreground rounded-full w-4.5 h-4.5 flex items-center justify-center border border-navbar">
                    {items.length}
                  </span>
                )}
                <ShoppingBag size={20} strokeWidth={1.7} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE DRILL-DOWN SIDE DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] flex">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                dispatchMenuState({
                  type: NavbarActionType.SET_MOBILE_MENU_OPEN,
                  payload: false,
                })
              }
              className="absolute inset-0 bg-black/40 backdrop-blur-xs w-full h-full"
            />

            {/* Drawer content drawer panel */}
            <motion.div
              ref={drawerRef}
              onKeyDown={handleDrawerKeyDown}
              role="dialog"
              aria-modal="true"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="absolute top-0 bottom-0 left-0 w-[290px] bg-white border-r border-slate-150 shadow-2xl flex flex-col p-5 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                <Link
                  href="/"
                  className="flex flex-col text-left"
                  onClick={() =>
                    dispatchMenuState({
                      type: NavbarActionType.SET_MOBILE_MENU_OPEN,
                      payload: false,
                    })
                  }
                >
                  <img
                    src={logoUrl}
                    alt={l1Config.logo.alt || NAVBAR_UI_TEXT.LOGO_ALT}
                    className="h-8 object-contain rounded-xl font-black"
                  />
                </Link>
                <button
                  onClick={() =>
                    dispatchMenuState({
                      type: NavbarActionType.SET_MOBILE_MENU_OPEN,
                      payload: false,
                    })
                  }
                  className="p-1.5 hover:bg-slate-150 rounded-lg text-slate-500 hover:text-slate-900 cursor-pointer"
                  aria-label="Close mobile menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Search Bar inside Drawer */}
              {l1Config.searchBar.isVisible && (
                <div className="py-4 border-b border-slate-100 shrink-0">
                  <SearchBar
                    value={searchQuery}
                    onChange={(q) =>
                      dispatchMenuState({
                        type: NavbarActionType.SET_SEARCH_QUERY,
                        payload: q,
                      })
                    }
                    onSearch={(q) => {
                      if (q.trim()) {
                        dispatchMenuState({
                          type: NavbarActionType.SET_MOBILE_MENU_OPEN,
                          payload: false,
                        });
                        router.push(
                          `${l1Config.searchBar.searchEndpoint}?q=${encodeURIComponent(q.trim())}`,
                        );
                      }
                    }}
                    placeholder={l1Config.searchBar.placeholder}
                  />
                </div>
              )}

              {/* Drill-down Navigation Container */}
              <div className="flex-1 flex flex-col min-h-0 mt-4">
                {/* Back button if depth > 1 */}
                {mobileStack.length > 1 && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 py-2 px-1 text-xs font-bold text-theme-primary hover:text-theme-primary/80 transition-colors mb-3 cursor-pointer text-left"
                    aria-label="Go back to previous menu"
                  >
                    <ChevronRight size={14} className="rotate-180" />
                    <span>
                      Back to {mobileStack[mobileStack.length - 2].title}
                    </span>
                  </button>
                )}

                {/* Current menu title */}
                <h3 className="px-1 text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  {mobileStack[mobileStack.length - 1]?.title ||
                    NavbarConfig.STRINGS.MENU}
                </h3>

                {/* List of items */}
                <nav className="flex-1 overflow-y-auto space-y-1 pr-1 hide-scrollbar min-h-0">
                  {mobileStack[mobileStack.length - 1]?.items.map((item) => {
                    if (item.hasChildren) {
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleDrillDown(item)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
                          aria-label={`Drill down to ${item.label}`}
                        >
                          <span>{item.label}</span>
                          <ChevronRight size={14} className="text-slate-400" />
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() =>
                          dispatchMenuState({
                            type: NavbarActionType.SET_MOBILE_MENU_OPEN,
                            payload: false,
                          })
                        }
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-750 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Footer / Account Link */}
              <div className="pt-4 border-t border-slate-150 flex flex-col gap-2 shrink-0">
                {l1Config.utilities.showAccount && (
                  <button
                    onClick={() => {
                      dispatchMenuState({
                        type: NavbarActionType.SET_MOBILE_MENU_OPEN,
                        payload: false,
                      });
                      if (user?.id) {
                        router.push("/customer");
                      } else {
                        dispatch(openLoginModal(null));
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left border-none bg-transparent cursor-pointer"
                  >
                    <User size={16} strokeWidth={1.7} />
                    <span>{user?.id ? "My Profile" : "Sign In"}</span>
                  </button>
                )}
                {user?.id && (
                  <button
                    onClick={() => {
                      dispatchMenuState({
                        type: NavbarActionType.SET_MOBILE_MENU_OPEN,
                        payload: false,
                      });
                      dispatch(logOut());
                      router.push("/");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors text-left border-none bg-transparent cursor-pointer"
                  >
                    <LogOut size={16} strokeWidth={1.7} />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DESKTOP HEADER (hidden lg:flex) */}
      <nav
        className={`hidden lg:flex relative bg-navbar text-navbar-foreground items-center justify-between xl:px-16 lg:px-8 py-3.5 storefront-nav w-full ${styles} ${
          l1Config.navbar.showShadow ? "shadow-md" : "shadow-sm"
        } ${l1Config.navbar.showBottomBorder ? "border-b border-border" : ""}`}
      >
        {/* LOGO (LEFT POSITION) */}
        {isLogoLeft && (
          <div className="flex-shrink-0 flex items-center">
            <Link href={l1Config.logo.href}>
              <img
                src={logoUrl}
                alt={l1Config.logo.alt || NAVBAR_UI_TEXT.LOGO_ALT}
                className="h-10 object-contain rounded-2xl font-black"
              />
            </Link>
          </div>
        )}

        {/* PRIMARY L1 NAVIGATION LINKS */}
        <ul
          className={`relative flex items-center space-x-7 text-sm font-medium ${
            isLogoLeft ? "ml-8 mr-auto" : "flex-1 justify-start"
          }`}
          onMouseLeave={handleMouseLeave}
        >
          {l1Config.navigationItems.map((item) => {
            const isActive = path === item.href;
            const hasMega = item.hasMegaMenu;
            const rawColumns = l2Config?.[item.id];
            const columns = Array.isArray(rawColumns) ? rawColumns : [];
            const hasResolvedColumns = columns.length > 0;
            const showMenuPanel =
              hasMega &&
              activeMenuId === item.id &&
              (menuState.status === NavbarState.OPEN ||
                menuState.status === NavbarState.CLOSING) &&
              (menuDataLoading || hasResolvedColumns);

            const isDirectoryStyle = (columns?.length ?? 0) > 4;
            const isVisual =
              item.displayType === NavItemDisplayType.CATEGORY_LISTING_VISUAL;
            const layoutType = item.layout_type || NavLayoutType.NONE;

            return (
              <li
                key={item.id}
                className="relative py-2"
                onMouseEnter={() => handleMouseEnter(item.id, hasMega)}
                onClick={() => handleMouseEnter(item.id, hasMega)}
              >
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    className={`relative z-10 transition-colors duration-200 text-sm font-semibold flex items-center gap-1 ${
                      isActive
                        ? "text-theme-primary"
                        : "text-navbar-foreground/80 hover:text-theme-primary"
                    }`}
                  >
                    <span>{item.label}</span>
                    {hasMega && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          activeMenuId === item.id
                            ? "rotate-180 text-theme-primary"
                            : ""
                        }`}
                      />
                    )}
                  </Link>
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline-desktop"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-theme-primary rounded-full"
                    />
                  )}
                </div>

                {/* DYNAMIC L2 MEGA MENU (RENDERED LAZILY ON HOVER) */}
                <AnimatePresence>
                  {showMenuPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 top-full mt-3 min-w-[320px] w-max max-w-[min(94vw,980px)] bg-white border border-slate-100 rounded-2xl shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] z-50 overflow-hidden"
                    >
                      {menuDataLoading ? (
                        <MegaMenuSkeleton />
                      ) : layoutType === NavLayoutType.DIRECTORY ? (
                        // DIRECTORY: Apple-style Grid of column headers & bulleted links
                        <div className="flex flex-wrap gap-x-8 gap-y-6 py-6 px-7 max-h-[480px] overflow-y-auto max-w-[min(94vw,980px)]">
                          {columns!.map((col, cIdx) => (
                            <div
                              key={col.id || `col-${cIdx}`}
                              className="flex flex-col gap-2.5 text-left min-w-[140px] max-w-[200px]"
                            >
                              <Link
                                href={col.href || "#"}
                                className="text-xs font-extrabold tracking-wider uppercase pb-2 mb-1 border-b border-slate-100 text-slate-950 hover:text-theme-primary transition-colors"
                              >
                                {col.title}
                              </Link>
                              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                                {col.items?.map((l3) => (
                                  <li key={l3.id}>
                                    <Link
                                      href={l3.href || "#"}
                                      className="text-sm font-medium text-slate-650 hover:text-theme-primary transition-colors hover:translate-x-0.5 transform inline-block transition-transform duration-150"
                                    >
                                      {l3.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : layoutType === NavLayoutType.GRID ? (
                        // VISUAL_MATRIX_ENGINE: boAt-style Grid of cards with fallback colored letter-circle, and tag pills
                        <div className="flex flex-wrap gap-6 py-6 px-7 max-w-[min(94vw,980px)] max-h-[480px] overflow-y-auto">
                          {columns!.map((col) => {
                            const firstLetter = col.title
                              ? col.title.charAt(0).toUpperCase()
                              : "?";
                            const colors = [
                              "bg-red-100 text-red-700",
                              "bg-blue-100 text-blue-700",
                              "bg-green-100 text-green-700",
                              "bg-yellow-100 text-yellow-700",
                              "bg-purple-100 text-purple-700",
                              "bg-pink-100 text-pink-700",
                              "bg-indigo-100 text-indigo-700",
                              "bg-emerald-100 text-emerald-700",
                              "bg-rose-100 text-rose-700",
                            ];
                            const colorClass =
                              colors[
                                (col.id?.charCodeAt(0) || 0) % colors.length
                              ] || "bg-gray-150 text-gray-700";

                            return (
                              <div
                                key={col.id}
                                className="flex flex-col p-4 bg-slate-50/70 hover:bg-white hover:shadow-lg rounded-2xl transition-all duration-300 border border-slate-100 hover:border-theme-primary/10 group min-w-[150px] max-w-[200px]"
                              >
                                <Link
                                  href={col.href || "#"}
                                  className="flex items-center gap-3.5 mb-3 cursor-pointer text-left"
                                >
                                  {col.iconUrl ? (
                                    <img
                                      src={col.iconUrl}
                                      alt={col.title}
                                      className="w-12 h-12 object-contain mix-blend-multiply flex-shrink-0 group-hover:scale-105 transition-transform duration-300 rounded-lg"
                                    />
                                  ) : (
                                    <div
                                      className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-lg shadow-sm ${colorClass} group-hover:scale-105 transition-transform duration-300`}
                                    >
                                      {firstLetter}
                                    </div>
                                  )}
                                  <span className="font-bold text-xs tracking-tight text-slate-800 group-hover:text-theme-primary transition-colors">
                                    {col.title}
                                  </span>
                                </Link>
                                {col.items && col.items.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-slate-100/50">
                                    {col.items.map((l3) => (
                                      <Link
                                        key={l3.id}
                                        href={l3.href || "#"}
                                        className="text-[10px] font-semibold bg-white border border-slate-150 text-slate-650 hover:bg-theme-primary hover:text-white hover:border-theme-primary px-2.5 py-0.5 rounded-full transition-colors duration-150 shrink-0"
                                      >
                                        {l3.label}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : isVisual ? (
                        <div className="flex flex-wrap gap-6 py-6 px-7 max-w-[min(94vw,980px)]">
                          {columns!.map((col) => (
                            <Link
                              key={col.id}
                              href={col.href || "#"}
                              className="flex items-center gap-4 p-3 bg-gray-50/60 hover:bg-theme-primary/5 hover:text-theme-primary rounded-xl transition-all group/item border border-transparent hover:border-theme-primary/20 cursor-pointer min-w-[140px]"
                            >
                              {col.iconUrl ? (
                                <img
                                  src={col.iconUrl}
                                  alt={col.title}
                                  className="w-12 h-12 object-contain mix-blend-multiply flex-shrink-0 group-hover/item:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
                              )}
                              <span className="font-semibold text-xs tracking-tight text-slate-800 group-hover/item:text-theme-primary">
                                {col.title}
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : isDirectoryStyle ? (
                        <div className="grid grid-cols-3 gap-x-8 gap-y-6 py-6 px-7 max-h-[480px] overflow-y-auto">
                          {columns!.map((col, cIdx) =>
                            col.type === NavItemColType.PROMOTION &&
                            col.promotion ? (
                              <PromoCard
                                key={`col-${cIdx}`}
                                promo={col.promotion}
                              />
                            ) : (
                              <MegaMenuColumn
                                key={`col-${cIdx}`}
                                col={col}
                                cIdx={cIdx}
                                itemId={item.id}
                                expandedColumns={expandedColumns}
                                toggleColumnExpand={toggleColumnExpand}
                              />
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-6 py-6 px-7 divide-x divide-slate-100 max-h-[440px]">
                          {columns!.map((col, cIdx) => (
                            <div
                              key={`col-${cIdx}`}
                              className={`shrink-0 ${cIdx > 0 ? "pl-6" : ""}`}
                            >
                              {col.type === NavItemColType.PROMOTION &&
                              col.promotion ? (
                                <PromoCard promo={col.promotion} />
                              ) : (
                                <MegaMenuColumn
                                  col={col}
                                  cIdx={cIdx}
                                  itemId={item.id}
                                  expandedColumns={expandedColumns}
                                  toggleColumnExpand={toggleColumnExpand}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        {/* LOGO (CENTER POSITION) */}
        {!isLogoLeft && (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <Link href={l1Config.logo.href}>
              <img
                src={logoUrl}
                alt={l1Config.logo.alt || NAVBAR_UI_TEXT.LOGO_ALT}
                className="h-10 object-contain rounded-2xl font-black"
              />
            </Link>
          </div>
        )}

        {/* SEARCH BAR */}
        {l1Config.searchBar.isVisible && (
          <div className="flex-1 max-w-[440px] mx-6">
            <SearchBar
              value={searchQuery}
              onChange={(q) =>
                dispatchMenuState({
                  type: NavbarActionType.SET_SEARCH_QUERY,
                  payload: q,
                })
              }
              onSearch={(q) => {
                if (q.trim()) {
                  router.push(
                    `${l1Config.searchBar.searchEndpoint}?q=${encodeURIComponent(q.trim())}`,
                  );
                }
              }}
              placeholder={l1Config.searchBar.placeholder}
            />
          </div>
        )}

        {/* UTILITY ICONS & USER DROPDOWN (RIGHT) */}
        <div className="flex items-center gap-5 flex-shrink-0">
          {/* Account/Profile Dropdown */}
          {l1Config.utilities.showAccount && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() =>
                  dispatchMenuState({ type: NavbarActionType.TOGGLE_PROFILE })
                }
                className="p-2 text-navbar-foreground/80 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-0.5 cursor-pointer"
                aria-label={NAVBAR_UI_TEXT.PROFILE_ARIA_LABEL}
                aria-expanded={isProfileOpen}
              >
                <User size={19} strokeWidth={1.7} />
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-[100] text-slate-700 min-w-[200px] flex flex-col gap-0.5"
                  >
                    <button
                      onClick={handleOrdersClick}
                      className="w-full flex items-center gap-3 px-4.5 py-2.5 text-sm font-semibold text-slate-750 hover:bg-theme-primary/5 hover:text-theme-primary transition-colors text-left border-none bg-transparent cursor-pointer"
                    >
                      <ShoppingBag size={16} strokeWidth={1.5} />
                      <span>{NAVBAR_UI_TEXT.MY_ORDERS}</span>
                    </button>
                    <button
                      onClick={handleCartClick}
                      className="w-full flex items-center gap-3 px-4.5 py-2.5 text-sm font-semibold text-slate-750 hover:bg-theme-primary/5 hover:text-theme-primary transition-colors text-left border-none bg-transparent cursor-pointer"
                    >
                      <ShoppingCart size={16} strokeWidth={1.5} />
                      <span>{NAVBAR_UI_TEXT.MY_CART}</span>
                    </button>
                    <button
                      onClick={handleAddressesClick}
                      className="w-full flex items-center gap-3 px-4.5 py-2.5 text-sm font-semibold text-slate-750 hover:bg-theme-primary/5 hover:text-theme-primary transition-colors text-left border-none bg-transparent cursor-pointer"
                    >
                      <MapPin size={16} strokeWidth={1.5} />
                      <span>{NAVBAR_UI_TEXT.MY_ADDRESSES}</span>
                    </button>
                    <button
                      onClick={handleSupportClick}
                      className="w-full flex items-center gap-3 px-4.5 py-2.5 text-sm font-semibold text-slate-750 hover:bg-theme-primary/5 hover:text-theme-primary transition-colors text-left border-none bg-transparent cursor-pointer"
                    >
                      <HelpCircle size={24} strokeWidth={1.5} />
                      <span>{NAVBAR_UI_TEXT.SUPPORT}</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={handleAuthClick}
                      className="w-full flex items-center gap-3 px-4.5 py-2.5 text-sm font-bold hover:bg-theme-primary/5 transition-colors text-left border-none bg-transparent cursor-pointer"
                    >
                      {user?.id ? (
                        <>
                          <LogOut
                            size={24}
                            strokeWidth={1.5}
                            className="text-red-500"
                          />
                          <span className="text-red-500">
                            {NAVBAR_UI_TEXT.LOGOUT}
                          </span>
                        </>
                      ) : (
                        <>
                          <LogIn
                            size={24}
                            strokeWidth={1.5}
                            className="text-theme-primary"
                          />
                          <span className="text-theme-primary">
                            {NAVBAR_UI_TEXT.SIGN_IN}
                          </span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Wishlist Link */}
          {l1Config.utilities.showWishlist && user && (
            <Link
              href="/customer/wishlist"
              className="relative p-2 text-navbar-foreground/80 hover:bg-slate-100 rounded-full transition-colors"
              aria-label={NAVBAR_UI_TEXT.WISH_ARIA_LABEL}
            >
              <Heart size={24} strokeWidth={1.7} />
            </Link>
          )}

          {/* Shopping Cart Sidebar Toggle */}
          {l1Config.utilities.showCart && (
            <button
              onClick={() => dispatch(toggleCartSidebar("open"))}
              className="relative p-2 text-navbar-foreground/80 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              aria-label={NAVBAR_UI_TEXT.CART_ARIA_LABEL}
            >
              {items.length > 0 && (
                <span className="absolute top-0 right-0 text-tiny font-bold bg-theme-primary text-theme-primary-foreground rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-navbar">
                  {items.length}
                </span>
              )}
              <ShoppingBag size={24} strokeWidth={1.7} />
            </button>
          )}
        </div>
      </nav>

      {/* Dimming overlay for menu backdrop */}
      <AnimatePresence>
        {(menuState.status === NavbarState.OPEN ||
          menuState.status === NavbarState.CLOSING) &&
          activeMenuId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleBackdropClick}
              className="fixed inset-0 top-[72px] bg-black/40 backdrop-blur-xs z-40 cursor-default pointer-events-auto"
              aria-hidden="true"
            />
          )}
      </AnimatePresence>
    </header>
  );
}
