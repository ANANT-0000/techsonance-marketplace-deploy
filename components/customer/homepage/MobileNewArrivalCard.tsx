import Image from "next/image";
import Link from "next/link";
import { useImageColors } from "@/hooks/useImageColors";

interface MobileNewArrivalCardProps {
  arr: {
    id: string;
    name: string;
    base_price: string | number;
    variants?: Array<{
      images?: Array<{
        image_url: string;
      }>;
    }>;
  };
}

const CARD_CONFIG = {
  PLACEHOLDER_IMAGE: "https://placehold.net/400x500.png",
  CURRENCY_SYMBOL: "₹",
} as const;

export function MobileNewArrivalCard({ arr }: MobileNewArrivalCardProps) {
  const imageUrl =
    arr.variants?.[0]?.images?.[0]?.image_url || CARD_CONFIG.PLACEHOLDER_IMAGE;
  const { bg: bgColor } = useImageColors(imageUrl);

  return (
    <Link
      href={`/store/${arr.id}`}
      className="min-w-[148px] snap-center flex flex-col bg-white border border-gray-100 rounded-xl py-2 px-4 shadow-sm active:scale-[0.98] transition-transform"
    >
      <div
        style={{ background: bgColor }}
        className="relative h-32 w-full overflow-hidden rounded-xl mb-2.5 transition-colors duration-500"
      >
        <Image
          src={imageUrl}
          alt={arr.name}
          fill
          className="object-contain"
          sizes="148px"
          loading="eager"
        />
      </div>
      <h3 className="text-theme-body-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-1">
        {arr.name}
      </h3>
      <span className="text-md font-black text-gray-900">
        {CARD_CONFIG.CURRENCY_SYMBOL}
        {Number(arr.base_price).toLocaleString("en-IN")}
      </span>
    </Link>
  );
}
