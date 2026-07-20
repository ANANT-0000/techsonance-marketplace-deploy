"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { toggleSidebar, type isSidebarType } from "@/lib/features/sidebar";
import { RootState } from "@/lib/store";
import { NavLinkType } from "@/utils/Types";
import { UserMenu } from "./SidebarFooter";

// ─── Constants ────────────────────────────────────────────────────────────────

const RESERVED_KEYS = new Set(["icon", "section", "divider"]);
const COLLAPSED_W = 64; // px — icon-only
const EXPANDED_W = 224; // px — full

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** The route label key is whichever key is NOT a reserved meta key */
function getLabel(linkObj: NavLinkType): string {
  return Object.keys(linkObj).find((k) => !RESERVED_KEYS.has(k)) ?? "";
}

/** Route value: null → basePath, string → basePath/value */
function getRouteValue(linkObj: NavLinkType): string | null {
  const key = getLabel(linkObj);
  const val = linkObj[key];
  return val === undefined || val === null ? null : String(val);
}

function getHref(basePath: string, linkObj: NavLinkType): string {
  const val = getRouteValue(linkObj);
  return val == null ? basePath : `${basePath}/${val}`;
}

function getIcon(linkObj: NavLinkType): IconName {
  return (linkObj.icon as IconName) ?? "circle";
}

function getSection(linkObj: NavLinkType): string | undefined {
  return linkObj.section as string | undefined;
}

function hasDivider(linkObj: NavLinkType): boolean {
  return !!linkObj.divider;
}

// ─── Props ────────────────────────────────────────────────────────────────────

