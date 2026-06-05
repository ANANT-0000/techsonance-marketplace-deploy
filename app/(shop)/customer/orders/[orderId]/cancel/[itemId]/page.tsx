import { Metadata } from 'next';
import CancelItemClient from './CancelItemClient';

export const metadata: Metadata = {
  title: 'Cancel Item',
  description: 'Cancel an item from your order',
};

export default function Page() {
  return <CancelItemClient />;
}