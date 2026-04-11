'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import { WishListBtn } from '@/components/customer/WishListBtn';
import { AddToCart } from '@/components/customer/AddToCart';
import { BuyBtn } from '@/components/customer/BuyBtn';
import { ProductList } from '@/components/customer/ProductList';
import { ProductReview } from '@/components/customer/ProductReview';
import { ProductSpecifications } from '@/components/customer/ProductSpec';
import { ProductImageType, ProductType, VariantsType } from '@/utils/Types';
import { PRODUCT_LIST } from '@/constants';
import { formatCurrency } from '@/lib/utils';
import { fetchProduct } from '@/utils/commonAPiClient';

const brandOffer = [
    { id: '1', title: '1 year warranty', icon: 'shopping-bag' },
    { id: '2', title: 'Free delivery', icon: 'truck' },
    { id: '3', title: '7 days return', icon: 'undo-2' },
    { id: '4', title: 'Cash on delivery', icon: 'banknote' },
    { id: '5', title: 'GST Billing', icon: 'file-spreadsheet' }
];

export default function ProductPage() {
    const params = useParams();
    const id = params?.id as string;
    const [activeImage, setActiveImage] = useState<string | undefined>();
    const [productImages, setProductImages] = useState<ProductImageType[]>([]);
    const [activeVariant, setActiveVariant] = useState<VariantsType | undefined>();
    const [product, setProduct] = useState<ProductType | undefined>(undefined);
    console.log("product id", id)
    useEffect(() => {
        const getProduct = async () => {
            const response = await fetchProduct(id);
            console.log("product response", response.data);
            const productData = response.data as ProductType;
            setProduct(productData);
            setActiveVariant(productData?.variants[0]);
            setProductImages(productData?.variants[0]?.images || []);
            setActiveImage(productData?.variants[0]?.images[0]?.image_url || undefined);
        }
        getProduct();

    }, [params.id])
    console.log("product response", product)
    console.log("activeVariant", activeVariant)
    console.log("activeImage", activeImage)
    const containerStagger = { visible: { transition: { staggerChildren: 0.1 } } };
    const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 50 } } };
    // console.log(!product)
    // if (!product?.id) {
    //     return <h1 className='text-2xl font-bold text-gray-900 p-8'>Product not found</h1>;
    // }
    const handleActiveVariantChange = (variant: VariantsType) => {
        setActiveVariant(variant);
        setProductImages(variant.images);
        setActiveImage(variant.images[0]?.image_url);
    }
    return (
        <main className='xl:pt-10 pb-8 xl:px-32 lg:px-8 md:px-4 px-2 py-1 overflow-x-hidden'>
            <section className="flex flex-col lg:flex-row justify-evenly gap-12">
                <div className='flex flex-col-reverse lg:flex-row gap-4 w-full lg:w-1/2'>
                    <div className='flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible hide-scrollbar'>
                        {productImages.map((img, idx) => (
                            <>
                                <motion.img key={idx} src={img.image_url} onClick={() => setActiveImage(img.image_url)} whileHover={{ scale: 1.05, borderColor: "#3b82f6" }} whileTap={{ scale: 0.95 }} alt={`Thumbnail ${idx + 1}`} className={`aspect-square w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition-all ${activeImage === img.image_url ? ' border-blue-500 ring-2 ring-blue-300' : 'border-transparent'}`} />

                            </>
                        ))}
                    </div>
                    <div className='relative w-full aspect-square bg-gray-50 rounded-3xl overflow-hidden'>
                        <WishListBtn productVariantId={activeVariant?.id} styles="absolute lg:top-0 lg:right-4 right-8 z-20" iconSize={32} />
                        <AnimatePresence mode="wait">
                            <motion.img key={activeImage} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} src={activeImage || product?.images.filter((img): img is ProductImageType => img.imgType === 'main')?.[0]?.image_url} alt={product?.name} className='w-full  object-cover' />
                        </AnimatePresence>
                    </div>
                </div>
                <motion.div variants={containerStagger} initial="hidden" animate="visible" className='flex flex-col gap-6 w-full lg:w-1/2'>
                    {/* <motion.div variants={fadeInUp} className="flex items-center gap-2">
                        <span className='flex bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100'>
                            {Array.from({ length: 5 }, (_, i) => (<Star key={i} size={16} fill={i < (product.rating || 0) ? "#eab308" : "none"} className={i < (product. || 0) ? 'text-yellow-500' : 'text-gray-300'} />))}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">(124 Reviews)</span>
                    </motion.div> */}
                    <motion.div variants={fadeInUp}>
                        <h1 className='text-sm lg:text-2xl font-bold text-gray-900 mb-2'>{activeVariant?.variant_name}</h1>
                        <p className='text-lg text-gray-500 font-medium leading-relaxed  truncate '>{product?.description}</p>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-end gap-3">
                            <span className='text-1xl lg:text-2xl text-gray-900'>₹{formatCurrency(Number(activeVariant?.price) || 0)}</span>
                            {Number(product?.discount_percent) > 0 && (<><span className='text-md lg:text-lg line-through text-gray-400 '>₹{formatCurrency(Math.floor(Number(activeVariant?.price) / (1 - Number(product?.discount_percent) / 100)))}</span><span className='text-lg font-semibold text-green-600 '>{Math.round(Number(product?.discount_percent))}% OFF</span></>)}
                        </div>
                        <p className='text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide'>Inclusive of all taxes</p>
                    </motion.div>
                    <div>


                        <motion.p variants={fadeInUp} className='text-sm text-gray-500 font-medium'>
                            Color: <span className='font-semibold text-gray-700'>
                                {activeVariant?.attributes.find(attr => attr.name === 'color')?.values || 'N/A'}
                            </span>
                        </motion.p>
                        <motion.div variants={fadeInUp} className='flex  gap-4 items-center h-28'>
                            {
                                product?.variants?.map((variant) => (
                                    <button key={variant.id} onClick={() => handleActiveVariantChange(variant)} className={`px-3 lg:px-4 pt-2 lg:py-2 rounded-lg border ${activeVariant?.id === variant.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} text-gray-700 font-medium hover:bg-gray-50 transition-colors`}>
                                        <motion.img src={variant.images[0]?.image_url} alt={variant.variant_name} className="h-12  object-cover" />
                                        <p>₹{formatCurrency(Number(variant.price) || 0)} </p>
                                    </button>
                                ))
                            }
                        </motion.div>
                    </div>
                    <motion.div variants={fadeInUp} className='flex gap-4 items-center'>
                        <AddToCart productVariantId={activeVariant?.id || ''} styles="text-xl w-32 lg:w-40" />
                        <BuyBtn productId={product?.id} styles="scale-[0.95]" />
                    </motion.div>


                    <motion.div variants={fadeInUp} className='mt-4'>
                        <div className='flex gap-4 overflow-x-auto pb-4 hide-scrollbar'>
                            {brandOffer.map((offer, idx) => (
                                <motion.div key={offer.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className='flex flex-col items-center justify-center gap-2 min-w-[100px] p-3 text-center'>
                                    <div className="p-2 bg-brand-primary/10 rounded-full text-brand-primary">  <DynamicIcon fallback={() => <p></p>} name={offer.icon as IconName} size={20} /></div>
                                    <span className='text-xs font-semibold text-gray-700 leading-tight'>{offer.title}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </section>
            <section className='flex flex-col lg:flex-row gap-12 mt-20'>
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className='lg:w-1/2'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2'><span className="w-1 h-8 bg-brand-primary rounded-full"></span>Product Description</h2>
                    <div className="prose prose-gray max-w-none text-gray-600 space-y-3">{product?.description && product.description.split('\n').map((line, idx) => (<p key={idx}>{line}</p>))}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className='lg:w-1/2'>
                    <ProductSpecifications product={product?.features} />
                </motion.div>
            </section>
            <section className='mt-20'>
                <h2 className='text-2xl font-bold text-gray-900 mb-8'>Customer Reviews</h2>
                <ProductReview product={product} />
            </section>
            <section className='mt-20'>
                <h2 className='text-2xl font-bold text-gray-900 mb-8'>You might also like</h2>
                <ProductList products={PRODUCT_LIST} />
            </section>
        </main >
    );
}
