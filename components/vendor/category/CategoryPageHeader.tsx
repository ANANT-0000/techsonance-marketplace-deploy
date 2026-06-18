"use client";
// ============================================================
// CategoryPageHeader — Title + "Add New" CTA
// ============================================================

import React from "react";
import { Layers, Plus } from "lucide-react";
import { CATEGORY_UI_LABELS } from "@/constants";
import { CategoryPageHeaderProps } from "@/utils/Types";

export default function CategoryPageHeader({
  onAddNew,
}: CategoryPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
          <Layers className="text-indigo-600" />
          {CATEGORY_UI_LABELS.PAGE_TITLE}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {CATEGORY_UI_LABELS.PAGE_DESCRIPTION}
        </p>
      </div>
      <button
        onClick={onAddNew}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all transform hover:scale-[1.02]"
      >
        <Plus size={16} />
        {CATEGORY_UI_LABELS.ADD_NEW_BUTTON}
      </button>
    </div>
  );
}
