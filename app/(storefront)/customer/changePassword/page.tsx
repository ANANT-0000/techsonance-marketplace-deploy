"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeftCircle,
  AlertCircle,
  ChevronLeft,
  EyeOff,
  Eye,
  Key,
} from "lucide-react";

import { useAppSelector } from "@/hooks/reduxHooks";
import { changePasswordSchema, ChangePasswordData } from "@/utils/validation";
import { useState } from "react";

export default function PasswordForm() {
  const { user } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      current_password: "",
      new_password: "",
    },
  });

  const onSubmit = (data: ChangePasswordData) => {
    reset();
    router.push(`/customer/${user?.id}`);
  };

  const onCancel = () => {
    reset();
    router.push(`/customer/${user?.id}`);
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Key size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Change Password</h2>
            <p className="text-sm text-gray-500">
              Ensure your account is using a long, random password to stay
              secure.
            </p>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-gray-300 py-2.5 px-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter current password"
                {...register("current_password")}
              />
              {errors.current_password && (
                <p className="text-red-500 text-sm">
                  {errors.current_password.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-xl border border-gray-300 py-2.5 pl-4 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter new password"
                  {...register("new_password")}
                />
                {errors.new_password && (
                  <p className="text-red-500 text-sm">
                    {errors.new_password.message}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Must be at least 8 characters long.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
