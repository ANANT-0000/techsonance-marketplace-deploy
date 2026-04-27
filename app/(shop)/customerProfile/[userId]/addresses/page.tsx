'use client';
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronLeftCircle } from "lucide-react";
// import { deleteAddress, setDefaultAddress } from "@/lib/features/auth/authSlice";

import { useRouter } from "next/navigation";
import { AddressCard } from "@/components/customer/AddressCard";
import { AddressModal } from "@/components/customer/AddressModel";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { RootState } from "@/lib/store";
import { fetchDeleteUserAddress, fetchGetUserAddresses, fetchSetDefaultAddress } from "@/utils/customerApiClient";
import { AddressOperationEnum, Address } from "@/utils/Types";

export default function Addresses() {
    const user = useAppSelector((state: RootState) => state.auth.user);
    const dispatch = useAppDispatch();
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<AddressOperationEnum>(AddressOperationEnum.ADD);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [addressList, setAddressList] = useState<Address[]>([]);
    useEffect(() => {
        const fetchAddresses = async () => {
            if (user?.id) {
                const response = await fetchGetUserAddresses(user.id);
                console.log("address Response", response);
                setAddressList(response.data);
            }
        }
        fetchAddresses();
    }, [user, addressList.length]);
    const router = useRouter()
    const openAdd = () => {
        setModalMode(AddressOperationEnum.ADD);
        setSelectedId(undefined);
        setModalOpen(true);
    };

    const openEdit = (id: string) => {
        setModalMode(AddressOperationEnum.EDIT);
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
            <div className="flex items-center gap-3 my-4 sm:hidden">
                <button
                    onClick={() => router.back()}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Go back"
                >
                    <ChevronLeft size={20} />
                </button>
                <h1 className="font-bold text-xl text-gray-900">My Addresses</h1>
            </div>
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
                {isModalOpen && user?.id && (
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
