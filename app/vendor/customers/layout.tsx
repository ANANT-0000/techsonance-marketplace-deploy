import { InnerSideBar } from '@/components/vendor/InnerSideBar'
import React from 'react'

export default async function CustomersLayout({ children }: { children: React.ReactNode;  }) {

    return (
        <main className='flex w-full'>
            <InnerSideBar selectedMenu="Customer Management" />
            {children}
        </main>
    )
}
