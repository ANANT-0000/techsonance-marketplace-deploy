import { OrderStatusEnum, OrderSuccessStatusTypes, UserOrder } from "@/utils/Types";
import { motion } from "motion/react";
import { OrderCard } from "./OrderCard";
export const OrdersList = ({ orders, status, isMobile }: { orders: UserOrder[], status: OrderStatusEnum, isMobile: boolean }) => {
    const filteredOrders = orders.filter(order => order.order_status === status);

    return (
        <motion.div className="space-y-4 w-full">
            {filteredOrders.map(order => (
                <OrderCard key={order.order_id} order={order} isMobile={isMobile} />
            ))}
            {filteredOrders.length === 0 && <p className="text-gray-500 text-center py-10">No {status} orders found.</p>}
        </motion.div>
    )
}