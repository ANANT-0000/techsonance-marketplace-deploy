'use client';
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeftCircle, AlertCircle } from "lucide-react";
import { FormInput } from "@/components/common/FormInput";
import { PASSWORD_CHANGE_FORM_FIELDS } from "@/constants/dynamicFields";
import { useAppSelector } from "@/hooks/reduxHooks";
import { changePasswordSchema, ChangePasswordData } from "@/utils/validation";

export default function PasswordForm() {
    const { user } = useAppSelector((state) => state.auth);
    const router = useRouter();

    const {
        register,
        reset,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<ChangePasswordData>({
        resolver: zodResolver(changePasswordSchema),
        mode: "onChange",
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: ""
        }
    });

    const onSubmit = (data: ChangePasswordData) => {
        console.log("Submit Data:", data);
        reset();
        router.push(`/customerProfile/${user?.user_id}`);
    };

    const onCancel = () => {
        reset();
        router.push(`/customerProfile/${user?.user_id}`);
    };

    return (
        <>
            <ChevronLeftCircle
                className="my-4 block lg:hidden cursor-pointer text-gray-600 hover:text-gray-900"
                size={36}
                onClick={() => router.back()}
            />

            <form
                className="max-w-md lg:ml-10 pt-1 lg:px-3 px-1 space-y-6"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
            >
                {PASSWORD_CHANGE_FORM_FIELDS.map((field) => (
                    <div className="flex flex-col gap-1.5" key={field.id}>
                        <FormInput
                            label={field.label}
                            placeholder={field.placeholder}
                            register={register}
                            type={field.type}
                            id={field.id}
                        />
                        {/* Display Zod Errors */}
                        {errors[field.id as keyof ChangePasswordData] && (
                            <p className="text-red-500 text-xs flex items-center gap-1 font-medium">
                                <AlertCircle size={12} />
                                {errors[field.id as keyof ChangePasswordData]?.message}
                            </p>
                        )}
                    </div>
                ))}

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "Updating..." : "Change Password"}
                    </button>
                </div>
            </form>
        </>
    );
}