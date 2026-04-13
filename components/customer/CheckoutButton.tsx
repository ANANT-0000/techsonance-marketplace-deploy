// components/CheckoutButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/reduxHooks';
import { RootState } from '@/lib/store';
import { BASE_API_URL } from '@/constants';

export default function CheckoutButton({ cartItems }) {
    const { token } = useAppSelector((state: RootState) => state.auth);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        setIsLoading(true);

        try {
            const payload = cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }));
            const response = await fetch(`${BASE_API_URL}/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ items: payload }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            }

            // Strategy B: Embedded Payment Element (e.g., Stripe Elements)
            // else if (data.clientSecret) {
            //     // Redirect to a local Next.js page where you mount the payment UI
            //     router.push(`/checkout/payment?secret=${data.clientSecret}`);
            // }

        } catch (error) {
            console.error("Checkout failed:", error);
            alert("Failed to initiate checkout. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button onClick={handleCheckout} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Checkout'}
        </button>
    );
}