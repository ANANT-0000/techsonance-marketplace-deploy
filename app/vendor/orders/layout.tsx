import { InnerSideBar } from '@/components/vendor/InnerSideBar'
import React from 'react'

export default async function ProductLayout({ children}: { children: React.ReactNode; }) {
 
    return (
         <main className='flex w-full'>
            <InnerSideBar selectedMenu="Sales" />
            {children}
        </main>
    )
}
