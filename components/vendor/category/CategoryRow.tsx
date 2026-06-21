import { CATEGORY_UI_LABELS } from "@/constants";
import { getCategoryBadge } from "@/lib/utils";
import { CategoryTreeNode } from "@/utils/Types";
import { ChevronDown, ChevronRight, Edit2, Move, Trash2 } from "lucide-react";

export function CategoryRow({
  node,
  depth,
  expandedIds,
  toggleExpand,
  selectedIds,
  handleSelectRow,
  onDrawerOpen,
  onEditClick,
  onDeleteClick,
  dragOverCategoryId,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
}: {
  node: CategoryTreeNode;
  depth: number;
  expandedIds: string[];
  toggleExpand: (id: string) => void;
  selectedIds: string[];
  handleSelectRow: (id: string, checked: boolean) => void;
  onDrawerOpen: (id: string) => void;
  onEditClick: (node: CategoryTreeNode) => void;
  onDeleteClick: (node: CategoryTreeNode) => void;
  dragOverCategoryId: string | null;
  handleDragStart: (
    e: React.DragEvent<HTMLTableRowElement>,
    id: string,
  ) => void;
  handleDragOver: (e: React.DragEvent<Element>, targetId: string) => void;
  handleDragLeave: () => void;
  handleDrop: (
    e: React.DragEvent<Element>,
    targetParentId: string,
  ) => Promise<void>;
}) {
  const hasChildren = node.children.length > 0;
  const expanded = expandedIds.includes(node.id);
  const isSelected = selectedIds.includes(node.id);
  const isDragOver = dragOverCategoryId === node.id;
  const badge = getCategoryBadge(node);

  return (
    <>
      <tr
        draggable
        onDragStart={(e) => handleDragStart(e, node.id)}
        onDragOver={(e) => handleDragOver(e, node.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, node.id)}
        className={`hover:bg-gray-50/80 transition-colors group border-l-4 ${
          isDragOver ? "border-blue-500 bg-blue-50/50" : "border-transparent"
        } ${depth > 0 ? "bg-gray-50/30" : ""}`}
      >
        <td className="py-3.5 pl-6 pr-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => handleSelectRow(node.id, e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/25 h-4 w-4 cursor-pointer"
          />
        </td>

        <td
          className="px-4 py-3.5 font-medium text-gray-900"
          style={{ paddingLeft: `${1 + depth * 1.75}rem` }}
        >
          <div className="flex items-center gap-2 relative">
            {depth > 0 && (
              <div className="absolute left-[-16px] top-[-8px] h-[24px] w-[12px] border-l border-b border-gray-250 rounded-bl-lg" />
            )}
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                {expanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            ) : (
              <span className="w-6 inline-block" />
            )}
            <div className="cursor-grab text-gray-300 hover:text-gray-500 flex items-center">
              <Move size={14} />
            </div>
            <span
              onClick={() => onDrawerOpen(node.id)}
              className="cursor-pointer capitalize hover:underline hover:text-indigo-600 font-medium text-gray-700 flex items-center gap-1.5"
            >
              {node.icon_url ? (
                <img
                  src={node.icon_url}
                  alt={node.name}
                  className="w-5 h-5 object-cover rounded-md border border-gray-200 bg-white"
                />
              ) : (
                hasChildren ? "📁" : "📂"
              )}
              {node.name}
            </span>
          </div>
        </td>

        <td className="px-4 py-3.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
              badge.tone === "green"
                ? "bg-green-50 text-green-700 border-green-150"
                : badge.tone === "amber"
                  ? "bg-amber-50 text-amber-700 border-amber-150"
                  : "bg-purple-50 text-purple-700 border-purple-150"
            }`}
          >
            {badge.label}
          </span>
        </td>
        <td className="px-4 py-3.5 text-gray-500 max-w-[200px] truncate text-xs">
          {node.description || CATEGORY_UI_LABELS.NO_DATA_DASH}
        </td>

        <td className="px-4 py-3.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              node.show_in_nav
                ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}
          >
            {node.show_in_nav ? "Visible" : "Hidden"}
          </span>
        </td>

        <td className="px-4 py-3.5 text-center">
          <span
            onClick={() => onDrawerOpen(node.id)}
            className="inline-flex items-center justify-center bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer text-gray-600 font-bold rounded-lg text-xs min-w-[24px] h-6 px-1.5 transition-colors"
          >
            {node.productCount || 0}
          </span>
        </td>

        <td className="px-6 py-3.5 text-right space-x-2">
          <button
            onClick={() => onEditClick(node)}
            className="inline-flex items-center justify-center p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDeleteClick(node)}
            className="inline-flex items-center justify-center p-2 text-red-650 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 size={14} />
          </button>
        </td>
      </tr>

      {expanded &&
        node.children.map((child) => (
          <CategoryRow
            key={child.id}
            node={child}
            depth={depth + 1}
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
        ))}
    </>
  );
}
