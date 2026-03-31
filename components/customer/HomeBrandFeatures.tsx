"use client";
import { HOME_BRAND_FEATURES } from "@/constants/customer";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
export function HomeBrandFeatures() {
    const features = Array.isArray(HOME_BRAND_FEATURES) ? HOME_BRAND_FEATURES : [];
    return (
        <>
            {features.length > 0 && features.map((feature, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center gap-4 p-2">
                    <span className="bg-linear-to-t from-brand-primary to-brand-secondary p-3 rounded-full">
                        <DynamicIcon
                            name={feature.icon as IconName}
                            size={20}
                            className="lg:h-8 lg:w-8 h-6 w-6 text-primary"
                        />
                    </span>
                    <p className="lg:px-2 lg:py-1 py-0 px-1 font-bold text-center lg:text-lg text-sm text-brand-primary-foreground">
                        {feature.title}
                    </p>
                </div>
            ))}
        </>
    );
}