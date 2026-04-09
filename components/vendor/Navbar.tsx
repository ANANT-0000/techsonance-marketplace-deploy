'use client';
import { userIcon } from '@/constants/common';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { useRef, useState, useEffect } from 'react';
import { LogOut, Building2, Mail, Globe, ChevronDown } from 'lucide-react';
import { logOut } from '@/lib/features/auth/authSlice';
import { useRouter } from 'next/navigation';

export default function Navbar({ title }: { title: string }) {
    const { isSidebarOpen } = useAppSelector((state: any) => state.sidebar);
    const router = useRouter();
    const [vendorDetails, setVendorDetails] = useState({
        companyName: '',
        companyEmail: '',
        // companyDomain: '',
        companyId: '',
        country_code: '',
        phone_number: '',
        first_name: '',
        last_name: ''
    });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useAppSelector((state: any) => state.auth);
    const isVendor = user?.role === 'vendor';
    useEffect(() => {
        if (isVendor) {
            setVendorDetails({
                companyName: user?.store_name || '',
                companyEmail: user?.email || '',
                // companyDomain: user?.companyDomain || '',
                companyId: user?.company_id || '',
                first_name: user?.first_name || '',
                last_name: user?.last_name || '',
                country_code: user?.country_code || '',
                phone_number: user?.phone_number || ''
            });
        }
    }, [user, isVendor]);
    const dispatch = useAppDispatch();
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
        console.log('Logging out...');
        dispatch(logOut());
        router.push('/auth/vendorLogin');
    };

    return (
        <nav className="w-full py-3 px-4 border-b border-gray-200 bg-white flex justify-between items-center">

            {title && <h1 className="text-xl font-semibold text-gray-800">{title}</h1>}


            <div className="relative ml-auto" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{vendorDetails.first_name} {vendorDetails.last_name}</p>
                        <p className="text-xs text-gray-500 leading-tight">{vendorDetails.companyEmail}</p>
                    </div>
                    <div className="relative">
                        <img
                            src={userIcon}
                            alt="Profile"
                            className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
                    </div>
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
                                    {vendorDetails.first_name.charAt(0)}{vendorDetails.last_name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{vendorDetails.first_name} {vendorDetails.last_name}</p>
                                    <p className="text-xs text-gray-500">Active workspace</p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Mail size={12} className="text-gray-400 flex-shrink-0" />
                                    <span>{vendorDetails.companyEmail}</span>
                                </div>
                                {/* <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Globe size={12} className="text-gray-400 flex-shrink-0" />
                                    <span>{vendorDetails.companyDomain}</span>
                                </div> */}
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Building2 size={12} className="text-gray-400 flex-shrink-0" />
                                    <span className="font-mono text-gray-400">{vendorDetails.companyId}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                            <LogOut size={15} />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}