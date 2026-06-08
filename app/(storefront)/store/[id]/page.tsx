import { Metadata, ResolvingMetadata } from 'next';
import ProductClient from './ProductClient';
import { fetchProduct } from '@/utils/commonAPiClient';

type Props = {
    params: Promise<{ id: string }>
};

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const { id } = await params;

    try {
        const response = await fetchProduct(id);
        const product = response?.data;

        if (!product) {
            return {
                title: 'Product Not Found',
                description: 'The requested product could not be found.',
            };
        }

        // Extract the main image from the first variant if available
        const mainImage = product.variants?.[0]?.images?.[0]?.image_url;

        const seoTitle = `${product.name} - Buy Online at Best Prices | Techsonance Store`;
        const seoDescription = product.description 
            ? `${product.description.slice(0, 150)}... Buy ${product.name} at Techsonance Store.`
            : `Check out full specifications, prices, customer reviews, and features for ${product.name} at Techsonance Store.`;

        return {
            title: seoTitle,
            description: seoDescription,
            openGraph: {
                title: seoTitle,
                description: seoDescription,
                images: mainImage ? [mainImage] : [],
            },
        };
    } catch (error) {
        return {
            title: 'Product Details',
            description: 'View details, specifications, and reviews for this product',
        };
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const response = await fetchProduct(id);
    const product = response?.data;

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-semibold text-gray-700">Product Not Found</h1>
            </div>
        );
    }

    return <ProductClient id={id} initialProduct={product} />;
}