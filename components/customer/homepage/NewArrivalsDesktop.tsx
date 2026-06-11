import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useImageColors } from "@/hooks/useImageColors";
import { SectionHeader } from "./SectionHeader";
import { NEW_ARRIVALS_TEXT } from "@/constants/customerText";

function ArrivalCard({
  card,
}: {
  card: { id: number; title: string; img: string; subtitle: string; bgColor?: string };
}) {
  // CMS-provided color is used as the fallbackColor so it takes priority
  // over the auto-detected edge color. If no CMS color, the hook picks intelligently.
  const { bg } = useImageColors(card.img, {
    fallbackColor: card.bgColor || undefined,
  });

  // When a CMS color is explicitly set, use it directly; otherwise trust the hook.
  const resolvedBg = card.bgColor || bg;

  return (
    <Link
      href="/store"
      style={{ background: resolvedBg }}
      className="relative flex flex-col overflow-hidden rounded-2xl group transition-all duration-500 min-h-[350px] md:min-h-[450px]"
    >
      {/* Image Container — object-contain so full product is visible */}
      <div className="absolute inset-0 p-8 lg:p-12">
        {card.img && (
          <Image
            src={card.img}
            alt={card.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain object-center transition-transform duration-700 group-hover:scale-105"
            quality={90}
          />
        )}
      </div>

      {/* Heavy Gradient Overlay to ensure text readability over the dynamic background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Text Content positioned at the bottom */}
      <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8 text-white pointer-events-none transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 flex flex-col justify-end">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 block mb-2 line-clamp-3">
          {card.subtitle}
        </span>
        <h4 className="text-xl lg:text-2xl font-serif tracking-wide mb-2 line-clamp-2">
          {card.title}
        </h4>
        <div className="flex items-center gap-1 text-xs font-medium text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
          {NEW_ARRIVALS_TEXT.VIEW_PRODUCT} <ChevronRight size={14} />
        </div>
      </div>
    </Link>
  );
}

// 2. Main Desktop Component
export function NewArrivalsDesktop({
  getField,
}: {
  getField: (k: string) => string;
}) {
  // Map out your 4 cards, including CMS bg color per card
  const cardsData = [1, 2, 3, 4].map((num) => ({
    id: num,
    title: getField(`new_arrivals_card_${num}_title`) || `${NEW_ARRIVALS_TEXT.NEW_ARRIVAL_PREFIX} ${num}`,
    img: getField(`new_arrivals_card_${num}_image_url`),
    subtitle: getField(`new_arrivals_card_${num}_subtitle`),
    bgColor: getField(`new_arrivals_card_${num}_bg_color`) || undefined,
  }));

  return (
    <section className="new_arrivals_desktop py-20 px-6 lg:px-16 xl:px-24 bg-white">
      <SectionHeader
        eyebrow={NEW_ARRIVALS_TEXT.JUST_DROPPED}
        title={NEW_ARRIVALS_TEXT.NEW_ARRIVALS}
        href="/store"
      />

      {/* The 2x2 Grid setup:
        grid-cols-1 for mobile, md:grid-cols-2 for tablets/desktop 
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-8 lg:mt-12">
        {cardsData.map((card) => (
          <ArrivalCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
