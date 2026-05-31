"use client";
import { FormInput } from "../common/FormInput";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { AddressForEnum, AddressOperationEnum, Address, User } from "@/utils/Types";
import { fetchCreateUserAddress, fetchUpdateUserAddress } from "@/utils/customerApiClient-SA";
import { X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressSchema } from "@/utils/validation";
import { authToken } from "@/utils/authToken";
import { ADDRESS_FIELDS } from "@/constants";
import { Country, State, City } from "country-state-city";

export const AddressModal = ({ user, addressId, addressList, operation, onClose, onSuccess }: {
    user: Partial<User>,
    addressId?: string,
    addressList?: Address[],
    operation: AddressOperationEnum,
    onClose: () => void,
    onSuccess?: Dispatch<SetStateAction<boolean>>
}) => {
    const [fetchError, setFetchError] = useState<{
        message: string | null;
        success: boolean | null;
    }>({
        message: null,
        success: null
    });

    const existingAddress = addressList?.find((addr) => addr.id === addressId);
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
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

    const token = authToken();

    // 3. Watch Form Values for Cascading Logic
    const watchedCountry = watch("country");
    const watchedState = watch("state");

    const availableCountries: string[] = Country.getAllCountries().map(c => c.name);

    const selectedCountryObj = Country.getAllCountries().find(c => c.name === watchedCountry);
    const availableStates: string[] = selectedCountryObj 
        ? State.getStatesOfCountry(selectedCountryObj.isoCode).map(s => s.name) 
        : [];
        
    const selectedStateObj = selectedCountryObj 
        ? State.getStatesOfCountry(selectedCountryObj.isoCode).find(s => s.name === watchedState)
        : null;
    const availableCities: string[] = selectedCountryObj && selectedStateObj
        ? City.getCitiesOfState(selectedCountryObj.isoCode, selectedStateObj.isoCode).map(c => c.name)
        : [];
    useEffect(() => {
        if (operation !== AddressOperationEnum.EDIT) {
            setValue("state", "");
            setValue("city", "");
        }
    }, [watchedCountry, setValue, operation]);

    useEffect(() => {
        if (operation !== AddressOperationEnum.EDIT) {
            setValue("city", "");
        }
    }, [watchedState, setValue, operation]);

    useEffect(() => {
        if (operation === AddressOperationEnum.EDIT && addressId) {
            reset({
                name: existingAddress?.name || "",
                address_for: existingAddress?.address_type as AddressForEnum || AddressForEnum.HOME,
                is_default: existingAddress?.is_default || false,
                phone: existingAddress?.number || "",
                address_line_1: existingAddress?.address_line1 || "",
                address_line_2: existingAddress?.address_line2 || "",
                city: existingAddress?.city || "",
                state: existingAddress?.state || "",
                street: existingAddress?.street || "",
                postal_code: existingAddress?.postal_code || "",
                country: existingAddress?.country || "",
                landmark: existingAddress?.landmark || ""
            });
        }
    }, [addressList, user, addressId, existingAddress, reset, operation]);

    const handleFadeClose = () => {
        setTimeout(() => {
            onClose();
        }, 800);
    };

    const onSubmit = async (data: any) => {
        if (!token) return;

        if (operation === AddressOperationEnum.EDIT && addressId && user.id) {
            const result = await fetchUpdateUserAddress(user.id, addressId, data, token);
            if (!result?.success) {
                setFetchError({ message: result?.message || 'Failed to update address', success: result?.success || false });
            }
        } else {
            const result = await fetchCreateUserAddress(user.id || "", data, token);
            if (!result?.success) {
                setFetchError({ message: result?.message || 'Failed to create address', success: result?.success || false });
            } else {
                onSuccess && onSuccess(true);
            }
        }
        handleFadeClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden z-10"
            >
                <div className="flex justify-between items-center py-3 px-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        {operation === AddressOperationEnum.EDIT ? 'Edit Address' : 'Add New Address'}
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

                         
                            let dynamicOptions = field.options;
                            if (field.id === "country") dynamicOptions = availableCountries;
                            if (field.id === "state") dynamicOptions = availableStates;
                            if (field.id === "city") dynamicOptions = availableCities;

                            return (
                                <div key={field.id} className="flex flex-col gap-1">
                                    {field.type !== "checkbox" ? (
                                        <>
                                            <FormInput
                                                label={field.label}
                                                id={field.id}
                                                register={register}
                                                required={field.required}
                                                options={dynamicOptions} // Passing dynamic arrays here
                                                type={field.type}
                                                placeholder={field.placeholder}
                                            />
                                            {fieldError && (
                                                <p className="text-red-600 text-sm">{fieldError.message as string}</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 py-2 border border-gray-300 mt-5 rounded-lg px-3">
                                            <input
                                                type="checkbox"
                                                id={field.id}
                                                {...register(field.id as keyof typeof register)}
                                                className="h-5 w-5 rounded-full text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                                            />
                                            <label htmlFor={field.id} className="text-sm font-semibold text-gray-700 cursor-pointer">
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