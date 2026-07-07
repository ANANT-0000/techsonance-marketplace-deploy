/**
 * sectionEditorEnums.ts
 *
 * Centralised enums and shared default constants consumed by every
 * landing-page section editor component under
 * `components/common/sections/`.
 *
 * Import pattern:
 *   import { LogoType, MediaType, ... } from "@/constants/sectionEditorEnums";
 */

// ─── Logo Type ────────────────────────────────────────────────────────────────
/** Controls whether the Navbar displays a text logo or an image logo. */
export enum LogoType {
  TEXT = "text",
  IMAGE = "image",
}

// ─── Hero Visual Media Type ───────────────────────────────────────────────────
/** Determines which kind of media asset is rendered in the Hero section. */
export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  EMBED = "embed",
}

// ─── Trust Badge Icon ─────────────────────────────────────────────────────────
/** Icon identifier used for Hero trust/security badge items. */
export enum TrustBadgeIcon {
  SHIELD = "shield",
  USERS = "users",
  SERVER = "server",
}

// ─── Feature Section Visual Type ─────────────────────────────────────────────
/** Determines which interactive demo widget is shown beside a feature item. */
export enum VisualType {
  STOREFRONT = "storefront",
  INVENTORY = "inventory",
  TIMELINE = "timeline",
  MARKETING = "marketing",
  ANALYTICS = "analytics",
}

// ─── CMS Control Level ────────────────────────────────────────────────────────
/** Maps `capabilities.cms_control` string values to a typed enum. */
export enum CmsControlLevel {
  BASIC = "basic",
  ADVANCED = "advanced",
  FULL_CUSTOM = "full_custom",
}

// ─── Support Level ────────────────────────────────────────────────────────────
/** Maps `capabilities.support_level` string values to a typed enum. */
export enum SupportLevel {
  EMAIL = "email",
  PRIORITY = "priority",
  DEDICATED_MANAGER = "dedicated_manager",
}

// ─── Shared Defaults ─────────────────────────────────────────────────────────
/**
 * Generic placeholder values reused across multiple editor components.
 * Use these instead of raw `"#"` / `"New Link"` literals so that a
 * single change propagates everywhere.
 */
export const SHARED_EDITOR_DEFAULTS = {
  /** Placeholder URL used when creating any new link item. */
  PLACEHOLDER_URL: "#",
  /** Generic fallback label for any newly created link. */
  NEW_LINK_LABEL: "New Link",
} as const;
