import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Secure Checkout',
  description: 'Complete your purchase securely',
};

export default function Page() {
  return <CheckoutClient />;
}