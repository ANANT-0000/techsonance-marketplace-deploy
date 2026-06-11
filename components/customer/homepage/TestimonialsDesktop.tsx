import { Star } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { TESTIMONIALS_DEFAULT } from "@/constants/storefront";

export function TestimonialsDesktop({ getField }: { getField: (k: string) => any }) {
  const cmsTestimonials = getField ? getField("social_proof_testimonials") : null;
  const testimonials = Array.isArray(cmsTestimonials) && cmsTestimonials.length > 0 ? cmsTestimonials : TESTIMONIALS_DEFAULT;

  const eyebrow = (getField && getField("social_proof_eyebrow")) || "Customer Stories";
  const title = (getField && getField("social_proof_title")) || "What Our Customers Say";

  return (
    <section className="testimonials_desktop py-20 px-6 lg:px-16 xl:px-24 bg-[#faf9f6]">
      <div className="max-w-screen-xl mx-auto">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          centered
        />
        <div className="grid grid-cols-3 gap-6 mt-12">
          {testimonials.map((t: any, i: number) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    size={13}
                    fill="#F59E0B"
                    className="text-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed font-light italic mb-6">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ background: `hsl(${i * 80 + 200}, 55%, 55%)` }}
                >
                  {t.name ? t.name[0] : "C"}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">
                    {t.name}
                  </p>
                  <p className="text-[11px] text-gray-400">{t.location || t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
