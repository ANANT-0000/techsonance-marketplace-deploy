"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ChevronLeft,
  EyeOff,
  Eye,
  Key,
} from "lucide-react";

import { useAppSelector } from "@/hooks/reduxHooks";
import { changePasswordSchema, ChangePasswordData } from "@/utils/validation";
import { useState } from "react";
import { CHANGE_PASSWORD_TEXT, EDIT_PROFILE_TEXT } from "@/constants/customerText";

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
    <div className="container mx-auto p-4 max-w-2xl font-sans">
      <div className="flex items-center gap-3 my-4 sm:hidden">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          aria-label={CHANGE_PASSWORD_TEXT.GO_BACK_ARIA}
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-bold text-base text-foreground tracking-tight">{CHANGE_PASSWORD_TEXT.TITLE}</h1>
      </div>
      
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-border flex items-center gap-3 text-left">
          <div className="p-2.5 bg-secondary text-theme-primary rounded-xl">
            <Key size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">{CHANGE_PASSWORD_TEXT.TITLE}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {CHANGE_PASSWORD_TEXT.SUBTITLE}
            </p>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {CHANGE_PASSWORD_TEXT.CURRENT_PASSWORD}
              </label>
              <input
                type="password"
                className={`w-full rounded-xl border bg-background py-2.5 px-4 text-xs transition-all outline-none focus:ring-2 ${
                  errors.current_password
                    ? "border-destructive focus:ring-destructive/20 text-foreground"
                    : "border-border focus:ring-primary/20 focus:border-primary text-foreground"
                }`}
                placeholder={CHANGE_PASSWORD_TEXT.CURRENT_PASSWORD_PLACEHOLDER}
                {...register("current_password")}
              />
              {errors.current_password && (
                <p className="text-destructive text-[10px] mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  {errors.current_password.message}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {CHANGE_PASSWORD_TEXT.NEW_PASSWORD}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full rounded-xl border bg-background py-2.5 pl-4 pr-10 text-xs transition-all outline-none focus:ring-2 ${
                    errors.new_password
                      ? "border-destructive focus:ring-destructive/20 text-foreground"
                      : "border-border focus:ring-primary/20 focus:border-primary text-foreground"
                  }`}
                  placeholder={CHANGE_PASSWORD_TEXT.NEW_PASSWORD_PLACEHOLDER}
                  {...register("new_password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.new_password ? (
                <p className="text-destructive text-[10px] mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  {errors.new_password.message}
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {CHANGE_PASSWORD_TEXT.PASSWORD_LENGTH_HINT}
                </p>
              )}
            </div>
            
            <div className="pt-2 flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-foreground hover:bg-foreground/90 text-background font-semibold text-xs px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {CHANGE_PASSWORD_TEXT.UPDATE_BUTTON}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                {EDIT_PROFILE_TEXT.CANCEL}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
