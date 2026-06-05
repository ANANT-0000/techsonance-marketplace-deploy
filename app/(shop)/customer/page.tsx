'use client';

import { motion } from "framer-motion"; // Changed to framer-motion as motion/react is deprecated
import { Mail, Phone, MapPin, Lock, Bell, ChevronLeft, Package, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppSelector } from "@/hooks/reduxHooks";

// shadcn/ui imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
};

export default function UserProfilePage() {
    const { user } = useAppSelector((state) => state.auth);
    
    // Extracted Wishlist directly from state per instructions
    const { wishItems } = useAppSelector((state: any) => state.wishlist || { wishItems: [] });
    const wishlistCount = wishItems.length;

    const router = useRouter();

    if (!user) return null;

    const totalOrders = 12; // Placeholder for total, since OrdersList handles fetching separately

    return (
        <motion.section
            className="w-full mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Mobile Header */}
            <div className="flex items-center gap-3 my-4 lg:hidden px-2">
                <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Go back">
                    <ChevronLeft size={20} />
                </Button>
                <h1 className="font-bold text-xl text-foreground">Profile Overview</h1>
            </div>

            {/* Profile Header Card */}
            <motion.div variants={itemVariants}>
                <Card className="mb-8 shadow-sm">
                    <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 lg:p-8 gap-6 pt-6 lg:pt-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
                            <div className="relative shrink-0">
                                <Image
                                    src={'profile_picture_url' in user && user.profile_picture_url
                                        ? (user.profile_picture_url as string) 
                                        : "https://i.pinimg.com/originals/74/a3/b6/74a3b6a8856b004dfff824ae9668fe9b.jpg"}
                                    alt={user?.first_name || "User"}
                                    width={112}
                                    height={112}
                                    className="rounded-full w-24 h-24 lg:w-28 lg:h-28 object-cover border border-border"
                                />
                            </div>

                            <div className="flex flex-col gap-3 text-center sm:text-left w-full mt-2">
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                                        {user?.first_name} {user?.last_name}
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Member since {new Date('created_at' in user && user.created_at ? user.created_at : Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                    </p>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-3 text-sm">
                                    <Badge variant="secondary" className="flex items-center justify-center sm:justify-start gap-2 py-1.5 px-3 font-normal text-muted-foreground">
                                        <Mail size={14} /> {user.email}
                                    </Badge>
                                    {user.phone_number && (
                                        <Badge variant="secondary" className="flex items-center justify-center sm:justify-start gap-2 py-1.5 px-3 font-normal text-muted-foreground">
                                            <Phone size={14} /> {user.phone_number}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Link href={`/customer/editProfile`} className="w-full md:w-auto shrink-0 mt-4 md:mt-0">
                            <Button className="w-full lg:w-auto">
                                Edit Profile
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Stats Row */}
            <motion.section variants={itemVariants} className="grid grid-cols-2 gap-4 mb-8">
                <Card className="shadow-sm">
                    <CardContent className="p-6 flex flex-col justify-center pt-6">
                        <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-2">Total Orders</span>
                        <div className="flex items-center gap-2">
                            <Package className="text-muted-foreground" size={24} />
                            <span className="text-3xl font-bold text-foreground">{totalOrders}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-6 flex flex-col justify-center pt-6">
                        <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-2">Wishlist Items</span>
                        <div className="flex items-center gap-2">
                            <Heart className="text-destructive" size={24} />
                            <span className="text-3xl font-bold text-foreground">{wishlistCount}</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.section>

            {/* Account Management Grid */}
            <motion.section variants={itemVariants} className="mb-8">
                <h2 className="font-semibold text-lg text-foreground mb-4 px-1">Settings & Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Address Card */}
                    <Link href={`/customer/addresses`} className="block group">
                        <Card className="h-full shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-secondary rounded-md group-hover:bg-secondary/80 transition-colors">
                                        <MapPin size={20} className="text-foreground" />
                                    </div>
                                    <CardTitle className="text-base">Saved Addresses</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col h-[calc(100%-4rem)]">
                                <CardDescription className="mb-4">Manage delivery locations for faster checkout.</CardDescription>
                                <div className="pt-4 border-t mt-auto">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Default</span>
                                    <p className="text-sm text-foreground font-medium mt-1 truncate">No default address set</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Security Card */}
                    <Link href="#" className="block group">
                        <Card className="h-full shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-secondary rounded-md group-hover:bg-secondary/80 transition-colors">
                                        <Lock size={20} className="text-foreground" />
                                    </div>
                                    <CardTitle className="text-base">Login & Security</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col h-[calc(100%-4rem)]">
                                <CardDescription className="mb-4">Update your password and secure your account.</CardDescription>
                                <div className="pt-4 border-t mt-auto">
                                    <span className="text-sm font-medium text-primary hover:underline">Update credentials &rarr;</span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Notifications Card */}
                    <Link href="#" className="block group">
                        <Card className="h-full shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-secondary rounded-md group-hover:bg-secondary/80 transition-colors">
                                        <Bell size={20} className="text-foreground" />
                                    </div>
                                    <CardTitle className="text-base">Notifications</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col h-[calc(100%-4rem)]">
                                <CardDescription className="mb-4">Control email and push notification preferences.</CardDescription>
                                <div className="pt-4 border-t mt-auto flex items-center gap-2">
                                    <span className="relative flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-sm font-medium text-foreground">All alerts enabled</span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                </div>
            </motion.section>
        </motion.section>
    );
}