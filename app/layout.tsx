import type { Metadata } from 'next'
import "./globals.css";
import ReduxProviders from '@/app/StoreProvider';

export const metadata: Metadata = {
    title: 'Techsonance Marketplace',
    description: 'Multi-vendor marketplace platform',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <ReduxProviders  >
                    {children}
                </ReduxProviders>
            </body>
        </html>
    )
}
