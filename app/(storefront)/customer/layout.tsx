"use client";
import { MobileHeader } from "@/components/customer/MobileHeader";
import { MobileSideDrawer } from "@/components/customer/MobileSideDrawer";
import { ProfileSidebar } from "@/components/customer/ProfileSidebar";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { toggleMenu } from "@/lib/features/menuBar";
import { RootState } from "@/lib/store";

import { useEffect } from "react";

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMenuOpen } = useAppSelector((state: RootState) => state.menu);
  const dispatch = useAppDispatch();
  //   useEffect(() => {
  //     // Add custom class on mount to let stylesheet hide parent navbar on mobile
  //     document.body.classList.add("customer-dashboard-mobile");
  //     return () => {
  //       // Remove custom class on unmount
  //       document.body.classList.remove("customer-dashboard-mobile");
  //     };
  //   }, []);
  return (
    <>
      <main className="xl:pt-10 xl:px-32 lg:px-8 md:px-4 min-h-[80dvh] flex lg:flex-row flex-col lg:gap-8 px-0 pt-0 pb-0 gap-0 lg:px-2 lg:pt-1 lg:pb-10 lg:gap-4">
        {/* Left sliding menu Drawer navigation */}
        <MobileSideDrawer
          isOpen={isMenuOpen}
          onClose={() => dispatch(toggleMenu())}
        />
        <ProfileSidebar />
        <div className="flex-1 min-w-0 bg-background">{children}</div>
      </main>
    </>
  );
}
