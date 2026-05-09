'use client';

import { useEffect, useState } from "react";
import { useParams, redirect } from "next/navigation";
import { MapPin, Plus, Save, Building, Trash2, Edit } from "lucide-react";
import { authToken } from "@/utils/authToken";
import { AnimatePresence } from "motion/react";

interface AddressType {
    id: string;
    address_type: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
}

export default function VendorAddressesPage() {
    const params = useParams();
    const vendorId = params.vendorId as string;

    const [addresses, setAddresses] = useState<AddressType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        address_type: "Registered Office",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
        is_default: false
    });

    const token = authToken();

    useEffect(() => {
        if (!token) redirect("/auth/vendorLogin");
        fetchAddresses();
    }, [token]);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            // Adjust endpoint to match your address controller
            // const res = await vendorApiClient.get('/address', {
            //     headers: { Authorization: `Bearer ${token}` }
            // });
            // setAddresses(res.data?.data || []);
        } catch (err) {
            console.error("Error fetching addresses:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // await vendorApiClient.post('/address', formData, {
            //     headers: { Authorization: `Bearer ${token}` }
            // });
            setShowModal(false);
            fetchAddresses(); // Refresh list after saving
            // Reset form
            setFormData({
                address_type: "Registered Office", address_line_1: "", address_line_2: "",
                city: "", state: "", postal_code: "", country: "India", is_default: false
            });
        } catch (error) {
            console.error("Error saving address:", error);
            alert("Failed to save address. Please check your inputs.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="w-full mx-auto mt-6 px-2 py-4 relative">
            {/* Header */}
            <header className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-3 text-gray-700">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Business Addresses</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Manage your registered, billing, and operational addresses.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 font-semibold text-sm bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl px-5 py-2.5 transition-colors shadow-sm"
                >
                    <Plus size={16} /> Add New Address
                </button>
            </header>

             {/* Address List */}
                    <AnimatePresence mode="popLayout">
            {/* Address List Grid */}
            {loading ? (
                <div className="py-16 text-center text-gray-400">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm">Loading addresses...</p>
                </div>
            ) : addresses.length === 0 ? (
                <div className=" border border-dashed border-gray-300 rounded-2xl py-16 text-center bg-gray-50/50">
                    <Building size={40} className="mx-auto mb-3 text-gray-300" />
                    <h3 className="text-gray-800 font-semibold mb-1">No addresses found</h3>
                    <p className="text-sm text-gray-500 mb-4">You haven't added any business addresses yet.</p>
                    <button onClick={() => setShowModal(true)} className="text-sm font-semibold text-blue-600 hover:underline">
                        + Add your first address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {addresses.map((address) => (
                        <div key={address.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                                        {address.address_type}
                                    </span>
                                    {address.is_default && (
                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wide border border-blue-100">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{address.address_line_1}</h3>
                                {address.address_line_2 && <p className="text-sm text-gray-600 mb-1">{address.address_line_2}</p>}
                                <p className="text-sm text-gray-600">{address.city}, {address.state} {address.postal_code}</p>
                                <p className="text-sm text-gray-500 mt-1">{address.country}</p>
                            </div>
                            
                            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit size={16} />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
</AnimatePresence>
            {/* Add Address Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Building className="text-blue-500" size={20} /> Add Business Address
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700">Address Type <span className="text-red-500">*</span></label>
                                    <select name="address_type" onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors">
                                        <option value="Registered Office">Registered Office (As per GST/PAN)</option>
                                        <option value="Billing Address">Billing Address</option>
                                        <option value="Corporate Office">Corporate / Branch Office</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700">Address Line 1 <span className="text-red-500">*</span></label>
                                    <input required type="text" name="address_line_1" onChange={handleChange} placeholder="Flat, House no., Building, Company, Apartment" className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700">Address Line 2</label>
                                    <input type="text" name="address_line_2" onChange={handleChange} placeholder="Area, Street, Sector, Village" className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors" />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700">City <span className="text-red-500">*</span></label>
                                    <input required type="text" name="city" onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors" />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700">State <span className="text-red-500">*</span></label>
                                    <input required type="text" name="state" onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors" />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700">Postal Code (PIN) <span className="text-red-500">*</span></label>
                                    <input required type="text" name="postal_code" onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors font-mono" />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700">Country <span className="text-red-500">*</span></label>
                                    <input required type="text" name="country" value={formData.country} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors" />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-2">
                                <input type="checkbox" id="is_default" name="is_default" onChange={handleChange} className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" />
                                <label htmlFor="is_default" className="text-sm font-medium text-gray-800 cursor-pointer">Set as primary default address</label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button disabled={saving} type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-70">
                                    {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
                                    {saving ? "Saving..." : "Save Address"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}