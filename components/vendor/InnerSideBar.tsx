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
    const [isClosed, setIsClosed] = useState(false)
    const [hovered, setHovered] = useState(false);
    const [mounted, setMounted] = useState(false);
    const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const expanded = isClosed || hovered;

    const handleMouseEnter = useCallback(() => {

        if (leaveTimer.current) clearTimeout(leaveTimer.current);
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

    useEffect(() => {
        setMounted(true);
    }, []);

    const links = getVendorInnerSidebarLinks(selectedMenu)
    useEffect(() => {
        const allPaths = links.flatMap((s) =>
            s.sections.flatMap((sec) => sec.list?.map((item) => item.path) ?? [])
        )
        const isMatch = allPaths.some((p) => p !== path)
        if (isMatch) setIsClosed(false)
    }, [])
    return (
        <AnimatePresence mode="wait">
            <div
                className={`mr-1
        left-0 top-0 z-30 flex h-full flex-col  bg-white  transition-[width] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden px-[10px] pb-4 border-r border-gray-200 
        ${!expanded ? "w-20" : "min-w-44 w-60 rounded-r-2xl"}
      `}
            >
                <div className="sticky top-0 z-10 flex items-center justify-end bg-white border-b border-gray-100 px-3 py-3 w-full">
                    <motion.span
                        initial={false}
                        animate={{
                            opacity: isClosed ? 1 : 0,
                            width: isClosed ? "auto" : 0,
                            marginRight: isClosed ? "auto" : 0,
                        }}
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                        className="text-theme-caption font-semibold uppercase tracking-widest text-gray-400 truncate overflow-hidden whitespace-nowrap"
                    >
                        {selectedMenu}
                    </motion.span>
                    <button
                        onClick={() => setIsClosed((v) => !v)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors ml-auto"
                        aria-label={expanded ? INNER_SIDEBAR_TEXT.ARIA_COLLAPSE : INNER_SIDEBAR_TEXT.ARIA_EXPAND}
                    >
                        {mounted ? (
                            <DynamicIcon name={!expanded ? "panel-left-open" : "panel-left-close"} size={24} />
                        ) : (
                            <div className="w-6 h-6" />
                        )}
                    </button>
                </div>





                <aside className="flex-1 py-3 space-y-6 w-full"  >
                    {links.map((section) => (
                        <div key={section.menu}>
                            {section.sections.map((group) => (
                                <div key={group.section} className="mb-1">
                                    {group.section && (
                                        <motion.p
                                            initial={false}
                                            animate={{
                                                opacity: expanded ? 1 : 0,
                                                height: expanded ? "auto" : 0,
                                                marginBottom: expanded ? 8 : 0,
                                            }}
                                            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                                            className="px-4 pt-2 pb-1 text-theme-body font-medium text-gray-400 truncate overflow-hidden"
                                        >
                                            {group.section}
                                        </motion.p>
                                    )}
                                    <ul>
                                        {group.list?.map((item) => {
                                            const isActive = path === item.path
                                            return (
                                                <motion.li
                                                    key={item.title}
                                                    transition={{ duration: 0.18 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}            >
                                                    <Link
                                                        href={item.path ?? "#"}
                                                        title={expanded ? item.title : undefined}
                                                        className={`
                                                            group relative flex items-center mx-2 px-2.5 py-2 rounded-lg
                                                            text-theme-body-sm font-medium transition-all duration-150
                                                            ${isActive
                                                                ? "bg-blue-50 text-blue-600"
                                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                            }
                                                          `}
                                                    >
                                                        {/* Active indicator bar */}
                                                        {isActive && (
                                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-full" />
                                                        )}

                                                        <span className={`shrink-0 ${isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"}`}>
                                                            {mounted ? (
                                                                <DynamicIcon name={item.icon as IconName} size={24} />
                                                            ) : (
                                                                <div className="w-6 h-6" />
                                                            )}
                                                        </span>

                                                        {/* Label — hidden when collapsed */}
                                                        <motion.span
                                                            initial={false}
                                                            animate={{
                                                                width: expanded ? "auto" : 0,
                                                                opacity: expanded ? 1 : 0,
                                                                marginLeft: expanded ? 12 : 0,
                                                            }}
                                                            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                                                            className="text-wrap overflow-hidden whitespace-nowrap text-theme-body-sm font-medium"
                                                        >
                                                            {item.title}
                                                        </motion.span>

                                                        {/* Tooltip on hover when collapsed */}
                                                        {!expanded && (
                                                            <span className="
                              pointer-events-none absolute left-full ml-2 z-50
                              whitespace-nowrap rounded-md bg-gray-900 text-white
                              text-theme-caption px-2 py-1 opacity-0 group-hover:opacity-100
                              transition-opacity duration-150 shadow-md
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