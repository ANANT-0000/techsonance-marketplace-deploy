import { AlertCircle } from "lucide-react";

export function Field({ label, error, children, hint }: {
  label: string; error?: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-theme-caption font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
      {hint && !error && <p className="text-theme-caption text-gray-400">{hint}</p>}
      {error && <p className="text-theme-caption text-red-500 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}