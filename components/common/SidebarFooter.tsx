'use client';
import { User, VendorUser } from "@/constants";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { logOut } from "@/lib/features/auth/authSlice";
import { useEffect, useRef, useState } from "react";


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
      className="mt-auto border-t border-white/[0.07] pt-2.5 relative"
    >
      {/* ── Dropdown panel — opens upward ── */}
      <div
        className={`
          absolute bottom-[calc(100%+6px)] left-0 right-0
          bg-[#1a1d27] border border-white/[0.10] rounded-[14px]
          overflow-hidden z-50
          transition-all duration-180 origin-bottom
          ${
            open
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
              : "opacity-0 translate-y-1.5 scale-[0.98] pointer-events-none"
          }
        `}
        style={{ boxShadow: "0 -8px 32px rgba(0,0,0,0.45)" }}
      >
        {/* Header */}
        <div className="px-3.5 pt-3.5 pb-3 border-b border-white/[0.08]">
 {  user.first_name &&       <div className="flex items-center gap-2.5 mb-2.5">
            {/* Avatar */}
            <div className="h-9 w-9 shrink-0 rounded-[10px] bg-gradient-to-br from-[#2ecc8a] to-[#1aab6d] flex items-center justify-center text-[12px] font-bold text-white">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate leading-snug">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-[11px] text-white/35 flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                Active workspace
              </p>
            </div>
          </div>}

          {/* Meta rows */}
          {user.email && (
            <div className="flex items-center gap-2 py-[3px] text-[11.5px] text-white/85">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/25 shrink-0"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <span className="truncate">{user.email}</span>
            </div>
          )}
          {user.company_id && (
            <div className="flex items-center gap-2 py-[3px] text-[11.5px] text-white/85">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/75 shrink-0"><path d="M3 21V7l9-4 9 4v14"/><path d="M9 21V12h6v9"/></svg>
              <span className="font-mono text-[11px] text-white/80">{user.company_id}</span>
            </div>
          )}
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
              className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] text-white/95 transition-colors hover:bg-white/[0.06]"
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
            className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] text-red-400 transition-colors hover:bg-red-400/[0.10]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400/70 shrink-0">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>

      {/* ── Trigger row ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          flex w-full items-center gap-2.5 overflow-hidden rounded-[10px]
          px-2.5 py-2 transition-colors duration-150
          ${open ? "bg-white/[0.09]" : "hover:bg-white/[0.06]"}
          ${!expanded ? "justify-center" : ""}
        `}
      >
        {/* Avatar */}
        <div className="relative h-[30px] w-[30px] shrink-0 rounded-[9px] bg-gradient-to-br from-[#2ecc8a] to-[#1aab6d] flex items-center justify-center text-[11px] font-bold text-white">
          {user.first_name?.[0]}{user.last_name?.[0]}
          <span className="absolute -bottom-px -right-px h-[9px] w-[9px] rounded-full bg-emerald-400 border-2 border-[#0f1117]" />
        </div>

        {/* Name + role — hidden when collapsed */}
        <div
          className={`
            flex-1 min-w-0 text-left overflow-hidden
            transition-[max-width,opacity] duration-200
            ${expanded ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0"}
          `}
        >
          <p className="truncate text-[12.5px] font-semibold text-white leading-snug">
            {user.first_name} {user.last_name}
          </p>
          <p className="truncate text-[10.5px] text-white/85">
            {role}
          </p>
        </div>

        {/* Chevron — hidden when collapsed */}
        <svg
          width="13" height="13"
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
}