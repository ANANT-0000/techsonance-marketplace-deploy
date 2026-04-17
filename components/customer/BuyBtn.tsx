'use client';
import Link from 'next/link'
import type { RootState } from '@/lib/store';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useRouter } from 'next/navigation';
import { checkAddressExistence } from '@/utils/customerApiClient';
import { BuyBtnMode } from '@/utils/Types';
import { createCheckoutSession } from '@/hooks/UseCheckoutSession';

export function BuyBtn({ id, styles, mode }: { id?: string, styles?: string, mode?: BuyBtnMode }) {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const userId = user?.id ? user.id : '';
  const handleBuyClick = async () => {

    if (!user || !userId) {
      return router.push('/auth/customerLogin');
    }
    const checkAddress = await checkAddressExistence(userId);
    console.log("checkAddress count:", checkAddress.count);

    if (!checkAddress.hasAddresses || checkAddress.count === 0) {
      console.log('user does not have address');
      return router.push(`/customerProfile/${userId}/addresses`);
    }
    createCheckoutSession();
    if (id && mode === BuyBtnMode.CART) {
      router.push(`/customerProfile/${userId}/checkout?type=cart&id=${id}`); // Example: /customerProfile/123/checkout?type=cart&id=789
    } else if (id && mode === BuyBtnMode.QUICK_BUY) {
      router.push(`/customerProfile/${userId}/checkout?type=product&id=${id}`); // Example: /customerProfile/123/checkout?type=product&id=456
    };
  }
  return (
    <> {
      isMounted && user && (
        <motion.button onClick={handleBuyClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.8 }}
          transition={{ duration: 0.25 }} className={`bg-brand-primary-foreground text-primary px-6 py-3  rounded-lg hover:bg-brand-primary-dark transition-colors duration-300 gap-2 text-center   ${styles}`} >Buy </motion.button>
      )
    }

    </>
  )
}
