'use client';
import type { RootState } from "@/lib/store";
import { motion } from "motion/react";
import { useState } from "react";
import { OrderStatusEnum, UserOrder } from "@/utils/Types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { ChevronLeftCircle } from "lucide-react";
import { OrdersList } from "@/components/customer/OrderList";
import { useAppSelector } from "@/hooks/reduxHooks";

export default function OrdersPage() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const [orderStatus, setOrderStatus] = useState<OrderStatusEnum>(OrderStatusEnum.PENDING);
  const orders: UserOrder[] = [];

  const ordersStatusMap = [OrderStatusEnum.DELIVERED, OrderStatusEnum.PENDING, OrderStatusEnum.CANCELLED];
  const statusLabels: Record<string, string> = {
    [OrderStatusEnum.PENDING]: "Not Shipped yet",
    [OrderStatusEnum.DELIVERED ]: "Delivered",
    [OrderStatusEnum.CANCELLED]: "Cancelled",
  };
  return (
    <>
      <ChevronLeftCircle className="my-4 block lg:hidden" size={36} onClick={() => router.back()} />
      <section className="w-full lg:px-4 px-2 min-h-[60vh]">
        <h1 className="w-full mb-6 font-bold">My Orders</h1>

        <div className="lg:flex xl:flex hidden relative border-gray-300 mb-6 ">
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
                onClick={() => setOrderStatus(status as OrderStatusEnum)}
              >
                <motion.p
                  whileHover={{ scale: 1.05 }}
                  className="relative z-10"
                >
                  {/* 2. Look up the label, or fallback to the raw status if not found */}
                  {statusLabels[status] || status}
                </motion.p>
              </motion.button>
            );
          })}
        </div>
        <OrdersList customerId={user?.id ?? ''} status={orderStatus} />
      </section >
    </>
  )
}
