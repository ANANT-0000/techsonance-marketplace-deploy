'use client';
import type { RootState } from '@/lib/store';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useRouter } from 'next/navigation';
import { BuyBtnMode, Coupon } from '@/utils/Types';
import { createCheckoutSession } from '@/hooks/UseCheckoutSession';
import { authToken } from '@/utils/authToken';
import { CreditCard } from 'lucide-react';

export function BuyBtn({ id, styles, mode, selectedCoupon }: { id?: string, styles?: string, mode?: BuyBtnMode, selectedCoupon?: Coupon | null }) {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const token = authToken();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const isSmall = styles?.includes('small');
  useEffect(() => {
    setIsMounted(true);
  }, []);
  console.log("selectedCoupon", selectedCoupon)
  const userId = user?.id ? user.id : '';
  const handleBuyNow = async () => {
    console.log(userId)
    if (!user || !userId || !token) {
      return router.push('/auth/customerLogin');
    }

    createCheckoutSession();
    if (id && mode === BuyBtnMode.CART) {
      router.push(`/customerProfile/${userId}/checkout?type=cart&id=${id}${selectedCoupon?.id ? '&couponId=' + selectedCoupon?.id : ''}`); // Example: /customerProfile/123/checkout?type=cart&id=789
    } else if (id && mode === BuyBtnMode.QUICK_BUY) {
      router.push(`/customerProfile/${userId}/checkout?type=product&id=${id}${selectedCoupon?.id ? '&couponId=' + selectedCoupon?.id : ''}`); // Example: /customerProfile/123/checkout?type=product&id=456
    };
  }
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={handleBuyNow}
      className={`flex items-center justify-center gap-2 whitespace-nowrap select-none ${styles}`}
    >
      <CreditCard size={16} className="text-gray-700" />
      <span className="text-[13px] font-semibold tracking-wide">Buy Now</span>
    </motion.button>
  );
}
