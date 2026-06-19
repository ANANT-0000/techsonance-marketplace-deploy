"use client";
// ============================================================
// CATEGORY MANAGEMENT — CUSTOM HOOK (STATE + HANDLERS)
// ============================================================

import { useReducer, useTransition, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authToken } from "@/utils/authToken";
import {
  createVendorProductCategory,
  deleteVendorProductCategory,
  updateVendorProductCategory,
} from "@/utils/vendorApiClient";

import {
  CategoryFilterType,
  DeleteMode,
} from "@/components/vendor/category/CategoryManager";
import {
  CATEGORY_AUTH,
  CATEGORY_EXPORT,
  CATEGORY_PAGINATION,
  CATEGORY_TOAST,
  CATEGORY_VALIDATION,
} from "@/constants";
import {
  Category,
  CategoryDrawerData,
  CategoryFormState,
  CategoryManagerProps,
  CategoryStatsData,
  CategoryTreeNode,
  DeleteModalConfig,
  DeleteModalState,
} from "@/utils/Types";

// ── Hook Return Type ─────────────────────────────────────────

export enum CategoryActionType {
  SET_FORM_NAME = "SET_FORM_NAME",
  SET_FORM_DESCRIPTION = "SET_FORM_DESCRIPTION",
  SET_FORM_PARENT_ID = "SET_FORM_PARENT_ID",
  EDIT_CATEGORY = "EDIT_CATEGORY",
  RESET_FORM = "RESET_FORM",
  SET_SEARCH_QUERY = "SET_SEARCH_QUERY",
  SET_FILTER_TYPE = "SET_FILTER_TYPE",
  SET_CURRENT_PAGE = "SET_CURRENT_PAGE",
  TOGGLE_EXPAND = "TOGGLE_EXPAND",
  SET_EXPANDED_IDS = "SET_EXPANDED_IDS",
  SELECT_ALL = "SELECT_ALL",
  SELECT_ROW = "SELECT_ROW",
  CLEAR_SELECTION = "CLEAR_SELECTION",
  SET_BULK_PARENT_ID = "SET_BULK_PARENT_ID",
  RESET_BULK = "RESET_BULK",
  SET_DRAGGED_CATEGORY_ID = "SET_DRAGGED_CATEGORY_ID",
  SET_DRAG_OVER_CATEGORY_ID = "SET_DRAG_OVER_CATEGORY_ID",
  CLEAR_DRAG_DROP = "CLEAR_DRAG_DROP",
  SET_DRAWER_CATEGORY_ID = "SET_DRAWER_CATEGORY_ID",
  OPEN_DELETE_MODAL = "OPEN_DELETE_MODAL",
  SET_DELETE_MODE_CHOICE = "SET_DELETE_MODE_CHOICE",
  SET_DELETE_MOVE_TARGET_PARENT_ID = "SET_DELETE_MOVE_TARGET_PARENT_ID",
  CLOSE_DELETE_MODAL = "CLOSE_DELETE_MODAL",
}

export type CategoryAction =
  | { type: CategoryActionType.SET_FORM_NAME; payload: string }
  | { type: CategoryActionType.SET_FORM_DESCRIPTION; payload: string }
  | { type: CategoryActionType.SET_FORM_PARENT_ID; payload: string }
  | {
      type: CategoryActionType.EDIT_CATEGORY;
      payload: {
        name: string;
        description: string;
        parentId: string;
        editingId: string;
      };
    }
  | { type: CategoryActionType.RESET_FORM }
  | { type: CategoryActionType.SET_SEARCH_QUERY; payload: string }
  | { type: CategoryActionType.SET_FILTER_TYPE; payload: CategoryFilterType }
  | { type: CategoryActionType.SET_CURRENT_PAGE; payload: number }
  | { type: CategoryActionType.TOGGLE_EXPAND; payload: string }
  | { type: CategoryActionType.SET_EXPANDED_IDS; payload: string[] }
  | {
      type: CategoryActionType.SELECT_ALL;
      payload: { checked: boolean; allIds: string[] };
    }
  | {
      type: CategoryActionType.SELECT_ROW;
      payload: { id: string; isChecked: boolean };
    }
  | { type: CategoryActionType.CLEAR_SELECTION }
  | { type: CategoryActionType.SET_BULK_PARENT_ID; payload: string }
  | { type: CategoryActionType.RESET_BULK }
  | { type: CategoryActionType.SET_DRAGGED_CATEGORY_ID; payload: string | null }
  | {
      type: CategoryActionType.SET_DRAG_OVER_CATEGORY_ID;
      payload: string | null;
    }
  | { type: CategoryActionType.CLEAR_DRAG_DROP }
  | { type: CategoryActionType.SET_DRAWER_CATEGORY_ID; payload: string | null }
  | {
      type: CategoryActionType.OPEN_DELETE_MODAL;
      payload: { config: DeleteModalConfig; defaultMoveTargetId: string };
    }
  | { type: CategoryActionType.SET_DELETE_MODE_CHOICE; payload: DeleteMode }
  | {
      type: CategoryActionType.SET_DELETE_MOVE_TARGET_PARENT_ID;
      payload: string;
    }
  | { type: CategoryActionType.CLOSE_DELETE_MODAL };

