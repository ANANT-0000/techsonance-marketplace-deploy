"use client";
// ============================================================
// CategoryManager — Thin Coordinator
// Holds only the 3 shared signals between child components.
// Each child component owns its own state via its own hook.
// ============================================================

import { useState, useMemo, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { authToken } from "@/utils/authToken";
import {
  deleteVendorProductCategory,
  updateVendorProductCategory,
} from "@/utils/vendorApiClient";
import { CATEGORY_TOAST } from "@/constants";

import { useCategoryForm } from "@/hooks/useCategoryForm";
import CategoryPageHeader from "./CategoryPageHeader";
import CategoryStatsCards from "./CategoryStatsCards";
import CategoryForm from "./CategoryForm";
import CategoryTreeTable from "./CategoryTreeTable";
import CategoryDetailDrawer from "./CategoryDetailDrawer";
import CategoryDeleteModal from "./CategoryDeleteModal";

import type {
  Category,
  CategoryManagerProps,
  CategoryDrawerData,
  CategoryStatsData,
  DeleteModalState,
} from "@/utils/Types";

// ── Enums (shared across components) ─────────────────────────

export enum CategoryFilterType {
  ALL = "all",
  PARENTS = "parents",
  SUBS = "subs",
  UNUSED = "unused",
  MOST_USED = "most_used",
}

export enum CategoryType {
  PARENT = "PARENT",
  SUBCATEGORY = "SUBCATEGORY",
}

export enum DeleteMode {
  MOVE = "move",
  DELETE_ALL = "delete_all",
}

// ── Component ────────────────────────────────────────────────

export default function CategoryManager({
  categories = [],
  setCheckChange,
}: CategoryManagerProps) {
  const token = authToken();

  // ═══════════════════════════════════════════════════════════
  //  Shared state (cross-component signals)
  // ═══════════════════════════════════════════════════════════

  /** Signal: which category to edit in the form (null = create mode) */
  const [editTarget, setEditTarget] = useState<Category | null>(null);

  /** Signal: which category to show in the drawer (null = closed) */
  const [drawerCategoryId, setDrawerCategoryId] = useState<string | null>(null);

  /** Signal: delete modal state for parent categories with subcategories */
  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    id: string;
    name: string;
    subcategories: Category[];
  } | null>(null);
  const [deleteModeChoice, setDeleteModeChoice] = useState<DeleteMode>(
    DeleteMode.MOVE,
  );
  const [deleteMoveTargetParentId, setDeleteMoveTargetParentId] = useState("");

  // ═══════════════════════════════════════════════════════════
  //  Form hook (form owns its own state)
  // ═══════════════════════════════════════════════════════════

  const {
    formState,
    isPending,
    onNameChange,
    onDescriptionChange,
    onParentIdChange,
    onIconUrlChange,
    handleSaveCategory,
    handleResetForm,
  } = useCategoryForm({ setCheckChange, editTarget });

  // ═══════════════════════════════════════════════════════════
  //  Computed (stats, drawer data)
  // ═══════════════════════════════════════════════════════════

  const stats = useMemo<CategoryStatsData>(() => {
    const totalCategories = categories.length;
    const parentCategoriesCount = categories.filter((c) => !c.parent_id).length;
    const subcategoriesCount = categories.filter((c) => c.parent_id).length;
    const totalAssignedProducts = categories.reduce(
      (acc, c) => acc + (c.productCount || 0),
      0,
    );
    return {
      totalCategories,
      parentCategoriesCount,
      subcategoriesCount,
      totalAssignedProducts,
    };
  }, [categories]);

  const activeDrawerCategory = useMemo<CategoryDrawerData | null>(() => {
    if (!drawerCategoryId) return null;
    const cat = categories.find((c) => c.id === drawerCategoryId);
    if (!cat) return null;
    const parentName = cat.parent_id
      ? categories.find((c) => c.id === cat.parent_id)?.name || "None"
      : "None";
    const children = categories.filter((c) => c.parent_id === cat.id);
    return { ...cat, parentName, children };
  }, [categories, drawerCategoryId]);

  // ═══════════════════════════════════════════════════════════
  //  Cross-component callbacks
  // ═══════════════════════════════════════════════════════════

  /** TreeTable → Form: populate form for editing */
  const handleEditClick = useCallback((cat: Category) => {
    setEditTarget(cat);
  }, []);

  /** Drawer → Form: edit from drawer */
  const handleEditFromDrawer = useCallback((cat: Category) => {
    setEditTarget(cat);
    setDrawerCategoryId(null);
  }, []);

  /** TreeTable → "Add New" resets form to create mode */
  const handleAddNew = useCallback(() => {
    setEditTarget(null);
    handleResetForm();
  }, [handleResetForm]);

  /** TreeTable → open complex delete modal for parent with subcategories */
  const handleComplexDeleteRequest = useCallback(
    (cat: Category) => {
      const subs = categories.filter((c) => c.parent_id === cat.id);
      const targetOption = categories.find(
        (c) => !c.parent_id && c.id !== cat.id,
      );

      setDeleteModalConfig({ id: cat.id, name: cat.name, subcategories: subs });
      setDeleteMoveTargetParentId(targetOption ? targetOption.id : "");
      setDeleteModeChoice(DeleteMode.MOVE);
    },
    [categories],
  );

  /** Confirm complex delete (move subs + delete parent) */
  const handleConfirmComplexDelete = useCallback(async () => {
    if (!deleteModalConfig || !token) return;

    try {
      if (deleteModeChoice === DeleteMode.MOVE) {
        const targetParent =
          deleteMoveTargetParentId === "" ? null : deleteMoveTargetParentId;
        for (const sub of deleteModalConfig.subcategories) {
          await updateVendorProductCategory(
            sub.id,
            {
              name: sub.name,
              description: sub.description,
              parent_id: targetParent,
            },
            token,
          );
        }
      }

      const res = await deleteVendorProductCategory(
        deleteModalConfig.id,
        token,
      );
      if (res.status === 200) {
        toast.success(CATEGORY_TOAST.DELETED);
        setDeleteModalConfig(null);
        setCheckChange((prev) => !prev);
      } else {
        toast.error(res.message || CATEGORY_TOAST.DELETE_FAILED);
      }
    } catch {
      toast.error(CATEGORY_TOAST.DELETE_ERROR);
    }
  }, [
    deleteModalConfig,
    deleteModeChoice,
    deleteMoveTargetParentId,
    token,
    setCheckChange,
  ]);

  const deleteState: DeleteModalState = {
    config: deleteModalConfig,
    modeChoice: deleteModeChoice,
    moveTargetParentId: deleteMoveTargetParentId,
  };

  // ═══════════════════════════════════════════════════════════
  //  Render
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="w-full space-y-8 bg-gray-50/50 p-6 min-h-screen text-gray-800">
      {/* Page Header */}
      <CategoryPageHeader onAddNew={handleAddNew} />

      {/* Stats Cards */}
      <CategoryStatsCards stats={stats} />

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Form (owns its own state via useCategoryForm) */}
        <CategoryForm
          formState={formState}
          categories={categories}
          isPending={isPending}
          onNameChange={onNameChange}
          onDescriptionChange={onDescriptionChange}
          onParentIdChange={onParentIdChange}
          onIconUrlChange={onIconUrlChange}
          onSubmit={handleSaveCategory}
          onReset={handleResetForm}
        />

        {/* Right: Table (owns its own state via useCategoryTable) */}
        <CategoryTreeTable
          categories={categories}
          setCheckChange={setCheckChange}
          onEditClick={handleEditClick}
          onComplexDelete={handleComplexDeleteRequest}
          onDrawerOpen={setDrawerCategoryId}
          onAddNew={handleAddNew}
        />
      </div>

      {/* Detail Drawer */}
      <CategoryDetailDrawer
        drawerData={activeDrawerCategory}
        onClose={() => setDrawerCategoryId(null)}
        onEdit={handleEditFromDrawer}
      />

      {/* Complex Delete Modal */}
      <CategoryDeleteModal
        deleteState={deleteState}
        categories={categories}
        onModeChange={setDeleteModeChoice}
        onMoveTargetChange={setDeleteMoveTargetParentId}
        onConfirm={handleConfirmComplexDelete}
        onCancel={() => setDeleteModalConfig(null)}
      />

      <Toaster />
    </div>
  );
}
