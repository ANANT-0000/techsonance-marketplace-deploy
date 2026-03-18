'use client';
import { useSelector } from "react-redux";
import type { RootState } from "@/Redux store/store";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ChevronLeftCircle } from "lucide-react";

export default function EditProfilePage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const { register, reset, handleSubmit } = useForm({
        defaultValues: {
            profile_picture: user?.profileImgUrl || "",
            name: user?.name || "",
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
                router.push(`/customerProfile/${user?.user_id}`);
            })}>
                <div className="flex justify-center">
                    <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">
                        {user?.profileImgUrl ? <img src={user.profileImgUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover" /> :
                            <input
                                type="text"
                                id="profile_picture"
                                {...register("profile_picture")}
                                className={`${user?.profileImgUrl ? "hidden" : ""} mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500`}
                            />}
                    </label>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        id="name"
                        {...register("name")}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        {...register("email")}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="text"
                        id="phone"
                        {...register("phone")}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
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
                            router.push(`/customerProfile/${user?.user_id}`);
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