type SidebarProps = {
  basePath?: string;
  NAV_LINKS: NavLinkType[];
  id?: string | number;
  user?: {
    name: string;
    role: string;
    initials: string;
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Tooltip({ label, show }: { label: string; show: boolean }) {
  if (!show) return null;
  return (
    <span
      role="tooltip"
      className="
        pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50
        -translate-y-1/2 whitespace-nowrap rounded-lg
        border border-white/10 bg-[#1e2433]
        px-2.5 py-[6px] text-theme-caption font-medium text-white
        opacity-0 transition-opacity duration-150
        group-hover/navitem:opacity-100
      "
    >
      {/* Arrow */}
      <span
        className="
        absolute -left-[5px] top-1/2 -translate-y-1/2
        border-[5px] border-transparent border-r-[#1e2433]
      "
      />
      {label}
    </span>
  );
}

function SectionLabel({
  label,
  expanded,
}: {
  label: string;
  expanded: boolean;
}) {
  return (
    <li
      aria-hidden="true"
      className={`
        w-full overflow-hidden px-2.5 text-theme-tiny font-semibold uppercase
        tracking-[0.08em] text-white/85 transition-all duration-200
        ${expanded ? "max-h-14 pt-4 pb-1 opacity-100" : "max-h-0 py-0 opacity-0"}
      `}
    >
      <span className="block w-full whitespace-normal break-words leading-tight">
        {label}
      </span>
    </li>
  );
}

function NavItem({
  href,
  label,
  icon,
  isActive,
  expanded,
}: {
  href: string;
  label: string;
  icon: IconName;
  isActive: boolean;
  expanded: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={`
          relative flex items-center overflow-hidden
          py-[10px] select-none rounded-[10px]
          transition-all duration-200 ease-out
          ${expanded ? "px-2.5 mx-1.5 gap-3" : "justify-center mx-auto w-full px-0 gap-0"}
          ${
            isActive
              ? "bg-[#4f8ef7]/[0.12] text-[#4f8ef7] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
              : "text-white/60 hover:bg-white/[0.06] hover:text-white/95"
          }
        `}
      >
        {/* Active indicator bar */}
        {isActive && (
          <span className="absolute left-0 top-[22%] h-[56%] w-[3px] rounded-r-[3px] bg-[#4f8ef7]" />
        )}

        {/* Icon */}
        <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center">
          <DynamicIcon
            name={icon}
            className="text-white  h-[24px] w-[24px]"
            fallback={() => null}
          />
        </span>

        {/* Label — slides in/out */}
        <span
          className={`
            overflow-hidden whitespace-nowrap text-[13.5px] font-medium leading-none text-white
            transition-[max-width,opacity] duration-200
            ${expanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"}
          `}
        >
          {label}
        </span>

        {/* Tooltip only when collapsed */}
        <Tooltip label={label} show={!expanded} />
      </Link>
    </li>
  );
}

function Divider() {
  return <li className="mx-1 my-1.5 h-px bg-white/[0.07]" aria-hidden="true" />;
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export function Sidebar({ basePath = "", NAV_LINKS }: SidebarProps) {
  const { isSidebarOpen }: isSidebarType = useAppSelector(
    (state: RootState) => state.sidebar,
  );
  const { role, user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const path = usePathname();

  const [mounted, setMounted] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const expanded = isSidebarOpen;

  // ── Auto-collapse on route change ──────────────────────────────────────────
  useEffect(() => {
    if (mounted && expanded) {
      // If we navigate to a new route, close the sidebar
      dispatch(toggleSidebar());
    }
  }, [path]);

  // ── Auto-collapse on outside click ───────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (expanded && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        dispatch(toggleSidebar());
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded, dispatch]);

  // ── Build render list with section headers inserted ──────────────────────
  type RenderItem =
    | { kind: "section"; label: string }
    | { kind: "divider" }
    | { kind: "link"; linkObj: NavLinkType };

  const renderList: RenderItem[] = [];
  let lastSection = "";

  NAV_LINKS.forEach((linkObj) => {
    if (hasDivider(linkObj)) {
      renderList.push({ kind: "divider" });
    }

    const section = getSection(linkObj);
    if (section && section !== lastSection) {
      renderList.push({ kind: "section", label: section });
      lastSection = section;
    }

    renderList.push({ kind: "link", linkObj });
  });

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <aside
      ref={sidebarRef}
      style={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
      className={` left-0 top-0 z-40  flex h-screen flex-col  bg-[#0f1117]  transition-[width] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden px-[14px] py-4 ${expanded ? "rounded-r-2xl" : ""}
     `}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className={` relative py-1 w-full
          mb-2 flex items-center border-b border-white/[0.07] pb-3.5
          ${expanded ? "justify-between px-1" : "justify-center"}
        `}
      >
        {/* Logo mark + wordmark */}
        <button
          className={`flex items-center overflow-hidden w-full ${expanded ? "justify-between mx-1.5" : "justify-center"}`}
          onClick={() => dispatch(toggleSidebar())}
        >
          {isSidebarOpen && (
            <div
              className="
              h-[30px] w-[30px] shrink-0 rounded-[10px]
              bg-gradient-to-br from-[#4f8ef7] to-[#7c5cfc]
              flex items-center justify-center
              text-theme-xxs font-bold text-white shadow-md shadow-indigo-500/20
            "
            >
              TS
            </div>
          )}

          <span
            className={`block rounded-[10px] p-1 text-white/50 hover:text-white/90 hover:bg-white/[0.06] transition-all duration-200 ${!expanded ? "mx-auto" : ""}`}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <DynamicIcon
              name={!expanded ? "panel-left-open" : "panel-left-close"}
              size={20}
            />
          </span>
        </button>
      </div>

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden mt-1"
        aria-label="Main navigation"
      >
        <ul className="flex flex-col gap-1 list-none p-0 m-0 pb-4">
          {renderList.length === 0 ? (
            <li className="px-3 py-8 text-center mt-4">
              <div className="flex flex-col items-center gap-3 opacity-60">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                  <DynamicIcon name="layout-dashboard" size={20} className="text-white/50" />
                </div>
                {expanded && (
                  <p className="text-theme-caption text-white/60 leading-relaxed font-medium px-2">
                    Your navigation is empty.<br />Add modules to get started.
                  </p>
                )}
              </div>
            </li>
          ) : (
            renderList.map((item, i) => {
              if (item.kind === "divider") {
                return <Divider key={`div-${i}`} />;
              }

              if (item.kind === "section") {
                return (
                  <SectionLabel
                    key={`sec-${i}`}
                    label={item.label}
                    expanded={expanded}
                  />
                );
              }

              const { linkObj } = item;
              const label = getLabel(linkObj);
              const icon = getIcon(linkObj);
              const href = getHref(basePath, linkObj);
              const active =
                href.length > 0 && (path === href || path.startsWith(href + "/"));

              return (
                <NavItem
                  key={`link-${i}`}
                  href={href}
                  label={label}
                  icon={icon}
                  isActive={active}
                  expanded={expanded}
                />
              );
            })
          )}
        </ul>
      </nav>

      {/* ── Footer / User ──────────────────────────────────────────────────── */}
      {mounted && (
        user ? (
          <UserMenu user={user} role={role} expanded={expanded} />
        ) : (
          <div className="mt-auto border-t border-white/[0.07] pt-4 pb-2 relative">
            {expanded ? (
              <div className="px-3">
                <div className="p-3.5 bg-red-500/[0.08] border border-red-500/20 rounded-[14px] text-center shadow-sm">
                  <p className="text-[13px] font-semibold text-red-400/90 mb-1.5">Session Expired</p>
                  <p className="text-[11.5px] text-white/60 mb-3.5 leading-snug">Please log in again to securely continue your session.</p>
                  <Link href="/vendor/login" className="inline-flex w-full justify-center items-center gap-2 rounded-[10px] bg-red-500/10 hover:bg-red-500/20 px-3 py-2 text-[12.5px] font-medium text-red-300 transition-all duration-200 border border-red-500/20 shadow-sm hover:shadow-md hover:border-red-500/30">
                    Log in
                  </Link>
                </div>
              </div>
            ) : (
              <Link href="/vendor/login" className="mx-auto flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-red-500/[0.08] border border-red-500/20 text-red-400 hover:bg-red-500/15 hover:border-red-500/30 transition-all duration-200 shadow-sm hover:shadow-md" title="Session Expired - Log in">
                <DynamicIcon name="log-in" size={20} />
              </Link>
            )}
          </div>
        )
      )}
    </aside>
  );
}
