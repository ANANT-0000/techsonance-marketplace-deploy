"use client";
import { ProfileSidebar } from "@/components/customer/ProfileSidebar";
import { useMediaQuery } from "react-responsive";


export default function UserProfileLayout({ children }: { children: React.ReactNode }) {
    const isTabletOrMobile = useMediaQuery({
        query: "(max-width: 1024px)"
    })
    return (
        <main className="xl:pt-10  xl:px-32 lg:px-8 md:px-4 px-2 pt-1 min-h-[80dvh] flex lg:flex-row flex-col">
            {!isTabletOrMobile && <ProfileSidebar />}
            <div className="flex-1 min-w-0">
                {children}
            </div>
            {isTabletOrMobile && <ProfileSidebar />}
        </main>
    );
}