import { Briefcase, CheckCircle2, Home, MapPin, Pen, Trash2 } from "lucide-react";
import { motion } from "motion/react";

export const AddressCard = ({ address, onEdit, onDelete, onSetDefault }: any) => {
    const Icon = address.address_for === 'work' ? Briefcase : address.address_for === 'home' ? Home : MapPin;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -2 }}
            className={`relative p-4 sm:p-6 rounded-2xl border-2 transition-colors bg-white ${address.is_default ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200'
                }`}
        >
            {address.is_default && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 text-blue-600 text-[10px] sm:text-xs font-bold bg-blue-100 px-2 py-1 sm:py-1.5 rounded-lg shadow-sm">
                    <CheckCircle2 size={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>DEFAULT</span>
                </div>
            )}

            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                {/* Icon */}
                <div className={`p-2.5 sm:p-3 rounded-xl mt-0.5 sm:mt-1 shrink-0 ${address.is_default ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon size={20} className="sm:w-6 sm:h-6" />
                </div>

                <div className="flex-1 pr-16 sm:pr-20">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg tracking-tight">
                            {address.name}
                        </h3>
                        <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider">
                            {address.address_for}
                        </span>
                    </div>

                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                        {address.address_line1}
                        {address.address_line2 && <><br />{address.address_line2}</>}
                        {address.street && <><br />{address.street}</>}
                        <br />
                        {address.city}, {address.state} {address.postal_code}
                        <br />
                        {address.country}
                    </p>

                    {address.landmark && (
                        <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-1.5 italic">
                            <span className="font-medium not-italic">Landmark:</span> {address.landmark}
                        </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 sm:mt-3">
                        <p className="text-gray-900 text-xs sm:text-sm font-semibold bg-gray-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-gray-100 inline-block">
                            {address.phone || address.number}
                        </p>
                    </div>
                </div>
            </div>


            <div className="flex items-center flex-wrap gap-y-3 gap-x-4 pt-3 sm:pt-4 border-t border-gray-100 mt-2">
                <button
                    onClick={() => onEdit(address.id)}
                    className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors py-1"
                >
                    <Pen size={14} className="sm:w-4 sm:h-4" /> Edit
                </button>
                <button
                    onClick={() => onDelete(address.user_id, address.id)}
                    className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors py-1"
                >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" /> Delete
                </button>
                {!address.is_default && (
                    <button
                        onClick={() => onSetDefault(address.user_id, address.id)}
                        className="ml-auto text-[10px] sm:text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline uppercase tracking-wide py-1"
                    >
                        Set as Default
                    </button>
                )}
            </div>
        </motion.div>
    );
};