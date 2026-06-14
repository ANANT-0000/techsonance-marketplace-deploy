"use client";

import { UiText } from "@/constants/ui-text";
import type { RootState } from "@/lib/store";
import { motion } from "framer-motion";
import { useState } from "react";
import { OrderStatus, OrderStatusEnum } from "@/utils/Types";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { ChevronLeft } from "lucide-react";
import { useAppSelector } from "@/hooks/reduxHooks";
import { OrdersList } from "@/components/customer/OrderList";

interface OrdersPageProps {
  uiText?: {
    myOrders?: string;
    statusLabels?: Record<string, string>;
  };
}

export default function OrdersPage({ uiText }: OrdersPageProps) {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const userId = user && "id" in user ? user.id : null;
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const [orderStatus, setOrderStatus] = useState<
    OrderStatus | "returns" | null
  >(OrderStatusEnum.PENDING);

  const ordersStatusMap: Array<OrderStatus | "returns"> = [
    OrderStatusEnum.PROCESSING,
    OrderStatusEnum.SHIPPED,
    OrderStatusEnum.DELIVERED,
    OrderStatusEnum.CANCELLED,
    "returns",
  ];

  const defaultStatusLabels: Record<string, string> = {
    [OrderStatusEnum.PROCESSING]:
      UiText.CUSTOMER_ORDERS.STATUS_LABELS.PROCESSING,
    [OrderStatusEnum.DELIVERED]: UiText.CUSTOMER_ORDERS.STATUS_LABELS.DELIVERED,
    [OrderStatusEnum.CANCELLED]: UiText.CUSTOMER_ORDERS.STATUS_LABELS.CANCELLED,
    returns: UiText.CUSTOMER_ORDERS.STATUS_LABELS.RETURNS,
  };

  const statusLabels = uiText?.statusLabels ?? defaultStatusLabels;
  const myOrdersTitle = uiText?.myOrders ?? UiText.CUSTOMER_ORDERS.MY_ORDERS;

  return (
    <>
      <div className="flex items-center gap-3 my-4">
        <h1 className="font-bold text-theme-h5 text-gray-900">
          {myOrdersTitle}
        </h1>
      </div>

      <section className="w-full lg:px-4 px-2 min-h-[60vh]">
        {/* Desktop tabs — hidden on mobile (< sm = 640px) */}
        <div className="hidden sm:flex relative border-b border-gray-200 mb-6 gap-1 overflow-x-auto">
          {ordersStatusMap.map((status) => {
            const isActive = orderStatus === status;
            return (
              <motion.button
                key={status}
                animate={{
                  color: isActive ? "#1D4ED8" : "#6B7280",
                  borderColor: isActive ? "#1D4ED8" : "rgba(29, 78, 216, 0)",
                }}
                transition={{ duration: 0.2 }}
                className="relative lg:px-6 lg:py-2.5 px-4 py-2 font-medium transition-colors focus:outline-none border-b-2 -mb-px text-theme-body-sm whitespace-nowrap"
                onClick={() => setOrderStatus(status)}
              >
                {statusLabels[status] || status}
              </motion.button>
            );
          })}
        </div>

        <OrdersList
          customerId={userId}
          status={isMobile ? null : orderStatus}
          setStatus={setOrderStatus}
        />
      </section>
    </>
  );
}