export interface CategoryManagerState {
  name: string;
  description: string;
  parentId: string;
  editingId: string | null;
  searchQuery: string;
  filterType: CategoryFilterType;
  currentPage: number;
  expandedIds: string[];
  selectedIds: string[];
  bulkParentId: string;
  draggedCategoryId: string | null;
  dragOverCategoryId: string | null;
  drawerCategoryId: string | null;
  deleteModalConfig: DeleteModalConfig | null;
  deleteModeChoice: DeleteMode;
  deleteMoveTargetParentId: string;
}

export interface UseCategoryManagerReturn {
  // Auth
  token: string | null;

  // Transition
  isPending: boolean;

  // Form state
  formState: CategoryFormState;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onParentIdChange: (value: string) => void;
  handleSaveCategory: (e: React.FormEvent) => Promise<void>;
  handleResetForm: () => void;
  handleEditClick: (cat: Category) => void;

  // Filter & Pagination
  searchQuery: string;
  filterType: CategoryFilterType;
  currentPage: number;
  pageSize: number;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: CategoryFilterType) => void;
  onPageChange: (page: number) => void;

  // Tree
  expandedIds: string[];
  toggleExpand: (id: string) => void;

  // Selection
  selectedIds: string[];
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectRow: (id: string, isChecked: boolean) => void;

  // Bulk Actions
  bulkParentId: string;
  onBulkParentIdChange: (value: string) => void;
  handleBulkDelete: () => Promise<void>;
  handleBulkMove: () => Promise<void>;
  handleBulkExport: () => void;

  // Drag & Drop
  dragOverCategoryId: string | null;
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent, targetId: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, targetParentId: string) => Promise<void>;

  // Drawer
  drawerCategoryId: string | null;
  setDrawerCategoryId: (id: string | null) => void;
  activeDrawerCategory: CategoryDrawerData | null;

  // Delete Modal
  deleteState: DeleteModalState;
  handleDeleteClick: (cat: Category) => void;
  handleConfirmComplexDelete: () => Promise<void>;
  onDeleteModeChange: (mode: DeleteMode) => void;
  onDeleteMoveTargetChange: (parentId: string) => void;
  onDeleteCancel: () => void;

  // Computed Data
  stats: CategoryStatsData;
  treeData: CategoryTreeNode[];
  paginatedRoots: CategoryTreeNode[];
  totalPages: number;
}

// ── Reducer State & Reducer ───────────────────────────────────

const initialCategoryState = (
  categories: Category[],
): CategoryManagerState => ({
  name: "",
  description: "",
  parentId: "",
  editingId: null,
  searchQuery: "",
  filterType: CategoryFilterType.ALL,
  currentPage: CATEGORY_PAGINATION.DEFAULT_PAGE,
  expandedIds: categories.filter((c) => !c.parent_id).map((c) => c.id),
  selectedIds: [],
  bulkParentId: "",
  draggedCategoryId: null,
  dragOverCategoryId: null,
  drawerCategoryId: null,
  deleteModalConfig: null,
  deleteModeChoice: DeleteMode.MOVE,
  deleteMoveTargetParentId: "",
});

