'use client';
import { CATEGORY_LIST_TYPE } from "@/utils/Types";
import { motion } from "motion/react";

export function CategoryList({ categories, styles }: { categories?: CATEGORY_LIST_TYPE[], styles?: string }) {

    // Parent container variant to stagger the children
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15, // Delay between each category appearing
                delayChildren: 0.2
            }
        }
    };

    // Individual item variant
    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring" as const, stiffness: 100, damping: 15 }
        }
    };

    return (
        <section className="xl:pt-10 pb-8 xl:px-32 lg:px-8 md:px-4 sm:px-2 py-1 overflow-hidden">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl text-center font-bold mt-8 mb-8"
            >
                Our Categories
            </motion.h2>

            <motion.ul
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className={`px-4 lg:flex lg:flex-nowrap grid grid-cols-2  lg:justify-between justify-evenly gap-6 ${styles}`}
            >
                {categories && categories.slice(0, 4).map((category, idx) => (
                    <motion.li
                        key={idx}
                        variants={itemVariants}
                        className="group flex flex-col items-center cursor-pointer"
                    >
                        <div className="overflow-hidden rounded-lg shadow-sm group-hover:shadow-xl transition-shadow duration-300">
                            <motion.img
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.4 }}
                                className="lg:w-74 lg:h-86 w-36 h-28 object-cover my-0"
                                src={category.url}
                                alt={category.title.trim()}
                            />
                        </div>
                        <span className="mt-4 text-lg font-medium text-gray-700 group-hover:text-brand-primary transition-colors">
                            {category.title.trim()}
                        </span>
                    </motion.li>
                ))}
            </motion.ul>
        </section>
    );
}