"use client";
// ============================================================
// useCategoryForm — Form-specific state & create/update operations
// Handles: form fields, validation, create & update API calls.
// Watches `editTarget` prop to populate form from external triggers.
// ============================================================

import { useState, useTransition, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authToken } from "@/utils/authToken";
import {
  createVendorProductCategory,
  updateVendorProductCategory,
} from "@/utils/vendorApiClient";
import {
  CATEGORY_AUTH,
  CATEGORY_TOAST,
  CATEGORY_VALIDATION,
} from "@/constants";
import type { Category, CategoryFormState } from "@/utils/Types";

// ── Props ────────────────────────────────────────────────────

export interface UseCategoryFormProps {
  setCheckChange: React.Dispatch<React.SetStateAction<boolean>>;
  /** When set, form auto-populates for editing. Set to null to reset. */
  editTarget: Category | null;
}

// ── Hook ─────────────────────────────────────────────────────

export function useCategoryForm({
  setCheckChange,
  editTarget,
}: UseCategoryFormProps) {
  const router = useRouter();
  const token = authToken();
  const [isPending, startTransition] = useTransition();

  // ── Form State ──
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // ── Sync form when editTarget changes from parent ──
  useEffect(() => {
    if (editTarget) {
      setName(editTarget.name);
      setDescription(editTarget.description || "");
      setParentId(editTarget.parent_id || "");
      setEditingId(editTarget.id);
      document
        .getElementById("category-form-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [editTarget]);

  // ── Reset ──
  const handleResetForm = useCallback(() => {
    setName("");
    setDescription("");
    setParentId("");
    setEditingId(null);
  }, []);

  // ── Save (Create or Update) ──
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
    [token, name, description, parentId, editingId, router, handleResetForm, setCheckChange],
  );

  // ── Return ──

  const formState: CategoryFormState = { name, description, parentId, editingId };

  return {
    formState,
    isPending,
    onNameChange: setName,
    onDescriptionChange: setDescription,
    onParentIdChange: setParentId,
    handleSaveCategory,
    handleResetForm,
  };
}
