import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { SECTION_HEADER_DEFAULTS } from "@/constants/storefront";

export function SectionHeader({
  eyebrow,
  title,
  href,
  hrefLabel,
  centered,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
  centered?: boolean;
}) {
  const displayHrefLabel = hrefLabel ?? SECTION_HEADER_DEFAULTS.hrefLabel;
  const isCentered = centered ?? false;

  return (
    <div
      className={`flex items-end justify-between mb-10 ${isCentered ? "flex-col items-center text-center gap-2" : ""}`}
    >
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl lg:text-3xl font-serif tracking-tight text-gray-900 leading-tight">
          {title}
        </h2>
        {isCentered && <div className="w-10 h-px bg-gray-300 mx-auto mt-3" />}
      </div>
      {href && !isCentered && (
        <Link
          href={href}
          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors border-b border-transparent hover:border-gray-900 pb-0.5"
        >
          {displayHrefLabel} <ChevronRight size={12} />
        </Link>
      )}
    </div>
  );
}
