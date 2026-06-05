import { InnerSideBar } from '@/components/vendor/InnerSideBar'
import React from 'react'

export default function ProductLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className='flex w-full'>
            <InnerSideBar selectedMenu="Catalog" />
            {children}
        </main>
    )
}
``