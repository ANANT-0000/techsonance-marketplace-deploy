'use client';
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeftCircle } from "lucide-react";
// import { deleteAddress, setDefaultAddress } from "@/lib/features/auth/authSlice";

import { useRouter } from "next/navigation";
import { AddressCard } from "@/components/customer/AddressCard";
import { AddressModal } from "@/components/customer/AddressModel";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { fetchDeleteUserAddress, fetchGetUserAddresses, fetchSetDefaultAddress } from "@/utils/customerApiClient";
export interface AddressType {
    address_line1: string;
    address_line2: string;
    address_type: string;
    city: string;
    company_id: string | null;
    country: string;
    created_at: string;
    id: string;
    is_default: boolean;
    landmark: string;
    name: string;
    number: string;
    postal_code: string;
    state: string;
    street: string;
    updated_at: string;
    user_id: string;
}
export default function Addresses() {
    const user = useAppSelector((state: RootState) => state.auth.user);
    const dispatch = useAppDispatch();
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [addressList, setAddressList] = useState<AddressType[]>([]);
    useEffect(() => {
        const fetchAddresses = async () => {
            if (user) {
                const response = await fetchGetUserAddresses(user.id);
                console.log("address Response", response);
                setAddressList(response.data);
            }
        }
        fetchAddresses();
    }, [user, addressList.length]);
    const router = useRouter()
    const openAdd = () => {
        setModalMode('add');
        setSelectedId(undefined);
        setModalOpen(true);
    };

    const openEdit = (id: string) => {
        setModalMode('edit');
        setSelectedId(id);
        setModalOpen(true);
    };
    const handleDelete = async (userId: string, id: string) => {
        if (confirm(`Are you sure you want to delete this address? ${id}`)) {
            await fetchDeleteUserAddress(userId, id);
            setAddressList(prev => prev.filter(addr => addr.id !== id));
        }
    };
    const handleSetDefault = async (userId: string, id: string) => {
        await fetchSetDefaultAddress(userId, id);
        setAddressList(prev => prev.map(addr => ({ ...addr, is_default: addr.id === id })));
    };
    return (
        <section className="w-full  mt-2 mx-auto mb-20">
            <ChevronLeftCircle className="mb-4 block lg:hidden" size={36} onClick={() => router.back()} />
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
                    <p className="text-gray-500 mt-1">Manage your shipping and billing locations</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openAdd}
                    className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                    + Add New
                </motion.button>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                    {addressList && addressList.length > 0 ? (
                        addressList.map((address) => (
                            <AddressCard
                                key={address.id}
                                address={address}
                                onEdit={openEdit}
                                onDelete={handleDelete}
                                onSetDefault={handleSetDefault}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl"
                        >
                            <p className="text-gray-400">No addresses saved yet.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


            <AnimatePresence>
                {isModalOpen && user && (
                    <AddressModal
                        user={user}
                        addressId={selectedId}
                        addressList={addressList}
                        operation={modalMode}
                        onClose={() => setModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
}
