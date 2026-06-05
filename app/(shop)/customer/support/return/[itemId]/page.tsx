import { Metadata } from 'next';
import ReturnReplaceClient from './ReturnReplaceClient';

export const metadata: Metadata = {
  title: 'Return Item',
  description: 'Return or replace an order item',
};

export default function Page() {
  return <ReturnReplaceClient />;
}