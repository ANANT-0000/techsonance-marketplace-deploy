import { fetchGetUserAddresses } from "@/utils/customerApiClient";
import { Address } from "@/utils/Types";
import { MapPin, Plus } from "lucide-react";
import { Dispatch, SetStateAction, use, useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { on } from "events";

const BADGE_STYLES: Record<string, string> = {
    home: "bg-green-50 text-green-700",
    work: "bg-purple-50 text-purple-700",
    other: "bg-gray-100 text-gray-500",
};

export function AddressSelector({
    userId,
    selectedAddressId,
    onSelect,
}: {
    userId: string;
    selectedAddressId: string;
    onSelect: Dispatch<SetStateAction<string>>;
}) {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAddresses = async () => {
            setIsLoading(true);
            const userAddresses = await fetchGetUserAddresses(userId);
            if (userAddresses.status === 200) setAddresses(userAddresses.data);
            setIsLoading(false);
        };
        fetchAddresses();
    }, [userId]);
    useEffect(() => {
        console.log("Fetched addresses:", addresses);
        addresses.find(addr => {
            const isMatch = addr.is_default === true;
            if (isMatch) {
                onSelect(addr.id);
            }
        }
        )

    }, [addresses]);
    return (
        <div className="border border-gray-200 rounded-xl p-4 lg:p-5 space-y-3">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-[15px] font-medium text-gray-900">Delivery address</h2>
                </div>
                <Link href={`/customerProfile/${userId}/addresses`} className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md hover:bg-blue-100 transition-colors">
                    <Plus className="w-3 h-3" />
                    Add new
                </Link>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="space-y-2">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse" />
                    ))}
                </div>
            )}

            {/* Empty */}
            {!isLoading && addresses.length === 0 && (
                <div className="text-center py-8">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                        <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400">No saved addresses</p>
                    <p className="text-xs text-gray-300 mt-0.5">Add one to continue</p>
                </div>
            )}

            {/* Address list */}
            {!isLoading && addresses.length > 0 && (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                    {addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        const badgeStyle = BADGE_STYLES[addr.address_type?.toLowerCase()] ?? BADGE_STYLES.other;

                        return (
                            <motion.button
                                key={addr.id}
                                onClick={() => onSelect(addr.id)}
                                whileTap={{ scale: 0.99 }}
                                className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-all text-sm ${isSelected
                                    ? "border-blue-400 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                {/* Radio indicator */}
                                <div
                                    className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                                        }`}
                                >
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                        <span className="font-medium text-gray-900 text-[13px]">{addr.name}</span>
                                        <span className={`text-[.5rem] font-medium px-2 py-0.5 rounded-full capitalize ${badgeStyle}`}>
                                            {addr.address_type}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-[0.875rem] leading-relaxed">
                                        {[addr.address_line1, addr.address_line2, addr.street].filter(Boolean).join(", ")}
                                        <br />
                                        {addr.city}, {addr.state} — {addr.postal_code}
                                    </p>
                                    {addr.number && (
                                        <p className="text-gray-400 text-[0.875rem] mt-1">{addr.number}</p>
                                    )}
                                </div>

                                {/* Checkmark */}
                                {isSelected && (
                                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}