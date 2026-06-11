import { useImageColors } from "@/hooks/useImageColors";
import Image from "next/image";
import Link from "next/link";

export function MobileCategoryPill({ cat }: { cat: { title: string; url: string } }) {
  const { bg: bgColor } = useImageColors(cat.url);
  return (
    <Link
      href={`/store?category=${encodeURIComponent(cat.title)}`}
      className="flex flex-col items-center gap-2 shrink-0 w-[72px]"
    >
      <div
        style={{ background: bgColor }}
        className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md transition-colors duration-500"
      >
        {cat.url && (
          <Image
            src={cat.url}
            alt={cat.title}
            width={150}
            height={150}
            className="object-contain rounded-md -scale-2"
            sizes="56px"
          />
        )}
      </div>
      <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight capitalize line-clamp-2">
        {cat.title}
      </span>
    </Link>
  );
}
