'use client';

import { Field } from "./Field";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { LOGO_UPLOAD_TEXT } from "@/constants/vendorText";

export function LogoUploadField({ label, value, fieldName, onFileSelect, hint }: {
  label: string; value?: string; fieldName: string;
  onFileSelect: (name: string, file: File) => void; hint: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  
  // 1. Only store the locally uploaded file preview in state (if any)
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalPreview(URL.createObjectURL(file));
    onFileSelect(fieldName, file);
  };

  // 2. Derive what to display: Local file takes priority, fallback to API value
  const displayUrl = localPreview || value;

  return (
    <Field label={label} hint={hint}>
      <div
        onClick={() => ref.current?.click()}
        className="relative flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all group overflow-hidden"
      >
        {/* 3. Use the derived displayUrl here */}
        {displayUrl ? (
          <>
            <img src={displayUrl} alt={label} className="h-16 object-contain" />
            <span className="text-theme-caption text-gray-400 group-hover:text-gray-600">{LOGO_UPLOAD_TEXT.REPLACE}</span>
          </>
        ) : (
          <>
            <Upload size={20} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            <span className="text-theme-caption text-gray-400">{LOGO_UPLOAD_TEXT.UPLOAD}</span>
          </>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </Field>
  );
}