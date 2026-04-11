import { motion } from "motion/react";
import Link from "next/link";


export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

export const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring" as const, stiffness: 50 }
    }
};

export const ManagementCard = ({ icon, color, title, description, children, link }: { icon: React.ReactNode; color: string; title: string; description: string; children?: React.ReactNode; link: string }) => (
    <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02, backgroundColor: "#fafafa" }}
        className="flex flex-col lg:p-6 p-3 border border-gray-200 rounded-2xl bg-white shadow-sm cursor-pointer transition-colors"
    >
        {
            link === '' || link === undefined ? (
                <>
                    <div className="flex items-start gap-6">
                        <div className={`w-14 h-14 ${color} rounded-2xl flex justify-center items-center flex-shrink-0`}>
                            {icon}
                        </div>
                        <div>
                            <h2 className="font-bold lg:text-xl text-lg mb-2 text-gray-900">{title}</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                        </div>
                    </div>
                    {children}
                </>
            ) : (
                <Link href={link}>
                    <div className="flex items-start gap-6">
                        <div className={`w-14 h-14 ${color} rounded-2xl flex justify-center items-center flex-shrink-0`}>
                            {icon}
                        </div>
                        <div>
                            <h2 className="font-bold lg:text-xl text-lg mb-2 text-gray-900">{title}</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                        </div>
                    </div>
                    {children}
                </Link>
            )
        }

    </motion.div>
);
