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
import { BUY_BTN_TEXT } from '@/constants/customerText';

export function BuyBtn({ id, styles, iconStyles, mode, selectedCoupon, quantity }: { id?: string, styles?: string, iconStyles?: string, mode?: BuyBtnMode, selectedCoupon?: Coupon | null, quantity?: number }) {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const token = authToken();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const isSmall = styles?.includes('small');
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const userId = user?.id ? user.id : '';
  const handleBuyNow = async () => {
    if (!user || !userId || !token) {
      let redirectTarget = '/';
      if (mode === BuyBtnMode.CART) {
        redirectTarget = `/customer/cart?checkout=true${selectedCoupon?.id ? '&couponId=' + selectedCoupon.id : ''}`;
      } else if (mode === BuyBtnMode.QUICK_BUY && id) {
        redirectTarget = `/customer/checkout?type=product&id=${id}&qty=${quantity ?? 1}${selectedCoupon?.id ? '&couponId=' + selectedCoupon.id : ''}`;
      }
      return router.push(`/auth/customerLogin?redirect=${encodeURIComponent(redirectTarget)}`);
    }

    createCheckoutSession();
    if (id && mode === BuyBtnMode.CART) {
      router.push(`/customer/checkout?type=cart&id=${id}${selectedCoupon?.id ? '&couponId=' + selectedCoupon?.id : ''}`); // Example:   
    } else if (id && mode === BuyBtnMode.QUICK_BUY) {
      router.push(`/customer/checkout?type=product&id=${id}&qty=${quantity ?? 1}${selectedCoupon?.id ? '&couponId=' + selectedCoupon?.id : ''}`); // Example:  
    };
  }
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={handleBuyNow}
      className={`flex items-center justify-center gap-2 whitespace-nowrap select-none ${styles}`}
    >
      <CreditCard size={16} className={iconStyles || 'text-white'} />
      <span className="text-[13px] font-semibold tracking-wide ">{BUY_BTN_TEXT.BUY_NOW}</span>
    </motion.button>
  );
}
