"use client";
import React from "react";
import { CATEGORY_TABLE_COL_SPAN, CATEGORY_UI_LABELS } from "@/constants";
import { CategoryEmptyStateProps } from "@/utils/Types";
import { Layers } from "lucide-react";

export default function CategoryEmptyState({
  onAddNew,
}: CategoryEmptyStateProps) {
  return (
    <tr>
      <td colSpan={CATEGORY_TABLE_COL_SPAN} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="bg-gray-100 p-4 rounded-full text-gray-400">
            <Layers size={36} />
          </div>
          <h4 className="text-gray-900 font-bold text-base">
            {CATEGORY_UI_LABELS.EMPTY_TITLE}
          </h4>
          <p className="text-xs text-gray-400 max-w-sm">
            {CATEGORY_UI_LABELS.EMPTY_DESCRIPTION}
          </p>
          <button
            onClick={onAddNew}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-sm transform hover:scale-[1.02]"
          >
            {CATEGORY_UI_LABELS.EMPTY_CTA}
          </button>
        </div>
      </td>
    </tr>
  );
}
