import { Carousel } from "@/components/common/Carousel";
import { BEST_SELLING_PRODUCTS, CATEGORY_LIST, FEEDBACK_LIST, HERO_BTN_TEXT, HOME_SECONDARY_IMG, HOME_HERO_TITLE, HOME_HERO_DESC } from "@/constants/customer";
import { CategoryList } from "@/components/customer/CategoryList";
import { BestSelling } from "@/components/customer/BestSelling";
import { ProductList } from "@/components/customer/ProductList";
import { CustomerFeedback } from "@/components/customer/CustomerFeedback";
import { HomeBrandFeatures } from "@/components/customer/HomeBrandFeatures";
import Link from "next/link";
import Image from "next/image";

const imgs = [
    'https://m.media-amazon.com/images/I/71YenZNhuPL._SL1500_.jpg',
    'https://m.media-amazon.com/images/I/61En6OhNqNL._SL1200_.jpg'
]

export default function Home() {
    return (
        <>
            <main className="h-full w-full relative">
                <Carousel items={imgs} styles="absolute z-[-10] filter blur-sm" />
                <section className="xl:px-32 xl:py-2 lg:px-8 md:px-4 sm:px-2 py-1">
                    <h1 className="pt-16 px-2 lg:text-2xl md:text-xl text-lg font-bold text-balance m-auto lg:w-[30vw] sm:w-[50vw] text-center mb-6 text-primary">
                        {HOME_HERO_TITLE}
                    </h1>
                    <p className="lg:text-5xl md:text-4xl text-2xl px-2 font-bold text-balance m-auto lg:w-[60vw] sm:w-[70vw] text-center mb-16 text-primary">{HOME_HERO_DESC}</p>
                    <Link href="/shopping" className="m-auto">
                        <button className="m-auto block bg-linear-to-t from-brand-primary to-brand-secondary text-primary font-bold px-4 py-2 rounded-lg cursor-pointer">{HERO_BTN_TEXT}</button>
                    </Link>
                </section>
                <section className="flex justify-between gap-16 mt-14 flex-wrap bg-primary xl:pt-10 pb-8 xl:px-32 lg:px-8 md:px-4 sm:px-2 py-1">
                    <div className="w-full grid lg:grid-cols-4 grid-cols-2 gap-4 mt-2">
                        <HomeBrandFeatures />
                    </div>
                    <hr className="mx-auto w-[80%] h-[2px] lg:text-gray-400 text-gray-300 mb mb-2" />
                </section>
                <section className="hero_img">
                    <Image className="w-full h-86 object-cover" src={HOME_SECONDARY_IMG} alt="Hero Image" width={800} height={400}  />
                </section>
                <CategoryList categories={CATEGORY_LIST} />
                <BestSelling product={BEST_SELLING_PRODUCTS} styles="bg-linear-to-r from-brand-primary to-brand-secondary" />
                <section className="xl:pt-5 pb-2 xl:px-32 lg:px-8 md:px-4 sm:px-2 py-1">
                    <h2 className="text-2xl text-center font-bold mt-8 mb-4">Popular products</h2>
                    {/* <ProductList products={PRODUCT_LIST} /> */}
                </section>
                <CustomerFeedback FEEDBACK_LIST={FEEDBACK_LIST} />
            </main>
        </>
    );
}
