'use client';
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ChevronLeftCircle } from "lucide-react";
import { useAppSelector } from "@/hooks/reduxHooks";


export const PROFILE_EDIT_FIELDS = [
    { id: 'profile_picture', label: 'Profile Picture URL', type: 'text', placeholder: 'Enter image URL' },
    { id: 'first_name', label: 'First Name', type: 'text', placeholder: 'Enter your first name' },
    { id: 'last_name', label: 'Last Name', type: 'text', placeholder: 'Enter your last name' },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
    { id: 'phone', label: 'Phone Number', type: 'text', placeholder: 'Enter your phone number' }
];

export default function EditProfilePage() {
    const { user } = useAppSelector((state) => state.auth);
    const userId = user?.user_id ? user.user_id : '';
    const router = useRouter();
    const { register, reset, handleSubmit } = useForm({
        defaultValues: {
            profile_picture: user?.profileImgUrl || "",
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            email: user?.email || "",
            phone: user?.phone || ""
        }
    })
    return (
        <>
            <ChevronLeftCircle className="mb-4 block lg:hidden" size={36} onClick={() => router.back()} />

            <form className="lg:ml-10 mx-auto pt-1 px-3 space-y-6 w-xs lg:w-lg" onSubmit={handleSubmit((data) => {
                console.log(data);
                reset();
                router.push(`/customerProfile/${userId}`);
            })}>
                {
                    PROFILE_EDIT_FIELDS.map((field) => (
                        <div key={field.id} className="space-y-1">
                            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                                {field.label}
                            </label>
                            <input
                                id={field.id}
                                type={field.type}
                                placeholder={field.placeholder}
                                {...register(field.id, { required: true })}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                            />
                        </div>
                    ))
                }
                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            reset();
                            router.push(`/customerProfile/${userId}`);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </>
    )
}
