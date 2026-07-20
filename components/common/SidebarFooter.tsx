"use client";
import { User, VendorUser } from "@/constants";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { logOut } from "@/lib/features/auth/authSlice";
import { useEffect, useRef, useState } from "react";
import { SIDEBAR_FOOTER_TEXT } from "@/constants/commonText";
import { toggleSidebar } from "@/lib/features/sidebar";

export const UserMenu = ({
  user,
  role,
  expanded,
}: {
  user: Partial<User | VendorUser>;
  role: string;
  expanded: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const onLogout = () => {
    dispatch(logOut());
  };
  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close when sidebar collapses
  useEffect(() => {
    if (!expanded) setOpen(false);
  }, [expanded]);

  return (
    <div
      ref={ref}
      // onClick={() => dispatch(toggleSidebar())}
      className="mt-auto border-t border-white/[0.07] pt-2.5 relative"
    >
      {/* ── Dropdown panel — opens upward ── */}
      <div
        className={`
          absolute bottom-[calc(100%+8px)] left-0 right-0
          bg-[#151821] border border-white/[0.08] rounded-[16px]
          overflow-hidden z-50
          transition-all duration-200 origin-bottom
          ${
            open
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
              : "opacity-0 translate-y-2 scale-[0.96] pointer-events-none"
          }
        `}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3.5 border-b border-white/[0.06]">
          {user.first_name ? (
            <div className="flex items-center gap-3 mb-3">
              {/* Avatar */}
              <div className="h-10 w-10 shrink-0 rounded-[12px] bg-gradient-to-br from-[#2ecc8a] to-[#1aab6d] flex items-center justify-center text-[13px] font-bold text-white shadow-sm">
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-white truncate leading-snug">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-[11px] text-emerald-400/90 flex items-center gap-1.5 mt-0.5 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {SIDEBAR_FOOTER_TEXT.ACTIVE_WORKSPACE}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-3 opacity-70">
               <div className="h-10 w-10 shrink-0 rounded-[12px] bg-white/10 flex items-center justify-center text-white/50 shadow-sm">
                 ?
               </div>
               <div className="min-w-0">
                 <p className="text-[13.5px] font-medium text-white/70 truncate leading-snug">
                   Unknown User
                 </p>
                 <p className="text-[11px] text-white/40 mt-0.5 font-medium">
                   Profile data missing
                 </p>
               </div>
            </div>
          )}

          {/* Meta rows */}
          <div className="flex flex-col gap-1.5 mt-1">
            {user.email && (
              <div className="flex items-center gap-2.5 text-[12px] text-white/70 hover:text-white/90 transition-colors">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/40 shrink-0"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="truncate">{user.email}</span>
              </div>
            )}
            
            {user.company_id ? (
              <div className="flex items-center gap-2.5 text-[12px] text-white/70 hover:text-white/90 transition-colors">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/40 shrink-0"
                >
                  <path d="M3 21V7l9-4 9 4v14" />
                  <path d="M9 21V12h6v9" />
                </svg>
                <span className="font-mono text-[11px] tracking-wide">
                  {user.company_id}
                </span>
              </div>
            ) : (
              <div className="mt-1.5 p-2.5 rounded-[10px] bg-amber-500/10 border border-amber-500/20 flex gap-2.5 items-start">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 shrink-0 mt-0.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div className="flex-1">
                  <p className="text-[11.5px] font-medium text-amber-300 leading-tight mb-1">Workspace ID missing</p>
                  <p className="text-[10.5px] text-amber-200/70 leading-snug">Your session may be incomplete or stale. Please sign out and log in again.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-1.5">
          {/* {[
            { icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", label: "Profile settings" },
            { icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0", label: "Notifications" },
            { icon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z", label: "Appearance" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-theme-caption-lg text-white/95 transition-colors hover:bg-white/[0.06]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 shrink-0">
                <path d={icon} />
              </svg>
              {label}
            </button>
          ))} */}

          <div className="my-1 h-px bg-white/[0.1]" />

          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-red-400 transition-colors hover:bg-red-500/[0.08]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-400/80 shrink-0"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />
            </svg>
            {SIDEBAR_FOOTER_TEXT.SIGN_OUT}
          </button>
        </div>
      </div>

      {/* ── Trigger row ── */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!expanded) {
            dispatch(toggleSidebar());
          }
        }}
        className={`
          flex w-full items-center overflow-hidden rounded-[12px]
          py-2 transition-all duration-200
          ${open ? "bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" : "hover:bg-white/[0.05]"}
          ${!expanded ? "justify-center px-0 gap-0" : "px-2.5 gap-3"}
        `}
      >
        {/* Avatar */}
        <div className={`relative shrink-0 rounded-[10px] bg-gradient-to-br from-[#2ecc8a] to-[#1aab6d] flex items-center justify-center text-[11px] font-bold text-white shadow-sm ${expanded ? "h-[32px] w-[32px]" : "h-[30px] w-[30px] mx-auto"}`}>
          {user.first_name?.[0] || "?"}
          {user.last_name?.[0] || ""}
          <span className="absolute -bottom-0.5 -right-0.5 h-[10px] w-[10px] rounded-full bg-emerald-500 border-[2.5px] border-[#0f1117]" />
        </div>

        {/* Name + role — hidden when collapsed */}
        <div
          className={`
            flex-1 min-w-0 text-left overflow-hidden
            transition-all duration-200
            ${expanded ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0"}
          `}
        >
          <p className="truncate text-[13px] font-semibold text-white/95 leading-snug">
            {user.first_name ? `${user.first_name} ${user.last_name || ""}` : "Unknown"}
          </p>
          <p className="truncate text-[11px] text-white/60">{role}</p>
        </div>

        {/* Chevron — hidden when collapsed */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`
            text-white/80 shrink-0
            transition-[transform,max-width,opacity] duration-200
            ${expanded ? "max-w-[13px] opacity-100" : "max-w-0 opacity-0"}
            ${open ? "rotate-180" : "rotate-0"}
          `}
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </div>
  );
};
