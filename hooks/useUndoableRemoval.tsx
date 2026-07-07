"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Shared "remove with undo" pattern for the Landing Page CMS editors.
 *
 * Convention (see CMS session handoff guide, §5):
 *   "Destructive or high-blast-radius actions get a confirm step or undo window."
 *
 * List deletions (a feature bullet, an FAQ, a footer link, a whole footer
 * column, etc.) are frequent, low-consequence-per-click actions, so a modal
 * confirm would be friction without much safety benefit. An undo window is
 * the better fit: the removal happens immediately (so the UI stays snappy),
 * but the item + a one-tap "Undo" stay on screen for a few seconds after.
 *
 * Usage:
 *   const { pending, schedule, runUndo } = useUndoableRemoval();
 *
 *   const removeFeature = (i: number) => {
 *     const removed = value.features[i];
 *     const features = value.features.filter((_, idx) => idx !== i);
 *     onChange({ ...value, features });
 *     schedule({
 *       label: `Removed "${removed}"`,
 *       undo: () => {
 *         const restored = [...features];
 *         restored.splice(i, 0, removed);
 *         onChange({ ...value, features: restored });
 *       },
 *     });
 *   };
 *
 *   <UndoBanner pending={pending} onUndo={runUndo} />
 */

export interface PendingRemoval {
  /** Human-readable description shown in the banner, e.g. `Removed "Custom domain"` */
  label: string;
  /** Reverses the removal by re-calling the editor's onChange with the item put back */
  undo: () => void;
}

const DEFAULT_TIMEOUT_MS = 5000;

export function useUndoableRemoval(timeoutMs: number = DEFAULT_TIMEOUT_MS) {
  const [pending, setPending] = useState<PendingRemoval | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const schedule = (removal: PendingRemoval) => {
    clearTimer();
    setPending(removal);
    timerRef.current = setTimeout(() => {
      setPending(null);
      timerRef.current = null;
    }, timeoutMs);
  };

  const runUndo = () => {
    if (!pending) return;
    pending.undo();
    setPending(null);
    clearTimer();
  };

  const dismiss = () => {
    setPending(null);
    clearTimer();
  };

  return { pending, schedule, runUndo, dismiss };
}

export function UndoBanner({
  pending,
  onUndo,
}: {
  pending: PendingRemoval | null;
  onUndo: () => void;
}) {
  if (!pending) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <span>{pending.label}</span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onUndo}
        className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
      >
        Undo
      </Button>
    </div>
  );
}
