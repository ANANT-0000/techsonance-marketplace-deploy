'use client';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import type { RootState } from '@/lib/store';
import { logOut } from '@/lib/features/auth/authSlice';
import { useMediaQuery } from 'react-responsive';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
const ProfileSidebarLink = [
    { name: 'Profile Overview', path: '/customerProfile', icon: 'user' },
    { name: 'My Orders', path: '/orders', icon: 'shopping-bag' },
    { name: "My Cart", path: '/cart', icon: 'shopping-cart' },
    { name: 'Wishlist', path: '/wishlist', icon: 'heart' },
    { name: 'Change Password', path: '/changePassword', icon: 'lock' },
    { name: 'Customer Support', path: '/support', icon: 'headphones' },
    { name: 'Logout', path: '/logout', icon: 'log-out', isDanger: true }
];

export function ProfileSidebar() {
    const { user } = useAppSelector((state: RootState) => state.auth);

    const router = useRouter();
    const dispatch = useAppDispatch();
    const currentPath = usePathname();
    const currentUserId = user?.user_id ? user.user_id : '';
    const isMobile = useMediaQuery({ maxWidth: 767 });
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
    if (currentPath.includes('checkout')) {
        return null; // Don't render sidebar on checkout pages
    }
    const mobileLinks = ProfileSidebarLink.filter(link => link.path !== '/customerProfile' && link.path !== '/logout');
    if (isMobile) {
        return (
            <motion.ul
                className="space-y-1 grid grid-cols-2 gap-2"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.05 } }
                }}

            >
                {mobileLinks.map((link) => {
                    const targetPath = link.path === '/customerProfile'
                        ? `/customerProfile/${currentUserId}`
                        : `/customerProfile/${currentUserId}${link.path}`;

                    const isActive = currentPath === targetPath || (link.path !== '/customerProfile' && currentPath.startsWith(targetPath));
                    const isDanger = link.path === '/logout';
                    return (

                        <motion.li
                            key={link.name}
                            variants={{
                                hidden: { opacity: 0, x: -10 },
                                visible: { opacity: 1, x: 0 }
                            }}
                            className='  border-2 border-gray-200 rounded-md flex-1 '
                        >
                            <button
                                onClick={() => handleNavigation(link.path)}
                                className={`
                                    relative w-full flex items-center gap-4 px-2 py-2  text-sm font-medium transition-colors group
                                    ${isDanger
                                        ? 'text-red-500 hover:bg-red-50'
                                        : isActive
                                            ? 'text-brand-primary'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <span className="relative z-10 flex items-start justify-start w-5 h-5">
                                    <DynamicIcon name={link.icon as IconName} size={20} />
                                </span>
                                <span className="relative text-start z-10 font-semibold">
                                    {link.name}
                                </span>
                            </button>
                        </motion.li>
                    );
                })}
            </motion.ul>

        )
    }
    return (
        <aside className="w-full lg:w-72 flex-shrink-0">
            {/* User Header Card */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6  border-l-4    flex items-center gap-4"
            >
                {/* <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-brand-primary font-bold text-xl">
                    {user?.name?.charAt(0) || 'U'}
                </div> */}
                <div className="overflow-hidden">
                    <h1 className="text-lg font-bold text-gray-900 truncate">
                        {user?.name || 'User'}
                    </h1>
                    <p className="text-gray-500 text-xs truncate max-w-[150px]">
                        {user?.email}
                    </p>
                </div>
            </motion.div>

            {/* Navigation List */}
            <motion.ul
                className="space-y-1"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.05 } }
                }}
            >
                {ProfileSidebarLink.map((link) => {
                    // Logic to determine active state
                    const targetPath = link.path === '/customerProfile'
                        ? `/customerProfile/${user?.user_id}`
                        : `/customerProfile/${user?.user_id}${link.path}`;

                    const isActive = currentPath === targetPath || (link.path !== '/customerProfile' && currentPath.startsWith(targetPath));
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
                                    relative w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-medium transition-colors group
                                    ${isDanger
                                        ? 'text-red-500 hover:bg-red-50'
                                        : isActive
                                            ? 'text-brand-primary'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }
                                `}
                            >
                                {/* The Magic Floating Background Pill */}
                                {isActive && !isDanger && (
                                    <motion.div
                                        layoutId="sidebar-active-pill"
                                        className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-xl"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                {/* Icon & Text - z-index ensures they sit ON TOP of the pill */}
                                <span className="relative z-10 flex items-center justify-center w-5 h-5">
                                    <DynamicIcon name={link.icon as IconName} size={20} />
                                </span>
                                <span className="relative z-10 font-semibold">
                                    {link.name}
                                </span>

                                {/* Hover Chevron (Micro-interaction) */}
                                {!isActive && !isDanger && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -5 }}
                                        whileHover={{ opacity: 1, x: 0 }}
                                        className="absolute right-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <DynamicIcon name="chevron-right" size={16} />
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