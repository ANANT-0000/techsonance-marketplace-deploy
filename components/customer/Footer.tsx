'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { FOOTER_BOTTOM_TEXT, FOOTER_CONTENT } from "@/constants/customer";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

export function Footer({ styles }: { styles?: string }) {
    const path = usePathname();

    // Skip footer for admin/vendor routes
    if (path.startsWith('/admin') || path.startsWith('/vendor')) {
        return <></>;
    }

    // Hide main footer content for Auth pages
    const isAuthPage = path === '/customerRegister' || path === '/customerLogin';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const columnVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring" as const, stiffness: 50 }
        }
    };

    return (
        <footer className={`bg-footer xl:px-32 lg:px-8 md:px-4 sm:px-2 py-8 px-4 ${styles}`}>
            {!isAuthPage && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="w-full flex flex-col sm:flex-row justify-between lg:gap-8 gap-2 lg:mb-12 mb-2 "
                >
                    {FOOTER_CONTENT.map((section, index) => (
                        <motion.ul
                            key={index}
                            variants={columnVariants}
                            className="flex flex-col lg:gap-4 gap-1  "
                        >
                            <li className="font-bold lg:text-lg text-md text-primary lg:mb-2">
                                {section.header}
                            </li>
                            <div className="lg:block grid grid-cols-2 gap-0">


                                {section.links.map((link, linkIndex) => (
                                    <motion.li
                                        key={linkIndex}
                                        whileHover={{ x: 5 }}
                                        className="lg:text-sm text-xs text-primary hover:text-brand-primary transition-colors"
                                    >
                                        <Link
                                            href={link.url}
                                            className={`flex items-center ${link.category == 'social' && 'my-2'} `}
                                        >
                                            {link.icon && (
                                                <DynamicIcon
                                                    name={link.icon as IconName}
                                                    className={link.styles}
                                                    size={28}
                                                    fallback={() => <p></p>}
                                                />

                                            )}
                                            {link.category !== 'social' && <span className="w-64 text-balance" >{link.title}</span>}
                                        </Link>
                                    </motion.li>
                                ))}</div>
                        </motion.ul>
                    ))}
                </motion.div>
            )}

            <div className="flex flex-col items-center">
                <motion.span
                    initial={{ width: 0 }}
                    whileInView={{ width: "70%" }}
                    viewport={{ once: true }}
                    className="h-[1px] bg-primary/70 lg:my-2 my-3   "
                />

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="font-light text-center text-gray-100 text-sm  leading-relaxed lg:mb-0 mb-12 "
                >
                    {FOOTER_BOTTOM_TEXT}
                </motion.p>
            </div>
        </footer>
    );
}