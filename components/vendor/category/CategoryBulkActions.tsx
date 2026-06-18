"use client";
// ============================================================
// CategoryBulkActions — Floating/Inline Bulk Action Controls
// ============================================================

import React from "react";
import { Download, Trash2 } from "lucide-react";

import { CATEGORY_UI_LABELS } from "@/constants";
import { CategoryBulkActionsProps } from "@/utils/Types";

export default function CategoryBulkActions({
  selectedCount,
  categories,
  bulkParentId,
  onBulkParentIdChange,
  onBulkMove,
  onBulkExport,
  onBulkDelete,
}: CategoryBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-indigo-50/80 border-b border-indigo-100 px-6 py-3 flex flex-wrap justify-between items-center gap-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center bg-indigo-600 text-white rounded-full text-xs font-bold h-5 px-2">
          {selectedCount}
        </span>
        <span className="text-indigo-900 text-xs font-semibold">
          {CATEGORY_UI_LABELS.BULK_SELECTED_SUFFIX}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {/* Bulk Move */}
        <div className="flex items-center border border-indigo-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <select
            value={bulkParentId}
            onChange={(e) => onBulkParentIdChange(e.target.value)}
            className="border-none text-xs bg-transparent py-1.5 px-3 focus:ring-0 outline-none cursor-pointer text-gray-700 font-medium"
          >
            <option value="">{CATEGORY_UI_LABELS.BULK_MOVE_PLACEHOLDER}</option>
            <option value="none">
              {CATEGORY_UI_LABELS.BULK_MOVE_MAKE_PARENT}
            </option>
            {categories
              .filter((c) => !c.parent_id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
          <button
            onClick={onBulkMove}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1"
          >
            {CATEGORY_UI_LABELS.BULK_MOVE_BUTTON}
          </button>
        </div>

        {/* Bulk Export */}
        <button
          onClick={onBulkExport}
          className="bg-white hover:bg-gray-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
        >
          <Download size={12} /> {CATEGORY_UI_LABELS.BULK_EXPORT_BUTTON}
        </button>

        {/* Bulk Delete */}
        <button
          onClick={onBulkDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
        >
          <Trash2 size={12} /> {CATEGORY_UI_LABELS.BULK_DELETE_BUTTON}
        </button>
      </div>
    </div>
  );
}
