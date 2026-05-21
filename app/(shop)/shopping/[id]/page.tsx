'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import { WishListBtn } from '@/components/customer/WishListBtn';
import { AddToCart } from '@/components/customer/AddToCart';
import { BuyBtn } from '@/components/customer/BuyBtn';
import { ProductReview } from '@/components/customer/ProductReview';
import { ProductSpecifications } from '@/components/customer/ProductSpec';
import { BuyBtnMode, Coupon, Product, ProductImage, Variant } from '@/utils/Types';
import { formatCurrency } from '@/lib/utils';
import { fetchProduct } from '@/utils/commonAPiClient';
import { CheckCircle2, ChevronLeft, ChevronRight, Star, Tag, X } from 'lucide-react';
import { AvailableCouponsModal } from '@/components/customer/AvailableCouponsModal';
import { useMediaQuery } from 'react-responsive';
import AxiosAPI from '@/lib/axios';
import { authToken } from '@/utils/authToken';
import toast, { Toaster } from 'react-hot-toast';
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
    const [isMounted, setIsMounted] = useState(false);
    const [activeImage, setActiveImage] = useState<string | undefined>();
    const [productImages, setProductImages] = useState<ProductImage[]>([]);
    const [activeVariant, setActiveVariant] = useState<Variant | undefined>();
    const [product, setProduct] = useState<Product | undefined>(undefined);
    const [isCouponModalOpen, setCouponModalOpen] = useState(false);
const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
const isMobile = useMediaQuery({maxWidth: '1024px'});
const route=useRouter();
const token = authToken();
    console.log("product id", id)
    useEffect(() => {
        setIsMounted(true);
    }, []);
    useEffect(() => {
        const getProduct = async () => {
            const response = await fetchProduct(id);
            console.log("product response", response.data);
            const productData = response.data as Product;
            setProduct(productData);
            if (productData?.variants && productData.variants.length > 0) {
                setActiveVariant(productData.variants[0]);
                setProductImages(productData.variants[0].images);
                setActiveImage(productData.variants[0].images[0]?.image_url);
            }
        }
        getProduct();

    }, [])
    console.log("product response", product)
    console.log("activeVariant", activeVariant)
    console.log("activeImage", activeImage)
    const containerStagger = { visible: { transition: { staggerChildren: 0.1 } } };
    const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 50 } } };
    const handleActiveVariantChange = (variant: Variant) => {
        setActiveVariant(variant);
        setProductImages(variant.images);
        setActiveImage(variant.images[0]?.image_url);
    }
    const reviewsList = activeVariant?.reviews || [];
    const totalReviews = reviewsList.length;

    // Calculate average: Sum all ratings, divide by total, and round to nearest whole star
    const averageRating = totalReviews > 0
        ? Math.round(reviewsList.reduce((sum, review) => sum + review.rating, 0) / totalReviews)
        : 0;
         
 const handleCouponSelect =async (coupon: Coupon) => {
     setSelectedCoupon(coupon);
     setCouponModalOpen(false);
     const res=await AxiosAPI.post('/v1/coupon/validate', { 
     code: coupon.code, 
     cartTotal: basePrice, 
     productIdsInCart:[product?.id] }, {
         headers: { Authorization: `Bearer ${token}` }
 });
 if(res.data.success!==true || res.status !==201){
toast.error(res.data.message || "Failed to validate coupon");
 }else{
toast.success("Coupon applied successfully");
 }
 console.log("Coupon validation response:", res.data);
 }
        const basePrice = Number(activeVariant?.price) || 0;
const productDiscountPercent = Number(product?.discount_percent) || 0;
const originalMRP = productDiscountPercent > 0 
    ? Math.floor(basePrice / (1 - productDiscountPercent / 100)) 
    : basePrice;

// Calculate additional coupon discount
let couponDiscountAmount = 0;
if (selectedCoupon) {
    if (selectedCoupon.discount_type === 'percentage') {
        couponDiscountAmount = Math.floor(basePrice * (Number(selectedCoupon.discount_value) / 100));
        // Apply max cap if the coupon has one
        if (selectedCoupon.max_discount_amount && couponDiscountAmount > Number(selectedCoupon.max_discount_amount)) {
            couponDiscountAmount = Number(selectedCoupon.max_discount_amount);
        }
    } else { // 'fixed_cart' or 'fixed_product'
        couponDiscountAmount = Number(selectedCoupon.discount_value);
    }
}
const [activeIndex, setActiveIndex] = useState(0);

// Sync activeIndex with activeImage
useEffect(() => {
    const idx = productImages.findIndex(img => img.image_url === activeImage);
    if (idx !== -1) setActiveIndex(idx);
}, [activeImage, productImages]);
// Final calculated values to display
const finalPayablePrice = Math.max(0, basePrice - couponDiscountAmount);
const totalSavings = originalMRP - finalPayablePrice;




