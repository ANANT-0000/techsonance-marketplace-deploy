import Image from "next/image";
import Link from "next/link";
import { useImageColors } from "@/hooks/useImageColors";

export function MobileNewArrivalCard({ arr }: { arr: any }) {
  const imageUrl =
    arr.variants?.[0]?.images?.[0]?.image_url ||
    "https://placehold.net/400x500.png";
  const { bg: bgColor } = useImageColors(imageUrl);

  return (
    <Link
      href={`/store/${arr.id}`}
      className="min-w-[148px] snap-center flex flex-col bg-white border border-gray-100 rounded-2xl p-2.5 shadow-sm active:scale-[0.98] transition-transform"
    >
      <div
        style={{ background: bgColor }}
        className="relative h-32 w-full overflow-hidden rounded-xl mb-2.5 transition-colors duration-500"
      >
        <Image
          src={imageUrl}
          alt={arr.name}
          fill
          className="object-contain p-2"
          sizes="148px"
        />
      </div>
      <h3 className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-snug mb-1">
        {arr.name}
      </h3>
      <span className="text-[12px] font-black text-gray-900">
        ₹{Number(arr.base_price).toLocaleString("en-IN")}
      </span>
    </Link>
  );
}
