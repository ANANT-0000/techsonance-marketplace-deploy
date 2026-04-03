'use client';
import { MapPin, CreditCard } from "lucide-react";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PAYMENT_METHODS_FIELDS } from "@/constants/dynamicFields";
import { SelectedPaymentMethod } from "@/components/customer/SelectedPaymentMethod";
import { useAppSelector } from "@/hooks/reduxHooks";
import { formatCurrency } from "@/lib/utils";



export default function CheckoutPage() {
  const { user } = useAppSelector((state) => state.auth);
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
    <section className="max-w-6xl mx-auto lg:px-4 py-8 min-h-[60vh]">
      <h1 className="text-2xl font-bold text-center mb-8">
        Secure Checkout with Us
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="lg:space-y-6 space-y-2">

          <div className="border-2 border-gray-300 rounded-xl lg:p-6 p-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <MapPin className="w-5 h-5" />
              Delivering to
            </h2>
            <div className="bg-gray-50 rounded-lg lg:p-4 px-2">
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

          <div className="border-2 border-gray-300 rounded-xl lg:p-6 p-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </h2>

            <div className="lg:space-y-4 space-y-3">
              {PAYMENT_METHODS_FIELDS.map((method) => (
                <SelectedPaymentMethod
                  key={method.id}
                  method={method.label}
                  selectedMethod={selectedPaymentMethod}
                  onSelect={(method) => setSelectedPaymentMethod(method)}
                  onInputChange={(val) => {
                    setUpiId(val);
                    const upiRegex = /^[\w.-]+@[\w.-]+$/;
                    setUpiValid(upiRegex.test(val));
                  }
                  }
                  isValid={method.id === 'UPI' ? upiValid : true}
                  value={method.id === 'UPI' ? upiId : ''}
                  description={method.description}
                />
              ))}
            </div>

            <button className="w-full bg-black text-white font-semibold lg:py-3 py-2 rounded-lg mt-6 hover:bg-gray-800 transition-colors">
              Use this method
            </button>
          </div>
        </div>

        <div>
          <div className="border-2 border-gray-300 rounded-xl lg:p-6 p-2 sticky top-4">
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
              {
                Object.entries(orderData).map(([key, value]) => (
                  <div key={key} className={`flex justify-between text-gray-700 ${key === 'total' ? 'py-2 font-bold text-lg border-t-2' : ''}`}>
                    <span className="capitalize">{key.replace('_', ' ')}</span>
                    <span  >₹{formatCurrency(value)}</span>
                  </div>
                ))

              }
            </div>



            <button className="w-full bg-blue-600 text-white font-semibold lg:py-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              Pay ₹{formatCurrency(orderData.total)}
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