import React, { useEffect } from "react";
import { BRAND_LOGO, ProfileSidebarLink } from "@/constants";
import { DASHBOARD_TEXT } from "@/constants/customerText";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useThemeData } from "@/hooks/useThemeData";
import { logOut } from "@/lib/features/auth/authSlice";
import { ChevronRight, X } from "lucide-react";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function MobileSideDrawer({
  isOpen,
  onClose,
  //   profile,
  labels = DASHBOARD_TEXT,
}: {
  isOpen: boolean;
  onClose: () => void;
  //   profile: UserProfileDTO;
  labels?: typeof DASHBOARD_TEXT;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentPath = usePathname();
  const { themeData } = useThemeData();

  React.useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const logoUrl = themeData.logo_url
    ? themeData.logo_url || themeData.logo_dark_url
    : BRAND_LOGO;

  const handleLinkClick = (path: string) => {
    onClose();
    if (path === "/logout") {
      dispatch(logOut());
      router.push("/");
    } else {
      router.push(path);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs w-full h-full"
          />

          {/* Drawer content drawer panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="absolute top-0 bottom-0 left-0 w-[280px] bg-card border-r border-border shadow-2xl flex flex-col p-5"
          >
            {/* Logo row Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <Link
                href="/"
                className="flex flex-col text-left"
                onClick={onClose}
              >
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="brand logo"
                    className="h-8 object-contain rounded-2xl"
                  />
                )}
              </Link>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Section */}
            {/* <div className="py-4 flex items-center gap-3 border-b border-border">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-secondary shrink-0 relative">
                <Image
                  src={
                    profile.avatarUrl ||
                    "https://i.pinimg.com/originals/74/a3/b6/74a3b6a8856b004dfff824ae9668fe9b.jpg"
                  }
                  alt={`${profile.firstName} ${profile.lastName}`}
                  fill
                  loading="eager"
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-xs font-bold text-foreground truncate">
                  {profile.firstName} {profile.lastName}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {profile.email}
                </span>
              </div>
            </div> */}

            {/* Scrollable links menu */}
            <nav className="flex-1 overflow-y-auto mt-4 space-y-1 hide-scrollbar">
              {ProfileSidebarLink.map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.name}
                    onClick={() => handleLinkClick(link.path)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      link.isDanger
                        ? "text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20"
                        : isActive
                          ? "bg-rose-800 dark:bg-rose-900 text-white shadow-sm"
                          : "text-foreground/80 hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <DynamicIcon
                        name={link.icon as IconName}
                        size={16}
                        className={
                          link.isDanger
                            ? "text-rose-600"
                            : isActive
                              ? "text-white"
                              : "text-muted-foreground"
                        }
                      />
                      <span>{link.name}</span>
                    </div>
                    <ChevronRight
                      size={12}
                      className={
                        link.isDanger
                          ? "text-rose-500"
                          : isActive
                            ? "text-white"
                            : "text-muted-foreground/50"
                      }
                    />
                  </button>
                );
              })}
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
