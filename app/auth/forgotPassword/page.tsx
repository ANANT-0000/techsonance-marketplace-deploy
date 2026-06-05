import { Metadata } from 'next';
import ForgotPasswordClient from './ForgotPasswordClient';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your techsonance marketplace password',
};

export default function Page() {
  return <ForgotPasswordClient />;
}