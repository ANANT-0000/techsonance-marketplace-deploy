"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Calendar,
  BadgeCheck,
  Pencil,
  ShoppingBag,
  Heart,
  Star,
  MapPin,
  Lock,
  Bell,
  ChevronRight,
  Globe,
  Headphones,
  CheckCircle,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  Menu,
  X,
  Home,
  ShoppingCart,
  Settings,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHooks";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logOut, openLoginModal } from "@/lib/features/auth/authSlice";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AxiosAPI from "@/lib/axios";
import { DASHBOARD_TEXT } from "@/constants/customerText";
import { useThemeData } from "@/hooks/useThemeData";
import { BRAND_LOGO } from "@/constants/common";
import { ProfileSidebar } from "@/components/customer/ProfileSidebar";
import {
  ProfileSidebarLink,
  IS_AUTHENTICATED_KEY,
  USER_STORAGE_KEY,
} from "@/constants";

// ─── Animation Variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

// ─── TypeScript Interfaces / DTOs ──────────────────────────────────────────────

/**
 * Verified status details for the user profile.
 */
export interface UserVerificationDTO {
  isVerified: boolean;
  verificationDate?: string | null;
}

/**
 * Core user details displayed in the profile banner.
 */
export interface UserProfileDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  memberSinceDate: string; // ISO date format
  verification: UserVerificationDTO;
}

/**
 * Quick statistics summary.
 */
export interface DashboardStatsDTO {
  totalOrders: number;
  wishlistCount: number;
  reviewsCount: number;
}

/**
 * Details representing a delivery address.
 */
export interface AddressDetailsDTO {
  id?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  formattedAddress?: string | null;
}

/**
 * Wrapper for the default shipping address status.
 */
export interface SavedAddressesInfoDTO {
  hasDefaultAddress: boolean;
  defaultAddress?: AddressDetailsDTO | null;
}

/**
 * Login & security state overview.
 */
export interface SecurityStatusDTO {
  passwordLastUpdated: string; // ISO date format
  mfaEnabled: boolean;
}

/**
 * User alert and communication settings.
 */
export interface NotificationPreferencesDTO {
  emailAlertsEnabled: boolean;
  pushAlertsEnabled: boolean;
  smsAlertsEnabled: boolean;
}

/**
 * Full backend API payload representation for populating the dashboard UI.
 */
export interface CustomerDashboardPayloadDTO {
  profile: UserProfileDTO;
  stats: DashboardStatsDTO;
  addressesInfo: SavedAddressesInfoDTO;
  securityStatus: SecurityStatusDTO;
  notificationsPreferences: NotificationPreferencesDTO;
}

/**
 * Component properties for the presentation container.
 */
export interface CustomerDashboardProps {
  data?: CustomerDashboardPayloadDTO;
  labels?: typeof DASHBOARD_TEXT;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEditProfile?: () => void;
  onManageAddresses?: () => void;
  onManageSecurity?: () => void;
  onManagePreferences?: () => void;
  onVisitHelpCenter?: () => void;
  onContactSupport?: () => void;
}

// ─── Skeleton Screen Components ──────────────────────────────────────────────────

