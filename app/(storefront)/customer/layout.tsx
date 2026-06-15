"use client";
import { ProfileSidebar } from "@/components/customer/ProfileSidebar";

export default function UserProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="xl:pt-10 xl:px-32 lg:px-8 md:px-4 min-h-[80dvh] flex lg:flex-row flex-col lg:gap-8 px-0 pt-0 pb-0 gap-0 lg:px-2 lg:pt-1 lg:pb-10 lg:gap-4">
            <ProfileSidebar />
            
            <div className="flex-1 min-w-0 bg-background">
                {children}
            </div>
        </main>
    );
}