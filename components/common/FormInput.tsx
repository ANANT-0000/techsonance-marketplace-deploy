export const FormInput = ({ label, register, id, required = false, type, options, placeholder }: {
    label: string,
    id: string,
    register: any,
    required?: boolean,
    type: string,
    options?: string[],
    placeholder?: string
}) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-600">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type !== "select" ? (
            <input type={type}
                {...register(id, { required })} placeholder={placeholder}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"

            />
        ) : (
            <select
                {...register(id, { required })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                defaultValue=""
            >
                <option value="">Select {placeholder}</option>
                {type === "select" && options && options.map((option: string) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        )}
    </div>
);
