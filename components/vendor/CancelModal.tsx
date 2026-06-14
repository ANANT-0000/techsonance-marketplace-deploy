import { useState } from "react";
import { X } from "lucide-react";
import { UiText } from "@/constants/ui-text";

interface CancelModalProps {
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}

export function CancelModal({ onConfirm, onClose }: CancelModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    await onConfirm(reason);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4 border border-slate-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-slate-800">
              {UiText.ORDER_DETAILS.CANCEL_ITEM_TITLE}
            </h2>
            <p className="text-theme-caption text-slate-400 mt-0.5">
              {UiText.ORDER_DETAILS.CANT_BE_UNDONE}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>
        <textarea
          className="w-full border border-slate-200 rounded-xl text-theme-body-sm px-3 py-2.5 resize-none outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 transition bg-slate-50"
          rows={3}
          placeholder={UiText.ORDER_DETAILS.CANCELLATION_REASON_PLACEHOLDER}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={!reason.trim() || submitting}
            className="flex-1 bg-red-500 text-white text-theme-body-sm rounded-xl px-3 py-2.5 hover:bg-red-600 disabled:opacity-60 font-medium transition-colors"
          >
            {submitting
              ? UiText.ORDER_DETAILS.CANCELLING
              : UiText.ORDER_DETAILS.CONFIRM_CANCELLATION}
          </button>
          <button
            onClick={onClose}
            className="text-theme-body-sm text-slate-500 hover:text-slate-700 px-3 font-medium"
          >
            {UiText.ORDER_DETAILS.KEEP_ITEM}
          </button>
        </div>
      </div>
    </div>
  );
}
