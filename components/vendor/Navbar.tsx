"use client";

// 1. Imports
import { useRef, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Building2, Mail, ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { logOut } from "@/lib/features/auth/authSlice";
import { VENDOR_NAVBAR_TEXT } from "@/constants/vendorText";
import { userIcon } from "@/constants/common";
import { RootState } from "@/lib/store";

// 2. Enums
export enum UserRole {
  ADMIN = "admin",
  VENDOR = "vendor",
  CUSTOMER = "customer",
}

export enum NavbarActionType {
  TOGGLE_DROPDOWN = "TOGGLE_DROPDOWN",
  CLOSE_DROPDOWN = "CLOSE_DROPDOWN",
}

// 3. Interfaces
export interface NavbarProps {
  title?: string;
}

export interface VendorUser {
  role: UserRole | string;
  store_name?: string;
  email?: string;
  company_id?: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthState {
  auth: {
    user: VendorUser | null;
  };
}

export interface NavbarState {
  isDropdownOpen: boolean;
}

export type NavbarAction =
  | { type: NavbarActionType.TOGGLE_DROPDOWN }
  | { type: NavbarActionType.CLOSE_DROPDOWN };

// 4. Constants/Config
export const NavbarConfig = {
  ROUTES: {
    AUTH: "/auth",
  },
  ASSETS: {
    PROFILE_ALT: "Profile",
  },
  EVENTS: {
    MOUSE_DOWN: "mousedown",
  },
} as const;

// 5. Reducer
const initialState: NavbarState = {
  isDropdownOpen: false,
};

function navbarReducer(state: NavbarState, action: NavbarAction): NavbarState {
  switch (action.type) {
    case NavbarActionType.TOGGLE_DROPDOWN:
      return { ...state, isDropdownOpen: !state.isDropdownOpen };
    case NavbarActionType.CLOSE_DROPDOWN:
      return { ...state, isDropdownOpen: false };
    default:
      const _exhaustiveCheck: never = action;
      return state;
  }
}

// 6. Component
export default function Navbar({ title }: NavbarProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [state, dispatchNavbar] = useReducer(navbarReducer, initialState);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        dispatchNavbar({ type: NavbarActionType.CLOSE_DROPDOWN });
      }
    };
    document.addEventListener(
      NavbarConfig.EVENTS.MOUSE_DOWN,
      handleClickOutside,
    );
    return () =>
      document.removeEventListener(
        NavbarConfig.EVENTS.MOUSE_DOWN,
        handleClickOutside,
      );
  }, []);

  const handleLogout = () => {
    dispatch(logOut());
    router.push(NavbarConfig.ROUTES.AUTH);
  };

  const isVendor = user && "role" in user && user?.role === UserRole.VENDOR;
  const vendorDetails = {
    companyName: isVendor ? user?.store_name || "" : "",
    companyEmail: isVendor ? user?.email || "" : "",
    companyId: isVendor ? user?.company_id || "" : "",
    firstName: isVendor ? user?.first_name || "" : "",
    lastName: isVendor ? user?.last_name || "" : "",
  };

  return (
    <nav className="w-full py-3 px-4 border-b border-gray-200 bg-white flex justify-between items-center min-h-[60px]">
      {/* Left Side */}
      {title && (
        <div>
          <h1 className="text-theme-h5 font-semibold text-gray-800">{title}</h1>
        </div>
      )}

      {/* Right Side */}
      <div className="relative ml-auto" ref={dropdownRef}>
        {!user ? (
          /* Skeleton Loader (Server Render) */
          <div className="flex items-center gap-3 px-3 py-1.5">
            <div className="text-right hidden sm:block space-y-1">
              <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
              <div className="w-32 h-3 bg-gray-50 rounded animate-pulse" />
            </div>
            <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse border-2 border-gray-100" />
          </div>
        ) : (
          /* Real User Data (Client Render) */
          <>
            <button
              onClick={() =>
                dispatchNavbar({ type: NavbarActionType.TOGGLE_DROPDOWN })
              }
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-right hidden sm:block">
                <span className="block text-theme-body-sm font-semibold text-gray-800 leading-tight">
                  {vendorDetails.firstName} {vendorDetails.lastName}
                </span>
                <span className="block text-theme-caption text-gray-500 leading-tight">
                  {vendorDetails.companyEmail}
                </span>
              </span>

              <span className="relative block">
                <Image
                  src={userIcon}
                  alt={NavbarConfig.ASSETS.PROFILE_ALT}
                  width={36}
                  height={36}
                  className="rounded-full object-cover border-2 border-gray-200"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
              </span>

              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${state.isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {state.isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-white font-bold text-theme-body-sm flex-shrink-0">
                      {vendorDetails.firstName.charAt(0)}
                      {vendorDetails.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-theme-body-sm font-semibold text-gray-900">
                        {vendorDetails.firstName} {vendorDetails.lastName}
                      </p>
                      <p className="text-theme-caption text-gray-500">
                        {VENDOR_NAVBAR_TEXT.ACTIVE_WORKSPACE}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-theme-caption text-gray-600">
                      <Mail size={12} className="text-gray-400 flex-shrink-0" />
                      <span>{vendorDetails.companyEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-theme-caption text-gray-600">
                      <Building2
                        size={12}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <span className="font-mono text-gray-400">
                        {vendorDetails.companyId}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-theme-body-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>{VENDOR_NAVBAR_TEXT.LOGOUT}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