function categoryReducer(
  state: CategoryManagerState,
  action: CategoryAction,
): CategoryManagerState {
  switch (action.type) {
    case CategoryActionType.SET_FORM_NAME:
      return { ...state, name: action.payload };
    case CategoryActionType.SET_FORM_DESCRIPTION:
      return { ...state, description: action.payload };
    case CategoryActionType.SET_FORM_PARENT_ID:
      return { ...state, parentId: action.payload };
    case CategoryActionType.EDIT_CATEGORY:
      return {
        ...state,
        name: action.payload.name,
        description: action.payload.description,
        parentId: action.payload.parentId,
        editingId: action.payload.editingId,
      };
    case CategoryActionType.RESET_FORM:
      return {
        ...state,
        name: "",
        description: "",
        parentId: "",
        editingId: null,
      };
    case CategoryActionType.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
        currentPage: CATEGORY_PAGINATION.DEFAULT_PAGE,
      };
    case CategoryActionType.SET_FILTER_TYPE:
      return {
        ...state,
        filterType: action.payload,
        currentPage: CATEGORY_PAGINATION.DEFAULT_PAGE,
      };
    case CategoryActionType.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    case CategoryActionType.TOGGLE_EXPAND:
      return {
        ...state,
        expandedIds: state.expandedIds.includes(action.payload)
          ? state.expandedIds.filter((id) => id !== action.payload)
          : [...state.expandedIds, action.payload],
      };
    case CategoryActionType.SET_EXPANDED_IDS:
      return { ...state, expandedIds: action.payload };
    case CategoryActionType.SELECT_ALL:
      return {
        ...state,
        selectedIds: action.payload.checked ? action.payload.allIds : [],
      };
    case CategoryActionType.SELECT_ROW:
      return {
        ...state,
        selectedIds: action.payload.isChecked
          ? [...state.selectedIds, action.payload.id]
          : state.selectedIds.filter((id) => id !== action.payload.id),
      };
    case CategoryActionType.CLEAR_SELECTION:
      return { ...state, selectedIds: [] };
    case CategoryActionType.SET_BULK_PARENT_ID:
      return { ...state, bulkParentId: action.payload };
    case CategoryActionType.RESET_BULK:
      return { ...state, selectedIds: [], bulkParentId: "" };
    case CategoryActionType.SET_DRAGGED_CATEGORY_ID:
      return { ...state, draggedCategoryId: action.payload };
    case CategoryActionType.SET_DRAG_OVER_CATEGORY_ID:
      return { ...state, dragOverCategoryId: action.payload };
    case CategoryActionType.CLEAR_DRAG_DROP:
      return { ...state, draggedCategoryId: null, dragOverCategoryId: null };
    case CategoryActionType.SET_DRAWER_CATEGORY_ID:
      return { ...state, drawerCategoryId: action.payload };
    case CategoryActionType.OPEN_DELETE_MODAL:
      return {
        ...state,
        deleteModalConfig: action.payload.config,
        deleteMoveTargetParentId: action.payload.defaultMoveTargetId,
      };
    case CategoryActionType.SET_DELETE_MODE_CHOICE:
      return { ...state, deleteModeChoice: action.payload };
    case CategoryActionType.SET_DELETE_MOVE_TARGET_PARENT_ID:
      return { ...state, deleteMoveTargetParentId: action.payload };
    case CategoryActionType.CLOSE_DELETE_MODAL:
      return { ...state, deleteModalConfig: null };
    default:
      const _exhaustiveCheck: never = action;
      return state;
  }
}

// ── Hook Implementation ──────────────────────────────────────

