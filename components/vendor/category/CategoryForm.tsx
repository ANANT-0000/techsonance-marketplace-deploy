"use client";
// ============================================================
// CategoryForm — Create/Edit Category Form Panel
// ============================================================

import React, { useMemo } from "react";
import { FolderPlus, Edit2 } from "lucide-react";
import { CATEGORY_UI_LABELS, CATEGORY_VALIDATION } from "@/constants";
import { Category, CategoryFormProps } from "@/utils/Types";
function getDescendantIds(categories: Category[], rootId: string): Set<string> {
  const ids = new Set<string>();
  const stack = [rootId];
  while (stack.length) {
    const current = stack.pop()!;
    categories.forEach((c) => {
      if (c.parent_id === current && !ids.has(c.id)) {
        ids.add(c.id);
        stack.push(c.id);
      }
    });
  }
  return ids;
}

function buildIndentedParentOptions(
  categories: Category[],
  excludeIds: Set<string>,
) {
  const byParent = new Map<string | null, Category[]>();
  categories.forEach((c) => {
    const key = c.parent_id ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  });
  const options: { value: string; label: string }[] = [];
  const walk = (parentId: string | null, depth: number) => {
    (byParent.get(parentId) ?? [])
      .filter((c) => !excludeIds.has(c.id))
      .forEach((c) => {
        options.push({
          value: c.id,
          label: `${"—".repeat(depth)}${depth ? " " : ""}${c.name}`,
        });
        walk(c.id, depth + 1);
      });
  };
  walk(null, 0);
  return options;
}
export default function CategoryForm({
  formState,
  categories,
  isPending,
  onNameChange,
  onDescriptionChange,
  onParentIdChange,
  onSubmit,
  onReset,
}: CategoryFormProps) {
  const { name, description, parentId, editingId } = formState;
  const excludeIds = useMemo(() => {
    const set = editingId
      ? getDescendantIds(categories, editingId)
      : new Set<string>();
    if (editingId) set.add(editingId); // can't parent itself
    return set;
  }, [categories, editingId]);

  const parentOptions = useMemo(
    () => buildIndentedParentOptions(categories, excludeIds),
    [categories, excludeIds],
  );
  return (
    <div
      id="category-form-section"
      className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6"
    >
      <div>
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          {editingId ? (
            <Edit2 size={18} className="text-amber-500" />
          ) : (
            <FolderPlus size={18} className="text-indigo-600" />
          )}
          {editingId
            ? CATEGORY_UI_LABELS.FORM_TITLE_EDIT
            : CATEGORY_UI_LABELS.FORM_TITLE_CREATE}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {editingId
            ? CATEGORY_UI_LABELS.FORM_DESC_EDIT
            : CATEGORY_UI_LABELS.FORM_DESC_CREATE}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Parent Category Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
            {CATEGORY_UI_LABELS.PARENT_LABEL}
          </label>
          <select
            value={parentId}
            onChange={(e) => onParentIdChange(e.target.value)}
            disabled={isPending}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all cursor-pointer disabled:opacity-50"
          >
            <option value="">{CATEGORY_UI_LABELS.PARENT_NONE_OPTION}</option>
            {parentOptions &&
              parentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </select>
          <p className="text-[10px] text-gray-400 mt-1">
            {CATEGORY_UI_LABELS.PARENT_HELPER}
          </p>
        </div>

        {/* Category Name */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
            {CATEGORY_UI_LABELS.NAME_LABEL}{" "}
            <span className="text-red-500">
              {CATEGORY_UI_LABELS.NAME_REQUIRED_MARKER}
            </span>
          </label>
          <input
            type="text"
            required
            minLength={CATEGORY_VALIDATION.NAME_MIN_LENGTH}
            maxLength={CATEGORY_VALIDATION.NAME_MAX_LENGTH}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={CATEGORY_UI_LABELS.NAME_PLACEHOLDER}
            disabled={isPending}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
            {CATEGORY_UI_LABELS.DESCRIPTION_LABEL}
          </label>
          <textarea
            rows={4}
            maxLength={CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={CATEGORY_UI_LABELS.DESCRIPTION_PLACEHOLDER}
            disabled={isPending}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all resize-none disabled:opacity-50"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {editingId
              ? CATEGORY_UI_LABELS.SUBMIT_UPDATE
              : CATEGORY_UI_LABELS.SUBMIT_CREATE}
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={isPending}
            className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          >
            {CATEGORY_UI_LABELS.RESET_BUTTON}
          </button>
        </div>
      </form>
    </div>
  );
}
