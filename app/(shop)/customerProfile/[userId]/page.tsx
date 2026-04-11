'use client';

import { motion } from "motion/react";
import { ShoppingBag, Mail, Phone, Timer, MapPin, Lock, Bell, ChevronLeftCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Counter } from "@/components/customer/Counter";
import { containerVariants, itemVariants, ManagementCard } from "@/components/customer/ManagementCard";
import { useAppSelector } from "@/hooks/reduxHooks";
import { ProfileSidebar } from "@/components/customer/ProfileSidebar";
export default function UserProfilePage() {
    const { user } = useAppSelector((state) => state.auth);
    const { userId } = useParams()
    console.log(user);
    const router = useRouter();
    if (!user) return null;

    // const activeOrders = user?.orders.filter(order => order.order_status === 'Pending').length;
    const activeOrders = 3;

    return (
        <motion.section
            className="w-full mx-auto lg:px-4  lg:py-2 py-1 px-2 mb-0 lg:mb-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <ChevronLeftCircle className="mb-4 block lg:hidden" size={36} onClick={() => router.back()} />

            <motion.section
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                className="mb-6 flex flex-col lg:flex-row justify-between items-center lg:p-8 px-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm lg:gap-6 gap-2"
            >
                <div className="flex lg:flex-row flex-col items-center gap-8 w-full">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative"
                    >
                        <Image
                            src={user?.profileImgUrl || "https://i.pinimg.com/originals/74/a3/b6/74a3b6a8856b004dfff824ae9668fe9b.jpg"}
                            alt={user?.first_name || "User"}
                            width={128}
                            height={128}
                            className="rounded-full lg:w-32 lg:h-32 w-24 h-24 object-cover border-4 border-gray-50 shadow-md"
                        />
                        <span className="absolute bottom-2 right-2 lg:w-5 lg:h-5 w-2 h-2 bg-green-500 border-2 border-white rounded-full"></span>
                    </motion.div>

                    <div className="flex flex-col gap-2 lg:text-center text-start md:text-left">
                        <h1 className="lg:text-3xl text-xl text-start font-bold text-gray-900">{user?.first_name} {user?.last_name}</h1>
                        <div className="flex flex-wrap lg:justify-center md:justify-start lg:gap-4 text-gray-500 text-sm">
                            <span className="flex items-center gap-2 lg:px-3 py-1 lg:bg-gray-50 rounded-full lg:border border-gray-100">
                                <Mail size={14} /> {user.email}
                            </span>
                            <span className="flex items-center gap-2 lg:px-3 py-1 lg:bg-gray-50 rounded-full lg:border border-gray-100">
                                <Phone size={14} /> {user.phone}
                            </span>
                        </div>
                        <p className="text-gray-400 text-xs lg:mt-2 text-left font-medium">
                            Member since: {new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
                <Link href={`/customerProfile/${user?.id}/editProfile`}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="lg:px-6 px-3 lg:py-2.5 py-1 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                        Edit Profile
                    </motion.button>
                </Link>
            </motion.section>

            <div className="mt-8 lg:flex flex-col md:flex-row gap-6 hidden  ">
                {[
                    { label: "TOTAL ORDERS", value: user?.orders?.length ?? 3, icon: ShoppingBag, color: "bg-brand-primary", text: "text-brand-primary" },
                    { label: "ACTIVE ORDERS", value: activeOrders, icon: Timer, color: "bg-yellow", text: "text-yellow-500" }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
                        className="flex-1 flex justify-between items-center lg:p-6 px-3 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm transition-all"
                    >
                        <div>
                            <h2 className="font-bold text-sm text-gray-400 mb-1 tracking-wider">{stat.label}</h2>
                            <p className="lg:text-4xl text-2xl font-extrabold text-gray-800">
                                <Counter value={stat.value} />
                            </p>
                        </div>
                        <div className={`flex items-center justify-center ${stat.color}/10 p-4 rounded-full h-16 w-16`}>
                            <stat.icon className={`${stat.text} lg:w-8 lg:h-8 h-6 w-6`} />
                        </div>
                    </motion.div>
                ))}
            </div>


            <motion.section variants={itemVariants} className="my-8 hidden lg:block">
                <h1 className="font-bold lg:text-2xl text-xl text-gray-900 mb-6">Account Management</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ManagementCard
                        link={`/customerProfile/${user?.id}/addresses`}
                        icon={<MapPin size={28} className="text-blue-600" />}
                        color="bg-blue-50"
                        title="Saved Addresses"
                        description="Manage your saved addresses for faster checkout and delivery."
                    >

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Default Address</p>
                            {user?.addresses?.filter(a => a.is_default).length > 0 ? (
                                user?.addresses?.filter(a => a.is_default).map(address => (
                                    <p key={address.address_id} className="text-sm text-gray-600 line-clamp-1">
                                        {address.address_line1}, {address.city}...
                                    </p>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">No default address set</p>
                            )}
                        </div>

                    </ManagementCard>

                    <ManagementCard
                        link=""
                        icon={<Lock size={28} className="text-green-600" />}
                        color="bg-green-50"
                        title="Login & Security"
                        description="Manage your login credentials and security settings to keep your account safe."
                    />

                    <ManagementCard
                        link=""
                        icon={<Bell size={28} className="text-yellow-600" />}
                        color="bg-yellow-50"
                        title="Notifications"
                        description="Customize how you receive updates and promotional offers."
                    >
                        <div className="mt-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium text-gray-600">Email Notifications: Enabled</p>
                        </div>
                    </ManagementCard>
                </div>
            </motion.section>
        </motion.section>
    );
}


