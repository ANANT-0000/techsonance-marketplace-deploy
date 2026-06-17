import { Trash2 } from "lucide-react";

export function ListCard({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 text-red-400 hover:text-red-650 p-1"
      >
        <Trash2 size={14} />
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">
        {children}
      </div>
    </div>
  );
}
