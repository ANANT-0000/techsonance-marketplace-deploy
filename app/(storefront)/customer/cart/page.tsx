import { Metadata } from 'next';
import CartClient from './CartClient';

export const metadata: Metadata = {
  title: 'My Cart',
  description: 'Review the items in your shopping cart',
};

export default function Page() {
  return <CartClient />;
}