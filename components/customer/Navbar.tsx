"use client";

import { useEffect, useState, useRef } from "react";
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
} from "lucide-react";
import { SearchBar } from "@/components/customer/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "motion/react";
import { RootState } from "@/lib/store";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { useThemeData } from "@/hooks/useThemeData";
import { openLoginModal, logOut } from "@/lib/features/auth/authSlice";
import { toggleCartSidebar } from "@/lib/features/CartSidebar";
import { PROFILE_SIDEBAR_TEXT } from "@/constants/customerText";
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
} from "@/utils/Types";

// UI Text Constants (strictly preventing hardcoded keys/texts in component logic)
const NAVBAR_UI_TEXT = {
  MY_ORDERS: PROFILE_SIDEBAR_TEXT.LINKS.ORDERS,
  MY_CART: PROFILE_SIDEBAR_TEXT.LINKS.CART,
  MY_ADDRESSES: PROFILE_SIDEBAR_TEXT.LINKS.ADDRESSES,
  SUPPORT: PROFILE_SIDEBAR_TEXT.LINKS.SUPPORT,
  LOGOUT: PROFILE_SIDEBAR_TEXT.LINKS.LOGOUT,
  SIGN_IN: "Sign In",
  WISH_ARIA_LABEL: "Wishlist page link",
  CART_ARIA_LABEL: "Toggle cart sidebar",
  PROFILE_ARIA_LABEL: "User profile dropdown",
  LOGO_ALT: "Store Brand Logo",
};

// Mega menu layout tuning
const MEGA_MENU_ITEM_LIMIT = 9;
const MEGA_MENU_SKELETON_COLUMNS = 4;
const MEGA_MENU_SKELETON_ROWS = 6;

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

  // Isolated interactive states
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(
    new Set(),
  );

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const menuDataLoading = isLoading;

  // Escape listener to close menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenuId(null);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener for profile dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  // Show a full matching skeleton overlay when data is loading from the server

  // Jitter-free Menu Hover Management
  const handleMouseEnter = (itemId: string, hasMegaMenu: boolean) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (hasMegaMenu) {
      setActiveMenuId(itemId);
    } else {
      setActiveMenuId(null);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMenuId(null);
    }, 150);
  };

  const handleBackdropClick = () => {
    setActiveMenuId(null);
  };

  const toggleColumnExpand = (colKey: string) => {
    setExpandedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(colKey)) {
        next.delete(colKey);
      } else {
        next.add(colKey);
      }
      return next;
    });
  };

  const handleOrdersClick = () => {
    setIsProfileOpen(false);
    if (!user?.id) {
      dispatch(openLoginModal("/customer/orders"));
    } else {
      router.push("/customer/orders");
    }
  };

  const handleCartClick = () => {
    setIsProfileOpen(false);
    if (!user?.id) {
      dispatch(openLoginModal("/customer/cart"));
    } else {
      router.push("/customer/cart");
    }
  };

  const handleAddressesClick = () => {
    setIsProfileOpen(false);
    if (!user?.id) {
      dispatch(openLoginModal("/customer/addresses"));
    } else {
      router.push("/customer/addresses");
    }
  };

  const handleSupportClick = () => {
    setIsProfileOpen(false);
    if (user?.id) {
      router.push("/customer/support");
    } else {
      router.push("/contact");
    }
  };

  const handleAuthClick = () => {
    setIsProfileOpen(false);
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
    <header
      className={`hidden lg:block w-full z-50 ${isSticky ? "sticky top-0" : "relative"}`}
    >
      <nav
        className={`relative bg-navbar text-navbar-foreground flex items-center justify-between xl:px-16 lg:px-8 py-3.5 storefront-nav w-full ${styles} ${
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
            const columns = l2Config?.[item.id];
            const hasResolvedColumns = !!columns && columns.length > 0;
            const showMenuPanel =
              hasMega &&
              activeMenuId === item.id &&
              (menuDataLoading || hasResolvedColumns);

            // Directory-style menus (e.g. "All Categories") tend to have many
            // columns — switch from a single horizontal row to a wrapping grid
            // so 6+ columns don't blow the panel out past the viewport.
            const isDirectoryStyle = (columns?.length ?? 0) > 4;
            const isVisual =
              item.displayType === NavItemDisplayType.CATEGORY_LISTING_VISUAL;

            return (
              <li
                key={item.id}
                className="relative py-2"
                onMouseEnter={() => handleMouseEnter(item.id, hasMega)}
                onClick={() => setActiveMenuId(item.id)}
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
                      ) : isVisual ? (
                        <div className="grid grid-cols-5 gap-6 py-6 px-7 w-full min-w-[600px] max-w-[min(94vw,980px)]">
                          {columns!.map((col) => (
                            <Link
                              key={col.id}
                              href={col.href || "#"}
                              className="flex items-center gap-4 p-3 bg-gray-50/60 hover:bg-theme-primary/5 hover:text-theme-primary rounded-xl transition-all group/item border border-transparent hover:border-theme-primary/20 cursor-pointer"
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
              onChange={setSearchQuery}
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
                onClick={() => setIsProfileOpen(!isProfileOpen)}
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
        {activeMenuId && (
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
