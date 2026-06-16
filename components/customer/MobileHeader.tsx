import { DASHBOARD_TEXT } from "@/constants/customerText";
import { useThemeData } from "@/hooks/useThemeData";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { BRAND_LOGO } from "@/constants";

export function MobileHeader({
  onOpenDrawer,
  labels = DASHBOARD_TEXT,
}: {
  onOpenDrawer: () => void;
  labels?: typeof DASHBOARD_TEXT;
}) {
  const { themeData } = useThemeData();

  const logoUrl = themeData.logo_url
    ? themeData.logo_url || themeData.logo_dark_url
    : BRAND_LOGO;

  return (
    <>
      <header className="sticky top-0 bg-navbar text-navbar-foreground border-b border-border z-30 px-4 py-3 flex items-center justify-between h-[64px]">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Icon */}
        </div>

        {/* Centered Brand Logo */}
        <div className="flex items-center justify-center flex-1">
          <Link href="/" className="flex flex-col items-center">
            {logoUrl && (
              <img
                src={logoUrl}
                alt="brand logo"
                className="h-8 object-contain rounded-2xl"
              />
            )}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            className="relative w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-navbar-foreground/10 active:scale-95 transition-all text-current cursor-pointer"
            aria-label={labels.CARD_NOTIFICATIONS_TITLE}
          >
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xxs font-bold text-destructive-foreground"></span>
          </button>
        </div>
      </header>
    </>
  );
}
