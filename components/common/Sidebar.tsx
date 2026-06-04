'use client';

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { toggleSidebar, type isSidebarType } from "@/lib/features/sidebar";
import { RootState } from "@/lib/store";
import { NavLinkType } from "@/utils/Types";
import { UserMenu } from "./SidebarFooter";
import { logOut } from "@/lib/features/auth/authSlice";

// ─── Constants ────────────────────────────────────────────────────────────────

const RESERVED_KEYS = new Set(["icon", "section", "divider"]);
const COLLAPSED_W = 64;   // px — icon-only
const EXPANDED_W = 224;  // px — full

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
        px-2.5 py-[6px] text-[12px] font-medium text-white
        opacity-0 transition-opacity duration-150
        group-hover/navitem:opacity-100
      "
    >
      {/* Arrow */}
      <span className="
        absolute -left-[5px] top-1/2 -translate-y-1/2
        border-[5px] border-transparent border-r-[#1e2433]
      " />
      {label}
    </span>
  );
}

function SectionLabel({ label, expanded }: { label: string; expanded: boolean }) {
  return (
    <li
      aria-hidden="true"
      className={`
        overflow-hidden whitespace-nowrap px-2.5 text-[10px] font-semibold
        uppercase tracking-[0.08em] text-white/85
        transition-all duration-200
        ${expanded ? "max-h-8 pt-4 pb-1 opacity-100" : "max-h-0 py-0 opacity-0"}
      `}
    >
      {label}
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
          relative flex items-center gap-3 overflow-hidden
         px-2.5 py-[9px] select-none
          transition-colors duration-150
          ${expanded ? "" : "justify-center"}
          ${isActive
            ? "bg-[#4f8ef7]/[0.15] text-[#4f8ef7]"
            : "text-white/50 hover:bg-white/[0.07] hover:text-white/90"
          }
        `}
      >
        {/* Active indicator bar */}
        {isActive && (
          <span className="absolute left-0 top-[22%] h-[56%] w-[3px] rounded-r-[3px] bg-[#4f8ef7]" />
        )}

        {/* Icon */}
        <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center">
          <DynamicIcon name={icon} className="text-white  h-[24px] w-[24px]" fallback={() => null} />
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

  // Hover state — sidebar expands while hovered OR while pinned open
  const [hovered, setHovered] = useState(false);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const expanded = isSidebarOpen || hovered;

  const handleMouseEnter = useCallback(() => {
    // 1. Clear any pending leave actions so it doesn't accidentally close
    if (leaveTimer.current) clearTimeout(leaveTimer.current);

    // 2. Wait 500ms before triggering the hover state
    enterTimer.current = setTimeout(() => {
      setHovered(true);
    }, 500);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // 1. If the mouse leaves before 500ms, cancel the expansion entirely
    if (enterTimer.current) clearTimeout(enterTimer.current);

    // 2. Keep your existing small delay so accidental quick mouse-outs don't flicker
    leaveTimer.current = setTimeout(() => {
      setHovered(false);
    }, 120);
  }, []);

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

      style={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
      className={` left-0 top-0 z-40  flex h-screen flex-col  bg-[#0f1117]  transition-[width] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden px-[14px] py-4 ${expanded ? 'rounded-r-2xl' : ''}
     ` }
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className={` relative py-1 w-full
          mb-2 flex items-center border-b border-white/[0.07] pb-3.5
          ${expanded ? "justify-between px-1" : "justify-between "}
        `}
      >
        {/* Logo mark + wordmark */}
        <button className="flex items-center justify-between overflow-hidden w-full  mx-1 "
          onClick={() => dispatch(toggleSidebar())}>
          {isSidebarOpen && <div
            className="
              h-7 w-7 shrink-0 rounded-lg
              bg-gradient-to-br from-[#4f8ef7] to-[#7c5cfc]
              flex items-center justify-center
              text-[11px] font-bold text-white
            "
          >
            TS
          </div>}


          <span
            className="block rounded-md text-gray-400 hover:text-gray-100  transition-colors"
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <DynamicIcon name={!expanded ? "panel-left-open" : "panel-left-close"} size={24} />
          </span>
        </button>

      </div>

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden" aria-label="Main navigation">
        <ul className="flex flex-col gap-0.5 list-none p-0 m-0">
          {renderList.map((item, i) => {
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
            const active = href.length > 0 && (path === href || path.startsWith(href + "/"));

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
          })}
        </ul>
      </nav>

      {/* ── Footer / User ──────────────────────────────────────────────────── */}
      {user && (
        <UserMenu
          user={user}
          role={role}
          expanded={expanded}
        />
      )}
    </aside>
  );
}