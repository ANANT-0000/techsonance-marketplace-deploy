"use client"
import { getVendorInnerSidebarLinks } from "@/constants"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export const InnerSideBar = ({
    vendorId,
    selectedMenu,
}: {
    vendorId: string
    selectedMenu: string
}) => {
    const path = usePathname()
    const [isClosed, setIsClosed] = useState(false)

    const links = getVendorInnerSidebarLinks(vendorId, selectedMenu)
    useEffect(() => {
        const allPaths = links.flatMap((s) =>
            s.sections.flatMap((sec) => sec.list?.map((item) => item.path) ?? [])
        )
        const isMatch = allPaths.some((p) => p === path)
        if (!isMatch) setIsClosed(true)
    }, [path, links])

    return (
        <div
            className={`
        relative flex flex-col bg-white border-r border-gray-200 h-screen
        overflow-y-auto overflow-x-hidden
        transition-all duration-300 ease-in-out
        ${isClosed ? "w-20" : "min-w-44 w-64"}
      `}
        >
            <div className="sticky top-0 z-10 flex items-center justify-end bg-white border-b border-gray-100 px-3 py-3 w-full">
                {!isClosed && (
                    <span className="mr-auto text-xs font-semibold uppercase tracking-widest text-gray-400 truncate">
                        {selectedMenu}
                    </span>
                )}
                <button
                    onClick={() => setIsClosed((v) => !v)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    aria-label={isClosed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <DynamicIcon name={isClosed ? "panel-left-open" : "panel-left-close"} size={24} />
                </button>
            </div>

            <aside className="flex-1 py-3 space-y-6 w-full">
                {links.map((section) => (
                    <div key={section.menu}>
                        {section.sections.map((group) => (
                            <div key={group.section} className="mb-1">
                                {!isClosed && group.section && (
                                    <p className="px-4 pt-2 pb-1 text-[16px] font-medium text-gray-400 truncate mb-2">
                                        {group.section}
                                    </p>
                                )}
                                <ul>
                                    {group.list?.map((item) => {
                                        const isActive = path === item.path
                                        return (
                                            <li key={item.title}>
                                                <Link
                                                    href={item.path ?? "#"}
                                                    title={isClosed ? item.title : undefined}
                                                    className={`
                            group relative flex items-center gap-3 mx-2 px-2.5 py-2 rounded-lg
                            text-sm font-medium transition-all duration-150
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
                                                        <DynamicIcon name={item.icon as IconName} size={24} />
                                                    </span>

                                                    {/* Label — hidden when collapsed */}
                                                    {!isClosed && (
                                                        <span className="truncate transition-opacity duration-200 ease-in-out">
                                                            {item.title}
                                                        </span>
                                                    )}

                                                    {/* Tooltip on hover when collapsed */}
                                                    {isClosed && (
                                                        <span className="
                              pointer-events-none absolute left-full ml-2 z-50
                              whitespace-nowrap rounded-md bg-gray-900 text-white
                              text-xs px-2 py-1 opacity-0 group-hover:opacity-100
                              transition-opacity duration-150 shadow-md
                            ">
                                                            {item.title}
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                ))}
            </aside>
        </div>
    )
}