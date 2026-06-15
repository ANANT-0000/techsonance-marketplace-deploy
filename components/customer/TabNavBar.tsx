"use client";
import { motion } from "motion/react";
import { TAB_LINKS } from "@/constants/customer";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useAppSelector } from "@/hooks/reduxHooks";

export function TabNavBar() {
  const { user } = useAppSelector((state: any) => state.auth);
  const path = usePathname();
  const navLinks = useMemo(() => {
    return TAB_LINKS.map((link) => {
      const newLink = { ...link };

      if (newLink.title.toLowerCase() === "profile") {
        newLink.url = `/customer`;
      } else if (newLink.title.toLowerCase() === "cart") {
        newLink.url = `/customer/cart`;
      }
      return newLink;
    });
  }, []);

  return (
    <>
      <motion.footer className="lg:hidden xl:hidden fixed bottom-0 w-full bg-navbar border-t border-border pb-safe flex justify-around items-center z-[100] pt-1">
        {navLinks.map((link, index) => {
          let isActive = false;
          if (link.title.toLowerCase() === "home") {
            isActive = path === "/";
          } else if (link.title.toLowerCase() === "profile") {
            isActive = path.startsWith("/customer") && !path.startsWith("/customer/cart");
          } else if (link.title.toLowerCase() === "cart") {
            isActive = path.startsWith("/customer/cart");
          } else if (link.title.toLowerCase() === "search") {
            isActive = path.startsWith("/store/search");
          } else if (link.title.toLowerCase() === "shop") {
            isActive = path.startsWith("/store") && !path.startsWith("/store/search");
          } else {
            isActive = path === link.url;
          }

          return (
            <motion.div
              key={index}
              whileTap={{ scale: 0.9 }}
              initial={{
                backgroundColor: "transparent",
                opacity: 0,
              }}
              animate={{
                opacity: 1,
                backgroundColor: isActive
                  ? "var(--theme-primary)"
                  : "transparent",
                color: isActive
                  ? "var(--theme-primary-foreground)"
                  : "var(--muted-foreground)",
                y: isActive ? -2 : 0,
                boxShadow: isActive ? "0 4px 12px rgba(0, 0, 0, 0.1)" : "none",
              }}
              transition={{
                duration: 0.3,
                backgroundColor: { duration: 0.5, ease: "linear" },
                color: { duration: 0.5, ease: "linear" },
                y: { duration: 0.5, ease: "linear" },
                boxShadow: { duration: 0.3, ease: "linear" },
                opacity: { duration: 0.5, ease: "linear" },
              }}
              className="rounded-full w-10 h-10 p-2 flex flex-col items-center justify-center gap-1"
            >
              <Link
                href={link.url}
                className="relative z-200 flex flex-col items-center justify-center gap-1 text-sm"
              >
                <DynamicIcon
                  name={link.iconNames as IconName}
                  size={20}
                  fallback={() => <p></p>}
                  className="text-current z-60 transition-colors duration-200"
                />
              </Link>
            </motion.div>
          );
        })}
      </motion.footer>
    </>
  );
}