function DashboardHeaderSkeleton() {
  return (
    <div className="w-full flex items-center justify-between pb-4 border-b border-border">
      <Skeleton className="h-4 w-24 rounded" />
      <div className="flex items-center gap-4">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}

function ProfileHeroSkeleton() {
  return (
    <div className="rounded-2xl bg-muted/30 border border-border p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex flex-col md:flex-row items-center gap-6 w-full">
        <Skeleton className="w-24 h-24 md:w-28 md:h-28 rounded-full shrink-0" />
        <div className="flex-1 space-y-3 w-full flex flex-col items-center md:items-start">
          <Skeleton className="h-7 w-48 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-8 w-44 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-9 w-32 rounded-lg shrink-0 w-full md:w-auto" />
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border p-4 space-y-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-6 w-10 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

function AccountCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-3/4 rounded" />
          <div className="border-t border-border pt-4 space-y-2">
            <Skeleton className="h-2 w-20 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function SupportSkeleton() {
  return (
    <div className="rounded-2xl border border-border p-5 flex flex-col lg:flex-row gap-4">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-3 w-3/4 rounded" />
      </div>
      <div className="flex-1 flex gap-4 w-full">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Error Fallback Component ──────────────────────────────────────────────────

function ErrorState({
  onRetry,
  message,
  labels = DASHBOARD_TEXT,
}: {
  onRetry?: () => void;
  message?: string | null;
  labels?: typeof DASHBOARD_TEXT;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center bg-card border border-border rounded-2xl">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="text-destructive" size={24} />
      </div>
      <div>
        <p className="font-semibold text-foreground">
          {message ?? labels.ERROR_DEFAULT_TITLE}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {labels.ERROR_DEFAULT_DESC}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw size={14} /> {labels.ERROR_RETRY}
        </Button>
      )}
    </div>
  );
}

// ─── Reusable Layout & Presentation Subcomponents ───────────────────────────────

/**
 * Top Header bar component containing notifications and user dropdown list (Desktop).
 */
function DashboardHeader({
  profile,
  labels = DASHBOARD_TEXT,
}: {
  profile: UserProfileDTO;
  labels?: typeof DASHBOARD_TEXT;
}) {
  return (
    <header className="w-full flex items-center justify-between pb-5 border-b border-border">
      <div className="w-fit" />
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <button
          className="relative w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary/50 active:scale-95 transition-all text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label={labels.CARD_NOTIFICATIONS_TITLE}
        >
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            3
          </span>
        </button>

        {/* User Dropdown */}
        <div className="flex items-center gap-2 pl-2 border-l border-border hover:opacity-95 transition-opacity cursor-pointer">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-secondary shrink-0 relative">
            <Image
              src={
                profile.avatarUrl ||
                "https://i.pinimg.com/originals/74/a3/b6/74a3b6a8856b004dfff824ae9668fe9b.jpg"
              }
              alt={`${profile.firstName} ${profile.lastName}`}
              fill
              loading="eager"
              className="object-cover"
              sizes="32px"
            />
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-foreground truncate max-w-[120px]">
            {profile.firstName} {profile.lastName}
          </span>
          <ChevronDown size={14} className="text-muted-foreground shrink-0" />
        </div>
      </div>
    </header>
  );
}

/**
 * Cover banner showing user name, avatar, verification badge, and email capsule.
 */
function ProfileHero({
  profile,
  labels = DASHBOARD_TEXT,
  onEditProfile,
  isMobile = false,
}: {
  profile: UserProfileDTO;
  labels?: typeof DASHBOARD_TEXT;
  onEditProfile?: () => void;
  isMobile?: boolean;
}) {
  const memberDateFormatted = new Date(
    profile.memberSinceDate,
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-theme-primary to-theme-secondary text-white shadow-md">
      {/* Decorative Wavy Gradients for Background styling */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-radial from-theme-primary to-theme-secondary " />

      <div
        className={`relative z-10  md:p-8 flex ${isMobile ? "flex-col gap-4 py-2 px-4" : "flex-col md:flex-row items-center justify-between gap-6"}`}
      >
        <div
          className={`flex ${isMobile ? "flex-row items-start" : "flex-col md:flex-row items-center"} gap-4 text-left w-full relative`}
        >
          {/* Avatar frame */}
          <div
            className={`relative ${isMobile ? "w-16 h-16" : "w-24 h-24 md:w-28 md:h-28"} rounded-full ring-4 ring-white/10 overflow-hidden shadow-lg shrink-0 bg-zinc-900`}
          >
            <Image
              src={
                profile.avatarUrl ||
                "https://i.pinimg.com/originals/74/a3/b6/74a3b6a8856b004dfff824ae9668fe9b.jpg"
              }
              alt={`${profile.firstName} ${profile.lastName}`}
              fill
              loading="eager"
              className="object-contain"
              sizes={isMobile ? "64px" : "112px"}
              priority
            />
          </div>

          {/* Identity Info */}
          <div className="flex flex-col min-w-0 flex-1 pr-16 md:pr-0 text-theme-primary-foreground">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1
                className={`${isMobile ? "text-base" : "text-xl md:text-2xl"} font-bold tracking-tight truncate max-w-full`}
              >
                {profile.firstName} {profile.lastName}
              </h1>
              {profile.verification.isVerified && (
                <BadgeCheck
                  size={isMobile ? 14 : 18}
                  className="text-sky-400 shrink-0"
                />
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-white/70 mt-1">
              <Calendar size={isMobile ? 11 : 13} className="shrink-0" />
              <span>
                {labels.MEMBER_SINCE_PREFIX}
                {memberDateFormatted}
              </span>
            </div>

            <div className="mt-2.5 flex">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/5 text-[9px] sm:text-xs font-medium text-white/95 backdrop-blur-sm transition-colors cursor-pointer">
                <Mail size={10} className="shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {profile.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Button in absolute position on top right for mobile */}
        <div
          className={`${isMobile ? "absolute top-5 right-5 z-20" : "shrink-0 w-full md:w-auto"}`}
        >
          {onEditProfile ? (
            <button
              onClick={onEditProfile}
              className={`flex items-center justify-center gap-1.5 ${isMobile ? "px-2.5 py-1.5 border border-white/20 rounded-md text-[10px] font-semibold text-white bg-white/5 backdrop-blur-xs hover:bg-white/10" : "w-full md:w-auto px-4 py-2.5 border border-white/25 hover:border-white/50 rounded-lg text-xs font-semibold text-white bg-transparent hover:bg-white/10"} active:scale-95 transition-all cursor-pointer`}
            >
              <Pencil size={isMobile ? 10 : 12} />
              <span>{labels.EDIT_PROFILE}</span>
            </button>
          ) : (
            <Link
              href="/customer/editProfile"
              className={isMobile ? "" : "block w-full md:w-auto"}
            >
              <button
                className={`flex items-center justify-center gap-1.5 ${isMobile ? "px-2.5 py-1.5 border border-white/20 rounded-md text-[10px] font-semibold text-white bg-white/5 backdrop-blur-xs hover:bg-white/10" : "w-full md:w-auto px-4 py-2.5 border border-white/25 hover:border-white/50 rounded-lg text-xs font-semibold text-white bg-transparent hover:bg-white/10"} active:scale-95 transition-all cursor-pointer`}
              >
                <Pencil size={isMobile ? 10 : 12} />
                <span>{labels.EDIT_PROFILE}</span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Three column card grid summarizing total orders, wishlist, and reviews.
 */
function StatsSection({
  stats,
  labels = DASHBOARD_TEXT,
  isMobile = false,
}: {
  stats: DashboardStatsDTO;
  labels?: typeof DASHBOARD_TEXT;
  isMobile?: boolean;
}) {
  const statItems = [
    {
      key: "orders",
      icon: ShoppingBag,
      iconBg: "bg-indigo-50 dark:bg-indigo-950/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      title: labels.STAT_TOTAL_ORDERS,
      value: stats.totalOrders,
      linkText: "View all orders",
      href: "/customer/orders",
    },
    {
      key: "wishlist",
      icon: Heart,
      iconBg: "bg-rose-50 dark:bg-rose-950/30",
      iconColor: "text-rose-600 dark:text-rose-400",
      title: labels.STAT_WISHLIST,
      value: stats.wishlistCount,
      linkText: "View wishlist",
      href: "/wishlist",
    },
    {
      key: "reviews",
      icon: Star,
      iconBg: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-500 dark:text-amber-400",
      title: labels.STAT_REVIEWS,
      value: stats.reviewsCount,
      linkText: "View all reviews",
      href: "/customer/reviews",
    },
  ];

  if (isMobile) {
    return (
      <section className="grid grid-cols-3 rounded-xl border border-border gap-3 p-3">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          const isRightmost = index === statItems.length - 1;
          return (
            <div
              key={item.key}
              className={`bg-card flex flex-col justify-between hover:shadow-md hover:border-primary/20 transition-all group text-left   ${!isRightmost ? "border-r border-border" : ""}`}
            >
              <div className="flex gap-2 ">
                <div
                  className={`w-8 h-8 aspect-square rounded-lg flex items-center justify-center ${item.iconBg}`}
                >
                  <Icon size={14} className={item.iconColor} />
                </div>
                <div>
                  <p className="text-tiny font-semibold capitalize  text-muted-foreground text-balance">
                    {item.title}
                  </p>
                  <p className="text-md sm:text-xl font-extrabold text-foreground mt-0.5 tabular-nums">
                    {item.value}
                  </p>
                </div>
              </div>
              <Link
                href={item.href}
                className="text-tiny font-semibold capitalize text-theme-secondary hover:text-theme-primary dark:text-theme-secondary-foreground dark:hover:text-theme-primary-foreground mt-3 flex items-center gap-0.5 hover:underline transition-colors w-fit"
              >
                <span>{item.linkText}</span>
                <ChevronRight size={8} className="shrink-0" />
              </Link>
            </div>
          );
        })}
      </section>
    );
  }

  // Desktop Card View
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.key}
            className="rounded-2xl border border-border bg-card px-5 py-3 flex  justify-start gap-4 items-start hover:shadow-md hover:border-primary/20 transition-all group text-left"
          >
            <div
              className={` h-16 w-16  aspect-4/4 rounded-md flex items-center justify-center ${item.iconBg}`}
            >
              <Icon size={24} className={item.iconColor} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground ">
                {item.title}
              </p>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {item.value}
              </p>
              <Link
                href={item.href}
                className="text-xs font-semibold text-theme-secondary hover:text-theme-primary dark:text-theme-secondary-foreground dark:hover:text-theme-primary-foreground inline-flex items-center gap-1.5 group-hover:underline transition-colors w-fit"
              >
                {item.linkText} <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        );
      })}
    </section>
  );
}

