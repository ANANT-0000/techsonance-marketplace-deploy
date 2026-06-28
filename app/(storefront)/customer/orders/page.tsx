"use client";

import { UiText } from "@/constants/ui-text";
import type { RootState } from "@/lib/store";
import { motion } from "framer-motion";
import { useState } from "react";
import { OrderStatus } from "@/utils/Types";
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

  // FIX 1: Set default initialization state to PROCESSING ("Not Shipped Yet")
  // so a matching tab is selected on initial page render.
  const [orderStatus, setOrderStatus] = useState<
    OrderStatus | "returns" | null
  >(OrderStatus.PROCESSING);

  const ordersStatusMap: Array<OrderStatus | "returns"> = [
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
    "returns",
  ];

  // FIX 2: Added missing Shipped label alignment to match UI schema formatting
  const defaultStatusLabels: Record<string, string> = {
    [OrderStatus.PROCESSING]: UiText.CUSTOMER_ORDERS.STATUS_LABELS.PROCESSING,
    [OrderStatus.SHIPPED]: "Shipped",
    [OrderStatus.DELIVERED]: UiText.CUSTOMER_ORDERS.STATUS_LABELS.DELIVERED,
    [OrderStatus.CANCELLED]: UiText.CUSTOMER_ORDERS.STATUS_LABELS.CANCELLED,
    returns: UiText.CUSTOMER_ORDERS.STATUS_LABELS.RETURNS,
  };

  const statusLabels = uiText?.statusLabels ?? defaultStatusLabels;
  const myOrdersTitle = uiText?.myOrders ?? UiText.CUSTOMER_ORDERS.MY_ORDERS;

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 lg:px-8 font-sans text-left  ">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          {myOrdersTitle}
        </h1>
      </div>

      <section className="w-full min-h-[60vh]">
        {/* Desktop Tabs View: Hidden cleanly below 768px (md) to prevent layout intersections */}
        <div className="hidden md:flex relative border-b border-border mb-6 gap-2 overflow-hidden">
          {ordersStatusMap.map((status) => {
            const isActive = orderStatus === status;
            return (
              <motion.button
                key={status}
                animate={{
                  color: isActive
                    ? "var(--theme-primary)"
                    : "var(--muted-foreground)",
                  borderColor: isActive
                    ? "var(--theme-primary)"
                    : "rgba(0, 0, 0, 0)",
                }}
                transition={{ duration: 0.2 }}
                className="relative lg:px-6 lg:py-3 px-4 py-2 font-bold transition-all focus:outline-none border-b-2 -mb-px text-xs whitespace-nowrap cursor-pointer hover:text-foreground"
                onClick={() => setOrderStatus(status)}
              >
                {statusLabels[status] || status}
              </motion.button>
            );
          })}
        </div>

        <OrdersList
          customerId={userId}
          status={orderStatus}
          setStatus={setOrderStatus}
        />
      </section>
    </div>
  );
}
