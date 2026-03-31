import { PRODUCT_LIST } from "@/constants";
import { PRODUCT_LIST_TYPE, UserOrder } from "@/utils/Types";
import { motion } from "motion/react";
export const OrderCard = ({ order, isMobile }: { order: UserOrder, isMobile: boolean }) => {
    const productId: string | undefined = order.products?.[0]?.product_id;
    const quantity: number = order.products?.[0]?.quantity ?? 0;

    const productDetails: PRODUCT_LIST_TYPE | undefined = PRODUCT_LIST.find(p => p.id === productId)
    const product: PRODUCT_LIST_TYPE | undefined = Array.isArray(productDetails) ? productDetails[0] : productDetails;

    if (isMobile) {
        return (
            <motion.div className="w-full flex border-2 border-gray-300 rounded-xl gap-4 py-1">
                <img src={product?.imgUrl ? product.imgUrl : "https://placehold.net/10.png"} alt={product?.title} className="ml-1 rounded-lg h-24 w-24 object-cover" />
                <div className="flex flex-col justify-start items-start gap-2">
                    <p className="text-blue-600 line-clamp-1">{product?.title}</p>
                    {order.order_status === 'Delivered' ? <p className="text-green-600">Delivered</p> : <p className="text-orange-600">Pending</p>}
                    <p>ordered on {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
            </motion.div>
        )
    }
    return (
        <motion.div className="w-full border-2 border-gray-300 rounded-xl p-4">
            <header className="flex justify-between items-start mb-4 border-b-2 border-gray-200 pb-2">
                <span className="flex gap-8">
                    <div className="text-gray-500">
                        <h3 className="mb-1"> ORDER PLACED</h3>
                        <p>{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-gray-500">
                        <h3 className="mb-1">  TOTAL AMOUNT</h3>
                        <p>₹{order.total_amount.toLocaleString()}</p>
                    </div>
                    <div className="text-gray-500">
                        <h3 className="mb-1">SHIP TO</h3>
                        <p className="text-blue-400">{Array.isArray(order.shippingTo) ? order.shippingTo.find(addr => addr.name) : order.shippingTo}</p>
                    </div>
                </span>
                <div>
                    <h1 className="text-gray-500">ORDER #{order.order_id}</h1>
                    <span className="space-x-6">
                        <Link href={`/shop/order-details/${order.order_id}`} className="text-blue-400 hover:underline">View Details</Link>
                        <select name="invoice" className="text-blue-400 hover:underline">
                            <option value="invoice" className="text-blue-400 hover:underline">Invoice  </option>
                            <option value="receipt">Receipt</option>
                        </select>
                    </span>
                </div>
            </header>
            {order.order_status == 'Pending' && <motion.div className="mb-2 rounded text-lg font-semibold">
                Order will Deliver soon
            </motion.div>}
            <div className="flex justify-start items-start gap-4">
                <img src={product?.imgUrl ? product.imgUrl : "https://placehold.net/10.png"} alt={product?.title} className="w-24 h-24 object-cover rounded" />
                <div>
                    <p className="text-blue-600 line-clamp-1">{product?.title}</p>
                    <p className="text-gray-600">Quantity: {quantity}</p>
                </div>
                <div className="flex justify-end items-end ml-auto gap-4">
                    {order.order_status === 'Delivered' && <motion.button className="text-blue-400 hover:underline justify-self-end">Write review</motion.button>}
                </div>
            </div>
        </motion.div>
    )
}