export function useCategoryManager({
  categories,
  setCheckChange,
}: CategoryManagerProps): UseCategoryManagerReturn {
  const router = useRouter();
  const token = authToken();

  // ── Transition ──
  const [isPending, startTransition] = useTransition();

  // ── Reducer State ──
  const [state, dispatch] = useReducer(
    categoryReducer,
    categories,
    initialCategoryState,
  );

  const {
    name,
    description,
    parentId,
    editingId,
    searchQuery,
    filterType,
    currentPage,
    expandedIds,
    selectedIds,
    bulkParentId,
    draggedCategoryId,
    dragOverCategoryId,
    drawerCategoryId,
    deleteModalConfig,
    deleteModeChoice,
    deleteMoveTargetParentId,
  } = state;

  const pageSize = CATEGORY_PAGINATION.DEFAULT_PAGE_SIZE;

  // ── Computed Stats ──
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

  // ── Filtered Categories ──
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
      list = list.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
    }

    return list;
  }, [categories, searchQuery, filterType]);

  // ── Tree Data ──
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

  // ── Pagination ──
  const paginatedRoots = useMemo<CategoryTreeNode[]>(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return treeData.slice(startIndex, startIndex + pageSize);
  }, [treeData, currentPage, pageSize]);

  const totalPages = Math.ceil(treeData.length / pageSize);

  // ── Active Drawer Category ──
  const activeDrawerCategory = useMemo<CategoryDrawerData | null>(() => {
    if (!drawerCategoryId) return null;
    const cat = categories.find((c) => c.id === drawerCategoryId);
    if (!cat) return null;
    const parentName = cat.parent_id
      ? categories.find((c) => c.id === cat.parent_id)?.name ||
        CATEGORY_UI_LABELS_NONE
      : CATEGORY_UI_LABELS_NONE;
    const children = categories.filter((c) => c.parent_id === cat.id);
    return { ...cat, parentName, children };
  }, [categories, drawerCategoryId]);

  // ── Form Handlers ──

  const handleResetForm = useCallback(() => {
    dispatch({ type: CategoryActionType.RESET_FORM });
  }, []);

  const handleSaveCategory = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!token) {
        toast.error(CATEGORY_TOAST.NO_TOKEN);
        setTimeout(
          () => router.push(CATEGORY_AUTH.LOGIN_REDIRECT_PATH),
          CATEGORY_AUTH.REDIRECT_DELAY_MS,
        );
        return;
      }

      if (name.trim().length < CATEGORY_VALIDATION.NAME_MIN_LENGTH) {
        toast.error(CATEGORY_TOAST.NAME_TOO_SHORT);
        return;
      }

      const payload = {
        name: name.trim(),
        description: description.trim(),
        parent_id: parentId === "" ? null : parentId,
      };

      try {
        if (editingId) {
          const response = await updateVendorProductCategory(
            editingId,
            payload,
            token,
          );
          if (response?.status === 200) {
            toast.success(CATEGORY_TOAST.UPDATED);
            handleResetForm();
            setCheckChange((prev) => !prev);
          } else {
            toast.error(response?.message || CATEGORY_TOAST.UPDATE_FAILED);
          }
        } else {
          const response = await createVendorProductCategory(payload, token);
          if (response?.status === 201 || response?.status === 200) {
            toast.success(CATEGORY_TOAST.CREATED);
            handleResetForm();
            setCheckChange((prev) => !prev);
          } else {
            toast.error(response?.message || CATEGORY_TOAST.CREATE_FAILED);
          }
        }
      } catch {
        toast.error(CATEGORY_TOAST.UNEXPECTED_ERROR);
      }
    },
    [
      token,
      name,
      description,
      parentId,
      editingId,
      router,
      handleResetForm,
      setCheckChange,
    ],
  );

  const handleEditClick = useCallback((cat: Category) => {
    dispatch({
      type: CategoryActionType.EDIT_CATEGORY,
      payload: {
        name: cat.name,
        description: cat.description || "",
        parentId: cat.parent_id || "",
        editingId: cat.id,
      },
    });
    document
      .getElementById("category-form-section")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ── Delete Handlers ──

  const handleDeleteClick = useCallback(
    (cat: Category) => {
      const subs = categories.filter((c) => c.parent_id === cat.id);
      if (subs.length > 0) {
        const targetOption = categories.find(
          (c) => !c.parent_id && c.id !== cat.id,
        );
        dispatch({
          type: CategoryActionType.OPEN_DELETE_MODAL,
          payload: {
            config: { id: cat.id, name: cat.name, subcategories: subs },
            defaultMoveTargetId: targetOption ? targetOption.id : "",
          },
        });
      } else {
        if (confirm(CATEGORY_TOAST.DELETE_CONFIRM(cat.name))) {
          startTransition(async () => {
            try {
              const res = await deleteVendorProductCategory(
                cat.id,
                token || "",
              );
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
      }
    },
    [categories, token, setCheckChange],
  );

  const handleConfirmComplexDelete = useCallback(async () => {
    if (!deleteModalConfig || !token) return;
    const parentIdToDelete = deleteModalConfig.id;

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

      const res = await deleteVendorProductCategory(parentIdToDelete, token);
      if (res.status === 200) {
        toast.success(CATEGORY_TOAST.DELETED);
        dispatch({ type: CategoryActionType.CLOSE_DELETE_MODAL });
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

  // ── Tree Expand/Collapse ──

  const toggleExpand = useCallback((id: string) => {
    dispatch({ type: CategoryActionType.TOGGLE_EXPAND, payload: id });
  }, []);

  // ── Selection Handlers ──

  const handleSelectAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const allIds: string[] = [];
      if (e.target.checked) {
        treeData.forEach((parent) => {
          allIds.push(parent.id);
          parent.children.forEach((child) => allIds.push(child.id));
        });
      }
      dispatch({
        type: CategoryActionType.SELECT_ALL,
        payload: { checked: e.target.checked, allIds },
      });
    },
    [treeData],
  );

  const handleSelectRow = useCallback((id: string, isChecked: boolean) => {
    dispatch({
      type: CategoryActionType.SELECT_ROW,
      payload: { id, isChecked },
    });
  }, []);

  // ── Bulk Actions ──

  const handleBulkDelete = useCallback(async () => {
    if (!token) return;
    if (confirm(CATEGORY_TOAST.BULK_DELETE_CONFIRM(selectedIds.length))) {
      let successCount = 0;
      for (const id of selectedIds) {
        try {
          const res = await deleteVendorProductCategory(id, token);
          if (res.status === 200) successCount++;
        } catch {
          // Continue with remaining deletions
        }
      }
      toast.success(CATEGORY_TOAST.BULK_DELETED(successCount));
      dispatch({ type: CategoryActionType.RESET_BULK });
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
          // Continue with remaining moves
        }
      }
    }
    toast.success(CATEGORY_TOAST.BULK_MOVED(successCount));
    dispatch({ type: CategoryActionType.RESET_BULK });
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

  // ── Drag & Drop Handlers ──

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    dispatch({ type: CategoryActionType.SET_DRAGGED_CATEGORY_ID, payload: id });
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (draggedCategoryId && draggedCategoryId !== targetId) {
        dispatch({
          type: CategoryActionType.SET_DRAG_OVER_CATEGORY_ID,
          payload: targetId,
        });
      }
    },
    [draggedCategoryId],
  );

  const handleDragLeave = useCallback(() => {
    dispatch({
      type: CategoryActionType.SET_DRAG_OVER_CATEGORY_ID,
      payload: null,
    });
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetParentId: string) => {
      e.preventDefault();
      const draggedId = draggedCategoryId;
      dispatch({ type: CategoryActionType.CLEAR_DRAG_DROP });

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

  // ── Filter/Pagination Callbacks ──

  const onSearchChange = useCallback((query: string) => {
    dispatch({ type: CategoryActionType.SET_SEARCH_QUERY, payload: query });
  }, []);

  const onFilterChange = useCallback((filter: CategoryFilterType) => {
    dispatch({ type: CategoryActionType.SET_FILTER_TYPE, payload: filter });
  }, []);

  const onPageChange = useCallback((page: number) => {
    dispatch({ type: CategoryActionType.SET_CURRENT_PAGE, payload: page });
  }, []);

  // ── Form Callbacks ──

  const onNameChange = useCallback((value: string) => {
    dispatch({ type: CategoryActionType.SET_FORM_NAME, payload: value });
  }, []);
  const onDescriptionChange = useCallback((value: string) => {
    dispatch({ type: CategoryActionType.SET_FORM_DESCRIPTION, payload: value });
  }, []);
  const onParentIdChange = useCallback((value: string) => {
    dispatch({ type: CategoryActionType.SET_FORM_PARENT_ID, payload: value });
  }, []);
  const onBulkParentIdChange = useCallback((value: string) => {
    dispatch({ type: CategoryActionType.SET_BULK_PARENT_ID, payload: value });
  }, []);

  // ── Delete Modal Callbacks ──

  const onDeleteModeChange = useCallback((mode: DeleteMode) => {
    dispatch({
      type: CategoryActionType.SET_DELETE_MODE_CHOICE,
      payload: mode,
    });
  }, []);
  const onDeleteMoveTargetChange = useCallback((id: string) => {
    dispatch({
      type: CategoryActionType.SET_DELETE_MOVE_TARGET_PARENT_ID,
      payload: id,
    });
  }, []);
  const onDeleteCancel = useCallback(() => {
    dispatch({ type: CategoryActionType.CLOSE_DELETE_MODAL });
  }, []);

  const setDrawerCategoryId = useCallback((id: string | null) => {
    dispatch({ type: CategoryActionType.SET_DRAWER_CATEGORY_ID, payload: id });
  }, []);

  // ── Return ──

  return {
    token,
    isPending,

    formState: { name, description, parentId, editingId },
    onNameChange,
    onDescriptionChange,
    onParentIdChange,
    handleSaveCategory,
    handleResetForm,
    handleEditClick,

    searchQuery,
    filterType,
    currentPage,
    pageSize,
    onSearchChange,
    onFilterChange,
    onPageChange,

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

    drawerCategoryId,
    setDrawerCategoryId,
    activeDrawerCategory,

    deleteState: {
      config: deleteModalConfig,
      modeChoice: deleteModeChoice,
      moveTargetParentId: deleteMoveTargetParentId,
    },
    handleDeleteClick,
    handleConfirmComplexDelete,
    onDeleteModeChange,
    onDeleteMoveTargetChange,
    onDeleteCancel,

    stats,
    treeData,
    paginatedRoots,
    totalPages,
  };
}

// Internal constant to avoid circular import
const CATEGORY_UI_LABELS_NONE = "None";
