'use client';
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { ChevronLeftCircle } from "lucide-react";
import type { RootState } from "@/Redux store/store";


export default function PasswordForm() {
    const { user } = useSelector((state: RootState) => state.auth);
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
                <div>
                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                        Current Password
                    </label>
                    <input

                        type="password"
                        id="current_password"
                        {...register("current_password")}

                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                        New Password
                    </label>
                    <input

                        type="password"
                        id="new_password"
                        {...register("new_password")}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        id="confirm_password"
                        {...register("confirm_password")}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
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
