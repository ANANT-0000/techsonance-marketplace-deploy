'use client';
import { BAR_TOGGLE_ICON, TS_LOGO,  } from "@/constants/common"
import { toggleSidebar, type isSidebarType } from "@/lib/features/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { NavLinkType } from "@/utils/Types";

type SidebarProps = {
    basePath?: string;
    NAV_LINKS: NavLinkType[];
    id?: string | number;
}

export function Sidebar({ basePath = " ", NAV_LINKS, id = 32 }: SidebarProps) {
    const { isSidebarOpen }: isSidebarType = useAppSelector((state: RootState) => state.sidebar);
    const dispatch = useAppDispatch()
    const path = usePathname();
    return (
        <>
            <aside className={`fixed flex flex-col top-0 left-0 h-full transition ease-in-out bg-gray-800 text-white shadow-lg px-2 `}>
                <button onClick={() => dispatch(toggleSidebar())} className="flex justify-between items-center my-3 ml-1 h-6 ">
                    {
                        isSidebarOpen && <img src={TS_LOGO} alt="Techsonance Logo" className="ml-1 h-8 w-10 rounded-m filter brightness-150" />
                    }
                    <img src={BAR_TOGGLE_ICON} alt="Toggle Sidebar" className={" relative w-6 h-6   transition ease-in-out " + (isSidebarOpen ? "rotate-180 right-4" : "left-0 ml-3")} />
                </button>
                {
                    NAV_LINKS.map((linkObj, index) => (

                        <Link href={Object.values(linkObj)[0] == null ? `${basePath}` : `${basePath}/${Object.values(linkObj)[0]}`} key={index} className={`flex gap-2 rounded-2xl items-center px-4 py-2 my-2 ${path === `${basePath}/${Object.values(linkObj)[0]}` ? "bg-gray-700" : ""} hover:bg-gray-700 transition ease-in-out ` + (isSidebarOpen ? "px-4" : "px-2")}>
                            <DynamicIcon name={`${Object.values(linkObj)[1] as IconName}`} className="w-6 h-6 " />
                            {
                                isSidebarOpen && <span className="text-sm">{Object.keys(linkObj)[0]}</span>
                            }

                        </Link>

                    ))
                }
            </aside>
        </>
    )
}