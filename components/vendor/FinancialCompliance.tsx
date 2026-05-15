import { COUNTRIES } from "@/constants";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { VendorRegisterSchema } from "@/utils/validation";

type Props = {
    country_code: string;
    style?: string;
    register: UseFormRegister<any>;
    errors: FieldErrors<VendorRegisterSchema>;
};

export default function FinancialCompliance({ country_code, style, register, errors }: Props) {
    const fields = COUNTRIES.find((c) => c.country_code === country_code)?.fields ?? [];

    if (fields.length === 0) return null;

    return (
        <section className={(style ?? "") + " my-4"}>
            {fields.map((field, index) => (
                <div key={field.value} className="mb-6 py-2 px-4 border border-gray-100 bg-gray-50 rounded-xl">
                    {/* Hidden input for field_key */}
                    <input
                        type="hidden"
                        value={field.value} 
                        {...register(`company_compliance.${index}.field_key` as any)}
                    />
                    <div>
                        <label
                            htmlFor={`value_${index}`}
                            className="block mb-1.5 text-sm font-semibold text-slate-700"
                        >
                            {field.label}
                            {field.required && <span className="text-red-500 ml-0.5">*</span>}
                        </label>
                        <input
                            id={`value_${index}`}
                            type="text"
                            placeholder={field.placeholder}
                            className="my-1 border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white focus:border-blue-500 outline-none transition text-sm text-slate-800 placeholder:text-slate-400"
                            {...register(`company_compliance.${index}.field_value` as any, {
                                required: field.required ? `${field.label} is required` : false,
                            })}
                        />
                        {field.helperText && (
                            <p className="text-xs text-slate-500 mt-1">{field.helperText}</p>
                        )}
                        {errors.company_compliance?.[index]?.field_value && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.company_compliance[index]?.field_value?.message as string}
                            </p>
                        )}
                    </div>

                    {/* Metadata: Is Active Checkbox & Valid Until Date */}
                    <div className="flex flex-wrap justify-between items-center gap-6 mt-2 pt-0 border-t border-gray-200">
                        {/* Is Active Checkbox */}
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-all"
                                {...register(`company_compliance.${index}.is_active` as any)}
                            />
                            <span className="ml-2 text-sm font-medium text-slate-700">
                                Mark as Active
                            </span>
                        </label>

                        {/* Valid Until Date Picker */}
                        <div className="flex items-center gap-2">
                            <label 
                                htmlFor={`date_${index}`} 
                                className="text-sm font-medium text-slate-700"
                            >
                                Valid Until:
                            </label>
                            <input
                                id={`date_${index}`}
                                type="date"
                                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white focus:border-blue-500 outline-none transition text-sm text-slate-800"
                                {...register(`company_compliance.${index}.valid_until` as any)}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}