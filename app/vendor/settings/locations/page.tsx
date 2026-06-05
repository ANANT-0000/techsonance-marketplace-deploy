'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Save, Building, Trash2, Edit } from "lucide-react";
import { authToken } from "@/utils/authToken";
import { motion, AnimatePresence } from "motion/react";
import { fetchCreateCompanyLocation, fetchGetCompanyLocations } from "@/utils/vendorApiClient";
import { address } from "framer-motion/client";

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

// ─── Dynamic Field Schema ────────────────────────────────────────────────────

type FieldType = "text" | "select" | "checkbox";

interface FieldOption { label: string; value: string }

interface FormField {
    name: keyof typeof INITIAL_FORM;
    label: string;
    type: FieldType;
    required?: boolean;
    placeholder?: string;
    colSpan?: "full" | "half";
    options?: FieldOption[];      // for select
    checkboxLabel?: string;       // for checkbox
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    className?: string;
}

const INITIAL_FORM = {
    address_for: "Registered Office",
    address_line_1: "",
    address_line_2: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    landmark: "",
    is_default: false as boolean,
};

type FormData = typeof INITIAL_FORM;

const FORM_FIELDS: FormField[] = [
    {
        name: "address_for",
        label: "Address Type",
        type: "select",
        required: true,
        colSpan: "full",
        options: [
            { label: "Registered Office (As per GST/PAN)", value: "Registered Office" },
            { label: "Billing Address", value: "Billing Address" },
            { label: "Corporate / Branch Office", value: "Corporate Office" },
        ],
    },
    {
        name: "address_line_1",
        label: "Address Line 1",
        type: "text",
        required: true,
        colSpan: "full",
        placeholder: "Flat, House no., Building, Company, Apartment",
    },
    {
        name: "address_line_2",
        label: "Address Line 2",
        type: "text",
        colSpan: "full",
        placeholder: "Area, Street, Sector, Village",
    },
    {
        name: "city",
        label: "City",
        type: "text",
        required: true,
        colSpan: "half",
    },
    {
        name: "street",
        label: "Street",
        type: "text",
        required: true,
        colSpan: "half",
    },
    {
        name: "state",
        label: "State",
        type: "text",
        required: true,
        colSpan: "half",
    },
    {
        name: "landmark",
        label: "Landmark",
        type: "text",
        colSpan: "half",
    },
    {
        name: "postal_code",
        label: "Postal Code (PIN)",
        type: "text",
        required: true,
        colSpan: "half",
        inputMode: "numeric",
        className: "font-mono",
    },
    {
        name: "country",
        label: "Country",
        type: "text",
        required: true,
        colSpan: "half",
    },
    {
        name: "is_default",
        label: "Default Address",
        type: "checkbox",
        colSpan: "full",
        checkboxLabel: "Set as primary default address",
    },
];

// ─── Render Helpers ──────────────────────────────────────────────────────────

const inputBase =
    "w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 mt-1.5 focus:border-blue-400 focus:bg-white focus:outline-none transition-colors text-sm";

function renderField(
    field: FormField,
    formData: FormData,
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
) {
    const value = formData[field.name];

    switch (field.type) {
        case "select":
            return (
                <select
                    name={field.name}
                    value={value as string}
                    onChange={handleChange}
                    required={field.required}
                    className={inputBase}
                >
                    {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );

        case "checkbox":
            return (
                <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-1.5">
                    <input
                        id={field.name}
                        type="checkbox"
                        name={field.name}
                        checked={value as boolean}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-800 cursor-pointer"
                    >
                        {field.checkboxLabel}
                    </label>
                </div>
            );

        default:
            return (
                <input
                    type="text"
                    name={field.name}
                    value={value as string}
                    onChange={handleChange}
                    required={field.required}
                    placeholder={field.placeholder}
                    inputMode={field.inputMode}
                    className={`${inputBase} ${field.className ?? ""}`}
                />
            );
    }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function VendorAddressesPage() {
    const router = useRouter();

    const [addresses, setAddresses] = useState<AddressType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM);

    const token = authToken();

    useEffect(() => {
        if (!token) {
            router.push("/auth/vendorLogin");  
            return;
        }
        fetchAddresses();
    }, [token]);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await fetchGetCompanyLocations(token || "");
            console.log('register addre',res.data)
            setAddresses(res.data || []);
        } catch (err) {
            console.error("Error fetching addresses:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === "checkbox" ? target.checked : target.value;
        setFormData((prev) => ({ ...prev, [target.name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetchCreateCompanyLocation(formData, token || "");
            setShowModal(false);
            setFormData(INITIAL_FORM);
            fetchAddresses();
        } catch (error) {
            console.error("Error saving address:", error);
            alert("Failed to save address. Please check your inputs.");
        } finally {
            setSaving(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData(INITIAL_FORM);
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
                        <p className="text-gray-500 text-sm mt-0.5">
                            Manage your registered, billing, and operational addresses.
                        </p>
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
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-16 text-center text-gray-400"
                    >
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-sm">Loading addresses...</p>
                    </motion.div>
                ) : addresses.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="border border-dashed border-gray-300 rounded-2xl py-16 text-center bg-gray-50/50"
                    >
                        <Building size={40} className="mx-auto mb-3 text-gray-300" />
                        <h3 className="text-gray-800 font-semibold mb-1">No addresses found</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            You haven't added any business addresses yet.
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="text-sm font-semibold text-blue-600 hover:underline"
                        >
                            + Add your first address
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                    >
                        <AnimatePresence>
                            {addresses && addresses.map((address) => (
                                <motion.div
                                    key={address.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                                >
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
                                        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">
                                            {address.address_line_1}
                                        </h3>
                                        {address.address_line_2 && (
                                            <p className="text-sm text-gray-600 mb-1">{address.address_line_2}</p>
                                        )}
                                        <p className="text-sm text-gray-600">
                                            {address.city}, {address.state} {address.postal_code}
                                        </p>
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
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Address Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        key="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                        onClick={(e) => e.target === e.currentTarget && closeModal()}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 16 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Building className="text-blue-500" size={20} /> Add Business Address
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 text-2xl font-light leading-none"
                                    aria-label="Close modal"
                                >
                                    &times;
                                </button>
                            </div>

                            {/* FIX: all inputs are now controlled (value bound to formData). 
                                Dynamic field rendering via FORM_FIELDS schema. */}
                            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {FORM_FIELDS.map((field) => {
                                        const isCheckbox = field.type === "checkbox";
                                        const colClass =
                                            field.colSpan === "full" || isCheckbox
                                                ? "md:col-span-2"
                                                : "";

                                        return (
                                            <div key={field.name} className={colClass}>
                                                {/* Don't render a standalone label for checkboxes — it's inline */}
                                                {!isCheckbox && (
                                                    <label className="text-sm font-semibold text-gray-700">
                                                        {field.label}
                                                        {field.required && (
                                                            <span className="text-red-500 ml-0.5">*</span>
                                                        )}
                                                    </label>
                                                )}
                                                {renderField(field, formData, handleChange)}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={saving}
                                        type="submit"
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-70"
                                    >
                                        {saving ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Save size={18} />
                                        )}
                                        {saving ? "Saving..." : "Save Address"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}