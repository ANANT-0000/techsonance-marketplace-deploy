import { SelectedPaymentMethodProps } from "@/utils/Types";

export const SelectedPaymentMethod = ({
    method,
    selectedMethod,
    onSelect,
    onInputChange,
    isValid,
    value,
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

                {/* Use a Fragment <> to wrap multiple elements inside the conditional */}
                {method === 'UPI' && isSelected && (
                    <>
                        <div className="lg:mt-3 mt-2 space-y-2">
                            <input
                                type="text"
                                className={`w-full lg:text-md text-sm lg:p-2  py-1 px-2 border rounded-md outline-none transition-all ${value && !isValid ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                placeholder="Enter your UPI ID (e.g., username@bank)"
                                value={value}
                                onChange={(e) => onInputChange(e.target.value)}
                            />

                            {value !== '' && (
                                <div className={`text-xs font-medium flex items-center gap-1 ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                                    {isValid ? (
                                        <><span className="text-sm">✓</span> Valid UPI ID</>
                                    ) : (
                                        <>Please enter a valid UPI ID</>
                                    )}
                                </div>
                            )}
                        </div>
                        {description && (
                            <p className="text-sm text-gray-500 mt-2 italic">{description}</p>
                        )}
                    </>
                )}

                {/* Industry Standard: If description belongs to the method (not just UPI), move it here */}
                {method !== 'UPI' && description && (
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                )}
            </div>
        </label>
    );
};