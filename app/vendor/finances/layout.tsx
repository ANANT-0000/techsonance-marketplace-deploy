'use client'
import { InnerSideBar } from '@/components/vendor/InnerSideBar'
import React from 'react'

export default  function FinancesLayout({ children }: { children: React.ReactNode }) {
    return (
                    <main className='flex w-full'>
            <InnerSideBar selectedMenu="Finances" />
            {children}
        </main>
    )
}
