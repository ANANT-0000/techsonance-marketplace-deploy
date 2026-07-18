"use client";
import { InnerSideBar } from "@/components/vendor/InnerSideBar";
import { ProfileReminderBanner } from "@/components/vendor/ProfileReminderBanner";

export default function VendorSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex w-full ">
      <InnerSideBar selectedMenu="Settings" />
      <div className="flex-1 p-6 max-h-screen overflow-y-auto">
        <ProfileReminderBanner />
        {children}
      </div>
    </main>
  );
}
