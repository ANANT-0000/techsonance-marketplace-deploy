'use client';
import { CreditCard, Smartphone, Package } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SELECTED_PAYMENT_METHOD_TEXT } from "@/constants/customerText";

export interface SelectedPaymentMethodProps {
  method: string;
  selectedMethod: string;
  onSelect: (method: string) => void;
  description?: string;
}

// ─── Payment method icon map ──────────────────────────────────────────────────
const METHOD_ICONS: Record<string, React.ReactNode> = {
  [SELECTED_PAYMENT_METHOD_TEXT.UPI]:                          <Smartphone size={14} className="text-purple-500" />,
  [SELECTED_PAYMENT_METHOD_TEXT.CREDIT_DEBIT]:         <CreditCard size={14} className="text-blue-500" />,
  [SELECTED_PAYMENT_METHOD_TEXT.COD]: <Package size={14} className="text-amber-500" />,
};

const METHOD_ICON_BG: Record<string, string> = {
  [SELECTED_PAYMENT_METHOD_TEXT.UPI]:                               'bg-purple-50 border-purple-100',
  [SELECTED_PAYMENT_METHOD_TEXT.CREDIT_DEBIT]:              'bg-blue-50   border-blue-100',
  [SELECTED_PAYMENT_METHOD_TEXT.COD]:  'bg-amber-50  border-amber-100',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const SelectedPaymentMethod = ({
  method,
  selectedMethod,
  onSelect,
  description,
}: SelectedPaymentMethodProps) => {
  const isSelected = selectedMethod === method;
  const icon = METHOD_ICONS[method] ?? <CreditCard size={14} className="text-gray-500" />;
  const iconBg = METHOD_ICON_BG[method] ?? 'bg-gray-50 border-gray-100';

  return (
    <motion.label
      layout
      className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all duration-150 ${
        isSelected
          ? 'border-blue-300 bg-blue-50/50 shadow-sm shadow-blue-100'
          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
      }`}
    >
      {/* Custom radio */}
      <div
        className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
        }`}
      >
        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>

      {/* Hidden native radio (accessibility) */}
      <input
        type="radio"
        name="paymentMethod"
        checked={isSelected}
        onChange={() => onSelect(method)}
        className="sr-only"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${iconBg}`}>
            {icon}
          </div>
          <span className={`text-[13px] font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
            {method}
          </span>
        </div>

        {/* Description — animated reveal on selection */}
        <AnimatePresence>
          {description && isSelected && (
            <motion.p
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="text-[11px] text-gray-500 leading-relaxed pl-8"
            >
              {description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.label>
  );
};