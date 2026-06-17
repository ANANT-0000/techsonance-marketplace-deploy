"use client";
export function ColorField({ label, value, onChange }: any) {
  return (
    <div>
      <label className="block text-theme-caption font-bold text-gray-500 mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 border border-gray-200 rounded-xl cursor-pointer bg-transparent shrink-0"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-theme-body-sm focus:outline-none focus:border-purple-400 font-mono"
        />
      </div>
    </div>
  );
}
