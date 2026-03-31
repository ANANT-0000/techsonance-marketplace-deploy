'use client';
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation";

import { ChevronLeftCircle } from "lucide-react";
import { FormInput } from "@/components/common/FormInput";
import { PASSWORD_CHANGE_FORM_FIELDS } from "@/constants/dynamicFields";
import { useAppSelector } from "@/hooks/reduxHooks";


export default function PasswordForm() {
    const { user } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const { register, reset, handleSubmit } = useForm({
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: ""
        }
    })
    const onSubmit = (data: any) => {
        console.log(data);
        reset();
        router.push(`/customerProfile/${user?.user_id}`);
    }
    const onCancel = () => {
        reset();
        router.push(`/customerProfile/${user?.user_id}`);
    }
    return (
        <>
            <ChevronLeftCircle className="my-4 block lg:hidden" size={36} onClick={() => router.back()} />
            <form className="max-w-md lg:ml-10 pt-1 lg:px-3 px-1 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {PASSWORD_CHANGE_FORM_FIELDS.map((field) => (
                    <div className="flex flex-col gap-2" key={field.id}>
                        <FormInput
                            label={field.label}
                            placeholder={field.placeholder}
                            register={register}
                            required={true}
                            type={field.type}
                            id={field.id}
                            {...register(field.id, { required: true })}
                        />
                    </div>
                ))}

                <div className="flex justify-end gap-4">
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => onCancel()}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Change Password
                        </button>
                    </div>
            </form>
        </>
    )
}
