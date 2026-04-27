'use client';
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeftCircle, AlertCircle, ChevronLeft } from "lucide-react";
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
        router.push(`/customerProfile/${user?.id}`);
    };

    const onCancel = () => {
        reset();
        router.push(`/customerProfile/${user?.id}`);
    };

    return (
        <>
            <div className="flex items-center gap-3 my-4 sm:hidden">
                <button
                    onClick={() => router.back()}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Go back"
                >
                    <ChevronLeft size={20} />
                </button>
                <h1 className="font-bold text-xl text-gray-900">Change Password</h1>
            </div>

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