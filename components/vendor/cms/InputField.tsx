"use client";

export function InputField({
  label,
  value,
  onChange,
  textarea,
  mono,
  type,
}: any) {
  const cls = `w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-theme-body-sm focus:outline-none focus:border-purple-400 ${mono ? "font-mono" : ""}`;
  return (
    <div>
      <label className="block text-theme-caption font-bold text-gray-500 mb-1.5">
        {label}
      </label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      ) : (
        <input
          type={type || "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
    </div>
  );
}
