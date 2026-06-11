import { useImageColors } from "@/hooks/useImageColors";
import Image from "next/image";
import Link from "next/link";

export function PromoBannerDesktop({
  imageUrl,
  subtitle,
  title,
  desc,
  btnText,
}: {
  imageUrl: string;
  subtitle: string;
  title: string;
  desc: string;
  btnText: string;
}) {
  const { bg: bgColor } = useImageColors(imageUrl);
  return (
    <section
      style={{ background: bgColor }}
      className=" promo_banner_desktop relative w-full h-[52vh] min-h-[340px] overflow-hidden transition-colors duration-500"
    >
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-contain  "
        sizes="100vw"
        priority={false}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-16 xl:px-24 w-full">
          <div className="max-w-lg text-white">
            {subtitle && (
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 mb-4">
                {subtitle}
              </p>
            )}
            <h2 className="text-4xl lg:text-5xl font-serif tracking-tight leading-[1.05] mb-4">
              {title}
            </h2>
            {desc && (
              <p className="text-sm text-white/75 font-light leading-relaxed mb-8 max-w-sm">
                {desc}
              </p>
            )}
            <Link href="/store">
              <button className="bg-white text-black hover:bg-gray-100 transition-all duration-300 px-8 py-3 text-[11px] uppercase tracking-[0.2em] font-bold">
                {btnText || "Shop Now"}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
