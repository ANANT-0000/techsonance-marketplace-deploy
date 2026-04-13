import { fetchGetUserAddresses } from "@/utils/customerApiClient";
import { AddressType } from "@/utils/Types";
import { CheckCircle2 } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { motion } from "motion/react";
export function AddressSelector({
    userId,
    selectedAddressId,
    onSelect,
}: {
    userId: string;
    selectedAddressId: string;
    onSelect: Dispatch<SetStateAction<string>>;
}) {
    const [addresses, setAddresses] = useState<AddressType[]>([]);
    useEffect(() => {
        const fetchAddresses = async () => {
            const userAddresses = await fetchGetUserAddresses(userId);
            if (userAddresses.status !== 200) {
                console.log("Failed to fetch addresses:", userAddresses);
                return;
            }
            setAddresses(userAddresses.data);
        };
        fetchAddresses();
    }, [userId]);
    if (addresses.length === 0) {
        return (
            <p className="text-sm text-gray-400 italic">
                No addresses saved. Please add one.
            </p>
        );
    }

    return (
        <div className="space-y-3 mt-2 max-h-64 overflow-y-auto pr-1">
            {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                    <motion.button
                        key={addr.id}
                        onClick={() => onSelect(addr.id)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-colors text-sm ${isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-200"
                            }`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {addr.name}
                                    <span className="ml-2 text-[10px] font-bold uppercase text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                        {addr.address_type}
                                    </span>
                                </p>
                                <p className="text-gray-600 mt-0.5 leading-relaxed">
                                    {addr.address_line1}
                                    {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                                    {addr.street ? `, ${addr.street}` : ""}
                                    <br />
                                    {addr.city}, {addr.state} - {addr.postal_code}
                                    <br />
                                    {addr.country}
                                </p>
                                <p className="text-gray-500 mt-1 font-medium">{addr.number}</p>
                            </div>
                            {isSelected && (
                                <CheckCircle2 className="text-blue-500 shrink-0 mt-0.5" size={18} />
                            )}
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}