/**
 * Main dashboard settings panel mapping Address, Security, and Preferences.
 */
function AccountSettingsGrid({
  addressesInfo,
  securityStatus,
  notificationsPreferences,
  labels = DASHBOARD_TEXT,
  onManageAddresses,
  onManageSecurity,
  onManagePreferences,
  isMobile = false,
}: {
  addressesInfo: SavedAddressesInfoDTO;
  securityStatus: SecurityStatusDTO;
  notificationsPreferences: NotificationPreferencesDTO;
  labels?: typeof DASHBOARD_TEXT;
  onManageAddresses?: () => void;
  onManageSecurity?: () => void;
  onManagePreferences?: () => void;
  isMobile?: boolean;
}) {
  if (isMobile) {
    const listItems = [
      {
        key: "addresses",
        title: labels.CARD_ADDRESSES_TITLE,
        description: labels.CARD_ADDRESSES_DESC,
        icon: MapPin,
        iconBg: "bg-indigo-50 dark:bg-indigo-950/30",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        chevronColor: "text-indigo-600 dark:text-indigo-400",
        action: onManageAddresses,
        href: "/customer/addresses",
      },
      {
        key: "security",
        title: labels.CARD_SECURITY_TITLE,
        description: labels.CARD_SECURITY_DESC,
        icon: Lock,
        iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        chevronColor: "text-emerald-600 dark:text-emerald-400",
        action: onManageSecurity,
        href: "/customer/changePassword",
      },
      {
        key: "notifications",
        title: labels.CARD_NOTIFICATIONS_TITLE,
        description: labels.CARD_NOTIFICATIONS_DESC,
        icon: Bell,
        iconBg: "bg-amber-50 dark:bg-amber-950/30",
        iconColor: "text-amber-500 dark:text-amber-400",
        chevronColor: "text-amber-500 dark:text-amber-400",
        action: onManagePreferences,
        href: "/customer/settings",
      },
    ];

    return (
      <section className="space-y-4">
        {/* Title Row with Gear Settings icon */}
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              {labels.SECTION_ACCOUNT_TITLE}
            </h2>
            <p className="text-xxs text-muted-foreground mt-0.5">
              {labels.SECTION_ACCOUNT_SUBTITLE}
            </p>
          </div>
          <Link href="/customer/settings">
            <button className="p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground hover:text-foreground active:scale-95 transition-all cursor-pointer">
              <Settings size={16} />
            </button>
          </Link>
        </div>

        {/* Stacked menu cards */}
        <div className="space-y-3">
          {listItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-secondary/20 active:scale-[0.99] transition-all min-h-[64px] text-left cursor-pointer">
                <div className="flex items-center flex-1 min-w-0 pr-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}
                  >
                    <Icon size={18} className={item.iconColor} />
                  </div>
                  <div className="ml-3.5 flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-foreground">
                      {item.title}
                    </h4>
                    <p className="text-xxs text-muted-foreground truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className={item.chevronColor} />
              </div>
            );

            if (item.action) {
              return (
                <button
                  key={item.key}
                  onClick={item.action}
                  className="w-full block"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.key}
                href={item.href}
                className="w-full block"
                onClick={(e) => {}}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  // Desktop Cards view
  return (
    <section>
      <div className="text-left">
        <h2 className="text-base font-bold text-foreground tracking-tight">
          {labels.SECTION_ACCOUNT_TITLE}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {labels.SECTION_ACCOUNT_SUBTITLE}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
        {/* Saved Addresses Card */}
        <article className="border border-border bg-card rounded-2xl p-6 flex flex-col hover:shadow-md hover:border-primary/20 transition-all text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0">
              <MapPin
                size={18}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>
            <h3 className="font-bold text-sm text-foreground">
              {labels.CARD_ADDRESSES_TITLE}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            {labels.CARD_ADDRESSES_DESC}
          </p>

          <div className="border-t border-border mt-6 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {labels.CARD_ADDRESSES_INFO_LABEL}
            </p>
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
              {addressesInfo.hasDefaultAddress &&
              addressesInfo.defaultAddress?.formattedAddress
                ? addressesInfo.defaultAddress.formattedAddress
                : labels.CARD_ADDRESSES_INFO_VALUE}
            </p>
          </div>

          <div className="mt-6">
            {onManageAddresses ? (
              <button
                onClick={onManageAddresses}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-border bg-secondary/30 dark:bg-secondary/10 hover:bg-secondary/50 dark:hover:bg-secondary/20 rounded-lg text-xs font-semibold text-foreground transition-all cursor-pointer"
              >
                <span>{labels.CARD_ADDRESSES_ACTION}</span>
                <ChevronRight size={11} className="text-muted-foreground" />
              </button>
            ) : (
              <Link href="/customer/addresses">
                <span className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-border bg-secondary/30 dark:bg-secondary/10 hover:bg-secondary/50 dark:hover:bg-secondary/20 rounded-lg text-xs font-semibold text-foreground transition-all cursor-pointer">
                  {labels.CARD_ADDRESSES_ACTION}
                  <ChevronRight size={11} className="text-muted-foreground" />
                </span>
              </Link>
            )}
          </div>
        </article>

        {/* Login & Security Card */}
        <article className="border border-border bg-card rounded-2xl p-6 flex flex-col hover:shadow-md hover:border-primary/20 transition-all text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
              <Lock
                size={18}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <h3 className="font-bold text-sm text-foreground">
              {labels.CARD_SECURITY_TITLE}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            {labels.CARD_SECURITY_DESC}
          </p>

          <div className="border-t border-border mt-6 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {labels.CARD_SECURITY_INFO_LABEL}
            </p>
            <p className="text-xs font-semibold text-foreground mt-1 tracking-widest font-mono">
              {labels.CARD_SECURITY_ACTION ? "************" : "••••••••••••"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {labels.CARD_SECURITY_INFO_VALUE}
            </p>
          </div>

          <div className="mt-6">
            {onManageSecurity ? (
              <button
                onClick={onManageSecurity}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 transition-all cursor-pointer"
              >
                <span>{labels.CARD_SECURITY_ACTION}</span>
                <ChevronRight
                  size={11}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </button>
            ) : (
              <Link href="/customer/changePassword">
                <span className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 transition-all cursor-pointer">
                  {labels.CARD_SECURITY_ACTION}
                  <ChevronRight
                    size={11}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </span>
              </Link>
            )}
          </div>
        </article>

        {/* Notifications Card */}
        <article className="border border-border bg-card rounded-2xl p-6 flex flex-col hover:shadow-md hover:border-primary/20 transition-all text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
              <Bell size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-bold text-sm text-foreground">
              {labels.CARD_NOTIFICATIONS_TITLE}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            {labels.CARD_NOTIFICATIONS_DESC}
          </p>

          <div className="border-t border-border mt-6 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {labels.CARD_NOTIFICATIONS_INFO_LABEL}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              <CheckCircle size={12} className="shrink-0" />
              <span>
                {notificationsPreferences.emailAlertsEnabled
                  ? labels.CARD_NOTIFICATIONS_INFO_VALUE
                  : "Alerts disabled"}
              </span>
            </div>
          </div>

          <div className="mt-6">
            {onManagePreferences ? (
              <button
                onClick={onManagePreferences}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-amber-100 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-950/40 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 transition-all cursor-pointer"
              >
                <span>{labels.CARD_NOTIFICATIONS_ACTION}</span>
                <ChevronRight
                  size={11}
                  className="text-amber-600 dark:text-amber-400"
                />
              </button>
            ) : (
              <Link href="/customer/settings">
                <span className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-amber-100 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-950/40 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 transition-all cursor-pointer">
                  {labels.CARD_NOTIFICATIONS_ACTION}
                  <ChevronRight
                    size={11}
                    className="text-amber-600 dark:text-amber-400"
                  />
                </span>
              </Link>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

/**
 * Dynamic Need Help footer navigation banner block.
 */
function NeedHelpSection({
  labels = DASHBOARD_TEXT,
  onVisitHelpCenter,
  onContactSupport,
  isMobile = false,
}: {
  labels?: typeof DASHBOARD_TEXT;
  onVisitHelpCenter?: () => void;
  onContactSupport?: () => void;
  isMobile?: boolean;
}) {
  if (isMobile) {
    const supportItems = [
      {
        key: "help",
        title: labels.SUPPORT_HELP_CENTER_TITLE,
        description: labels.SUPPORT_HELP_CENTER_DESC,
        icon: Globe,
        iconBg: "bg-blue-50 dark:bg-blue-950/30",
        iconColor: "text-blue-600 dark:text-blue-400",
        chevronColor: "text-blue-600 dark:text-blue-400",
        action: onVisitHelpCenter,
        href: "/help",
      },
      {
        key: "support",
        title: labels.SUPPORT_CONTACT_TITLE,
        description: labels.SUPPORT_CONTACT_DESC,
        icon: Headphones,
        iconBg: "bg-violet-50 dark:bg-violet-950/30",
        iconColor: "text-violet-600 dark:text-violet-400",
        chevronColor: "text-violet-600 dark:text-violet-400",
        action: onContactSupport,
        href: "/customer/support",
      },
    ];

    return (
      <section className="space-y-4">
        {/* Section title */}
        <h2 className="text-sm font-bold text-foreground tracking-tight text-left">
          {labels.SECTION_SUPPORT_TITLE}
        </h2>

        {/* Stacked help links */}
        <div className="space-y-3">
          {supportItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-secondary/20 active:scale-[0.99] transition-all min-h-[64px] text-left cursor-pointer">
                <div className="flex items-center flex-1 min-w-0 pr-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}
                  >
                    <Icon size={18} className={item.iconColor} />
                  </div>
                  <div className="ml-3.5 flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-foreground">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className={item.chevronColor} />
              </div>
            );

            if (item.action) {
              return (
                <button
                  key={item.key}
                  onClick={item.action}
                  className="w-full block"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link key={item.key} href={item.href} className="w-full block">
                {content}
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  // Desktop row View
  return (
    <section className="border border-border bg-card rounded-2xl p-4 flex flex-col xl:flex-row items-center justify-between gap-4">
      <div className="text-center xl:text-left">
        <h3 className="font-bold text-sm text-foreground">
          {labels.SECTION_SUPPORT_TITLE}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          If you have any questions or need assistance, our support team is here
          to help.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto xl:flex-1 justify-end max-w-2xl">
        {/* Help Center Card link */}
        {onVisitHelpCenter ? (
          <button
            onClick={onVisitHelpCenter}
            className="flex-1 flex items-center gap-3 px-4 py-3 bg-blue-50/30 dark:bg-blue-950/10 hover:bg-blue-50/70 dark:hover:bg-blue-950/20 border border-blue-100/30 dark:border-blue-900/30 rounded-xl cursor-pointer transition-all group text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Globe size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {labels.SUPPORT_HELP_CENTER_TITLE}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {labels.SUPPORT_HELP_CENTER_DESC}
              </p>
            </div>
            <ChevronRight
              size={14}
              className="text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0"
            />
          </button>
        ) : (
          <Link
            href="/help"
            className="flex-1 flex items-center gap-3 px-4 py-3 bg-blue-50/30 dark:bg-blue-950/10 hover:bg-blue-50/70 dark:hover:bg-blue-950/20 border border-blue-100/30 dark:border-blue-900/30 rounded-xl cursor-pointer transition-all group text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Globe size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {labels.SUPPORT_HELP_CENTER_TITLE}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {labels.SUPPORT_HELP_CENTER_DESC}
              </p>
            </div>
            <ChevronRight
              size={14}
              className="text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0"
            />
          </Link>
        )}

        {/* Contact Support Card link */}
        {onContactSupport ? (
          <button
            onClick={onContactSupport}
            className="flex-1 flex items-center gap-3 px-4 py-3 bg-violet-50/30 dark:bg-violet-950/10 hover:bg-violet-50/70 dark:hover:bg-violet-950/20 border border-violet-100/30 dark:border-violet-900/30 rounded-xl cursor-pointer transition-all group text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-violet-100/50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <Headphones size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {labels.SUPPORT_CONTACT_TITLE}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {labels.SUPPORT_CONTACT_DESC}
              </p>
            </div>
            <ChevronRight
              size={14}
              className="text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0"
            />
          </button>
        ) : (
          <Link
            href="/customer/support"
            className="flex-1 flex items-center gap-3 px-4 py-3 bg-violet-50/30 dark:bg-violet-950/10 hover:bg-violet-50/70 dark:hover:bg-violet-950/20 border border-violet-100/30 dark:border-violet-900/30 rounded-xl cursor-pointer transition-all group text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-violet-100/50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <Headphones size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {labels.SUPPORT_CONTACT_TITLE}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {labels.SUPPORT_CONTACT_DESC}
              </p>
            </div>
            <ChevronRight
              size={14}
              className="text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0"
            />
          </Link>
        )}
      </div>
    </section>
  );
}

/**
 * Dismissible Become a Seller promo card banner (Mobile and Desktop).
 */
// function BecomeSellerCard({
//   labels = DASHBOARD_TEXT,
//   onClose,
// }: {
//   labels?: typeof DASHBOARD_TEXT;
//   onClose: () => void;
// }) {
//   return (
//     <div className="relative rounded-2xl overflow-hidden border border-rose-100 dark:border-rose-950 bg-rose-50/50 dark:bg-rose-950/10 p-5 flex items-center justify-between shadow-sm">
//       {/* Close Button Circle X Icon */}
//       <button
//         onClick={onClose}
//         className="absolute top-3 right-3 w-6 h-6 rounded-full bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 flex items-center justify-center transition-colors cursor-pointer"
//         aria-label="Dismiss banner"
//       >
//         <X size={12} className="text-rose-800 dark:text-rose-400" />
//       </button>

//       {/* Left text column info */}
//       <div className="flex-1 pr-4 text-left">
//         <h4 className="font-bold text-sm text-rose-950 dark:text-rose-300">
//           {labels.SELLER_BANNER_TITLE}
//         </h4>
//         <p className="text-[10px] sm:text-xs text-rose-900/80 dark:text-rose-400/80 mt-1 leading-relaxed max-w-[170px] xs:max-w-xs">
//           Start selling your products on Techsonance.
//         </p>
//         <div className="mt-4">
//           <Link href="/vendor/register">
//             <span className="inline-flex items-center gap-1 px-3 py-1.5 border border-rose-800 text-rose-800 hover:bg-rose-800 hover:text-white dark:border-rose-400 dark:text-rose-400 dark:hover:bg-rose-400 dark:hover:text-zinc-950 rounded-lg text-[10px] font-bold transition-all cursor-pointer bg-white dark:bg-transparent">
//               Start Selling <ChevronRight size={10} className="ml-0.5" />
//             </span>
//           </Link>
//         </div>
//       </div>

//       {/* Right storefront icon box illustration */}
//       <div className="relative w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] shrink-0 bg-rose-100/40 dark:bg-rose-950/20 rounded-2xl flex items-center justify-center overflow-hidden border border-rose-100 dark:border-rose-900/40">
//         <svg
//           className="w-10 h-10 text-rose-800 dark:text-rose-400"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         >
//           <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
//           <polyline points="9 22 9 12 15 12 15 22" />
//         </svg>
//       </div>
//     </div>
//   );
// }

// ─── Presentation Component ──────────────────────────────────────────────────

/**
 * High-fidelity, responsive presentation layout component that maps user data payload directly to markup.
 */
export function CustomerDashboardContent({
  data,
  labels = DASHBOARD_TEXT,
  isLoading = false,
  error = null,
  onRetry,
  onEditProfile,
  onManageAddresses,
  onManageSecurity,
  onManagePreferences,
  onVisitHelpCenter,
  onContactSupport,
}: CustomerDashboardProps) {
  const [isSellerCardDismissed, setIsSellerCardDismissed] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <DashboardHeaderSkeleton />
        <ProfileHeroSkeleton />
        <StatsSkeleton />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-6 w-36 rounded" />
          <AccountCardsSkeleton />
        </div>
        <SupportSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState onRetry={onRetry} message={error} labels={labels} />;
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
      {/* ── MOBILE SHELL (block lg:hidden) ── */}
      <div className="flex flex-col lg:hidden w-full relative min-h-screen">
        {/* Scrollable content container */}
        <main className="w-full px-4 pt-4 pb-8 space-y-6 flex-1">
          {/* Profile Hero Card banner */}
          <ProfileHero
            profile={data.profile}
            labels={labels}
            onEditProfile={onEditProfile}
            isMobile={true}
          />

          {/* Quick Statistics column row */}
          <StatsSection stats={data.stats} labels={labels} isMobile={true} />

          {/* Account Settings stacked list menu */}
          <AccountSettingsGrid
            addressesInfo={data.addressesInfo}
            securityStatus={data.securityStatus}
            notificationsPreferences={data.notificationsPreferences}
            labels={labels}
            onManageAddresses={onManageAddresses}
            onManageSecurity={onManageSecurity}
            onManagePreferences={onManagePreferences}
            isMobile={true}
          />

          {/* Help Section menu cards */}
          <NeedHelpSection
            labels={labels}
            onVisitHelpCenter={onVisitHelpCenter}
            onContactSupport={onContactSupport}
            isMobile={true}
          />

          {/* Become a Seller card badge */}
          {/* {!isSellerCardDismissed && (
            <BecomeSellerCard
              labels={labels}
              onClose={() => setIsSellerCardDismissed(true)}
            />
          )} */}
        </main>
      </div>

      {/* ── DESKTOP SHELL (hidden lg:flex) ── */}
      <div className="hidden lg:flex flex-col w-full space-y-6">
        <DashboardHeader profile={data.profile} labels={labels} />

        <ProfileHero
          profile={data.profile}
          labels={labels}
          onEditProfile={onEditProfile}
        />

        <StatsSection stats={data.stats} labels={labels} />

        <AccountSettingsGrid
          addressesInfo={data.addressesInfo}
          securityStatus={data.securityStatus}
          notificationsPreferences={data.notificationsPreferences}
          labels={labels}
          onManageAddresses={onManageAddresses}
          onManageSecurity={onManageSecurity}
          onManagePreferences={onManagePreferences}
        />

        <NeedHelpSection
          labels={labels}
          onVisitHelpCenter={onVisitHelpCenter}
          onContactSupport={onContactSupport}
        />
      </div>
    </div>
  );
}

// ─── Main Route Export ─────────────────────────────────────────────────────────

export default function UserProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const { wishItems } = useAppSelector(
    (state: any) => state.wishlist || { wishItems: [] },
  );

  const dispatch = useAppDispatch();
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [dashboardData, setDashboardData] =
    useState<CustomerDashboardPayloadDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  useEffect(() => {
    if (!isClientMounted) return;

    // Check localStorage directly to prevent false modal trigger during Redux hydration
    const isAuthRaw = localStorage.getItem(IS_AUTHENTICATED_KEY);
    const parsedAuth = isAuthRaw ? JSON.parse(isAuthRaw) : null;
    const serializedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!parsedAuth?.isAuthenticated || !serializedUser) {
      dispatch(openLoginModal(null));
    }
  }, [isClientMounted, user, dispatch]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosAPI.get(`/v1/customers/dashboard/${user.id}`);
      const res = response.data;
      console.log(res, "res");
      if (res.status === 200 || res.success) {
        setDashboardData(res.data);
      } else {
        throw new Error(res.message || "Failed to load dashboard data");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
      // Fallback
      setDashboardData({
        profile: {
          id: user.id || "",
          firstName: user.first_name || "Guest",
          lastName: user.last_name || "",
          email: user.email || "",
          phoneNumber: user.phone_number,
          avatarUrl:
            "profile_picture_url" in user && user.profile_picture_url
              ? (user.profile_picture_url as string)
              : null,
          memberSinceDate:
            "created_at" in user && user.created_at
              ? new Date(user.created_at).toISOString()
              : new Date("2026-06-01").toISOString(),
          verification: {
            isVerified: true,
          },
        },
        stats: {
          totalOrders: 0,
          wishlistCount: wishItems.length || 0,
          reviewsCount: 0,
        },
        addressesInfo: {
          hasDefaultAddress: false,
          defaultAddress: null,
        },
        securityStatus: {
          passwordLastUpdated: new Date().toISOString(),
          mfaEnabled: false,
        },
        notificationsPreferences: {
          emailAlertsEnabled: true,
          pushAlertsEnabled: true,
          smsAlertsEnabled: false,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (!user || !dashboardData) return null;

  return (
    <CustomerDashboardContent
      data={dashboardData}
      isLoading={loading}
      error={error}
      onRetry={fetchData}
    />
  );
}
