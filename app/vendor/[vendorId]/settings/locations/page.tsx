'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { locationSchema, LocationFormData, LocationForEnum } from '@/utils/validation'; // Adjust import path as needed

export interface LocationType {
    id: string;              // Unique identifier (e.g., WH001, HUB001)
    name: string;            // Display name (e.g., "Main Warehouse (Surat)")
    type: LocationForEnum;   // Type of location
    address: string;         // Street/area address
    city: string;            // City name
    state: string;           // State/region
    default: boolean;        // Marks if this is the default location
    contactPerson?: string;  // Optional contact person
    phone?: string;
}

const initialLocations: LocationType[] = [
    {
        id: "WH001",
        name: "Main Warehouse (Surat)",
        type: LocationForEnum.WAREHOUSE,
        address: "123, Ring Road, Industrial Area",
        city: "Surat",
        state: "Gujarat",
        default: true,
        contactPerson: "Rajesh Patel",
        phone: "+91-9876543210"
    },
    {
        id: "HUB001",
        name: "North Hub (Delhi)",
        type: LocationForEnum.HUB,
        address: "Okhla Industrial Estate",
        city: "Delhi",
        state: "Delhi",
        default: false,
        contactPerson: "Anil Sharma",
        phone: "+91-9123456780"
    }
];

