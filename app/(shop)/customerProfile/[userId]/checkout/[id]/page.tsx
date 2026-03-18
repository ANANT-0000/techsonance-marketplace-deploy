'use client';
import { MapPin, CreditCard } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/Redux store/store";
import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CheckoutPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const params = useParams<{ userId: string; id: string }>();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('UPI');
  const [couponCode, setCouponCode] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [upiValid, setUpiValid] = useState<boolean>(false);

  const orderData = {
    subtotal: 1999,
    discount: 300,
    delivery: 0,
    total: 1699
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 min-h-[60vh]">
      <h1 className="text-2xl font-bold text-center mb-8">
        Secure Checkout with Us
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="space-y-6">

          <div className="border-2 border-gray-300 rounded-xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <MapPin className="w-5 h-5" />
              Delivering to
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-1">
                {user?.name || 'Guest User'}
              </h3>
              {user?.addresses?.filter(addr => addr.is_default === true).map((adr, idx) => (
                <p key={idx} className="text-gray-700 text-sm leading-relaxed">
                  {adr.address_line1}, {adr.city}, {adr.state}, {adr.postal_code}, {adr.country}
                </p>
              ))}
            </div>
            <Link href={`/customerProfile/${user?.user_id}/addresses`}>
              <motion.button
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}>
                Update Address
              </motion.button>
            </Link>
          </div>

          <div className="border-2 border-gray-300 rounded-xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </h2>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input type="radio" name="paymentMethod" value="UPI" checked={selectedPaymentMethod === 'UPI'} onChange={(e) => setSelectedPaymentMethod(e.target.value)} className="mt-1" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">UPI</div>
                  <div className="flex gap-3">
                    <input type="text" className="text-lg text-gray-600" placeholder="Enter your UPI ID" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                    {selectedPaymentMethod === 'UPI' && (
                      upiId !== '' && (upiValid ?
                        <div className="text-green-600 text-sm mt-1">Verify</div>
                        :
                        <div className="text-red-600 text-sm mt-1">Invalid UPI ID</div>)
                    )}
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="radio" name="paymentMethod" value="Card" checked={selectedPaymentMethod === 'Card'} onChange={(e) => setSelectedPaymentMethod(e.target.value)} className="mt-1" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Credit or debit card</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="radio" name="paymentMethod" value="COD" checked={selectedPaymentMethod === 'COD'} onChange={(e) => setSelectedPaymentMethod(e.target.value)} className="mt-1" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Cash on Delivery/Pay on Delivery</div>
                  <div className="text-sm text-gray-600">
                    Cash, UPI and Cards accepted.{' '}
                    <span className="text-blue-600 hover:underline cursor-pointer">Know more.</span>
                  </div>
                </div>
              </label>
            </div>

            <button className="w-full bg-black text-white font-semibold py-3 rounded-lg mt-6 hover:bg-gray-800 transition-colors">
              Use this method
            </button>
          </div>
        </div>

        <div>
          <div className="border-2 border-gray-300 rounded-xl p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="flex flex-wrap gap-2 mb-6">
              <input
                type="text"
                placeholder="Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Apply
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>₹{orderData.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Discount</span>
                <span className="text-green-600">- ₹{orderData.discount}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total</span>
                <span>₹{orderData.total.toLocaleString()}</span>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              Pay ₹{orderData.total.toLocaleString()}
              <span>→</span>
            </button>

            <div className="text-center mt-4 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1">
                <span className="text-black">🛡️</span>
                Safe and Secure Payments. 100% Authentic products
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}