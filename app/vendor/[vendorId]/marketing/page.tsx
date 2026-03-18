"use client"
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/vendor/Navbar";
import { userIcon } from "@/constants/common";
import { Pagination } from "@/components/common/Pagination";
import { useForm } from "react-hook-form";
import { COUPON_DATA, COUPON_COLORS, REVIEW_DATA } from "@/constants/vendor";

export default function MarketingPage() {
    const couponFormRef = useRef(null);
    const [closedCouponForm, setClosedCouponForm] = useState(false);
    const { register, handleSubmit, setValue, watch, formState: { submitCount, errors } } = useForm({
        defaultValues: {
            type: 'percentage',
            code: '',
            value: 0
        }
    });

    const [count, setCount] = useState(1);
    const pageSize = 5;
    const totalPages = Math.ceil(REVIEW_DATA.length / pageSize);
    const startIndex = (count - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData = REVIEW_DATA.slice(startIndex, endIndex);

    const onSubmit = (data: any) => {
        console.log("Form Data Submitted: ", data);
        setClosedCouponForm(false);
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (couponFormRef.current && !(couponFormRef.current as any).contains(event.target)) {
                setClosedCouponForm(false);
                setValue('code', '');
                setValue('value', 0);
                setValue('type', 'percentage');
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [])

    return (
        <>
            <Navbar title={"Marketing & Reviews"} />

            {closedCouponForm && (
                <section className="absolute blur-4xl bg-black/20 w-full h-full top-0 left-0 z-10">
                    <form className="absolute top-[50%] bottom-[50%] left-[50%] right-[50%] translate-x-[-50%] translate-y-[-50%] z-20" ref={couponFormRef} onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col justify-center items-center h-full">
                            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col w-96">
                                <h2 className="text-2xl font-bold my-2">Create Coupon & promo</h2>
                                <select className="my-2 border-2 py-1 px-2 border-gray-300 rounded-md" {...register('type')}>
                                    <option value="percentage">Percentage Discount</option>
                                    <option value="flat">Flat Amount Discount</option>
                                </select>
                                <div className="flex flex-col my-2 gap-2">
                                    <label htmlFor="code">Coupon Code</label>
                                    <input className="py-1 px-2 border-2 border-gray-300 rounded-md" type="text" {...register('code', { required: true })} />
                                </div>
                                <div className="flex flex-col my-2 gap-2">
                                    <label htmlFor="value">Discount Value</label>
                                    <input className="py-1 px-2 border-2 border-gray-300 rounded-md" type="number" id="value" {...register('value', { required: true, validate: value => value > 0 })} />
                                </div>
                                <input className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700" value="Create" type="submit" />
                            </div>
                        </div>
                    </form>
                </section>
            )}

            <main>
                <header className="flex justify-end">
                    <button className="py-2 px-4 bg-blue-500 text-white rounded-lg my-6" onClick={() => setClosedCouponForm(true)}>
                        + Add New Coupon
                    </button>
                </header>
                <section className="mb-6">
                    <h2 className="font-bold text-xl mb-4">Active Coupons & Promo Codes</h2>
                    <div className="flex gap-6">
                        {COUPON_DATA.map((coupon, index) => (
                            <div key={coupon.id} className="border border-gray-400 rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between">
                                            <h3 className={`font-semibold text-lg ${COUPON_COLORS.text[index]} bg-none`}>{coupon.code}</h3>
                                            <span className={`px-3 py-1 rounded-full text-sm ${coupon.status === 'ACTIVE' ? `${COUPON_COLORS.bg[index]} ${COUPON_COLORS.text[index]}` : coupon.status === 'EXPIRED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {coupon.status}
                                            </span>
                                        </div>
                                        <p className="text-black text-2xl font-bold">
                                            {coupon.discount_type === 'PERCENTAGE' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                                        </p>
                                        <p className="text-gray-600">
                                            {coupon.conditions.customer_segment === 'ALL' ? 'All Customers' : 'New Customers'} | {coupon.conditions.min_purchase_amount ? `Min Purchase: ₹${coupon.conditions.min_purchase_amount}` : 'No Min Purchase'}
                                            <br />
                                            {coupon.conditions.expiry_text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-6 w-full">
                    <h2 className="font-bold text-xl mb-4">User Reviews & Ratings</h2>
                    <div className="w-full flex flex-col gap-4 mb-6">
                        {currentData?.map((review) => (
                            <div key={review.id} className="border border-gray-400 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2 w-full">
                                    <div className="flex flex-col gap-1">
                                        <span className="flex items-center gap-2">
                                            <img src={userIcon} alt="user icon" className="w-10 h-10 rounded-full" />
                                            <div>
                                                <h3 className="font-semibold text-lg">{review.user_name}</h3>
                                                <p className="text-gray-600 text-sm">Purchased: {review.purchased_item}</p>
                                            </div>
                                        </span>
                                        <div className="flex items-center gap-0">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.455a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.54 1.118l-3.39-2.455a1 1 0 00-1.176 0l-3.39 2.455c-.784.57-1.838-.197-1.539-1.118l1.285-3.974a1 1 0 00-.364-1.118L2.034 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.951-.69l1.286-3.974z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">{review.time_posted}</div>
                                </div>
                                <p className="text-gray-800 mb-4 text-balance pl-10">"{review.review_text}"</p>
                                <div className="flex gap-4">
                                    {review.actions.can_reply && <button className="text-blue-500 text-sm">Reply</button>}
                                    {review.actions.can_report && <button className="text-red-500 text-sm">Report</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <span className="flex justify-between items-start">
                        <p className="font-medium text-gray-500">
                            showing {startIndex + 1} to {Math.min(endIndex, REVIEW_DATA.length)} of {REVIEW_DATA.length} entries
                        </p>
                        <Pagination setCount={setCount} count={count} totalPages={totalPages} style="relative right-0 w-54" />
                    </span>
                </section>
            </main>
        </>
    )
}