export default function LocationsPage() {
    const [locationList, setLocationList] = useState<LocationType[]>(initialLocations);
    const locationFormRef = useRef<HTMLFormElement>(null);
    const [closedLocationForm, setClosedLocationForm] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const {
        register,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(locationSchema),
        defaultValues: {
            default: 'false' as any,
            name: '',
            type: LocationForEnum.WAREHOUSE,
            address: '',
            city: '',
            state: '',
            contactPerson: '',
            phone: ''
        }
    });

    const deleteLocation = (id: string) => {
        const updatedLocations = locationList.filter(location => location.id !== id);
        setLocationList(updatedLocations);
    };

    const handleEditLocation = (location: LocationType) => {
        setSelectedLocation(location);
        setIsEditing(true);
        setClosedLocationForm(true);
    };

    const onSubmit = (data: LocationFormData) => {
        setLocationList(prev => {
            if (isEditing && selectedLocation) {
                return prev.map(location =>
                    location.id === selectedLocation.id ? { ...location, ...data } : location
                );
            } else {
                const newLocation: LocationType = {
                    id: `LOC${Date.now()}`,
                    ...data
                };
                return [...prev, newLocation];
            }
        });
        closeModal();
    };

    const closeModal = () => {
        setClosedLocationForm(false);
        setIsEditing(false);
        setSelectedLocation(null);
    };

    // Handle form reset based on mode (Edit vs Create)
    useEffect(() => {
        if (isEditing && selectedLocation) {
            reset({
                default: selectedLocation.default ? 'true' : 'false',
                name: selectedLocation.name,
                type: selectedLocation.type,
                address: selectedLocation.address,
                city: selectedLocation.city,
                state: selectedLocation.state,
                contactPerson: selectedLocation.contactPerson || '',
                phone: selectedLocation.phone || ''
            });
        } else if (closedLocationForm) {
            reset({
                name: '',
                type: LocationForEnum.WAREHOUSE,
                address: '',
                city: '',
                state: '',
                contactPerson: '',
                phone: '',
                default: 'false' as any,
            });
        }
    }, [isEditing, selectedLocation, closedLocationForm, reset]);

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
        <main className="mt-6 relative">
            {closedLocationForm && (
                <section className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 flex justify-center items-center">
                    <form
                        className="bg-white p-6 rounded-xl shadow-2xl flex flex-col w-full max-w-md z-20 relative"
                        ref={locationFormRef}
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold mb-4">
                            {isEditing ? 'Edit Location' : 'Create Location'}
                        </h2>

                        <div className="flex flex-col mb-3">
                            <label className="text-sm font-semibold mb-1" htmlFor="default">Location Status</label>
                            <select
                                className={`border py-2 px-3 rounded-md ${errors.default ? 'border-red-500' : 'border-gray-300'}`}
                                id="default"
                                {...register('default')}
                            >
                                <option value="false">Standard</option>
                                <option value="true">Default Location</option>
                            </select>
                        </div>

                        <div className="flex flex-col mb-3">
                            <label className="text-sm font-semibold mb-1" htmlFor="type">Location Type</label>
                            <select
                                className={`border py-2 px-3 rounded-md ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
                                id="type"
                                {...register('type')}
                            >
                                <option value="Warehouse">Warehouse</option>
                                <option value="Hub">Hub</option>
                            </select>
                            {errors.type && <span className="text-red-500 text-xs mt-1">{errors.type.message}</span>}
                        </div>

                        <div className="flex flex-col mb-3 gap-1">
                            <label className="text-sm font-semibold" htmlFor="name">Location Name</label>
                            <input
                                className={`py-2 px-3 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                type="text"
                                id="name"
                                placeholder="e.g. South Hub"
                                {...register('name')}
                            />
                            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                        </div>

                        <div className="flex flex-col mb-3 gap-1">
                            <label className="text-sm font-semibold" htmlFor="address">Address</label>
                            <input
                                className={`py-2 px-3 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                type="text"
                                id="address"
                                placeholder="Street address"
                                {...register('address')}
                            />
                            {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold" htmlFor="city">City</label>
                                <input
                                    className={`py-2 px-3 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                                    type="text"
                                    id="city"
                                    {...register('city')}
                                />
                                {errors.city && <span className="text-red-500 text-xs">{errors.city.message}</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold" htmlFor="state">State</label>
                                <input
                                    className={`py-2 px-3 border rounded-md ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                                    type="text"
                                    id="state"
                                    {...register('state')}
                                />
                                {errors.state && <span className="text-red-500 text-xs">{errors.state.message}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold" htmlFor="contactPerson">Contact Person</label>
                                <input
                                    className={`py-2 px-3 border rounded-md ${errors.contactPerson ? 'border-red-500' : 'border-gray-300'}`}
                                    type="text"
                                    id="contactPerson"
                                    {...register('contactPerson')}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold" htmlFor="phone">Phone</label>
                                <input
                                    className={`py-2 px-3 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                    type="text"
                                    id="phone"
                                    {...register('phone')}
                                />
                                {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
                            </div>
                        </div>

                        <button
                            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                            type="submit"
                        >
                            {isEditing ? 'Update Location' : 'Create Location'}
                        </button>
                    </form>
                </section>
            )}

            <section className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Pickup Locations</h1>
                    <button
                        className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                        onClick={() => setClosedLocationForm(true)}
                    >
                        + Add New
                    </button>
                </div>

                <div className="space-y-4">
                    {locationList.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No locations added yet.</p>
                    ) : (
                        locationList.map((location) => (
                            <div
                                key={location.id}
                                className={`group border-2 p-5 rounded-xl transition-all ${location.default
                                    ? 'border-blue-500 bg-blue-50/50'
                                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        {location.default && (
                                            <span className="inline-block py-1 px-3 rounded-full text-xs font-bold text-blue-700 bg-blue-100 mb-3">
                                                Default Location
                                            </span>
                                        )}
                                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            {location.name}
                                            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded border">
                                                {location.type}
                                            </span>
                                        </h2>
                                        <p className="text-gray-600 text-sm mt-1">{location.address}, {location.city}, {location.state}</p>

                                        <div className="flex gap-6 mt-3 text-sm text-gray-500">
                                            {location.contactPerson && (
                                                <p><span className="font-semibold text-gray-700">Contact:</span> {location.contactPerson}</p>
                                            )}
                                            {location.phone && (
                                                <p><span className="font-semibold text-gray-700">Phone:</span> {location.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            className="px-4 py-1.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200"
                                            onClick={() => handleEditLocation(location)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteLocation(location.id)}
                                            className="px-4 py-1.5 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
}