const handleCouponModalOpen = () => {
    if (!token) {
        route.push('/auth/customerLogin');
    } else {
        setCouponModalOpen(true);
    }
}
    return (
        <main className='xl:pt-10 pb-8 xl:px-32 lg:px-8 md:px-4 px-2 py-1 overflow-x-hidden'>
            <section className="flex flex-col lg:flex-row justify-evenly gap-12">
            <div className='flex flex-col-reverse lg:flex-row gap-4 w-full lg:w-1/2'>

    {/* THUMBNAIL — desktop only */}
    {!isMobile && (
        <div className='flex lg:flex-col gap-4 lg:overflow-y-auto lg:h-0 lg:min-h-full lg:w-24 shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth p-1'>
            {productImages.map((img, idx) => (
                <motion.img
                    key={idx}
                    src={img.image_url}
                    onClick={() => setActiveImage(img.image_url)}
                    whileHover={{ scale: 1.05, borderColor: "#3b82f6" }}
                    whileTap={{ scale: 0.95 }}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`shrink-0 aspect-square w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition-all ${
                        activeImage === img.image_url
                            ? 'border-blue-500 ring-2 ring-blue-300'
                            : 'border-transparent'
                    }`}
                />
            ))}
        </div>
    )}

    {/* MAIN IMAGE CONTAINER */}
    <div className='relative flex-1 aspect-square bg-gray-50 rounded-3xl overflow-hidden'>
        <WishListBtn
            productVariantId={activeVariant?.id}
            styles="absolute lg:top-0 lg:right-4 right-8 z-20"
            iconSize={32}
        />

        {isMobile ? (
            /* ── MOBILE CAROUSEL ── */
            <>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={activeIndex}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.25 }}
                        src={productImages[activeIndex]?.image_url}
                        alt={product?.name}
                        className='aspect-square w-full h-full object-contain rounded-2xl'
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.x < -50 && activeIndex < productImages.length - 1) {
                                const next = activeIndex + 1;
                                setActiveIndex(next);
                                setActiveImage(productImages[next].image_url);
                            } else if (info.offset.x > 50 && activeIndex > 0) {
                                const prev = activeIndex - 1;
                                setActiveIndex(prev);
                                setActiveImage(productImages[prev].image_url);
                            }
                        }}
                    />
                </AnimatePresence>

                {/* Dot indicators */}
                <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10'>
                    {productImages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setActiveIndex(idx);
                                setActiveImage(productImages[idx].image_url);
                            }}
                            className={`rounded-full transition-all duration-300 ${
                                idx === activeIndex
                                    ? 'w-4 h-2 bg-blue-500'
                                    : 'w-2 h-2 bg-gray-300'
                            }`}
                        />
                    ))}
                </div>

                {/* Prev / Next arrows */}
                {activeIndex > 0 && (
                    <button
                        onClick={() => {
                            const prev = activeIndex - 1;
                            setActiveIndex(prev);
                            setActiveImage(productImages[prev].image_url);
                        }}
                        className='absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/70 backdrop-blur rounded-full p-1 shadow'
                    >
                        <ChevronLeft size={20} className='text-gray-700' />
                    </button>
                )}
                {activeIndex < productImages.length - 1 && (
                    <button
                        onClick={() => {
                            const next = activeIndex + 1;
                            setActiveIndex(next);
                            setActiveImage(productImages[next].image_url);
                        }}
                        className='absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/70 backdrop-blur rounded-full p-1 shadow'
                    >
                        <ChevronRight size={20} className='text-gray-700' />
                    </button>
                )}
            </>
        ) : (
            /* ── DESKTOP MAIN IMAGE ── */
            <AnimatePresence mode="wait">
                <motion.img
                    key={activeImage}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={activeImage}
                    alt={product?.name}
                    className='aspect-square w-full h-full object-contain rounded-2xl'
                />
            </AnimatePresence>
        )}
    </div>
