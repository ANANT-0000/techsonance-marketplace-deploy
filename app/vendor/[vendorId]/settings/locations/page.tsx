'use client';
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

interface LocationType {
    id: string;              // Unique identifier (e.g., WH001, HUB001)
    name: string;            // Display name (e.g., "Main Warehouse (Surat)")
    type: "Warehouse" | "Hub"; // Type of location
    address: string;         // Street/area address
    city: string;            // City name
    state: string;           // State/region
    default: boolean;        // Marks if this is the default location
    contactPerson?: string;  // Optional contact person
    phone?: string;
              // Optional default flag
}

const locations: LocationType[] = [
    {
        "id": "WH001",
        "name": "Main Warehouse (Surat)",
        "type": "Warehouse",
        "address": "123, Ring Road, Industrial Area",
        "city": "Surat",
        "state": "Gujarat",
        "default": true,
        "contactPerson": "Rajesh Patel",
        "phone": "+91-9876543210"
    },
    {
        "id": "HUB001",
        "name": "North Hub (Delhi)",
        "type": "Hub",
        "address": "Okhla Industrial Estate",
        "city": "Delhi",
        "state": "Delhi",
        "default": false,
        "contactPerson": "Anil Sharma",
        "phone": "+91-9123456780"
    }
]



export default function LocationsPage() {
    const { register, reset, watch, handleSubmit } = useForm({
        defaultValues: {
            default: false,
            name: '',
            type: 'Warehouse',
            address: '',
            city: '',
            state: '',
            contactPerson: '',
            phone: ''
        }
    });
    const [locationList, setLocationList] = React.useState<LocationType[]>(locations);
    const locationFormRef = useRef(null);
    const [closedLocationForm, setClosedLocationForm] = useState(false);
    const [selectedLocation, setSelectedLocation] = React.useState<LocationType | null>(null);
    const [isEditing, setIsEditing] = React.useState<boolean>(false);
    const deleteLocation = (id: string) => {
        const updatedLocations = locationList.filter(location => location.id !== id);
        setLocationList(updatedLocations);
    }
    console.log('colse', closedLocationForm)
    console.log('slec', !!selectedLocation)
    console.log('edt', isEditing)

    const handleEditLocation = (location: LocationType) => {
        setSelectedLocation(location);
        setIsEditing(true);
        setClosedLocationForm(true);
    }
    const onSubmit = (data: any) => {
        setLocationList(prev => {
            if (isEditing && selectedLocation) {
                return prev.map(location => location.id === selectedLocation.id ? { ...location, ...data } : location);
            } else {
                const newLocation: LocationType = {
                    id: `LOC${Date.now()}`,
                    default: false,
                    ...data
                }
                return [...prev, newLocation];
            }
        });
        setClosedLocationForm(false);
        setIsEditing(false);
        setSelectedLocation(null);
    }
    const chooseExist = (name) => {
        if (!!selectedLocation) {
            return selectedLocation[name];
        }
        return '';
    }
    useEffect(() => {
        if (isEditing && selectedLocation) {
            reset({
                name: chooseExist('name'),
                type: chooseExist('type'),
                address: chooseExist('address'),
                city: chooseExist('city'),
                state: chooseExist('state'),
                contactPerson: chooseExist('contactPerson'),
                phone: chooseExist('phone'),
                default: chooseExist('default'),
            })
        } else if(closedLocationForm)  {
            reset({
                name: '',
                type: 'Warehouse',
                address: '',
                city: '',
                state: '',
                contactPerson: '',
                phone: '',
                default: false,
            })
        }
    }, [isEditing, selectedLocation, closedLocationForm]);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (locationFormRef.current && !locationFormRef.current.contains(event.target)) {
                setClosedLocationForm(false);
                setIsEditing(false);
                setSelectedLocation(null);
                console.log('mouse over')
            }

        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [locationFormRef])
    console.log(chooseExist('name'))
    return (
        <>
        
             
    <main className={`mt-6 `}>
               
                {
                    closedLocationForm && (

                        <section className=" absolute blur-4xl bg-black/20 w-full h-full top-0 left-0 z-10"   >
                            <form className=" absolute top-[50%] bottom-[50%] left-[50%] right-[50%] translate-x-[-50%] translate-y-[-50%] z-20 " ref={locationFormRef} onSubmit={handleSubmit(onSubmit)} >
                                <div className=" flex flex-col justify-center items-center h-full  ">
                                    <div className=" bg-white  p-6 rounded-lg shadow-lg flex flex-col   w-96 ">
                                        <h2 className=" text-2xl font-bold my-2 ">{isEditing ? 'Edit Location' : 'Create Location'}</h2>
                                        <select className="my-2 border-2 py-1 px-2  border-gray-300 rounded-md" id="type"
                                            {...register('default')}
                                        >
                                            <option value="false">Not Default</option>
                                            <option value="true">Default</option>

                                        </select>
                                        <select className="my-2 border-2 py-1 px-2  border-gray-300 rounded-md" id="type"
                                            {...register('type')}
                                        >
                                            <option value="Warehouse">Warehouse</option>
                                            <option value="Hub">Hub</option>

                                        </select>
                                        <div className="flex flex-col my-2 gap-2">
                                            <label htmlFor="name">Location Name</label>
                                            <input className="py-1 px-2 border-2 border-gray-300 rounded-md" type="text" id="name"
                                                {...register('name', { required: true, })} />
                                        </div>
                                        <div className="flex flex-col my-2 gap-2">
                                            <label htmlFor="address">Address</label>
                                            <input className="py-1 px-2 border-2 border-gray-300 rounded-md" type="text" defaultValue={selectedLocation?.address} id="address" {...register('address', { required: true })} />
                                        </div>
                                        <div className="flex flex-col my-2 gap-2">
                                            <label htmlFor="city">City</label>
                                            <input className="py-1 px-2 border-2 border-gray-300 rounded-md" type="text" id="city" {...register('city', { required: true })} />
                                        </div>
                                        <div className="flex flex-col my-2 gap-2">
                                            <label htmlFor="state">State</label>
                                            <input className="py-1 px-2 border-2 border-gray-300 rounded-md" type="text" id="state" {...register('state', { required: true })} />
                                        </div>
                                        <div className="flex flex-col my-2 gap-2">
                                            <label htmlFor="contactPerson">Contact Person</label>
                                            <input className="py-1 px-2 border-2 border-gray-300 rounded-md" type="text" id="contactPerson" {...register('contactPerson')} />
                                        </div>
                                        <div className="flex flex-col my-2 gap-2">
                                            <label htmlFor="phone">Phone</label>
                                            <input className="py-1 px-2 border-2 border-gray-300 rounded-md" type="text" id="phone" {...register('phone')} />
                                        </div>


                                        <input className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 " value="Create" type="submit" />
                                    </div>
                                </div>
                            </form>
                        </section>
                    )

                }
                <section className="vendor_settings_content ml-74   p-6 bg-white rounded-lg border-2 border-gray-300 ">

                    <div className=' flex justify-between items-center mb-6'>
                        <h1 className='text-2xl font-bold'>Pickup Locations</h1>
                        <button className='px-6 py-2 border-2 border-gray-300 rounded-lg' onClick={() => setClosedLocationForm(true)}>+ Add new</button>
                    </div>

                    {
                        locationList.map((location) => (
                            <div key={location.id} className={`my-6 hover:border-blue-500 hover:bg-blue-50 border-2  ${location.default ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} px-6 py-6 mb-4 rounded-lg`}>
                                {location.default && (
                                    <span className="py-2 px-4 rounded-xl text-sm font-semibold text-blue-600  border-blue-500 bg-blue-100 mb-2 inline-block">Default Location</span>
                                )}
                                <h2 className="text-xl font-bold mb-2">{location.name} ({location.type})</h2>
                                <p className="mb-1">{location.address}, {location.city}, {location.state}</p>
                                {location.contactPerson && <p className="mb-1">Contact Person: {location.contactPerson}</p>}
                                {location.phone && <p className="mb-1">Phone: {location.phone}</p>}
                                <div className="mt-4 flex gap-4">
                                    <button className="px-4 py-2 min-w-24 bg-blue-200 text-blue-600 font-semibold rounded-lg" onClick={() => { handleEditLocation(location) }}>Edit</button>
                                    <button onClick={() => deleteLocation(location.id)} className="px-4 py-2 min-w-24 bg-red-200 text-red-600 font-semibold rounded-lg">Delete</button>
                                </div>
                            </div>
                        )
                        )
                    }
                </section>

            </main>
        </>
    )
}
