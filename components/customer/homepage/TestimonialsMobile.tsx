import { Star } from "lucide-react";
import { TESTIMONIALS_DEFAULT } from "@/constants/storefront";
import { TESTIMONIALS_TEXT } from "@/constants/customerText";

export function TestimonialsMobile({ getField }: { getField: (k: string) => any }) {
  const cmsTestimonials = getField ? getField("social_proof_testimonials") : null;
  const testimonials = Array.isArray(cmsTestimonials) && cmsTestimonials.length > 0 ? cmsTestimonials : TESTIMONIALS_DEFAULT;

  const title = (getField && getField("social_proof_title")) || TESTIMONIALS_TEXT.WHAT_CUSTOMERS_SAY_MOBILE;

  return (
    <section className=" testimonials_mobile py-8 px-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-5">
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
        {testimonials.map((t: any, i: number) => (
          <div
            key={i}
            className="min-w-[280px] snap-center bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star
                  key={j}
                  size={12}
                  fill="#F59E0B"
                  className="text-amber-400"
                />
              ))}
            </div>
            <p className="text-[12px] text-gray-600 leading-relaxed italic mb-4">
              "{t.text}"
            </p>
            <p className="text-[12px] font-bold text-gray-900">
              {t.name} ·{" "}
              <span className="font-normal text-gray-400">{t.location || t.role}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}