'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import type { RootState } from '@/lib/store';
import { logOut } from '@/lib/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';

const ProfileSidebarLink = [
    { name: 'Profile Overview', path: '/customerProfile', icon: 'user' },
    { name: 'My Orders', path: '/orders', icon: 'shopping-bag' },
    { name: 'My Cart', path: '/cart', icon: 'shopping-cart' },
    { name: 'Wishlist', path: '/wishlist', icon: 'heart' },
    { name: 'My Addresses', path: '/addresses', icon: 'map-pin' },
    { name: 'Change Password', path: '/changePassword', icon: 'lock' },
    { name: 'Customer Support', path: '/support', icon: 'headphones' },
    { name: 'Logout', path: '/logout', icon: 'log-out', isDanger: true }
];

export function ProfileSidebar() {
    const { user } = useAppSelector((state: RootState) => state.auth);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const currentPath = usePathname();
    const currentUserId = user?.id ?? '';

    const [isMobile, setIsMobile] = useState(false);
    const [hasMounted, setHasMounted] = useState(false); // add this
    useEffect(() => {
        setHasMounted(true);
        const mql = window.matchMedia('(max-width: 1023px)'); // below lg breakpoint
        setIsMobile(mql.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    if (currentPath.includes('checkout')) return null;

    const handleNavigation = (linkPath: string) => {
        if (linkPath === '/logout') {
            dispatch(logOut());
            router.push('/');
        } else if (linkPath === '/customerProfile') {
            router.push(`/customerProfile/${currentUserId}`);
        } else {
            router.push(`/customerProfile/${currentUserId}${linkPath}`);
        }
    };

    const profileOverviewPath = `/customerProfile/${currentUserId}`;
    const isOnOverviewPage = currentPath === profileOverviewPath;
    if (!hasMounted) return null;
    // ── MOBILE / TABLET (below lg) ────────────────────────────────────
    if (isMobile) {
        // On overview page → show quick-access grid BELOW the profile card
        // (the grid is rendered here, layout positions it via flex-col in the layout)
        if (isOnOverviewPage) {
            const mobileLinks = ProfileSidebarLink.filter(
                link => link.path !== '/customerProfile' && link.path !== '/logout'
            );
            return (
                <motion.ul
                    className="grid grid-cols-2 gap-2 w-full mt-4"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                >
                    {mobileLinks.map((link) => {
                        const targetPath = `/customerProfile/${currentUserId}${link.path}`;
                        const isActive =
                            currentPath === targetPath ||
                            currentPath.startsWith(targetPath);

                        return (
                            <motion.li
                                key={link.name}
                                variants={{
                                    hidden: { opacity: 0, x: -10 },
                                    visible: { opacity: 1, x: 0 }
                                }}
                                className="border-2 border-gray-200 rounded-md"
                            >
                                <button
                                    onClick={() => handleNavigation(link.path)}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5
                                        text-sm font-semibold transition-colors
                                        ${isActive
                                            ? 'text-brand-primary bg-blue-50'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <DynamicIcon name={link.icon as IconName} size={18} fallback={() => <span />} />
                                    <span>{link.name}</span>
                                </button>
                            </motion.li>
                        );
                    })}
                </motion.ul>
            );
        }

        // On sub-pages (orders, cart, etc.) → horizontal scrollable tab bar
        return (
            <nav className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 w-full scrollbar-hide">
                {ProfileSidebarLink.map((link) => {
                    if (link.path === '/customerProfile') return null; // skip overview in tab bar

                    const isDanger = link.path === '/logout';
                    const targetPath = isDanger
                        ? null
                        : `/customerProfile/${currentUserId}${link.path}`;

                    const isActive =
                        !isDanger &&
                        targetPath !== null &&
                        (currentPath === targetPath || currentPath.startsWith(targetPath));

                    return (
                        <button
                            key={link.name}
                            onClick={() => handleNavigation(link.path)}
                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors
                                ${isDanger
                                    ? 'text-red-500 hover:bg-red-50'
                                    : isActive
                                        ? 'bg-blue-50 text-brand-primary border border-blue-100'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }
                            `}
                        >
                            <DynamicIcon name={link.icon as IconName} size={14} fallback={() => <span />} />
                            <span>{link.name}</span>
                        </button>
                    );
                })}
            </nav>
        );
    }

    // ── DESKTOP (lg and above) ────────────────────────────────────────
    return (
        <aside className="w-72 flex-shrink-0 rounded-xl p-6">
            {/* User Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 border-l-4 border-brand-primary flex items-center gap-4"
            >
                <div className="overflow-hidden">
                    {user?.first_name && (
                        <>
                            <h2 className="text-base font-bold text-gray-900 truncate">
                                {`${user.first_name} ${user.last_name}`}
                            </h2>
                            <p className="text-gray-500 text-xs truncate max-w-[150px]">
                                {user.email}
                            </p>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Nav Links */}
            <motion.ul
                className="space-y-1"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
                {ProfileSidebarLink.map((link) => {
                    const targetPath = link.path === '/customerProfile'
                        ? `/customerProfile/${currentUserId}`
                        : `/customerProfile/${currentUserId}${link.path}`;

                    const isActive =
                        link.path !== '/logout' &&
                        (currentPath === targetPath ||
                            (link.path !== '/customerProfile' &&
                                currentPath.startsWith(targetPath)));

                    const isDanger = link.path === '/logout';

                    return (
                        <motion.li
                            key={link.name}
                            variants={{
                                hidden: { opacity: 0, x: -10 },
                                visible: { opacity: 1, x: 0 }
                            }}
                        >
                            <button
                                onClick={() => handleNavigation(link.path)}
                                className={`
                                    relative w-full flex items-center gap-4 px-5 py-3.5
                                    rounded-xl text-sm font-medium transition-colors group
                                    ${isDanger
                                        ? 'text-red-500 hover:bg-red-50'
                                        : isActive
                                            ? 'text-brand-primary'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }
                                `}
                            >
                                {isActive && !isDanger && (
                                    <motion.div
                                        layoutId="sidebar-active-pill"
                                        className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-xl"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center justify-center w-5 h-5">
                                    <DynamicIcon name={link.icon as IconName} size={20} fallback={() => <span />} />
                                </span>
                                <span className="relative z-10 font-semibold">{link.name}</span>
                                {!isActive && !isDanger && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -5 }}
                                        whileHover={{ opacity: 1, x: 0 }}
                                        className="absolute right-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <DynamicIcon name="chevron-right" size={16} fallback={() => <span />} />
                                    </motion.div>
                                )}
                            </button>
                        </motion.li>
                    );
                })}
            </motion.ul>
        </aside>
    );
}