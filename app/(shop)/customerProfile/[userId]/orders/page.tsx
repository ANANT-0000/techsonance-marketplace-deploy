'use client';
import type { RootState } from "@/lib/store";
import { motion } from "motion/react";
import { useState } from "react";
import type { UserOrder } from "@/utils/Types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { ChevronLeftCircle } from "lucide-react";
import { OrdersList } from "@/components/customer/OrderList";
import { useAppSelector } from "@/hooks/reduxHooks";

type ordersStatusType = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';




export default function OrdersPage() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const [orderStatus, setOrderStatus] = useState<ordersStatusType>('Pending');
  const orders: UserOrder[] = user?.orders || [];

  const ordersStatusMap = ["Pending", "Delivered", "Cancelled"];

  return (
    <>
      <ChevronLeftCircle className="my-4 block lg:hidden" size={36} onClick={() => router.back()} />
      <section className="w-full lg:px-4 px-2 min-h-[60vh]">
        <h1 className="w-full mb-6 font-bold">My Orders</h1>

        <div className="flex relative border-gray-300 mb-6">
          {ordersStatusMap.map((status) => {
            const isActive = orderStatus === status;
            return (
              <motion.button
                key={status}
                animate={{
                  color: isActive ? "#1D4ED8" : "#6B7280",
                  borderColor: isActive ? "#1D4ED8" : "transparent",
                }}
                transition={{
                  duration: 0.3,
                  color: { type: 'spring', ease: 'easeInOut', duration: 0.3 },
                  background: { type: 'spring', ease: 'easeInOut', duration: 0.5 }
                }}
                className={"relative lg:px-6 lg:py-2 px-4 font-medium transition-colors focus:outline-none border-b-4"}
                onClick={() => setOrderStatus(status as ordersStatusType)}
              >
                <motion.p
                  whileHover={{ scale: 1.05 }}
                  className="relative z-10">
                  {status === 'Pending' ? 'Active' : status === 'Shipped' ? 'Shipped' : status === 'Delivered' ? 'Delivered' : 'Cancelled'}
                </motion.p>
              </motion.button>
            );
          })}
        </div>
        <OrdersList orders={orders} status={orderStatus} isMobile={isMobile} />
      </section>
    </>
  )
}
