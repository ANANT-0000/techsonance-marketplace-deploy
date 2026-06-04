'use client'
import { InnerSideBar } from "@/components/vendor/InnerSideBar";
import { useParams } from "next/navigation";

export default function VendorSettingsLayout({ children }: { children: React.ReactNode }) {
    const { vendorId } = useParams<{ vendorId: string }>();
    return (
        <>
               <main className='flex w-full'>
            <InnerSideBar vendorId={vendorId } selectedMenu="Settings" />
            {children}
        </main>
        </>
    );
}
