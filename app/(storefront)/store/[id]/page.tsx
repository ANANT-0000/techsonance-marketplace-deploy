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

        return {
            title: product.name || 'Product Details',
            description: product.description ? product.description.slice(0, 160) : 'View details, specifications, and reviews for this product',
            openGraph: {
                title: product.name,
                description: product.description ? product.description.slice(0, 160) : 'View details, specifications, and reviews for this product',
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