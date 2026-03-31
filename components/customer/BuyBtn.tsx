'use client';
import Link from 'next/link'
import type { RootState } from '@/lib/store';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/reduxHooks';

export function BuyBtn({ productId, styles }: { productId?: string, styles?: string }) {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const userId = user?.user_id ? user.user_id : '';

  return (
    <> {
      isMounted && user ? (
        <Link href={`/customerProfile${userId ? `/${userId}` : ''}/checkout/${productId}`} className={`${styles}  `}>
          <motion.button whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            transition={{ duration: 0.25 }} className={`bg-brand-primary-foreground text-primary px-6 py-3  rounded-lg hover:bg-brand-primary-dark transition-colors duration-300 gap-2 text-center   ${styles}`} >Buy </motion.button> </Link>
      ) : (
        <Link href={`/customerLogin`} className={`${styles}  `}>
          <motion.button whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            transition={{ duration: 0.25 }} className={`bg-brand-primary-foreground text-primary px-6 py-3  rounded-lg hover:bg-brand-primary-dark transition-colors duration-300 gap-2 text-center   ${styles}`} >Buy </motion.button> </Link>
      )}

    </>
  )
}
