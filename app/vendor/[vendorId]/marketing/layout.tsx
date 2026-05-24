'use client'
import { InnerSideBar } from '@/components/vendor/InnerSideBar'
import { useParams } from 'next/navigation';
import React from 'react'

export default  function MarketingLayout({ children }: { children: React.ReactNode }) {
    const {vendorId} = useParams<{ vendorId: string }>();
    return (
        <main className='flex gap-6'>
            <InnerSideBar vendorId={vendorId} selectedMenu="Marketing" />
            {children}
        </main>
    )
}
