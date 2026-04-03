'use client';
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeftCircle } from "lucide-react";
import { deleteAddress, setDefaultAddress } from "@/lib/features/auth/authSlice";

import { useRouter } from "next/navigation";
import { AddressCard } from "@/components/customer/AddressCard";
import { AddressModal } from "@/components/customer/AddressModel";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

export default function Addresses() {
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const router = useRouter()
    const openAdd = () => {
        setModalMode('add');
        setSelectedId(undefined);
        setModalOpen(true);
    };

    const openEdit = (id: number) => {
        setModalMode('edit');
        setSelectedId(id.toString());
        setModalOpen(true);
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
                    {user?.addresses.length ? (
                        user.addresses.map((address) => (
                            <AddressCard
                                key={address.address_id}
                                address={address}
                                onEdit={openEdit}
                                onDelete={(id: number) => dispatch(deleteAddress(id))}
                                onSetDefault={(id: number) => dispatch(setDefaultAddress(id))}
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
                        operation={modalMode}
                        onClose={() => setModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
}
