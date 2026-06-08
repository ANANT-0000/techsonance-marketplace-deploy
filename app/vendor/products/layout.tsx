import { InnerSideBar } from '@/components/vendor/InnerSideBar'
import { getCompanyDomain } from '@/lib/get-domain';
import React from 'react'

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
    const domain = await getCompanyDomain();
    console.log("the domain", domain);
    return (
        <main className='flex w-full'>
            <InnerSideBar selectedMenu="Catalog" />
            {children}
        </main>
    )
}