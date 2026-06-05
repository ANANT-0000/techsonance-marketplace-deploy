import { InnerSideBar } from '@/components/vendor/InnerSideBar'
import React from 'react'

export default function ConfigDocumentLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className='flex w-full'>
            <InnerSideBar selectedMenu="Config Documents" />
            {children}
        </main>
    )
}
