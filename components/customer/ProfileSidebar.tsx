'use client';
import { useEffect, useReducer } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import type { RootState } from '@/lib/store';
import { logOut } from '@/lib/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { ChevronLeft } from 'lucide-react';
import { PROFILE_SIDEBAR_TEXT } from '@/constants/customerText';

const ProfileSidebarLink = [
    { name: PROFILE_SIDEBAR_TEXT.LINKS.OVERVIEW, path: '/customer', icon: 'user' },
    { name: PROFILE_SIDEBAR_TEXT.LINKS.ORDERS, path: '/orders', icon: 'shopping-bag' },
    { name: PROFILE_SIDEBAR_TEXT.LINKS.CART, path: '/cart', icon: 'shopping-cart' },
    { name: PROFILE_SIDEBAR_TEXT.LINKS.WISHLIST, path: '/wishlist', icon: 'heart' },
    { name: PROFILE_SIDEBAR_TEXT.LINKS.ADDRESSES, path: '/addresses', icon: 'map-pin' },
    { name: PROFILE_SIDEBAR_TEXT.LINKS.SUPPORT, path: '/support', icon: 'headphones' },
    { name: PROFILE_SIDEBAR_TEXT.LINKS.LOGOUT, path: '/logout', icon: 'log-out', isDanger: true }
];

type SidebarState = { isMounted: boolean; isMobile: boolean };
type SidebarAction = 
    | { type: 'SET_MOUNTED' }
    | { type: 'SET_MOBILE'; payload: boolean };

const sidebarReducer = (state: SidebarState, action: SidebarAction): SidebarState => {
    switch (action.type) {
        case 'SET_MOUNTED': return { ...state, isMounted: true };
        case 'SET_MOBILE': return { ...state, isMobile: action.payload };
        default: return state;
    }
};

export function ProfileSidebar() {
    const { user } = useAppSelector((state: RootState) => state.auth);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const currentPath = usePathname();

    const [state, dispatchState] = useReducer(sidebarReducer, {
        isMounted: false,
        isMobile: false,
    });

    useEffect(() => {
        dispatchState({ type: 'SET_MOUNTED' });
        const mql = window.matchMedia('(max-width: 1023px)');
        dispatchState({ type: 'SET_MOBILE', payload: mql.matches });
        
        const handler = (e: MediaQueryListEvent) => dispatchState({ type: 'SET_MOBILE', payload: e.matches });
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    if (!state.isMounted || currentPath.includes('checkout')) return null;

    const handleNavigation = (linkPath: string) => {
        if (linkPath === '/logout') {
            dispatch(logOut());
            router.push('/');
        } else if (linkPath === '/customer') {
            router.push(`/customer`);
        } else {
            router.push(`/customer${linkPath}`);
        }
    };

    const isOnOverviewPage = currentPath === `/customer`;

    if (state.isMobile) {
        if (!isOnOverviewPage) return null;

        const mobileLinks = ProfileSidebarLink.filter(
            link => link.path !== '/customer' && link.path !== '/logout'
        );

        return (
            <motion.ul
                className="grid grid-cols-2 gap-3 w-full mb-6"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
                {mobileLinks.map((link) => {
                    const targetPath = `/customer${link.path}`;
                    const isActive = currentPath === targetPath || currentPath.startsWith(targetPath);

                    return (
                        <motion.li
                            key={link.name}
                            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                        >
                            <button
                                onClick={() => handleNavigation(link.path)}
                                className={`
                                    w-full flex flex-col items-center justify-center gap-2 px-4 py-6
                                    rounded-xl border text-sm font-medium transition-all shadow-sm
                                    ${isActive
                                        ? 'border-theme-primary/50 bg-theme-primary/5 text-theme-primary'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <DynamicIcon name={link.icon as IconName} size={24} fallback={() => <span />} className={isActive ? 'text-theme-primary' : 'text-gray-500'} />
                                <span>{link.name}</span>
                            </button>
                        </motion.li>
                    );
                })}
            </motion.ul>
        );
    }

    // ── DESKTOP ──
    return (
        <aside className="w-72 flex-shrink-0 px-6 py-4">
            <div className="flex items-center gap-3 mb-6 sm:hidden">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 transition-colors"
                    aria-label="Go back"
                >
                    <ChevronLeft size={20} />
                </button>
            </div>
            
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col items-center text-center gap-3"
            >
                {user && (
                    <>
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm">
                            <img 
                                src={'profile_picture_url' in user && user.profile_picture_url ? (user.profile_picture_url as string) : "https://i.pinimg.com/originals/74/a3/b6/74a3b6a8856b004dfff824ae9668fe9b.jpg"} 
                                alt={`${user.first_name}`} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {`${user.first_name} ${user.last_name}`}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {user.email}
                            </p>
                        </div>
                    </>
                )}
            </motion.div>

            <motion.ul
                className="space-y-1.5"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
                {ProfileSidebarLink.map((link) => {
                    const targetPath = link.path === '/customer' ? `/customer` : `/customer${link.path}`;
                    const isActive = link.path !== '/logout' && (currentPath === targetPath || (link.path !== '/customer' && currentPath.startsWith(targetPath)));
                    const isDanger = link.path === '/logout';

                    return (
                        <motion.li
                            key={link.name}
                            variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                        >
                            <button
                                onClick={() => handleNavigation(link.path)}
                                className={`
                                relative w-full flex items-center gap-3 px-4 py-3
                                rounded-md text-sm font-medium transition-colors group
                                ${isDanger
                                        ? 'text-red-600 hover:bg-red-50'
                                        : isActive
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }
                                `}
                            >
                                <DynamicIcon name={link.icon as IconName} size={18} fallback={() => <span />} />
                                <span className="relative z-10">{link.name}</span>
                            </button>
                        </motion.li>
                    );
                })}
            </motion.ul>
        </aside>
    );
}