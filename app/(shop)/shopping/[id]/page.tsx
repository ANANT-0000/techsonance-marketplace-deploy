'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import { Star } from 'lucide-react';
import { PRODUCT_LIST, type PRODUCT_LIST_TYPE } from '@/constants/customer';
import { WishListBtn } from '@/components/customer/WishListBtn';
import { AddToCart } from '@/components/customer/AddToCart';
import { BuyBtn } from '@/components/customer/BuyBtn';
import { ProductList } from '@/components/customer/ProductList';

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
    const product: PRODUCT_LIST_TYPE | undefined = PRODUCT_LIST.find(pro => pro.id === id);
    const [activeImage, setActiveImage] = useState(product?.imgUrl);

    if (!product) {
        return <h1 className='text-2xl font-bold text-gray-900 p-8'>Product not found</h1>;
    }

    const containerStagger = { visible: { transition: { staggerChildren: 0.1 } } };
    const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 50 } } };

    return (
        <main className='xl:pt-10 pb-8 xl:px-32 lg:px-8 md:px-4 px-2 py-1 overflow-x-hidden'>
            <section className="flex flex-col lg:flex-row justify-evenly gap-12">
                <div className='flex flex-col-reverse lg:flex-row gap-4 w-full lg:w-1/2'>
                    <div className='flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible hide-scrollbar'>
                        {product.specificationsImgUrl?.map((img, idx) => (
                            <motion.img key={idx} src={img} onClick={() => setActiveImage(img)} whileHover={{ scale: 1.05, borderColor: "#3b82f6" }} whileTap={{ scale: 0.95 }} alt={`Thumbnail ${idx + 1}`} className={`aspect-square w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition-all ${activeImage === img ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent'}`} />
                        ))}
                        <motion.img src={product.imgUrl} onClick={() => setActiveImage(product.imgUrl)} whileHover={{ scale: 1.05 }} className={`aspect-square w-20 h-20 object-cover rounded-xl cursor-pointer border-2 ${activeImage === product.imgUrl ? 'border-blue-500' : 'border-transparent'}`} />
                    </div>
                    <div className='relative w-full aspect-square bg-gray-50 rounded-3xl overflow-hidden'>
                        <WishListBtn styles="absolute lg:top-0 lg:right-4 right-8 z-20" iconSize={32} />
                        <AnimatePresence mode="wait">
                            <motion.img key={activeImage} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} src={activeImage || product.imgUrl} alt={product.title} className='w-full h-full object-cover' />
                        </AnimatePresence>
                    </div>
                </div>
                <motion.div variants={containerStagger} initial="hidden" animate="visible" className='flex flex-col gap-6 w-full lg:w-1/2'>
                    <motion.div variants={fadeInUp} className="flex items-center gap-2">
                        <span className='flex bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100'>
                            {Array.from({ length: 5 }, (_, i) => (<Star key={i} size={16} fill={i < (product.rating || 0) ? "#eab308" : "none"} className={i < (product.rating || 0) ? 'text-yellow-500' : 'text-gray-300'} />))}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">(124 Reviews)</span>
                    </motion.div>
                    <motion.div variants={fadeInUp}>
                        <h1 className='text-3xl lg:text-4xl font-black text-gray-900 mb-2'>{product.title}</h1>
                        <p className='text-lg text-gray-500 font-medium leading-relaxed'>{product.description}</p>
                    </motion.div>
                    <motion.div variants={fadeInUp} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-end gap-3">
                            <span className='text-4xl font-black text-gray-900'>₹{product.price.toLocaleString()}</span>
                            {product.discount > 0 && (<><span className='text-lg line-through text-gray-400 mb-1'>₹{Math.floor(product.price / (1 - product.discount / 100)).toLocaleString()}</span><span className='text-lg font-bold text-green-600 mb-1'>{Math.round(product.discount)}% OFF</span></>)}
                        </div>
                        <p className='text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide'>Inclusive of all taxes</p>
                    </motion.div>
                    <motion.div variants={fadeInUp} className='flex gap-4 items-center'>
                        <AddToCart productId={product.id} styles="text-xl w-32 lg:w-40" />
                        <BuyBtn productId={product.id} styles="scale-[0.95]" />
                    </motion.div>
                    <motion.div variants={fadeInUp} className='mt-4'>
                        <div className='flex gap-4 overflow-x-auto pb-4 hide-scrollbar'>
                            {brandOffer.map((offer, idx) => (
                                <motion.div key={offer.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className='flex flex-col items-center justify-center gap-2 min-w-[100px] p-3 text-center'>
                                    <div className="p-2 bg-brand-primary/10 rounded-full text-brand-primary"><DynamicIcon name={offer.icon as IconName} size={20} /></div>
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
                    <div className="prose prose-gray max-w-none text-gray-600 space-y-3">{product.description.split('\n').map((line, idx) => (<p key={idx}>{line}</p>))}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className='lg:w-1/2'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2'><span className="w-1 h-8 bg-brand-primary rounded-full"></span>Specifications</h2>
                    <div className='bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm'>
                        <table className="w-full text-sm text-left"><tbody>{product.productDetails?.specifications && Object.entries(product.productDetails.specifications).map(([key, value], idx) => (<tr key={key} className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}><td className='py-3 px-6 font-semibold text-gray-900 w-1/3'>{key}</td><td className='py-3 px-6 text-gray-600'>{value}</td></tr>))}</tbody></table>
                    </div>
                </motion.div>
            </section>
            <section className='mt-20'>
                <h2 className='text-2xl font-bold text-gray-900 mb-8'>Customer Reviews</h2>
                {product.reviews && product.reviews.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>{product.reviews.map((review, idx) => (<motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className='p-6 border border-gray-200 rounded-2xl bg-white hover:shadow-md transition-shadow'><div className="flex justify-between items-start mb-4"><div><h3 className='font-bold text-gray-900'>{review.userName}</h3><div className='flex items-center gap-1 mt-1'>{Array.from({ length: 5 }, (_, i) => (<Star key={i} size={12} fill={i < review.rating ? "#eab308" : "#e5e7eb"} className={i < review.rating ? "text-yellow-500" : "text-gray-200"} />))}</div></div><span className='text-xs text-gray-400 font-medium'>{new Date(review.date).toLocaleDateString()}</span></div><p className='text-gray-600 leading-relaxed text-sm'>"{review.comment}"</p></motion.div>))}</div>
                ) : (
                    <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200"><p className='text-gray-500'>No reviews yet. Be the first to review!</p></div>
                )}
            </section>
            <section className='mt-20'>
                <h2 className='text-2xl font-bold text-gray-900 mb-8'>You might also like</h2>
                <ProductList products={PRODUCT_LIST} />
            </section>
        </main>
    );
}
