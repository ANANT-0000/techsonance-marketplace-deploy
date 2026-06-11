import { FORM_INPUT_TEXT } from "@/constants/commonText";

export const FormInput = ({ label, register, id, required = false, type, options, placeholder }: {
    label: string,
    id: string,
    register: any,
    required?: boolean,
    type: string,
    options?: string[],
    placeholder?: string
}) => (
    <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-semibold text-foreground">
            {label} {required && <span className="text-destructive">*</span>}
        </label>
        {type !== "select" ? (
            <input 
                type={type}
                id={id}
                {...register(id, { required })} 
                placeholder={placeholder}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            />
        ) : (
            <select
                id={id}
                {...register(id, { required })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                defaultValue=""
            >
                <option value="" disabled>{FORM_INPUT_TEXT.SELECT_PREFIX} {placeholder || label}</option>
                {options && options.map((option: string, index: number) => (
                    <option key={`${option}-${index}`} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                ))}
            </select>
        )}
    </div>
);