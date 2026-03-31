'use client';
import { motion } from "motion/react"
import { TAB_LINKS } from "@/constants/customer"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react"
import { useAppSelector } from "@/hooks/reduxHooks";



export function TabNavBar() {
    const { user } = useAppSelector((state: any) => state.auth)
    const userId= user?.user_id ? user.user_id : '';
    const path = usePathname();
    const navLinks = useMemo((() => {
        return TAB_LINKS.map((link, index) => {
            if (!user) {
                link.url = link.url.toLowerCase() === '/profile' ? '/customerProfile' : link.url.toLowerCase() === '/cart' ? '/customerProfile' : link.url;
            } else {
                link.title.toLowerCase() === 'profile' ? link.url = `/customerProfile/${userId}` : link.title.toLowerCase() === 'cart' ? link.url = `/customerProfile/${userId}/cart` : link.url = link.url;
            }
            return link;
        })
    }), [user])
    return (
        <>
            <motion.footer className="lg:hidden xl:hidden fixed bottom-0 w-full bg-white   border-t-gray-300   pb-0  flex justify-around items-center   z-100 pt-1">
                {
                    navLinks.map((link, index) => {
                        const isActive: boolean = path === link.url;

                        return (

                            <motion.div
                                key={index}
                                whileTap={{ scale: 0.90 }}
                                initial={{ backgroundColor: "transparent", opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    backgroundColor: isActive ? "#007BFF" : "transparent",
                                    color: isActive ? "#FFFFFF" : "#6B7280",
                                    y: isActive ? -2 : 0,
                                    boxShadow: isActive ? "0 4px 12px rgba(0, 123, 255, 0.3)" : "none"
                                }}
                                transition={{
                                    duration: 0.3,
                                    backgroundColor: { duration: 0.5, ease: "linear" },
                                    color: { duration: 0.5, ease: "linear" },
                                    y: { duration: 0.5, ease: "linear" },
                                    boxShadow: { duration: 0.3, ease: "linear" },
                                    opacity: { duration: 0.5, ease: "linear" }
                                }}
                                className="rounded-full w-10 h-10 p-2 flex flex-col items-center justify-center gap-1"
                            >
                                <Link
                                    href={link.url}
                                    className="relative z-200 flex flex-col items-center justify-center gap-1   text-sm  "
                                >
                                    <DynamicIcon
                                        name={link.iconNames as IconName}
                                        size={20}
                                        className={`${isActive ? 'text-primary' : 'text-gray-500'} z-60 transition-colors duration-200`}
                                    />
                                </Link>
                            </motion.div>
                        )
                    })

                }
            </motion.footer>
        </>
    )
}
