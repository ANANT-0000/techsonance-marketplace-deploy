import { InnerSideBar } from '@/components/vendor/InnerSideBar'
import React from 'react'

export default async function FinancesLayout({ children, params }: { children: React.ReactNode; params: Promise<{ vendorId: string }> }) {
    const { vendorId } = await params;
    return (
        <main className='flex gap-6'>
            <InnerSideBar vendorId={vendorId} selectedMenu="Finances" />
            {children}
        </main>
    )
}
