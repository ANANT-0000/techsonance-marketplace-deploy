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
import { CategoryRow } from "./CategoryRow";
import { countNodes } from "@/lib/utils";

// ── Props (minimal — only cross-component callbacks) ─────────

interface CategoryTreeTableProps {
  categories: Category[];
  setCheckChange: React.Dispatch<React.SetStateAction<boolean>>;
  onEditClick: (cat: Category) => void;
  onComplexDelete: (cat: Category) => void;
  onDrawerOpen: (id: string) => void;
  onAddNew: () => void;
  onSimpleDelete: (cat: Category) => void;
  onBulkDelete: (selectedIds: string[], onSuccess: () => void) => void;
}

// ── Component ────────────────────────────────────────────────

export default function CategoryTreeTable({
  categories,
  setCheckChange,
  onEditClick,
  onComplexDelete,
  onDrawerOpen,
  onAddNew,
  onSimpleDelete,
  onBulkDelete,
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
    onSimpleDelete,
    onBulkDelete,
  });

  const { searchQuery, filterType, currentPage } = filterState;
  const totalItemsCount = countNodes(treeData);
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
              paginatedRoots.map((root) => (
                <CategoryRow
                  key={root.id}
                  node={root}
                  depth={0}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                  selectedIds={selectedIds}
                  handleSelectRow={handleSelectRow}
                  onDrawerOpen={onDrawerOpen}
                  onEditClick={onEditClick}
                  onDeleteClick={onDeleteClick}
                  dragOverCategoryId={dragOverCategoryId}
                  handleDragStart={handleDragStart}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                />
              ))
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
