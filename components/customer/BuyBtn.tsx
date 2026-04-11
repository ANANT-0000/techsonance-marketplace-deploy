'use client';
import Link from 'next/link'
import type { RootState } from '@/lib/store';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useRouter } from 'next/navigation';
import { checkAddressExistence } from '@/utils/customerApiClient';

export function BuyBtn({ productId, styles }: { productId?: string, styles?: string }) {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const userId = user?.id ? user.id : '';
  const handleBuyClick = async () => {
    const checkAddress: { hasAddresses: boolean, count: number } = await checkAddressExistence(userId);
    console.log("checkAddress", checkAddress.count);
    if (!user) return router.push('/customerLogin');
    if (!checkAddress.hasAddresses || checkAddress.count === 0) {
      console.log('user not hve address')
      router.push(`/customerProfile/${userId}/addresses`);
    } else {
      router.push(`/customerProfile/${userId}/checkout/${productId}`);
    }
  };
  return (
    <> {
      isMounted && user ? (
        <motion.button onClick={handleBuyClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.8 }}
          transition={{ duration: 0.25 }} className={`bg-brand-primary-foreground text-primary px-6 py-3  rounded-lg hover:bg-brand-primary-dark transition-colors duration-300 gap-2 text-center   ${styles}`} >Buy </motion.button>
      ) : (

        <motion.button
          onClick={handleBuyClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.8 }}
          transition={{ duration: 0.25 }} className={`bg-brand-primary-foreground text-primary px-6 py-3  rounded-lg hover:bg-brand-primary-dark transition-colors duration-300 gap-2 text-center   ${styles}`} >Buy </motion.button>
      )
    }

    </>
  )
}