</div>
                <motion.div variants={containerStagger} initial="hidden" animate="visible" className='flex flex-col gap-6 w-full lg:w-1/2'>
                    <motion.div variants={fadeInUp} className="flex items-center gap-2">
                        <span className='flex bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100'>
                            {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    fill={i < averageRating ? "#eab308" : "none"}
                                    className={i < averageRating ? 'text-yellow-500' : 'text-gray-300'}
                                />
                            ))}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">
                            ({totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'})
                        </span>
                    </motion.div>
                    <motion.div variants={fadeInUp}>
                        <h1 className='text-sm lg:text-xl font-bold text-gray-900 mb-1 capitalize'>{activeVariant?.variant_name}</h1>
        
                    </motion.div>
     
                    <div>
                        <motion.p variants={fadeInUp} className='text-sm text-gray-500 font-medium'>
                            {activeVariant?.attributes[0]?.name && activeVariant?.attributes[0]?.name.charAt(0).toUpperCase() + activeVariant?.attributes[0]?.name.slice(1)}: <span className='font-semibold text-gray-700'>
                                {activeVariant?.attributes[0]?.value && activeVariant?.attributes[0]?.value.charAt(0).toUpperCase() + activeVariant?.attributes[0]?.value.slice(1)}
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

       <motion.div variants={fadeInUp} className="flex flex-col lg:flex-row justify-between gap-4 lg:px-5 px-3 lg:py-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
        
        {/* Left Side: Pricing Details */}
        <div className="flex flex-col justify-center">
            <div className="flex items-end gap-3 flex-wrap">
                <span className='lg:text-3xl text-lg font-black text-gray-900'>
                    ₹{formatCurrency(finalPayablePrice)}
                </span>
                
                {/* Original MRP */}
                {(productDiscountPercent > 0 || couponDiscountAmount > 0) && (
                    <span className='lg:text-lg text-md  line-through text-gray-400 mb-0.5'>
                        ₹{formatCurrency(originalMRP)}
                    </span>
                )}
                
                {/* Total Savings Badge */}
                {(productDiscountPercent > 0 || couponDiscountAmount > 0) && (
                    <span className='lg:text-sm text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1'>
                        Save ₹{formatCurrency(totalSavings)}
                    </span>
                )}
            </div>
            <p className='text-xs text-gray-500 mt-1.5 font-medium uppercase tracking-wide'>
                Inclusive of all taxes
            </p>
        </div>

        {/* Right Side: Coupon Interaction */}
        <div className="lg:min-w-[280px]">
            {selectedCoupon ? (
                // --- APPLIED STATE ---
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl lg:px-4 px-2 lg:py-3 py-1.5 h-full">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-600">
                            <CheckCircle2 size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-emerald-800 tracking-wide uppercase">
                                {selectedCoupon.code} Applied
                            </span>
                            <span className="text-xs text-emerald-600 font-medium">
                                Extra ₹{formatCurrency(couponDiscountAmount)} savings!
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedCoupon(null)} 
                        className="p-1.5 text-emerald-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove Coupon"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                // --- UNAPPLIED STATE ---
                <button
                    onClick={() => handleCouponModalOpen()}
                    className="w-full flex items-center justify-between bg-blue-50/60 hover:bg-blue-50 border border-blue-200 border-dashed rounded-xl lg:px-4 lg:py-3 py-1.5 transition-all group h-full"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600 shadow-sm">
                            <Tag size={16} />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="text-sm font-bold text-blue-800">Available Offers</span>
                            <span className="text-xs text-blue-600/80 font-medium">
                                Click to view coupons
                            </span>
                        </div>
                    </div>
                    <ChevronRight
                        size={18} 
                        className="text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" 
                    />
                </button>
            )}
        </div>
    </motion.div>
                    <motion.div variants={fadeInUp} className='flex gap-4 items-center'>
                        <motion.div variants={fadeInUp} className='flex gap-4 items-center'>
                            {isMounted && activeVariant && (
                                <>
                                    <AddToCart productVariantId={activeVariant.id} styles="text-xl py-1 w-32 lg:w-40" />
                                    <BuyBtn id={activeVariant.id} mode={BuyBtnMode.QUICK_BUY} styles="px-6" selectedCoupon={selectedCoupon} />
                                </>
                            )}
                        </motion.div>
                    </motion.div>


                </motion.div>
            </section>
            <motion.div variants={fadeInUp} className='mt-2 w-full flex justify-end'>
                <div className='flex gap-4 overflow-x-auto pb-4 hide-scrollbar'>
                    {brandOffer.map((offer, idx) => (
                        <motion.div key={offer.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className='flex flex-col items-center justify-center gap-2 min-w-[100px] p-3 text-center'>
                            <div className="p-2 bg-brand-primary/10 rounded-full text-brand-primary">  <DynamicIcon fallback={() => <p></p>} name={offer.icon as IconName} size={20} /></div>
                            <span className='text-xs font-semibold text-gray-700 leading-tight'>{offer.title}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
            <section className='flex flex-col lg:flex-row gap-12 mt-10'>
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className='lg:w-1/2'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2'><span className="w-1 h-8 bg-brand-primary rounded-full"></span>Product Description</h2>
                    <div className="prose prose-gray max-w-none text-gray-600 space-y-3">{product?.description && product.description.split('\n').map((line, idx) => (<p key={idx}>{line}</p>))}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className='lg:w-1/2'>
                    {product?.features &&
                        <ProductSpecifications product={product?.features} />
                    }
                </motion.div>
            </section>
            <section className='mt-20'>
                <h2 className='text-2xl font-bold text-gray-900 mb-8'>Customer Reviews</h2>
                { product && product.id &&
                    <ProductReview productId={product.id } />
                }
            </section>
            <section className='mt-20'>
                <h2 className='text-2xl font-bold text-gray-900 mb-8'>You might also like</h2>
                {/* <ProductList products={product?.variants || []} /> */}
            </section>
            <AvailableCouponsModal isOpen={isCouponModalOpen} onClose={() => setCouponModalOpen(false)} onSelect={handleCouponSelect} productId={product?.id} />
                <Toaster />
        </main >
    );
}
