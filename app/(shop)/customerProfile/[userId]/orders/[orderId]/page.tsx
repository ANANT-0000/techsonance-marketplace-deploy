'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Check, X, Copy, AlertCircle, ChevronLeftCircle } from 'lucide-react';
import Link from 'next/link';
import { BASE_API_URL } from '@/constants';
import { companyDomain } from '@/config';
import { formatCurrency } from '@/lib/utils';

export default function OrderDetailPage() {
    const { userId, orderId } = useParams<{ userId: string; orderId: string }>();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setLoading(false);
    }, [orderId]);

    const copyOrderId = () => {
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const orderStatuses = [
        { label: 'Order Placed', active: true },
        { label: 'Processing', active: true },
        { label: 'Shipped', active: false },
        { label: 'Delivered', active: false },
    ];

    return (
        <div className="pb-20">
            <ChevronLeftCircle
                className="my-4 block lg:hidden cursor-pointer"
                size={36}
                onClick={() => router.back()}
            />

            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Success header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <Check className="w-10 h-10 text-green-700" strokeWidth={3} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600">
                        Thank you for your purchase. We&apos;ve emailed you the receipt.
                    </p>
                </div>

                {/* Order ID */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="border border-gray-300 rounded-lg px-4 py-2 flex items-center gap-2">
                        <span className="text-gray-600 text-sm">Order ID:</span>
                        <span className="font-semibold text-sm font-mono">{orderId}</span>
                        <button onClick={copyOrderId} className="ml-2 text-blue-600 hover:text-blue-700">
                            <Copy className="w-4 h-4" />
                        </button>
                        {copied && <span className="text-xs text-green-600">Copied!</span>}
                    </div>
                </div>

                {/* Status tracker */}
                <div className="border-2 border-gray-200 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-bold mb-6">Order Status</h2>
                    <div className="relative flex justify-between">
                        <div className="absolute top-2 left-0 right-0 h-0.5 bg-gray-200">
                            <div className="h-full bg-green-500 w-[33%] transition-all duration-700" />
                        </div>
                        {orderStatuses.map((s, i) => (
                            <div key={i} className="flex flex-col items-center relative z-10">
                                <div className={`w-4 h-4 rounded-full mb-2 border-2 ${s.active
                                    ? 'bg-green-500 border-green-500'
                                    : 'bg-white border-gray-300'
                                    }`} />
                                <span className={`text-xs font-medium text-center ${s.active ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href={`/customerProfile/${userId}/orders`}
                        className="flex-1 text-center border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        View All Orders
                    </Link>
                    <Link
                        href="/shopping"
                        className="flex-1 text-center bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}