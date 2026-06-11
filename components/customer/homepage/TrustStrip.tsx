import * as LucideIcons from "lucide-react";
import { TRUST_BADGE_DEFAULT } from "@/constants/storefront";

export function TrustStrip({ getField }: { getField: (k: string) => any }) {
  const cmsBadges = getField ? getField("social_proof_badges") : null;
  const badgesData = Array.isArray(cmsBadges) && cmsBadges.length > 0 ? cmsBadges : TRUST_BADGE_DEFAULT;

  return (
    <section className="bg-white border-y border-gray-100">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-16 xl:px-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
          {badgesData.map((badge: any, index: number) => {
            const IconComponent = (LucideIcons as any)[badge.icon] || LucideIcons.HelpCircle;
            return (
              <div
                key={badge.title || badge.label || index}
                className="flex items-center gap-3 py-5 px-4 lg:px-6"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <IconComponent size={18} className="text-gray-700" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-900 leading-tight">
                    {badge.title || badge.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {badge.subtitle || badge.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

 