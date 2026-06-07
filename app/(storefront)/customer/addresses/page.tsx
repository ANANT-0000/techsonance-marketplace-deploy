import { Metadata } from 'next';
import AddressesClient from './AddressesClient';

export const metadata: Metadata = {
  title: 'My Addresses',
  description: 'Manage your shipping and billing locations',
};

export default function Page() {
  return <AddressesClient />;
}
