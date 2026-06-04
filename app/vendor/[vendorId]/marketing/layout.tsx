'use client'
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import React from 'react'
const InnerSideBar = dynamic(() => import('@/components/vendor/InnerSideBar').then(mod => mod.InnerSideBar), {
  ssr: false,
  loading: () => <div className="w-64 h-screen bg-white border-r border-gray-200" /> // Optional loading skeleton
});
export default  function MarketingLayout({ children }: { children: React.ReactNode }) {
    const {vendorId} = useParams<{ vendorId: string }>();
    return (
          <main className='flex w-full'>


            <InnerSideBar vendorId={vendorId} selectedMenu="Marketing" />
            {children}
        </main>
    )
}
