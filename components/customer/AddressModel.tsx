"use client";
import { createAddress, updateAddress } from "@/lib/features/auth/authSlice";
import { FormInput } from "../common/FormInput";
import { useForm } from "react-hook-form";

import { motion } from "motion/react";
import { ADDRESS_FIELDS } from "@/constants/dynamicFields";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { UserType } from "@/utils/Types";
import { fetchCreateUserAddress, fetchGetAddressById, fetchGetUserAddresses, fetchUpdateUserAddress } from "@/utils/customerApiClient";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { AddressType } from "@/app/(shop)/customerProfile/[userId]/addresses/page";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressSchema } from "@/utils/validation";
export const AddressModal = ({ user, addressId, addressList, operation, onClose }: {
    user: UserType,
    addressId?: string,
    addressList: AddressType[],
    operation: 'edit' | 'add',
    onClose: () => void
}) => {
    console.log("Existing Address id in Modal", addressId);
    const [fetchError, setFetchError] = useState<{
        message: string | null;
        success: boolean | null;
    }>({
        message: null,
        success: null
    });
    const existingAddress = addressList.find((addr) => {
        const isMatch = addr.id === addressId;
        if (!isMatch) {
            console.log(`No match: ${addr.id} (type: ${typeof addr.id}) vs ${addressId} (type: ${typeof addressId})`);
        }
        return isMatch;
    });

    console.log("Found Address:", existingAddress);
    console.log("Existing Address in Modal", existingAddress?.name);
    // const dispatch = useAppDispatch();

    const { register, handleSubmit, reset, formState: {
        errors
    }
    } = useForm({
        resolver: zodResolver(AddressSchema),
        mode: 'onChange',
        defaultValues: {
            name: "",
            address_for: 'home',
            is_default: false,
            phone: "",
            address_line_1: "",
            address_line_2: "",
            city: "",
            state: "",
            street: "",
            postal_code: "",
            country: "",
            landmark: ""
        }
    });
    console.log("Existing Address in Modal", addressList);
    console.log("Existing Address id in Modal", addressId);

    useEffect(() => {
        const fetchAddressDetails = async () => {
        };
        fetchAddressDetails();
        if (operation === 'edit' && addressId) {
            reset({
                name: existingAddress?.name,
                address_for: existingAddress?.address_type,
                is_default: existingAddress?.is_default,
                phone: existingAddress?.number,
                address_line_1: existingAddress?.address_line1,
                address_line_2: existingAddress?.address_line2,
                city: existingAddress?.city,
                state: existingAddress?.state,
                street: existingAddress?.street,
                postal_code: existingAddress?.postal_code,
                country: existingAddress?.country,
                landmark: existingAddress?.landmark
            });
        }

    }, [addressList, user]);

    const handleFadeClose = () => {
        setTimeout(() => {
            onClose();
        }, 800);
    };


    const onSubmit = async (data: any) => {
        if (operation === 'edit' && addressId) {

            const result = await fetchUpdateUserAddress(user.id, addressId, data);
            if (!result?.success) {
                setFetchError({
                    message: result?.message,
                    success: result?.success
                });
            }
        } else {
            const result: { success: boolean; message: string; status: number } = await fetchCreateUserAddress(user.id, data);
            if (!result?.success) {
                setFetchError({
                    message: result?.message,
                    success: result?.success
                });
            }
        }
        handleFadeClose();
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
                {fetchError.message !== null && (
                    <div className={`absolute top-0 right-0 left-0 ${fetchError.success === false ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} py-6 px-2 mx-2 rounded-lg shadow-md`}>
                        <p>{fetchError.message}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="lg:p-6 p-3 space-y-4 max-h-[70dvh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        
                            {ADDRESS_FIELDS.map((field) => {
                                const fieldError = errors[field.id as keyof typeof errors];

                                return (
                                    <div key={field.id} className="flex flex-col gap-1">
                                        {field.type !== "checkbox" ? (
                                            <>
                                                <FormInput
                                                    label={field.label}
                                                    id={field.id}
                                                    register={register}
                                                    required={field.required}
                                                    options={field.options}
                                                    type={field.type}
                                                    placeholder={field.placeholder}
                                                />
                                                {fieldError && (
                                                    <p className="text-red-600 text-sm">{fieldError.message}</p>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2 py-2">
                                                <input
                                                    type="checkbox"
                                                    id={field.id}
                                                    {...register(field.id as keyof typeof register)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                                />
                                                <label htmlFor={field.id} className="text-sm font-semibold text-gray-600 cursor-pointer">
                                                    {field.label}
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
