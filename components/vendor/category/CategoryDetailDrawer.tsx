"use client";
// ============================================================
// CategoryDetailDrawer — Slide-out Detail Panel
// ============================================================

import React from "react";
import { Info, X, Edit2 } from "lucide-react";

import { CATEGORY_UI_LABELS } from "@/constants";
import { CategoryDetailDrawerProps } from "@/utils/Types";

export default function CategoryDetailDrawer({
  drawerData,
  onClose,
  onEdit,
}: CategoryDetailDrawerProps) {
  if (!drawerData) return null;

  return (
    <>
      {/* Overlay background */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Slider content */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col transition-all duration-300 ease-out translate-x-0 border-l border-gray-100 animate-slide-in-right">
        {/* Header */}
        <div className="p-6 border-b border-gray-150 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Info className="text-indigo-600" size={20} />
            <h3 className="font-black text-gray-900 text-lg">
              {CATEGORY_UI_LABELS.DRAWER_TITLE}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Category Name */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
              {CATEGORY_UI_LABELS.DRAWER_NAME_LABEL}
            </span>
            <h2 className="text-xl font-black text-gray-900 mt-1">
              {drawerData.name}
            </h2>
          </div>

          {/* Category Image / Thumbnail */}
          {drawerData.icon_url && (
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                Category Image / Thumbnail
              </span>
              <div className="mt-1.5 w-full h-[180px] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                <img
                  src={drawerData.icon_url}
                  alt={drawerData.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Badges / Hierarchy Type */}
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                drawerData.parent_id
                  ? "bg-purple-50 text-purple-700 border-purple-150"
                  : "bg-green-50 text-green-700 border-green-150"
              }`}
            >
              {drawerData.parent_id
                ? CATEGORY_UI_LABELS.BADGE_SUBCATEGORY
                : CATEGORY_UI_LABELS.BADGE_PARENT}
            </span>
            {drawerData.parent_id && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-50 border border-gray-200 text-gray-600 flex items-center gap-1">
                {CATEGORY_UI_LABELS.DRAWER_PARENT_PREFIX}{" "}
                {drawerData.parentName}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
              {CATEGORY_UI_LABELS.DRAWER_DESCRIPTION_LABEL}
            </span>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
              {drawerData.description ||
                CATEGORY_UI_LABELS.DRAWER_NO_DESCRIPTION}
            </p>
          </div>

          {/* Products count and details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                {CATEGORY_UI_LABELS.DRAWER_PRODUCTS_LABEL}
              </span>
              <h4 className="text-2xl font-black text-indigo-600 mt-1">
                {drawerData.productCount || 0}
              </h4>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                {CATEGORY_UI_LABELS.DRAWER_SUBCATEGORIES_LABEL}
              </span>
              <h4 className="text-2xl font-black text-indigo-600 mt-1">
                {drawerData.children.length}
              </h4>
            </div>
          </div>

          {/* Subcategories (if Parent) */}
          {!drawerData.parent_id && (
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                {CATEGORY_UI_LABELS.DRAWER_SUBCATEGORIES_LIST_LABEL}
              </span>
              {drawerData.children.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {drawerData.children.map((child) => (
                    <li
                      key={child.id}
                      className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-xs font-semibold text-gray-700"
                    >
                      <span>📂 {child.name}</span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {child.productCount || 0}{" "}
                        {CATEGORY_UI_LABELS.DRAWER_PRODUCTS_SUFFIX}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 mt-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {CATEGORY_UI_LABELS.DRAWER_NO_SUBCATEGORIES}
                </p>
              )}
            </div>
          )}

          {/* Updated At */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
              {CATEGORY_UI_LABELS.DRAWER_UPDATED_AT_LABEL}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(drawerData.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-150 bg-gray-50/50 flex gap-3">
          <button
            onClick={() => onEdit(drawerData)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-all flex justify-center items-center gap-1.5 shadow-sm transform hover:scale-[1.02]"
          >
            <Edit2 size={14} /> {CATEGORY_UI_LABELS.DRAWER_EDIT_BUTTON}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-250 text-gray-650 font-semibold text-sm py-2.5 rounded-xl transition-all"
          >
            {CATEGORY_UI_LABELS.DRAWER_CLOSE_BUTTON}
          </button>
        </div>
      </div>
    </>
  );
}
