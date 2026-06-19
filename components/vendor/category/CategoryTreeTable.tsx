"use client";
// ============================================================
// CategoryTreeTable — Hierarchical Table + Filters + Pagination
// Owns its own state via useCategoryTable hook.
// ============================================================

import React from "react";
import {
  Search,
  Filter,
  Move,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
} from "lucide-react";

import CategoryBulkActions from "./CategoryBulkActions";
import CategoryEmptyState from "./CategoryEmptyState";
import { useCategoryTable } from "@/hooks/useCategoryTable";
import {
  CATEGORY_FILTER_OPTIONS,
  CATEGORY_TABLE_HEADERS,
  CATEGORY_UI_LABELS,
} from "@/constants";
import type { Category } from "@/utils/Types";

// ── Props (minimal — only cross-component callbacks) ─────────

interface CategoryTreeTableProps {
  categories: Category[];
  setCheckChange: React.Dispatch<React.SetStateAction<boolean>>;
  onEditClick: (cat: Category) => void;
  onComplexDelete: (cat: Category) => void;
  onDrawerOpen: (id: string) => void;
  onAddNew: () => void;
}

// ── Component ────────────────────────────────────────────────

export default function CategoryTreeTable({
  categories,
  setCheckChange,
  onEditClick,
  onComplexDelete,
  onDrawerOpen,
  onAddNew,
}: CategoryTreeTableProps) {
  // All table state lives here — fully self-contained
  const {
    filterState,
    onSearchChange,
    onFilterChange,
    onPageChange,
    treeData,
    paginatedRoots,
    totalPages,
    expandedIds,
    toggleExpand,
    selectedIds,
    handleSelectAll,
    handleSelectRow,
    bulkParentId,
    onBulkParentIdChange,
    handleBulkDelete,
    handleBulkMove,
    handleBulkExport,
    dragOverCategoryId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isPending,
    onDeleteClick,
  } = useCategoryTable({
    categories,
    setCheckChange,
    onEditClick,
    onComplexDelete,
    onDrawerOpen,
  });

  const { searchQuery, filterType, currentPage } = filterState;

  // Calculate total selectable rows in the current filtered dataset
  const totalItemsCount = treeData.reduce(
    (acc, c) => acc + 1 + c.children.length,
    0,
  );
  const isAllSelected =
    selectedIds.length > 0 && selectedIds.length === totalItemsCount;

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* SEARCH, FILTER & CONTROLS BAR */}
      <div className="p-4 border-b border-gray-150 bg-gray-50/50 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={CATEGORY_UI_LABELS.SEARCH_PLACEHOLDER}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs font-semibold flex items-center gap-1.5">
            <Filter size={14} /> {CATEGORY_UI_LABELS.FILTER_LABEL}
          </span>
          <select
            value={filterType}
            onChange={(e) => onFilterChange(e.target.value as any)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-white hover:bg-gray-50 focus:border-indigo-500 outline-none transition-all cursor-pointer font-medium text-gray-700"
          >
            {CATEGORY_FILTER_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BULK ACTIONS FLOATING/INLINE BAR */}
      <CategoryBulkActions
        selectedCount={selectedIds.length}
        categories={categories}
        bulkParentId={bulkParentId}
        onBulkParentIdChange={onBulkParentIdChange}
        onBulkMove={handleBulkMove}
        onBulkExport={handleBulkExport}
        onBulkDelete={handleBulkDelete}
      />

      {/* TABLE AREA */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 border-b border-gray-150 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="py-4 pl-6 pr-3 w-8">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/25 h-4 w-4 cursor-pointer"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-4">{CATEGORY_TABLE_HEADERS.CATEGORY}</th>
              <th className="px-4 py-4">{CATEGORY_TABLE_HEADERS.TYPE}</th>
              <th className="px-4 py-4">
                {CATEGORY_TABLE_HEADERS.DESCRIPTION}
              </th>
              <th className="px-4 py-4 text-center">
                {CATEGORY_TABLE_HEADERS.PRODUCTS}
              </th>
              <th className="px-6 py-4 text-right">
                {CATEGORY_TABLE_HEADERS.ACTIONS}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedRoots.length > 0 ? (
              paginatedRoots.map((parent) => {
                const isExpanded = expandedIds.includes(parent.id);
                const isSelected = selectedIds.includes(parent.id);
                const isDragOver = dragOverCategoryId === parent.id;

                return (
                  <React.Fragment key={parent.id}>
                    {/* Parent Row */}
                    <tr
                      draggable
                      onDragStart={(e) => handleDragStart(e, parent.id)}
                      onDragOver={(e) => handleDragOver(e, parent.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, parent.id)}
                      className={`hover:bg-gray-50/80 transition-colors group border-l-4 ${
                        isDragOver
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-transparent"
                      }`}
                    >
                      {/* Selector */}
                      <td className="py-4 pl-6 pr-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/25 h-4 w-4 cursor-pointer"
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectRow(parent.id, e.target.checked)
                          }
                        />
                      </td>

                      {/* Category Name & Hierarchy Control */}
                      <td className="px-4 py-4 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleExpand(parent.id)}
                            className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            )}
                          </button>
                          <div className="cursor-grab text-gray-300 hover:text-gray-500 flex items-center">
                            <Move size={14} />
                          </div>
                          <span
                            onClick={() => onDrawerOpen(parent.id)}
                            className="cursor-pointer capitalize hover:underline hover:text-indigo-600 font-bold flex items-center gap-1.5"
                          >
                            📁 {parent.name}
                          </span>
                        </div>
                      </td>

                      {/* Badge Type */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-150">
                          {CATEGORY_UI_LABELS.BADGE_PARENT}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-4 text-gray-500 max-w-[200px] truncate">
                        {parent.description || CATEGORY_UI_LABELS.NO_DATA_DASH}
                      </td>

                      {/* Product Count */}
                      <td className="px-4 py-4 text-center">
                        <span
                          onClick={() => onDrawerOpen(parent.id)}
                          className="inline-flex items-center justify-center bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer text-gray-600 font-bold rounded-lg text-xs min-w-[24px] h-6 px-1.5 transition-colors"
                        >
                          {parent.productCount || 0}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => onEditClick(parent)}
                          className="inline-flex items-center justify-center p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => onDeleteClick(parent)}
                          className="inline-flex items-center justify-center p-2 text-red-650 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>

                    {/* Subcategories (children) */}
                    {isExpanded &&
                      parent.children.map((child) => {
                        const isChildSelected = selectedIds.includes(child.id);
                        return (
                          <tr
                            key={child.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, child.id)}
                            onDragOver={(e) => handleDragOver(e, child.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, child.id)}
                            className="bg-gray-50/30 hover:bg-gray-50 transition-colors group"
                          >
                            {/* Selector */}
                            <td className="py-3.5 pl-6 pr-3">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/25 h-4 w-4 cursor-pointer"
                                checked={isChildSelected}
                                onChange={(e) =>
                                  handleSelectRow(child.id, e.target.checked)
                                }
                              />
                            </td>

                            {/* Subcategory Indentation Line & Name */}
                            <td className="px-4 py-3.5 font-medium text-gray-900 pl-12">
                              <div className="flex items-center gap-2 relative">
                                <div className="absolute left-[-16px] top-[-8px] h-[24px] w-[12px] border-l border-b border-gray-250 rounded-bl-lg"></div>
                                <div className="cursor-grab text-gray-300 hover:text-gray-500 flex items-center">
                                  <Move size={14} />
                                </div>
                                <span
                                  onClick={() => onDrawerOpen(child.id)}
                                  className="cursor-pointer hover:underline hover:text-indigo-600 font-medium text-gray-700 flex items-center gap-1.5"
                                >
                                  📂 {child.name}
                                </span>
                              </div>
                            </td>

                            {/* Badge Type */}
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-150">
                                {CATEGORY_UI_LABELS.BADGE_SUBCATEGORY}
                              </span>
                            </td>

                            {/* Description */}
                            <td className="px-4 py-3.5 text-gray-400 max-w-[200px] truncate text-xs">
                              {child.description ||
                                CATEGORY_UI_LABELS.NO_DATA_DASH}
                            </td>

                            {/* Product Count */}
                            <td className="px-4 py-3.5 text-center">
                              <span
                                onClick={() => onDrawerOpen(child.id)}
                                className="inline-flex items-center justify-center bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer text-gray-650 rounded-lg text-xs min-w-[24px] h-6 px-1.5 transition-colors"
                              >
                                {child.productCount || 0}
                              </span>
                            </td>

                            {/* Action Buttons */}
                            <td className="px-6 py-3.5 text-right space-x-2">
                              <button
                                onClick={() => onEditClick(child)}
                                className="inline-flex items-center justify-center p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => onDeleteClick(child)}
                                className="inline-flex items-center justify-center p-2 text-red-650 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })
            ) : (
              <CategoryEmptyState onAddNew={onAddNew} />
            )}
          </tbody>
        </table>
      </div>

      {/* SKELETON PENDING LOADER */}
      {isPending && (
        <div className="p-6 space-y-4 border-t border-gray-100">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex gap-4 animate-pulse">
              <div className="h-6 w-6 bg-gray-100 rounded"></div>
              <div className="h-6 flex-1 bg-gray-100 rounded"></div>
              <div className="h-6 w-24 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE FOOTER / PAGINATION */}
      {totalPages > 1 && (
        <div className="border-t border-gray-150 px-6 py-4 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">
            {CATEGORY_UI_LABELS.PAGINATION_SHOWING} {currentPage}{" "}
            {CATEGORY_UI_LABELS.PAGINATION_OF} {totalPages} ({treeData.length}{" "}
            {CATEGORY_UI_LABELS.PAGINATION_SUFFIX})
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-3.5 py-1.5 border border-gray-200 hover:bg-white text-xs font-semibold rounded-xl disabled:opacity-40 transition-colors shadow-sm bg-gray-50"
            >
              {CATEGORY_UI_LABELS.PAGINATION_PREV}
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-3.5 py-1.5 border border-gray-200 hover:bg-white text-xs font-semibold rounded-xl disabled:opacity-40 transition-colors shadow-sm bg-gray-50"
            >
              {CATEGORY_UI_LABELS.PAGINATION_NEXT}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
