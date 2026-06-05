"use client";
import { FormInput } from "../common/FormInput";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { AddressForEnum, AddressOperationEnum, Address, User } from "@/utils/Types";
import { fetchCreateUserAddress, fetchUpdateUserAddress } from "@/utils/customerApiClient-SA";
import { X, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useReducer } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressSchema } from "@/utils/validation";
import { authToken } from "@/utils/authToken";
import { ADDRESS_FIELDS } from "@/constants";
import { Country, State, City } from "country-state-city";
import { Button } from "@/components/ui/button";

// ─── State ────────────────────────────────────────────────────────────────────

interface FetchErrorState {
    message: string | null;
    success: boolean | null;
}

function fetchErrorReducer(state: FetchErrorState, action: Partial<FetchErrorState>): FetchErrorState {
    return { ...state, ...action };
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AddressModal = ({
    user,
    addressId,
    addressList,
    operation,
    onClose,
    onSuccess,
}: {
    user: Partial<User>;
    addressId?: string | null;
    addressList?: Address[];
    operation: AddressOperationEnum;
    onClose: () => void;
    onSuccess?: Dispatch<SetStateAction<boolean>>;
}) => {
    // ─── useReducer replaces useState for fetchError ──────────────────────────
    const [fetchError, dispatchFetchError] = useReducer(fetchErrorReducer, {
        message: null,
        success: null,
    });

    const existingAddress = addressList?.find((addr) => addr.id === addressId);

    // ─── React Hook Form (logic strictly preserved) ───────────────────────────
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
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
            landmark: "",
        },
    });

    const token = authToken();
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

    // ─── Effects (logic unchanged) ───────────────────────────────────────────
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
                landmark: existingAddress?.landmark || "",
            });
        }
    }, [addressList, user, addressId, existingAddress, reset, operation]);

    const handleFadeClose = () => {
        setTimeout(() => { onClose(); }, 300);
    };

    // ─── Submit (logic unchanged) ─────────────────────────────────────────────
    const onSubmit = async (data: any) => {
        if (!token) return;
        if (operation === AddressOperationEnum.EDIT && addressId && user.id) {
            const result = await fetchUpdateUserAddress(user.id, addressId, data, token);
            if (!result?.success) {
                dispatchFetchError({ message: result?.message || 'Failed to update address', success: result?.success || false });
                return;
            }
        } else {
            const result = await fetchCreateUserAddress(user.id || "", data, token);
            if (!result?.success) {
                dispatchFetchError({ message: result?.message || 'Failed to create address', success: result?.success || false });
                return;
            } else {
                onSuccess && onSuccess(true);
            }
        }
        handleFadeClose();
    };

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="fixed bottom-10 sm:bottom-0 inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="relative bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between py-4 px-5 border-b border-gray-100 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                            <MapPin size={15} className="text-blue-600" />
                        </div>
                        <h2 className="text-base font-bold text-gray-900">
                            {operation === AddressOperationEnum.EDIT ? 'Edit Address' : 'Add New Address'}
                        </h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                    >
                        <X size={16} />
                    </Button>
                </div>

                {/* Error / success banner */}
                {fetchError.message !== null && (
                    <div
                        className={`mx-5 mt-4 flex items-center gap-2.5 p-3.5 rounded-xl text-xs font-medium ${fetchError.success === false
                                ? 'bg-red-50 text-red-700 border border-red-100'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}
                    >
                        {fetchError.success === false
                            ? <AlertCircle size={14} className="shrink-0" />
                            : <CheckCircle2 size={14} className="shrink-0" />
                        }
                        {fetchError.message}
                    </div>
                )}

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-5 overflow-y-auto flex-1 custom-scrollbar"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                        {ADDRESS_FIELDS.map((field) => {
                            const fieldError = errors[field.id as keyof typeof errors];
                            let dynamicOptions = field.options;
                            if (field.id === "country") dynamicOptions = availableCountries;
                            if (field.id === "state") dynamicOptions = availableStates;
                            if (field.id === "city") dynamicOptions = availableCities;

                            return (
                                <div
                                    key={field.id}
                                    className={`flex flex-col ${field.type === 'checkbox' ? 'md:col-span-2 mt-1' : ''}`}
                                >
                                    {field.type !== "checkbox" ? (
                                        <>
                                            <FormInput
                                                label={field.label}
                                                id={field.id}
                                                register={register}
                                                required={field.required}
                                                options={dynamicOptions}
                                                type={field.type}
                                                placeholder={field.placeholder}
                                            />
                                            {fieldError && (
                                                <p className="text-red-500 text-[11px] mt-1.5 font-medium flex items-center gap-1">
                                                    <AlertCircle size={10} className="shrink-0" />
                                                    {fieldError.message as string}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50/60">
                                            <input
                                                type="checkbox"
                                                id={field.id}
                                                {...register(field.id as keyof typeof register)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400 cursor-pointer"
                                            />
                                            <label
                                                htmlFor={field.id}
                                                className="text-xs font-semibold text-gray-700 cursor-pointer select-none"
                                            >
                                                {field.label}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="pt-6 flex gap-2.5 justify-end mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="px-5 rounded-xl text-xs font-semibold border-gray-200 text-gray-600 hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="px-7 rounded-xl text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving…" : "Save Address"}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};