import { CATEGORY_CART_TEXT, COLOR_WHITE } from "@/constants";
import { useImageColors } from "@/hooks/useImageColors";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function CategoryCard({
  cat,
  idx,
}: {
  cat: { title: string; url: string };
  idx: number;
}) {
  const { bg: bgColor } = useImageColors(cat.url);
  return (
    <Link
      href={`/store?category=${encodeURIComponent(cat.title)}`}
      className="group flex flex-col"
    >
      <div
        style={{ background: COLOR_WHITE }}
        className={`relative aspect-3/4 p-2   shadow-md border border-gray-200/50  overflow-hidden rounded-2xl transition-colors duration-500 h-[20vh]`}
      >
        {cat.url && (
          <Image
            src={cat.url}
            alt={cat.title}
            width={1500}
            height={1500}
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="pt-3 pb-1">
        <h3 className="text-theme-body-sm font-semibold text-gray-800 capitalize tracking-wide">
          {cat.title}
        </h3>
        <p className="text-theme-xxs text-gray-400 mt-0.5 flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
          {CATEGORY_CART_TEXT.SHOP_NOW} <ChevronRight size={10} />
        </p>
      </div>
    </Link>
  );
}
