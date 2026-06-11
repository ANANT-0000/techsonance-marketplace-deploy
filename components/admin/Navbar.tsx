'use client';
import { searchImgDark, toggle_dark, toggle_light, TS_LOGO, userIcon } from "@/constants/common";
import { toggleTheme } from "@/lib/features/theme/adminThemeSlice";
import { useAppDispatch , useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { logOut } from "@/lib/features/auth/authSlice";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, LogOut, Mail } from "lucide-react";
import { NAVBAR_TEXT } from "@/constants/adminText";

export function Navbar({ title }: { title: string }) {
    const dispatch = useAppDispatch()
    const { theme } = useAppSelector((state: RootState) => state.adminTheme)
    const { isSidebarOpen } = useAppSelector((state: RootState) => state.sidebar);
        const router = useRouter();
    
        const [isMounted, setIsMounted] = useState(false);
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);
    
        const { user } = useAppSelector((state: any) => state.auth);
    
        useEffect(() => {
            setIsMounted(true);
        }, []);
    
        useEffect(() => {
            const handleClickOutside = (e: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                    setIsDropdownOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);
    
        const handleLogout = () => {
            dispatch(logOut());
            router.push('/auth');
        };
         
    const adminDetails = {
        id  :  user?.id || ''  ,
        email: user?.email || '' 
    };
    return (
        <>
            <nav className={`flex border-b-2  rounded-3xl border-gray-200 py-2 transition-colors duration-300 ease-in-out items-center justify-between  px-6   ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}>
                <div className="nav_lift flex items-center transition  duration-300 ease-in-out">
                    {!isSidebarOpen &&
                        <img src={TS_LOGO} alt="Techsonance Logo" className=" h-6 w-8   " />
                    }
                    {title && <span className={"ml-4 font-medium text-xl " + (theme === 'light' ? 'text-black' : 'text-white')}>{title}</span>}
                </div>
                <div className="nav_right flex items-center gap-4">
                    <div className={`border-2  text-[.8rem] border-black/40 rounded-full flex items-center px-3  gap-2  filter ${theme == 'light' ? '' : 'invert'}  `}>
                        <input type="text" name="search" placeholder={NAVBAR_TEXT.SEARCH_SYSTEM} className="focus:outline-none text-[1rem] px-2
                        w-30 py-1" /> <button className="focus:outline-none">
                            <img src={searchImgDark} alt="" className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="toggle_btn transition-transform duration-300 ease-in-out cursor-pointer" onClick={() => { dispatch(toggleTheme()) }}>

                        <img src={theme == 'light' ? toggle_dark : toggle_light} alt="" className={`${theme == 'light' ? 'rotate-180' : ''} h-8 w-8`} />


                    </div>
                   <div className="relative ml-auto" ref={dropdownRef}>
                {!isMounted ? (
                    /* Skeleton Loader (Server Render) */
                    <div className="flex items-center gap-3 px-3 py-1.5">
                        <div className="text-right hidden sm:block space-y-1">
                            <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
                            <div className="w-32 h-3 bg-gray-50 rounded animate-pulse" />
                        </div>
                        <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse border-2 border-gray-100" />
                    </div>
                ) : (
                    /* Real User Data (Client Render) */
                    <>
                        <button
                            onClick={() => setIsDropdownOpen((prev) => !prev)}
                            className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-right hidden sm:block">
                                <span className="block text-xs text-gray-500 leading-tight">
                                    {adminDetails.email}
                                </span>
                            </span>
                            
                            <span className="relative block">
                                <img
                                    src={userIcon}
                                    alt="Profile"
                                    className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                                />
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
                            </span>
                            
                            <ChevronDown
                                size={14}
                                className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {adminDetails.id}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{adminDetails.id}</p>
                                            <p className="text-xs text-gray-500">{NAVBAR_TEXT.ACTIVE_WORKSPACE}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <Mail size={12} className="text-gray-400 flex-shrink-0" />
                                            <span>{adminDetails.email}</span>
                                        </div>
                                        {/* <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <Building2 size={12} className="text-gray-400 flex-shrink-0" />
                                            <span className="font-mono text-gray-400">{adminDetails.companyId}</span>
                                        </div> */}
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                    <LogOut size={15} />
                                    <span>{NAVBAR_TEXT.LOGOUT}</span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
                </div>
            </nav>
        </>
    )
}