"use client";
// ============================================================
// CategoryDeleteModal — Confirm Dialog with Options for Subcategories
// ============================================================

import React from "react";
import { AlertTriangle } from "lucide-react";

import { CATEGORY_TOAST, CATEGORY_UI_LABELS } from "@/constants";
import { DeleteMode } from "./CategoryManager";
import { CategoryDeleteModalProps } from "@/utils/Types";

export default function CategoryDeleteModal({
  deleteState,
  categories,
  onModeChange,
  onMoveTargetChange,
  onConfirm,
  onCancel,
}: CategoryDeleteModalProps) {
  const { config, modeChoice, moveTargetParentId } = deleteState;

  if (!config) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-150 animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-150 bg-red-50/50 flex items-center gap-3">
          <AlertTriangle className="text-red-600" size={24} />
          <div>
            <h3 className="font-black text-gray-900 text-base">
              {CATEGORY_UI_LABELS.DELETE_MODAL_TITLE}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {CATEGORY_TOAST.DELETE_MODAL_SUBTITLE(
                config.name,
                config.subcategories.length,
              )}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-sm">
          <p className="text-gray-500">
            {CATEGORY_UI_LABELS.DELETE_MODAL_BODY}
          </p>

          {/* Radio buttons options */}
          <div className="space-y-3">
            {/* Option 1: Move */}
            <label className="flex items-start gap-3 p-3 border border-gray-200 hover:bg-gray-50 rounded-xl cursor-pointer transition-all">
              <input
                type="radio"
                name="deleteMode"
                value={DeleteMode.MOVE}
                checked={modeChoice === DeleteMode.MOVE}
                onChange={() => onModeChange(DeleteMode.MOVE)}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold text-gray-700">
                  {CATEGORY_UI_LABELS.DELETE_MODAL_MOVE_LABEL}
                </span>
                {modeChoice === DeleteMode.MOVE && (
                  <div className="mt-2">
                    <select
                      value={moveTargetParentId}
                      onChange={(e) => onMoveTargetChange(e.target.value)}
                      className="w-full border border-gray-200 bg-white rounded-lg px-2 py-1 text-xs outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">
                        {CATEGORY_UI_LABELS.DELETE_MODAL_MOVE_NONE_OPTION}
                      </option>
                      {categories
                        .filter((c) => !c.parent_id && c.id !== config.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </label>

            {/* Option 2: Delete All */}
            <label className="flex items-start gap-3 p-3 border border-gray-200 hover:bg-gray-50 rounded-xl cursor-pointer transition-all">
              <input
                type="radio"
                name="deleteMode"
                value={DeleteMode.DELETE_ALL}
                checked={modeChoice === DeleteMode.DELETE_ALL}
                onChange={() => onModeChange(DeleteMode.DELETE_ALL)}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold text-red-650">
                  {CATEGORY_UI_LABELS.DELETE_MODAL_DELETE_ALL_LABEL}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {CATEGORY_UI_LABELS.DELETE_MODAL_DELETE_ALL_DESC}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-150 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-250 text-gray-650 hover:bg-gray-200 text-xs font-semibold rounded-xl transition-all"
          >
            {CATEGORY_UI_LABELS.DELETE_MODAL_CANCEL}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            {CATEGORY_UI_LABELS.DELETE_MODAL_CONFIRM}
          </button>
        </div>
      </div>
    </div>
  );
}
