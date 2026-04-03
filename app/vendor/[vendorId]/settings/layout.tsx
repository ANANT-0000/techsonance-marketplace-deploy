'use client'
import Navbar from "@/components/vendor/Navbar";
import { InnerSideBar } from "@/components/common/InnerSideBar";
import { VENDOR_SETTINGS_LINKS } from "@/constants/vendor";
import { useParams } from "next/navigation";

export default function VendorSettingsLayout({ children }: { children: React.ReactNode }) {
    const { vendorId } = useParams();
    return (
        <>
            <Navbar title="Global Settings" />
            <InnerSideBar
                path={`/vendor/${vendorId}/settings`}
                links={VENDOR_SETTINGS_LINKS}
                isOpen={'ml-50'}
                isNotOpen={'ml-24'}
            />
            {children}
        </>
    );
}
