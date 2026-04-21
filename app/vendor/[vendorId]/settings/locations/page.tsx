'use client';
import React, { useEffect, useRef, useState } from 'react';
import { set, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { locationSchema, LocationFormData, LocationForEnum, AddressSchema, AddressType } from '@/utils/validation'; // Adjust import path as needed
import { FormInput } from '@/components/common/FormInput';
import { ADDRESS_FIELDS, WAREHOUSE_ADDRESS_FIELDS } from '@/constants/dynamicFields';
import { fetchCreateWarehouseLocation, fetchDeleteWarehouseLocation, fetchUpdateWarehouseLocation, fetchVendorWarehouseLocations } from '@/utils/vendorApiClient';
import { motion, AnimatePresence } from "motion/react";


interface Address {
    id: string;
    name: string;
    number: string;
    address_type: "warehouse" | string; // can extend if needed
    address_line_1: string;
    address_line_2: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    landmark: string;
    is_default: boolean;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    user_id: string | null;
    company_id: string;
}

interface Warehouse {
    id: string;
    warehouse_name: string;
    address: Address;
}

export default function LocationsPage() {
    const [locationList, setLocationList] = useState<Warehouse[]>([]);
    const locationFormRef = useRef<HTMLFormElement>(null);
    const [closedLocationForm, setClosedLocationForm] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Warehouse | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<{
        message: string | null;
        success: boolean | null;
    }>({
        message: null,
        success: null
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
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

    const deleteLocation = async (id: string) => {
        const response = await fetchDeleteWarehouseLocation(id);
        console.log(response)
        const updatedLocations = locationList.filter(location => location.id !== id);
        setLocationList(updatedLocations);
    };

    const handleEditLocation = (location: Warehouse) => {
        setSelectedLocation(location);
        setIsEditing(true);
        setClosedLocationForm(true);
    };

    const onSubmit = async (data: AddressType, isEditing: boolean) => {
        if (isEditing && selectedLocation) {
            const response = await fetchUpdateWarehouseLocation(selectedLocation.id, data).then((res) => {
                console.log(res)
            }).catch((error) => {
                console.error("Error updating warehouse location:", error);
            });
            console.log(response)
        } else {
            const response = await fetchCreateWarehouseLocation(data).then((res) => {
                setLocationList(prevList => [...prevList, { ...res, warehouse_name: data.name, address: { ...res.address, ...data } }]);
                console.log(res)
            }).catch((error) => {
                console.error("Error creating warehouse location:", error);
            });
            console.log(response)
        }
        setTimeout(() => {
            closeModal();
        }, 500);
    };

    const closeModal = () => {
        setClosedLocationForm(false);
        setIsEditing(false);
        setSelectedLocation(null);
    };

    useEffect(() => {
        const getWarehouseList = async () => {
            await fetchVendorWarehouseLocations().then((response) => {
                console.log(response)
                if (response.success) {
                    console.log(response.data)
                    setLocationList(response.data);
                }
            }).catch((error) => {
                console.error("Error fetching warehouse locations:", error);
            });
        };
        getWarehouseList();
    }, []);

    useEffect(() => {
        if (isEditing && selectedLocation) {
            reset({
                name: selectedLocation.warehouse_name,
                address_for: selectedLocation.address.address_type as LocationForEnum,
                is_default: selectedLocation.address.is_default || false,
                phone: selectedLocation.address.number || "",
                address_line_1: selectedLocation.address.address_line_1 || "",
                address_line_2: selectedLocation.address.address_line_2 || "",
                city: selectedLocation.address.city || "",
                state: selectedLocation.address.state || "",
                street: selectedLocation.address.street || "",
                postal_code: selectedLocation.address.postal_code || "",
                country: selectedLocation.address.country || "",
                landmark: selectedLocation.address.landmark || ""
            });
        } else {
            reset({});
        }
    }, [closedLocationForm, isEditing, selectedLocation, reset]);

    // Close modal on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (locationFormRef.current && !locationFormRef.current.contains(event.target as Node)) {
                closeModal();
            }
        };

        if (closedLocationForm) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [closedLocationForm]);

    return (
        <main className="ml-72 mt-6 relative">
            <AnimatePresence>
                {closedLocationForm && (
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 flex justify-center items-center"
                    >
                        <motion.form
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.4, bounce: 0.25 }}
                            onSubmit={handleSubmit((data) => onSubmit(data, isEditing))}
                            ref={locationFormRef}
                            className="lg:p-6 p-3 space-y-4 max-h-[80dvh] overflow-y-auto bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                {WAREHOUSE_ADDRESS_FIELDS.map((field) => {
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
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                                >
                                    Save Address
                                </motion.button>
                            </div>
                        </motion.form>
                    </motion.section>
                )}
            </AnimatePresence>

            <section className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm mx-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Pickup Locations</h1>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                        onClick={() => setClosedLocationForm(true)}
                    >
                        + Add New
                    </motion.button>
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {locationList.length === 0 ? (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-gray-500 text-center py-8"
                            >
                                No locations added yet.
                            </motion.p>
                        ) : (
                            locationList.map((location, index) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    key={location.id}
                                    className={`group border-2 p-5 rounded-xl transition-colors ${location.address.is_default
                                        ? 'border-blue-500 bg-blue-50/50'
                                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            {location.address.is_default && (
                                                <span className="inline-block py-1 px-3 rounded-full text-xs font-bold text-blue-700 bg-blue-100 mb-3">
                                                    Default Location
                                                </span>
                                            )}
                                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                {location.warehouse_name}
                                                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded border">
                                                    {location.address.address_type && location.address.address_type.charAt(0).toUpperCase() + location.address.address_type.slice(1)}
                                                </span>
                                            </h2>
                                            <p className="text-gray-600 text-sm mt-1">
                                                {location.address.address_line_1}, {location.address.city},<br />
                                                {location.address.state} , {location.address.postal_code}, {location.address.country}
                                            </p>

                                            <div className="flex gap-6 mt-3 text-sm text-gray-500">
                                                {location.address.number && (
                                                    <p><span className="font-semibold text-gray-700">Contact:</span> {location.address.number}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="px-4 py-1.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                                onClick={() => handleEditLocation(location)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteLocation(location.id)}
                                                className="px-4 py-1.5 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </main>
    );
}