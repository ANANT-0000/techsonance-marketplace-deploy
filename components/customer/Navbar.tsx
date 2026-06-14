"use client";
import { useEffect, useReducer } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { BRAND_LOGO } from "@/constants/common";
import { Bell, Heart, ShoppingBag, User, Search, Menu } from "lucide-react";
import { toggleCartSidebar } from "@/lib/features/CartSidebar";
import { motion } from "motion/react";
import { RootState } from "@/lib/store";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { useNavbarData } from "@/hooks/useNavbarData";
import { useThemeData } from "@/hooks/useThemeData";
import { SearchBar } from "./SearchBar";
import { BackButton } from "../ui/back-button";
import { SearchTrigger } from "./SearchOverlay";

export enum NavActionType {
  MOUNT = "MOUNT",
  TOGGLE_SEARCH = "TOGGLE_SEARCH",
  SET_SEARCH_QUERY = "SET_SEARCH_QUERY",
}

type NavState = {
  isMounted: boolean;
  isSearchOpen: boolean;
  searchQuery: string;
};
type NavAction =
  | { type: NavActionType.MOUNT }
  | { type: NavActionType.TOGGLE_SEARCH; payload: boolean }
  | { type: NavActionType.SET_SEARCH_QUERY; payload: string };

const navReducer = (state: NavState, action: NavAction): NavState => {
  switch (action.type) {
    case NavActionType.MOUNT:
      return { ...state, isMounted: true };
    case NavActionType.TOGGLE_SEARCH:
      return { ...state, isSearchOpen: action.payload };
    case NavActionType.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
};

export function Navbar({
  styles,
  menuLinks: propMenuLinks,
}: {
  styles?: string;
  menuLinks?: { [key: string]: string | null }[];
}) {
  const { menuLinks: dynamicLinks } = useNavbarData();
  const { themeData } = useThemeData();
  const menuLinks = propMenuLinks || dynamicLinks;

  const { items } = useAppSelector((state: RootState) => state.cart);
  const { wishItems } = useAppSelector((state: RootState) => state.wishlist);
  const { user } = useAppSelector((state: RootState) => state.auth);

  const dispatch = useAppDispatch();
  const wishlistCount = wishItems.length; // Simplified since array length implies count
  const path = usePathname();
  const router = useRouter();
  const isHome = path === "/";
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });
  const logoUrl = themeData.logo_url
    ? themeData.logo_url || themeData.logo_dark_url
    : BRAND_LOGO;
  const [state, dispatchState] = useReducer(navReducer, {
    isMounted: false,
    isSearchOpen: false,
    searchQuery: "",
  });

  useEffect(() => {
    dispatchState({ type: NavActionType.MOUNT });
  }, []);

  if (
    path.startsWith("/admin") ||
    path.startsWith("/vendor") ||
    path.includes("checkout")
  ) {
    return null;
  }

  if (!state.isMounted) return <nav className="h-16" />;

  if (isTabletOrMobile) {
    const navPosCls =
      themeData.navbar_position === "sticky" ? "sticky top-0 z-50" : "relative";
    return (
      <nav
        className={`flex justify-between items-center px-4 py-1.5 bg-navbar text-navbar-foreground border-b border-gray-200 shadow-sm ${navPosCls} ${styles}`}
      >
        {isHome ? null : <BackButton />}
        <Link href="/">
          <img
            src={logoUrl}
            alt="brand logo"
            className="h-8 object-contain rounded-2xl"
          />
        </Link>
        <button className="p-2 -mr-2 text-current hover:bg-black/5 rounded-md transition-colors relative">
          <Bell strokeWidth={1.5} size={22} />
        </button>
      </nav>
    );
  }

  const navPosCls =
    themeData.navbar_position === "sticky" ? "sticky top-0 z-50" : "relative";
  const logoAlignCls =
    themeData.logo_alignment === "center"
      ? "order-2 flex-1 flex justify-center"
      : "order-1 flex-1";
  const linksAlignCls =
    themeData.logo_alignment === "center"
      ? "order-1 flex-1 justify-start"
      : "order-2 flex-1 justify-center";
  const actionsAlignCls = "order-3 flex-1 flex justify-end";

  return (
    <nav
      className={`bg-navbar text-navbar-foreground flex justify-between items-center xl:px-16 lg:px-8 md:px-4 py-1 border-b border-gray-200 shadow-sm ${navPosCls} ${styles}`}
    >
      <div className={logoAlignCls}>
        <Link href="/">
          <img
            src={logoUrl}
            alt="brand logo"
            className="h-14 font-black object-contain rounded-2xl"
          />
        </Link>
      </div>

      <ul
        className={`flex space-x-8 md:text-theme-body-sm lg:text-theme-body-sm font-medium items-center ${linksAlignCls}`}
      >
        {menuLinks.map((item, idx) => {
          let label: string;
          let href: string;

          if ("label" in item && "href" in item) {
            label = String(item.label || "");
            href = String(item.href || "#");
          } else {
            label = Object.keys(item)[0] || "";
            href = String(Object.values(item)[0] || "#");
          }

          const isActive = path === href;

          return (
            <li key={`nav-${label}-${idx}`} className="relative py-1">
              <Link
                href={href || "#"}
                className={`relative z-10 transition-colors duration-200 ${isActive ? "text-current font-bold" : "text-navbar-foreground/70 hover:text-navbar-foreground"}`}
              >
                {label}
              </Link>
              {isActive && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-current z-0"
                />
              )}
            </li>
          );
        })}
      </ul>

      <div className={actionsAlignCls}>
        {path === "/customerRegister" || path === "/customerLogin" ? null : (
          <div className="flex gap-5 items-center">
            <div className="relative flex items-center">
              {/* {state.isSearchOpen ? (
                                <div className="w-[320px] z-50">
                                    <SearchBar
                                        value={state.searchQuery}
                                        onChange={(val) => dispatchState({ type: 'SET_SEARCH_QUERY', payload: val })}
                                        onClose={() => dispatchState({ type: NavActionType.TOGGLE_SEARCH, payload: false })}
                                        onSearch={(val) => {
                                            if (val.trim()) {
                                                router.push(`/store?search=${encodeURIComponent(val)}`);
                                            }
                                            dispatchState({ type: NavActionType.TOGGLE_SEARCH, payload: false });
                                            dispatchState({ type: 'SET_SEARCH_QUERY', payload: '' });
                                        }}
                                        placeholder="Search products..."
                                    />
                                </div>
                            ) : (
                                <button onClick={() => dispatchState({ type: NavActionType.TOGGLE_SEARCH, payload: true })} className="p-2 text-navbar-foreground/75 hover:bg-black/5 rounded-full transition-colors">
                                    <Search size={20} strokeWidth={1.5} />
                                </button>
                            )} */}
              {/* <button onClick={() => router.push('/store/search')} className="p-2 text-navbar-foreground/75 hover:bg-black/5 rounded-full transition-colors">
                                <Search size={20} strokeWidth={1.5} />
                            </button> */}
              <SearchTrigger />
            </div>

            {user && (
              <Link
                href={"/customer/wishlist"}
                className="relative p-2 text-navbar-foreground/75 hover:bg-black/5 rounded-full transition-colors"
              >
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 text-theme-tiny font-bold bg-theme-primary text-theme-primary-foreground rounded-full w-4 h-4 flex items-center justify-center border-2 border-navbar">
                    {wishlistCount}
                  </span>
                )}
                <Heart
                  size={20}
                  strokeWidth={1.5}
                  color="currentColor"
                  fill={wishlistCount > 0 ? "currentColor" : "none"}
                />
              </Link>
            )}

            <button
              onClick={() => dispatch(toggleCartSidebar("open"))}
              className="relative p-2 text-navbar-foreground/75 hover:bg-black/5 rounded-full transition-colors"
            >
              {state.isMounted && items.length > 0 && (
                <span className="absolute top-0 right-0 text-theme-tiny font-bold bg-theme-primary text-theme-primary-foreground rounded-full w-4 h-4 flex items-center justify-center border-2 border-navbar">
                  {items.length}
                </span>
              )}
              <ShoppingBag size={20} strokeWidth={1.5} />
            </button>

            <Link
              href={user?.id ? "/customer" : "/auth/customerLogin"}
              className="p-2 text-navbar-foreground/75 hover:bg-black/5 rounded-full transition-colors"
            >
              <User size={20} strokeWidth={1.5} />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
