import { Briefcase, CheckCircle2, Home, MapPin, Pen, Trash2 } from "lucide-react";
import { motion } from "motion/react";
export const AddressCard = ({ address, onEdit, onDelete, onSetDefault }: any) => {
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