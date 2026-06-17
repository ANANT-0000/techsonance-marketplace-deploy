"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { useAppSelector } from "@/hooks/reduxHooks";
import { profileEditSchema, ProfileEditData } from "@/utils/validation";
import { EDIT_PROFILE_TEXT } from "@/constants/customerText";
import { PROFILE_EDIT_FIELDS } from "@/constants";

export default function EditProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id ?? "";
  const router = useRouter();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEditData>({
    resolver: zodResolver(profileEditSchema),
    mode: "onBlur",
    defaultValues: {
      profile_picture:
        user && "profile_picture_url" in user
          ? user.profile_picture_url || ""
          : "",
      first_name: user && "first_name" in user ? user.first_name || "" : "",
      last_name: user && "last_name" in user ? user.last_name || "" : "",
      email: user && "email" in user ? user.email || "" : "",
      phone: user && "phone_number" in user ? user.phone_number || "" : "",
    },
  });

  const onSubmit = (data: ProfileEditData) => {
    // Here you would call your update API
    reset();
    router.push(`/customer/${userId}`);
  };

  const handleCancel = () => {
    reset();
    router.push(`/customer`);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Mobile Header */}
      <div className="flex items-center gap-3 my-4 sm:hidden">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          aria-label={EDIT_PROFILE_TEXT.GO_BACK_ARIA}
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-bold text-base text-foreground tracking-tight">
          {EDIT_PROFILE_TEXT.TITLE}
        </h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:block mb-6 font-sans">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          {EDIT_PROFILE_TEXT.TITLE}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {EDIT_PROFILE_TEXT.SUBTITLE}
        </p>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-2xl p-6 sm:p-8 font-sans">
        <form
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {PROFILE_EDIT_FIELDS.map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor={field.id}
                className="text-xs font-semibold text-foreground"
              >
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                {...register(field.id as keyof ProfileEditData)}
                className={`w-full border rounded-xl shadow-sm text-xs p-3 transition-all outline-none bg-background focus:ring-2 ${
                  errors[field.id as keyof ProfileEditData]
                    ? "border-destructive focus:ring-destructive/20 text-foreground"
                    : "border-border focus:ring-primary/20 focus:border-primary text-foreground"
                }`}
              />
              {errors[field.id as keyof ProfileEditData] && (
                <p className="text-destructive text-[10px] flex items-center gap-1 font-medium mt-1">
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
              className="px-6 py-2.5 bg-foreground text-background text-xs font-bold rounded-xl hover:bg-foreground/90 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? EDIT_PROFILE_TEXT.SAVING
                : EDIT_PROFILE_TEXT.SAVE_CHANGES}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 bg-secondary text-foreground text-xs font-bold rounded-xl hover:bg-secondary/80 transition-all cursor-pointer"
            >
              {EDIT_PROFILE_TEXT.CANCEL}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
