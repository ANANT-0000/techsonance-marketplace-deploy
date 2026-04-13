'use client';
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeftCircle, AlertCircle } from "lucide-react";
import { useAppSelector } from "@/hooks/reduxHooks";
import { profileEditSchema, ProfileEditData } from "@/utils/validation";

export const PROFILE_EDIT_FIELDS = [
    { id: 'profile_picture', label: 'Profile Picture URL', type: 'text', placeholder: 'https://example.com/photo.jpg' },
    { id: 'first_name', label: 'First Name', type: 'text', placeholder: 'Enter your first name' },
    { id: 'last_name', label: 'Last Name', type: 'text', placeholder: 'Enter your last name' },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
    { id: 'phone', label: 'Phone Number', type: 'text', placeholder: 'Enter your phone number' }
] as const;

export default function EditProfilePage() {
    const { user } = useAppSelector((state) => state.auth);
    const userId = user?.id ?? '';
    const router = useRouter();

    const {
        register,
        reset,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<ProfileEditData>({
        resolver: zodResolver(profileEditSchema),
        mode: "onBlur",
        defaultValues: {
            profile_picture: user && "profile_picture_url" in user ? user.profile_picture_url || "" : "",
            first_name: user && "first_name" in user ? user.first_name || "" : "",
            last_name: user && "last_name" in user ? user.last_name || "" : "",
            email: user && "email" in user ? user.email || "" : "",
            phone: user && "phone_number" in user ? user.phone_number || "" : ""
        }
    });

    const onSubmit = (data: ProfileEditData) => {
        console.log("Updated Profile Data:", data);
        // Here you would call your update API
        reset();
        router.push(`/customerProfile/${userId}`);
    };

    const handleCancel = () => {
        reset();
        router.push(`/customerProfile/${userId}`);
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <ChevronLeftCircle
                className="mb-4 block lg:hidden cursor-pointer text-gray-600 hover:text-gray-900"
                size={36}
                onClick={() => router.back()}
            />

            <form
                className="lg:ml-10 pt-1 space-y-5"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
            >
                <h1 className="text-xl font-bold text-gray-800 mb-2">Edit Profile</h1>

                {PROFILE_EDIT_FIELDS.map((field) => (
                    <div key={field.id} className="flex flex-col gap-1.5">
                        <label htmlFor={field.id} className="text-sm font-semibold text-gray-700">
                            {field.label}
                        </label>
                        <input
                            id={field.id}
                            type={field.type}
                            placeholder={field.placeholder}
                            {...register(field.id as keyof ProfileEditData)}
                            className={`w-full border rounded-lg shadow-sm sm:text-sm p-2.5 transition-all outline-none focus:ring-2 ${errors[field.id as keyof ProfileEditData]
                                ? "border-red-400 focus:ring-red-100"
                                : "border-gray-300 focus:ring-blue-100 focus:border-blue-500"
                                }`}
                        />
                        {errors[field.id as keyof ProfileEditData] && (
                            <p className="text-red-500 text-xs flex items-center gap-1 font-medium mt-1">
                                <AlertCircle size={12} />
                                {errors[field.id as keyof ProfileEditData]?.message}
                            </p>
                        )}
                    </div>
                ))}

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}