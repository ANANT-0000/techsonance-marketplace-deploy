'use client'
import { useImageColors } from "@/hooks/useImageColors";
import Image from "next/image";
import Link from "next/link";

import { BRAND_HIGHLIGHT_DEFAULT } from "@/constants/storefront";

export function BrandHighlight({ getField }: { getField: (k: string) => any }) {
  const img = getField("brand_highlight_image_url") || getField("new_arrivals_left_image_url");
  const cmsBgColor: string | undefined = getField("brand_highlight_bg_color") || undefined;

  // CMS color overrides auto-detection; if absent, hook picks from image edges
  const { bg: bgColor } = useImageColors(img, { fallbackColor: cmsBgColor });
  const resolvedBg = cmsBgColor || bgColor;


  const eyebrow = getField("brand_highlight_eyebrow") || BRAND_HIGHLIGHT_DEFAULT.eyebrow;
  const title = getField("brand_highlight_title") || BRAND_HIGHLIGHT_DEFAULT.title;
  const desc = getField("brand_highlight_desc") || BRAND_HIGHLIGHT_DEFAULT.desc;
  const btnText = getField("brand_highlight_btn_text") || BRAND_HIGHLIGHT_DEFAULT.btn_text;

  const rawStats = getField("brand_highlight_stats");
  const stats = Array.isArray(rawStats) && rawStats.length > 0 ? rawStats : BRAND_HIGHLIGHT_DEFAULT.stats;

  if (!img) return null;
  return (
    <section className="brand_highlight_desktop  py-20 px-6 lg:px-16 xl:px-24 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            style={{ background: resolvedBg }}
            className="relative h-[420px] rounded-2xl overflow-hidden transition-colors duration-500"
          >
            <Image
              src={img}
              alt="Brand"
              fill
              className="object-contain"
              sizes="50vw"
            />
          </div>
          <div>
            {eyebrow && (
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-3xl lg:text-4xl font-serif tracking-tight text-gray-900 mb-5 leading-tight">
                {title}
              </h2>
            )}
            {desc && (
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {desc}
              </p>
            )}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {stats.map((item: any) => (
                <div
                  key={item.label}
                  className="text-center p-4 bg-gray-50 rounded-xl"
                >
                  <p className="text-xl font-black text-gray-900">{item.value}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            <Link href="/store">
              <button className="bg-gray-900 text-white hover:bg-black transition-colors px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest rounded-xl">
                {btnText}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
