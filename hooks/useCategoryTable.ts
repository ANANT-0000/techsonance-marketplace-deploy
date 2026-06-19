"use client";
// ============================================================
// useCategoryTable — Table-specific state & operations
// Handles: filter, pagination, tree expand, selection, drag & drop,
// bulk operations, and simple (no-subcategory) deletes.
// ============================================================

import { useState, useTransition, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { authToken } from "@/utils/authToken";
import {
  deleteVendorProductCategory,
  updateVendorProductCategory,
} from "@/utils/vendorApiClient";
import { CategoryFilterType } from "@/components/vendor/category/CategoryManager";
import {
  CATEGORY_EXPORT,
  CATEGORY_PAGINATION,
  CATEGORY_TOAST,
} from "@/constants";
import type {
  Category,
  CategoryFilterState,
  CategoryTreeNode,
} from "@/utils/Types";

// ── Props ────────────────────────────────────────────────────

export interface UseCategoryTableProps {
  categories: Category[];
  setCheckChange: React.Dispatch<React.SetStateAction<boolean>>;
  /** Called when the user clicks Edit on a row — parent handles form population */
  onEditClick: (cat: Category) => void;
  /** Called when deleting a parent that has subcategories — parent handles the modal */
  onComplexDelete: (cat: Category) => void;
  /** Called when clicking a row name — parent opens the drawer */
  onDrawerOpen: (id: string) => void;
}

// ── Hook ─────────────────────────────────────────────────────

export function useCategoryTable({
  categories,
  setCheckChange,
  onEditClick,
  onComplexDelete,
  onDrawerOpen,
}: UseCategoryTableProps) {
  const token = authToken();
  const [isPending, startTransition] = useTransition();

  // ── Filter & Pagination State ──
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<CategoryFilterType>(
    CategoryFilterType.ALL,
  );
  const [currentPage, setCurrentPage] = useState<number>(
    CATEGORY_PAGINATION.DEFAULT_PAGE,
  );
  const pageSize = CATEGORY_PAGINATION.DEFAULT_PAGE_SIZE;

  // ── Tree Expand State ──
  const [expandedIds, setExpandedIds] = useState<string[]>(() =>
    categories.filter((c) => !c.parent_id).map((c) => c.id),
  );

  // ── Selection State ──
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkParentId, setBulkParentId] = useState("");

  // ── Drag & Drop State ──
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(
    null,
  );
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(
    null,
  );

  // ═══════════════════════════════════════════════════════════
  //  Computed Values
  // ═══════════════════════════════════════════════════════════

  const filteredCategories = useMemo(() => {
    let list = [...categories];

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((cat) => {
        const parentName = cat.parent_id
          ? categories.find((c) => c.id === cat.parent_id)?.name || ""
          : "";
        return (
          cat.name.toLowerCase().includes(q) ||
          (cat.description || "").toLowerCase().includes(q) ||
          parentName.toLowerCase().includes(q)
        );
      });
    }

    if (filterType === CategoryFilterType.PARENTS) {
      list = list.filter((c) => !c.parent_id);
    } else if (filterType === CategoryFilterType.SUBS) {
      list = list.filter((c) => c.parent_id);
    } else if (filterType === CategoryFilterType.UNUSED) {
      list = list.filter((c) => !c.productCount);
    } else if (filterType === CategoryFilterType.MOST_USED) {
      list = [...list].sort(
        (a, b) => (b.productCount || 0) - (a.productCount || 0),
      );
    }

    return list;
  }, [categories, searchQuery, filterType]);

  const treeData = useMemo<CategoryTreeNode[]>(() => {
    const buildTree = (
      parentId: string | null,
      currentDepth: number,
    ): CategoryTreeNode[] => {
      return filteredCategories
        .filter((c) => c.parent_id === parentId)
        .map((cat) => ({
          ...cat,
          depth: currentDepth,
          children: buildTree(cat.id, currentDepth + 1),
        }));
    };
    return buildTree(null, 0);
  }, [filteredCategories]);

  const paginatedRoots = useMemo<CategoryTreeNode[]>(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return treeData.slice(startIndex, startIndex + pageSize);
  }, [treeData, currentPage, pageSize]);

  const totalPages = Math.ceil(treeData.length / pageSize);

  const filterState: CategoryFilterState = {
    searchQuery,
    filterType,
    currentPage,
    pageSize,
  };

  // ═══════════════════════════════════════════════════════════
  //  Handlers
  // ═══════════════════════════════════════════════════════════

  // ── Filter & Pagination ──

  const onSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(CATEGORY_PAGINATION.DEFAULT_PAGE);
  }, []);

  const onFilterChange = useCallback((filter: CategoryFilterType) => {
    setFilterType(filter);
    setCurrentPage(CATEGORY_PAGINATION.DEFAULT_PAGE);
  }, []);

  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // ── Tree Expand ──

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  // ── Selection ──

  const handleSelectAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        const allIds: string[] = [];
        treeData.forEach((parent) => {
          allIds.push(parent.id);
          parent.children.forEach((child) => allIds.push(child.id));
        });
        setSelectedIds(allIds);
      } else {
        setSelectedIds([]);
      }
    },
    [treeData],
  );

  const handleSelectRow = useCallback((id: string, isChecked: boolean) => {
    setSelectedIds((prev) =>
      isChecked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  }, []);

  // ── Delete (simple — no subcategories) ──

  const handleDeleteClick = useCallback(
    (cat: Category) => {
      const subs = categories.filter((c) => c.parent_id === cat.id);
      if (subs.length > 0) {
        // Has subcategories → delegate to parent for complex delete modal
        onComplexDelete(cat);
        return;
      }
      // Simple delete
      if (confirm(CATEGORY_TOAST.DELETE_CONFIRM(cat.name))) {
        startTransition(async () => {
          try {
            const res = await deleteVendorProductCategory(cat.id, token || "");
            if (res.status === 200) {
              toast.success(CATEGORY_TOAST.DELETED);
              setCheckChange((prev) => !prev);
            } else {
              toast.error(res.message || CATEGORY_TOAST.DELETE_FAILED);
            }
          } catch {
            toast.error(CATEGORY_TOAST.DELETE_CATEGORY_FAILED);
          }
        });
      }
    },
    [categories, token, setCheckChange, onComplexDelete],
  );

  // ── Bulk Operations ──

  const handleBulkDelete = useCallback(async () => {
    if (!token) return;
    if (confirm(CATEGORY_TOAST.BULK_DELETE_CONFIRM(selectedIds.length))) {
      let successCount = 0;
      for (const id of selectedIds) {
        try {
          const res = await deleteVendorProductCategory(id, token);
          if (res.status === 200) successCount++;
        } catch {
          /* continue with remaining */
        }
      }
      toast.success(CATEGORY_TOAST.BULK_DELETED(successCount));
      setSelectedIds([]);
      setBulkParentId("");
      setCheckChange((prev) => !prev);
    }
  }, [token, selectedIds, setCheckChange]);

  const handleBulkMove = useCallback(async () => {
    if (!token) return;
    const targetParentId = bulkParentId === "" ? null : bulkParentId;
    let successCount = 0;
    for (const id of selectedIds) {
      if (id === targetParentId) continue;
      const cat = categories.find((c) => c.id === id);
      if (cat) {
        try {
          const res = await updateVendorProductCategory(
            id,
            {
              name: cat.name,
              description: cat.description,
              parent_id: targetParentId,
            },
            token,
          );
          if (res.status === 200) successCount++;
        } catch {
          /* continue with remaining */
        }
      }
    }
    toast.success(CATEGORY_TOAST.BULK_MOVED(successCount));
    setSelectedIds([]);
    setBulkParentId("");
    setCheckChange((prev) => !prev);
  }, [token, bulkParentId, selectedIds, categories, setCheckChange]);

  const handleBulkExport = useCallback(() => {
    const selectedCats = categories.filter((c) => selectedIds.includes(c.id));
    const dataStr =
      CATEGORY_EXPORT.MIME_TYPE +
      encodeURIComponent(JSON.stringify(selectedCats, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", CATEGORY_EXPORT.FILE_NAME);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(CATEGORY_TOAST.EXPORTED);
  }, [categories, selectedIds]);

  // ── Drag & Drop ──

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedCategoryId(id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (draggedCategoryId && draggedCategoryId !== targetId) {
        setDragOverCategoryId(targetId);
      }
    },
    [draggedCategoryId],
  );

  const handleDragLeave = useCallback(() => {
    setDragOverCategoryId(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetParentId: string) => {
      e.preventDefault();
      const draggedId = draggedCategoryId;
      setDraggedCategoryId(null);
      setDragOverCategoryId(null);

      if (!draggedId || draggedId === targetParentId) return;

      const draggedCat = categories.find((c) => c.id === draggedId);
      const targetParent = categories.find((c) => c.id === targetParentId);
      if (!draggedCat || !targetParent) return;

      if (targetParent.parent_id) {
        toast.error(CATEGORY_TOAST.NESTING_NOT_SUPPORTED);
        return;
      }

      if (!token) return;

      try {
        const res = await updateVendorProductCategory(
          draggedId,
          {
            name: draggedCat.name,
            description: draggedCat.description,
            parent_id: targetParentId,
          },
          token,
        );
        if (res.status === 200) {
          toast.success(
            CATEGORY_TOAST.HIERARCHY_UPDATED(
              draggedCat.name,
              targetParent.name,
            ),
          );
          setCheckChange((prev) => !prev);
        } else {
          toast.error(res.message || CATEGORY_TOAST.HIERARCHY_FAILED);
        }
      } catch {
        toast.error(CATEGORY_TOAST.REORDER_FAILED);
      }
    },
    [draggedCategoryId, categories, token, setCheckChange],
  );

  // ═══════════════════════════════════════════════════════════
  //  Return
  // ═══════════════════════════════════════════════════════════

  return {
    // Filter & Pagination
    filterState,
    onSearchChange,
    onFilterChange,
    onPageChange,

    // Tree
    treeData,
    paginatedRoots,
    totalPages,
    expandedIds,
    toggleExpand,

    // Selection
    selectedIds,
    handleSelectAll,
    handleSelectRow,

    // Bulk
    bulkParentId,
    onBulkParentIdChange: setBulkParentId,
    handleBulkDelete,
    handleBulkMove,
    handleBulkExport,

    // Drag & Drop
    dragOverCategoryId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,

    // Transition
    isPending,

    // Passthrough callbacks from parent
    onEditClick,
    onDeleteClick: handleDeleteClick,
    onDrawerOpen,
  };
}
