"use client"
import { getVendorInnerSidebarLinks } from "@/constants"
import { INNER_SIDEBAR_TEXT } from "@/constants/vendorText"
import { AnimatePresence } from "framer-motion";
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
export const InnerSideBar = ({
    selectedMenu,
}: {
    selectedMenu: string
}) => {
    const path = usePathname()
    const [isExpanded, setIsExpanded] = useState(true)
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const links = getVendorInnerSidebarLinks(selectedMenu)

    // ── Empty State ──────────────────────────────────────────────────────────
    if (!links || links.length === 0) {
        return (
            <div
                className={`mr-1 left-0 top-0 z-30 flex h-full flex-col bg-white transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden px-3 pb-4 border-r border-slate-100 ${isExpanded ? "min-w-44 w-64 rounded-r-3xl shadow-[4px_0_24px_rgb(0,0,0,0.02)]" : "w-[72px]"}`}
            >
                <div className="flex h-full flex-col items-center justify-center text-center px-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 mb-3">
                        <DynamicIcon name="folder-x" className="h-6 w-6 text-slate-400" />
                    </div>
                    {isExpanded && (
                        <div className="animate-in fade-in zoom-in duration-300">
                            <h3 className="text-[13px] font-semibold text-slate-700 mb-1">No Navigation</h3>
                            <p className="text-[11px] leading-relaxed text-slate-500">
                                This module has no menu items configured.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <AnimatePresence mode="wait">
            <div
                className={`mr-1 left-0 top-0 z-30 flex h-full flex-col bg-white transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden px-3 pb-4 border-r border-slate-100 ${isExpanded ? "min-w-44 w-64 rounded-r-3xl shadow-[4px_0_24px_rgb(0,0,0,0.02)]" : "w-[72px]"}`}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-2 py-4 w-full">
                    <motion.span
                        initial={false}
                        animate={{
                            opacity: isExpanded ? 1 : 0,
                            width: isExpanded ? "auto" : 0,
                        }}
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                        className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 truncate overflow-hidden whitespace-nowrap"
                    >
                        {selectedMenu}
                    </motion.span>
                    <button
                        onClick={() => setIsExpanded((v) => !v)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all duration-200 ml-auto shrink-0"
                        aria-label={isExpanded ? INNER_SIDEBAR_TEXT.ARIA_COLLAPSE : INNER_SIDEBAR_TEXT.ARIA_EXPAND}
                    >
                        {mounted ? (
                            <DynamicIcon name={isExpanded ? "panel-left-close" : "panel-left-open"} size={20} strokeWidth={2} />
                        ) : (
                            <div className="w-5 h-5" />
                        )}
                    </button>
                </div>

                <aside className="flex-1 py-4 space-y-6 w-full custom-scrollbar overflow-y-auto overflow-x-hidden">
                    {links.map((section) => (
                        <div key={section.menu}>
                            {section.sections.map((group) => (
                                <div key={group.section} className="mb-2">
                                    {group.section && (
                                        <motion.p
                                            initial={false}
                                            animate={{
                                                opacity: isExpanded ? 1 : 0,
                                                height: isExpanded ? "auto" : 0,
                                                marginBottom: isExpanded ? 12 : 0,
                                            }}
                                            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                                            className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-widest truncate overflow-hidden"
                                        >
                                            {group.section}
                                        </motion.p>
                                    )}
                                    <ul className="space-y-1">
                                        {group.list?.map((item) => {
                                            const isActive = path === item.path
                                            return (
                                                <motion.li
                                                    key={item.title}
                                                    transition={{ duration: 0.2 }} 
                                                    initial={{ opacity: 0, y: 8 }} 
                                                    animate={{ opacity: 1, y: 0 }} 
                                                    exit={{ opacity: 0, y: -8 }}            
                                                >
                                                    <Link
                                                        href={item.path ?? "#"}
                                                        title={isExpanded ? item.title : undefined}
                                                        className={`
                                                            group relative flex items-center rounded-xl
                                                            text-[13px] font-medium transition-all duration-200 ease-out
                                                            ${isExpanded ? "mx-1 px-3 py-2.5" : "justify-center mx-auto w-full px-0 py-2.5"}
                                                            ${isActive
                                                                ? "bg-indigo-50/80 text-indigo-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-indigo-500/10"
                                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                                            }
                                                          `}
                                                    >
                                                        {/* Active indicator bar */}
                                                        {isActive && (
                                                            <span className="absolute left-0 top-[20%] h-[60%] w-[3px] bg-indigo-500 rounded-r-[3px]" />
                                                        )}

                                                        <span className={`shrink-0 transition-transform duration-200 ${isActive ? "text-indigo-500" : "text-slate-400 group-hover:text-slate-600 group-hover:scale-110"}`}>
                                                            {mounted ? (
                                                                <DynamicIcon name={item.icon as IconName} size={20} strokeWidth={isActive ? 2.5 : 2} />
                                                            ) : (
                                                                <div className="w-5 h-5" />
                                                            )}
                                                        </span>

                                                        {/* Label — hidden when collapsed */}
                                                        <motion.span
                                                            initial={false}
                                                            animate={{
                                                                width: isExpanded ? "auto" : 0,
                                                                opacity: isExpanded ? 1 : 0,
                                                                marginLeft: isExpanded ? 12 : 0,
                                                            }}
                                                            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                                                            className="text-wrap overflow-hidden whitespace-nowrap text-[13px] font-medium"
                                                        >
                                                            {item.title}
                                                        </motion.span>

                                                        {/* Tooltip on hover when collapsed */}
                                                        {!isExpanded && (
                                                            <span className="
                                                              pointer-events-none absolute left-full ml-3 z-50
                                                              whitespace-nowrap rounded-lg bg-slate-900 text-white
                                                              text-[11px] font-medium px-2.5 py-1.5 opacity-0 group-hover:opacity-100
                                                              transition-opacity duration-200 shadow-xl border border-slate-700
                                                            ">
                                                                {item.title}
                                                            </span>
                                                        )}
                                                    </Link>
                                                </motion.li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ))}
                </aside>
            </div>
        </AnimatePresence>
    )
}