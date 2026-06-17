"use client";
import { Plus } from "lucide-react";

export function AddBtn({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 text-theme-caption font-bold rounded-lg border border-purple-200"
    >
      <Plus size={12} /> {label}
    </button>
  );
}
