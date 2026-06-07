import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Search Products | Store',
    description: 'Search and find products across all categories on our storefront.',
    openGraph: {
        title: 'Search Products | Store',
        description: 'Search and find products across all categories on our storefront.',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Search Products | Store',
        description: 'Search and find products across all categories on our storefront.',
    }
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
