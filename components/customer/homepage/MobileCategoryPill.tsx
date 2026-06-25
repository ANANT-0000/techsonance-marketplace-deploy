import { COLOR_LIGHT_GRAY, COLOR_WHITE } from "@/constants";
import { useImageColors } from "@/hooks/useImageColors";
import Image from "next/image";
import Link from "next/link";

export function MobileCategoryPill({
  cat,
}: {
  cat: { title: string; url: string };
}) {
  const { bg: bgColor } = useImageColors(cat.url);
  const initial = cat.title?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <Link
      href={`/store?category=${encodeURIComponent(cat.title)}`}
      className="flex flex-col items-center gap-3.5 shrink-0 w-[84px] group active:scale-95 transition-transform"
    >
      <div
        style={{ background: COLOR_WHITE }}
        className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:shadow-lg group-hover:ring-2 group-hover:ring-theme-primary/30 transition-all duration-300"
      >
        {cat.url ? (
          <Image
            src={cat.url}
            alt={cat.title}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-theme-h6 font-bold text-gray-400">
            {initial}
          </span>
        )}
      </div>
      <span className="text-theme-tiny font-semibold text-gray-600 text-center leading-tight capitalize line-clamp-2 group-hover:text-theme-primary transition-colors">
        {cat.title}
      </span>
    </Link>
  );
}
