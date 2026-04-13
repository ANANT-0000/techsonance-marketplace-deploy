export interface SelectedPaymentMethodProps {
    method: string;
    selectedMethod: string;
    onSelect: (method: string) => void;
    description?: string; // Optional description
}
export const SelectedPaymentMethod = ({
    method,
    selectedMethod,
    onSelect,
    description
}: SelectedPaymentMethodProps) => {
    const isSelected = selectedMethod === method;

    return (
        <label
            className={`flex items-start gap-3 lg:gap-3 lg:p-4 p-2 border rounded-lg cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200 hover:bg-gray-50'
                }`}
        >
            <input
                type="radio"
                name="paymentMethod"
                checked={isSelected}
                onChange={() => onSelect(method)}
                className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />

            <div className="flex-1">
                <div className="font-semibold text-gray-900">{method}</div>


                {description && isSelected && (
                    <p className="text-sm text-gray-500 mt-2 italic">{description}</p>
                )}
            </div>
        </label>
    );
};