import { Metadata } from 'next';
import CartClient from './CartClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'My Cart',
  description: 'Review the items in your shopping cart',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50/30">Loading cart...</div>}>
      <CartClient />
    </Suspense>
  );
}