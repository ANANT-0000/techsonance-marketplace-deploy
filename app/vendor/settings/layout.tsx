'use client'
import { InnerSideBar } from "@/components/vendor/InnerSideBar";

export default function VendorSettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
               <main className='flex w-full'>
            <InnerSideBar selectedMenu="Settings" />
            {children}
        </main>
        </>
    );
}
