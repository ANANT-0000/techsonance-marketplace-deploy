"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import type { RootState } from "@/lib/store";
import { logOut } from "@/lib/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { ChevronLeft } from "lucide-react";
import { ProfileSidebarLink } from "@/constants";
import Image from "next/image";

export function ProfileSidebar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentPath = usePathname();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (currentPath && currentPath.includes("checkout")) return null;

  const hasUserSession = typeof window !== "undefined" && !!window.localStorage.getItem("isAuthenticated");

  // Hide sidebar for guests — only show once mounted to avoid SSR/hydration flicker.
  // Do not hide if there's an active session but the redux store is still hydrating.
  if (mounted && !user && !hasUserSession) return null;

  const handleNavigation = (linkPath: string) => {
    if (linkPath === "/logout") {
      dispatch(logOut());
      router.push("/");
    } else {
      router.push(linkPath);
    }
  };

  const activePath = mounted ? currentPath : "";
  const showUserProfile = mounted && user;
  const isOnOverviewPage = mounted && activePath === `/customer`;

  const mobileLinks = ProfileSidebarLink.filter(
    (link) => link.path !== "/customer" && link.path !== "/logout",
  );

  return (
    <>
      {/* Desktop View */}
      <aside className="hidden lg:block w-72 flex-shrink-0 px-6 py-4">
        <div className="flex items-center gap-3 mb-6 sm:hidden">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-center text-center gap-3"
        >
          {showUserProfile ? (
            <>
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm relative">
                <Image
                  src={
                    "profile_picture_url" in user && user.profile_picture_url
                      ? (user.profile_picture_url as string)
                      : "https://i.pinimg.com/originals/74/a3/b6/74a3b6a8856b004dfff824ae9668fe9b.jpg"
                  }
                  alt={`${user.first_name}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-theme-h6 font-semibold text-gray-900">
                  {`${user.first_name} ${user.last_name}`}
                </h2>
                <p className="text-theme-body-sm text-gray-500">{user.email}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse border-2 border-gray-100 shadow-sm" />
              <div className="flex flex-col items-center gap-2 mt-2 w-full">
                <div className="h-5 bg-gray-200 animate-pulse rounded w-32" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-48" />
              </div>
            </>
          )}
        </motion.div>

        <motion.ul
          className="space-y-1.5"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {ProfileSidebarLink.map((link) => {
            const targetPath =
              link.path === "/customer" ? `/customer` : `/customer${link.path}`;
            const isActive =
              link.path !== "/logout" &&
              (activePath === targetPath ||
                (link.path !== "/customer" &&
                  activePath.startsWith(targetPath)));
            const isDanger = link.path === "/logout";

            return (
              <motion.li
                key={link.name}
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <button
                  onClick={() => handleNavigation(link.path)}
                  className={`
                                  relative w-full flex items-center gap-3 px-4 py-3
                                  rounded-md text-theme-body-sm font-medium transition-colors group
                                  ${
                                    isDanger
                                      ? "text-red-600 hover:bg-red-50"
                                      : isActive
                                        ? "bg-gray-900 text-white shadow-md"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                  }
                                  `}
                >
                  <DynamicIcon
                    name={link.icon as IconName}
                    size={18}
                    fallback={() => <span />}
                  />
                  <span className="relative z-10">{link.name}</span>
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      </aside>
    </>
  );
}
