'use client';
import type { RootState } from "@/lib/store";
import { motion } from "motion/react";
import { useState } from "react";
import { OrderStatus, OrderStatusEnum } from "@/utils/Types";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { ChevronLeft, ChevronLeftCircle } from "lucide-react";
import { OrdersList } from "@/components/customer/OrderList";
import { useAppSelector } from "@/hooks/reduxHooks";

export default function OrdersPage() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const [orderStatus, setOrderStatus] = useState<OrderStatus | 'returns' | null>(
    OrderStatusEnum.PENDING
  );

  const ordersStatusMap: Array<OrderStatus | 'returns'> = [
    OrderStatusEnum.PENDING,
    OrderStatusEnum.DELIVERED,
    OrderStatusEnum.CANCELLED,
    'returns',
  ];

  const statusLabels: Record<string, string> = {
    [OrderStatusEnum.PENDING]: "Not Shipped Yet",
    [OrderStatusEnum.DELIVERED]: "Delivered",
    [OrderStatusEnum.CANCELLED]: "Cancelled",
    returns: "Returns & Replacements",
  };

  return (
    <>
      <div className="flex items-center gap-3 my-4 sm:hidden">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-bold text-xl text-gray-900">My Orders</h1>
      </div>

      <section className="w-full lg:px-4 px-2 min-h-[60vh]">
        {/* Desktop tabs — hidden on mobile (< sm = 640px) */}
        <div className="hidden sm:flex relative border-b border-gray-200 mb-6 gap-1">
          {ordersStatusMap.map((status) => {
            const isActive = orderStatus === status;
            return (
              <motion.button
                key={status}
                animate={{
                  color: isActive ? "#1D4ED8" : "#6B7280",
                  borderColor: isActive ? "#1D4ED8" : "transparent",
                }}
                transition={{ duration: 0.2 }}
                className="relative lg:px-6 lg:py-2.5 px-4 py-2 font-medium transition-colors focus:outline-none border-b-2 -mb-px text-sm whitespace-nowrap"
                onClick={() => setOrderStatus(status)}
              >
                {statusLabels[status] || status}
              </motion.button>
            );
          })}
        </div>

        <OrdersList
          customerId={user?.id ?? ''}
          status={isMobile ? null : orderStatus}
        />
      </section>
    </>
  );
}
