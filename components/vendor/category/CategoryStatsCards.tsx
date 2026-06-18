"use client";
import { CATEGORY_STATS_CONFIG } from "@/constants";
import { CategoryStatsCardsProps } from "@/utils/Types";

export default function CategoryStatsCards({ stats }: CategoryStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CATEGORY_STATS_CONFIG.map((stat, i) => {
        const IconComponent = stat.icon;
        const colorParts = stat.colorClass.split(" ");
        const textColor = colorParts[0];
        const bgAndBorder = colorParts.slice(1).join(" ");

        return (
          <div
            key={stat.titleKey}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`p-3 rounded-xl border ${bgAndBorder}`}>
              <IconComponent className={textColor} size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                {stat.label}
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {/* @ts-ignore */}
                {stats[stat.titleKey]}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
