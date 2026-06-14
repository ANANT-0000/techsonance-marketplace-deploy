import { CheckCircle2, PartyPopper, X } from "lucide-react";
import { VENDOR_CREATED_TOAST_TEXT } from "@/constants/adminText";

export function VendorCreatedToast({ vendorName, onClose }: { vendorName: string; onClose: () => void }) {
    return (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="bg-white border border-emerald-200 rounded-2xl shadow-2xl shadow-emerald-100/60 w-80 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
                <div className="p-5">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                            <PartyPopper size={20} className="text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-theme-body-sm">{VENDOR_CREATED_TOAST_TEXT.TITLE}</p>
                            <p className="text-theme-caption text-gray-500 mt-0.5 leading-relaxed">
                                <span className="font-semibold text-gray-700">{vendorName}</span>{VENDOR_CREATED_TOAST_TEXT.DESCRIPTION_SUFFIX}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
                            aria-label="Dismiss"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-500" />
                        <span className="text-theme-xxs text-emerald-600 font-semibold">
                            {VENDOR_CREATED_TOAST_TEXT.SUCCESS_MSG}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}