import { InnerSideBar } from '@/components/vendor/InnerSideBar'
import React from 'react'

export default async function ConfigDocumentLayout({ children, params }: { children: React.ReactNode; params: Promise<{ vendorId: string }> }) {
    const { vendorId } = await params;
    return (
            <main className='flex w-full'>

            <InnerSideBar vendorId={vendorId} selectedMenu="Config Documents" />
            {children}
        </main>
    )
}
