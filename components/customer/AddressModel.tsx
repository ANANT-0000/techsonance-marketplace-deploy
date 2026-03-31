import { createAddress, updateAddress } from "@/lib/features/auth/authSlice";
import { FormInput } from "../common/FormInput";
import { useForm } from "react-hook-form";
import { UserProfile } from "@/constants/common";
import { motion } from "motion/react";
import { ADDRESS_FIELDS } from "@/constants/dynamicFields";
import { useAppDispatch } from "@/hooks/reduxHooks";
export const AddressModal = ({ user, addressId, operation, onClose }: {
    user: UserProfile,
    addressId?: string,
    operation: 'edit' | 'add',
    onClose: () => void
}) => {
    const dispatch = useAppDispatch();
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
                        {ADDRESS_FIELDS.map((field) => (
                            <div key={field.id}>
                                {field.type !== "checkbox" ? (
                                    <FormInput
                                        label={field.label}
                                        id={field.id}
                                        register={register}
                                        required={true}
                                        options={field.options}
                                        type={field.type}
                                    />

                                ) : (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            {...register(field.id)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="text-sm font-semibold text-gray-600">
                                            {field.label}
                                        </label>
                                    </div>
                                )}
                            </div>
                        ))}
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
