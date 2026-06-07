"use client";
import { useEffect, useState } from "react";
import { ProfileSidebar } from "@/components/customer/ProfileSidebar";
import { useMediaQuery } from "react-responsive";

export default function UserProfileLayout({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);
    const isTabletOrMobile = useMediaQuery({
        query: "(max-width: 1024px)"
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

 
    if (!isMounted) {
        return <main className="xl:pt-10 xl:px-32 lg:px-8 md:px-4 px-2 pt-1 min-h-[80dvh]" />;
    }

    return (
        <main className="xl:pt-10 xl:px-32 lg:px-8 md:px-4 px-2 pt-1 pb-10 min-h-[80dvh] flex lg:flex-row flex-col lg:gap-8 gap-4">
            {!isTabletOrMobile && <ProfileSidebar />}
            
            <div className="flex-1 min-w-0 bg-background">
                {children}
            </div>
            
            {isTabletOrMobile && <ProfileSidebar />}
        </main>
    );
}