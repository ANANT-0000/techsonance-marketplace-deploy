"use client";
export function SelectField({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-theme-caption font-bold text-gray-500 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-theme-body-sm focus:outline-none focus:border-purple-400 font-semibold text-gray-750"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
