'use client';
import type { RootState } from '@/lib/store';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useRouter } from 'next/navigation';
import { checkAddressExistence } from '@/utils/customerApiClient';
import { BuyBtnMode, Coupon } from '@/utils/Types';
import { createCheckoutSession } from '@/hooks/UseCheckoutSession';
import { authToken } from '@/utils/authToken';

export function BuyBtn({ id, styles, mode, selectedCoupon }: { id?: string, styles?: string, mode?: BuyBtnMode ,selectedCoupon?: Coupon | null}) {
  const { user } = useAppSelector((state: RootState) => state.auth);
    const token = authToken();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const isSmall = styles?.includes('small');
  useEffect(() => {
    setIsMounted(true);
  }, []);
console.log("selectedCoupon",selectedCoupon)
  const userId = user?.id ? user.id : '';
  const handleBuyClick = async () => {
    console.log(userId)
    if (!user || !userId ||!token) {
      return router.push('/auth/customerLogin');
    }
    const checkAddress = await checkAddressExistence(userId, token);
    console.log("checkAddress count:", checkAddress.count);

    if (!checkAddress.hasAddresses || checkAddress.count === 0) {
      console.log('user does not have address');
      return router.push(`/customerProfile/${userId}/addresses`);
    }
    createCheckoutSession();
    if (id && mode === BuyBtnMode.CART) {
      router.push(`/customerProfile/${userId}/checkout?type=cart&id=${id}&couponId=${selectedCoupon?.id ?? ''}`); // Example: /customerProfile/123/checkout?type=cart&id=789
    } else if (id && mode === BuyBtnMode.QUICK_BUY) {
      router.push(`/customerProfile/${userId}/checkout?type=product&id=${id}&couponId=${selectedCoupon?.id ?? ''}`); // Example: /customerProfile/123/checkout?type=product&id=456
    };
  }
  return (
    <> {
      isMounted && user && (
        <motion.button onClick={handleBuyClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.8 }}
          transition={{ duration: 0.25 }} className={`bg-brand-primary-foreground text-primary   rounded-lg hover:bg-brand-primary-dark transition-colors duration-300 gap-2 text-center${isSmall ? 'py-1 px-2' : 'px-6 py-2'}   ${styles}`} >Buy </motion.button>
      )
    }

    </>
  )
}
