'use client';
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { Pen, Trash2, X, Home, Briefcase, MapPin, CheckCircle2, ChevronLeftCircle } from "lucide-react";
import { createAddress, deleteAddress, updateAddress, setDefaultAddress } from "@/Redux store/features/auth/authSlice";
import type { RootState } from "@/Redux store/store";
import type { UserProfile } from "@/utils/Types";
import { useRouter } from "next/navigation";

// --- 1. Reusable Form Input Component ---
const FormInput = ({ label, register, name, required = false, ...rest }: any) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-600">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            {...register(name, { required })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            {...rest}
        />
    </div>
);

// --- 2. The Animated Modal Form ---
const AddressModal = ({ user, addressId, operation, onClose }: {
    user: UserProfile,
    addressId?: string,
    operation: 'edit' | 'add',
    onClose: () => void
}) => {
    const dispatch = useDispatch();
    const existingAddress = user.addresses.find(addr => addr.address_id.toString() === addressId);

    const { register, handleSubmit, reset } = useForm({
        defaultValues: operation === 'edit' && existingAddress ? existingAddress : {
            address_for: 'home',
            is_default: false
        }
    });

    const onSubmit = (data: any) => {
        if (operation === 'edit') {
            dispatch(updateAddress({ ...data, address_id: existingAddress?.address_id }));

        } else {
            dispatch(createAddress({ ...data, address_id: Date.now() }));
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center  px-4">

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0  bg-black/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-2xl  rounded-2xl shadow-2xl overflow-hidden z-10"
            >
                <div className="flex justify-between items-center py-3 px-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        {operation === 'edit' ? 'Edit Address' : 'Add New Address'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="lg:p-6 p-3 space-y-4 max-h-[70dvh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-600">Address Type</label>
                            <select {...register('address_for')} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="home">Home</option>
                                <option value="work">Work</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <FormInput label="Phone" name="phone" register={register} required />
                        <FormInput label="Address Line 1" name="address_line1" register={register} required />
                        <FormInput label="City" name="city" register={register} required />
                        <FormInput label="State" name="state" register={register} required />
                        <FormInput label="Postal Code" name="postal_code" register={register} required />
                        <FormInput label="Country" name="country" register={register} required />
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" {...register('is_default')} id="is_default" className="w-4 h-4 text-blue-600 rounded" />
                        <label htmlFor="is_default" className="text-gray-700">Set as default address</label>
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all">Save Address</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// --- 3. Individual Address Card ---
const AddressCard = ({ address, onEdit, onDelete, onSetDefault }: any) => {
    const Icon = address.address_for === 'work' ? Briefcase : address.address_for === 'home' ? Home : MapPin;

    return (
        <motion.div
            layout // Magic prop for smooth reordering
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -2 }}
            className={`relative  p-6 rounded-2xl border-2 transition-colors bg-white ${address.is_default ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200'
                }`}
        >
            {address.is_default && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-blue-600 text-xs font-bold bg-blue-100 px-2 py-1 rounded-lg">
                    <CheckCircle2 size={12} /> DEFAULT
                </div>
            )}

            <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-xl ${address.is_default ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 capitalize text-lg">{address.address_for}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mt-1">
                        {address.address_line1}<br />
                        {address.city}, {address.state} {address.postal_code}<br />
                        {address.country}
                    </p>
                    <p className="text-gray-500 text-sm mt-2 font-medium">{address.phone}</p>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-2">
                <button onClick={() => onEdit(address.address_id)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
                    <Pen size={14} /> Edit
                </button>
                <button onClick={() => onDelete(address.address_id)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors">
                    <Trash2 size={14} /> Delete
                </button>
                {!address.is_default && (
                    <button onClick={() => onSetDefault(address.address_id)} className="ml-auto text-xs font-bold text-blue-600 hover:underline">
                        SET AS DEFAULT
                    </button>
                )}
            </div>
        </motion.div>
    );
};

// --- 4. Main Component ---
export function Addresses() {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
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

export default function AddressesPage() {
    return <Addresses />;
}