"use client";
import { HOME_BRAND_FEATURES } from "@/constants/customer";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

interface BrandFeature {
  title: string;
  icon: string;
}

export function HomeBrandFeatures({ features }: { features?: BrandFeature[] }) {
    const activeFeatures = features || (Array.isArray(HOME_BRAND_FEATURES) ? HOME_BRAND_FEATURES : []);
    return (
        <>
            {activeFeatures.length > 0 && activeFeatures.map((feature, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center gap-4 p-2">
                    <span className="bg-linear-to-t from-theme-primary to-theme-secondary p-3 rounded-full">
                        <DynamicIcon
                             name={feature.icon as IconName}
                             size={20}
                             className="lg:h-8 lg:w-8 h-6 w-6 text-primary"
                             fallback={() => <p></p>}
                        />
                    </span>
                    <p className="lg:px-2 lg:py-1 py-0 px-1 font-bold text-center lg:text-lg text-sm text-theme-primary-foreground">
                        {feature.title}
                    </p>
                </div>
            ))}
        </>
    );
}