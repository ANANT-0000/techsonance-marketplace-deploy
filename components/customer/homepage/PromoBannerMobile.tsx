import { useImageColors } from "@/hooks/useImageColors";
import { Link } from "lucide-react";
import Image from "next/image";
import { PROMO_BANNER_TEXT } from "@/constants/customerText";

export function PromoBannerMobile({
  imageUrl,
  title,
  desc,
  btnText,
}: {
  imageUrl: string;
  title: string;
  desc: string;
  btnText: string;
}) {
  const { bg: bgColor } = useImageColors(imageUrl);
  return (
    <section
      style={{ background: bgColor }}
      className="promo_banner_mobile mx-4 my-6 rounded-2xl overflow-hidden relative h-44 transition-colors duration-500"
    >
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-contain"
        sizes="(max-width: 768px) calc(100vw - 32px)"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/20" />
      <div className="absolute inset-0 flex flex-col justify-center px-5">
        <h3 className="text-theme-h6 font-bold text-white leading-tight mb-1">
          {title}
        </h3>
        {desc && (
          <p className="text-theme-xxs text-white/70 mb-4 line-clamp-2">{desc}</p>
        )}
        <Link href="/store">
          <button className="self-start bg-white text-black text-theme-tiny font-bold uppercase tracking-wider px-4 py-2 rounded-full">
            {btnText || PROMO_BANNER_TEXT.SHOP_NOW}
          </button>
        </Link>
      </div>
    </section>
  );
}
