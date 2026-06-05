'use client'
import dynamic from 'next/dynamic';
import React from 'react'
const InnerSideBar = dynamic(() => import('@/components/vendor/InnerSideBar').then(mod => mod.InnerSideBar), {
  ssr: false,
  loading: () => <div className="w-64 h-screen bg-white border-r border-gray-200" /> // Optional loading skeleton
});
export default  function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
          <main className='flex w-full'>


            <InnerSideBar selectedMenu="Marketing" />
            {children}
        </main>
    )
}
