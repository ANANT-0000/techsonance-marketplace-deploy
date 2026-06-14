'use client';

import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { SIGNATURE_UPLOAD_TEXT } from "@/constants/vendorText";

interface SignatureUploadProps {
  existingUrl?: string;
  onChange: (file: File | null) => void;
  onRemoveExisting?: () => void;
}

export function SignatureUpload({ existingUrl, onChange, onRemoveExisting }: SignatureUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [existingRemoved, setExistingRemoved] = useState(false);
  const [newFilePreview, setNewFilePreview] = useState<{ src: string; name: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ─── Derived display states ────────────────────────────────────────────────
  const showExisting   = !!existingUrl && !existingRemoved && !newFilePreview;
  const showNewPreview = !!newFilePreview;
  const showUploader   = !showExisting; // drop zone only when no locked-in server image

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleFile = (file: File | null) => {
    if (!file) return;
    if (newFilePreview?.src) URL.revokeObjectURL(newFilePreview.src);
    setNewFilePreview({ src: URL.createObjectURL(file), name: file.name });
    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleRemoveExisting = () => {
    setExistingRemoved(true);
    onRemoveExisting?.();
    onChange(null);
  };

  const handleRemoveNew = () => {
    if (newFilePreview?.src) URL.revokeObjectURL(newFilePreview.src);
    setNewFilePreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ─── Shared preview card ───────────────────────────────────────────────────
  const PreviewCard = ({
    src, label, onRemove,
  }: { src: string; label: string; onRemove: () => void }) => (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg">
      <div
        className="w-24 h-24 rounded border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center"
        style={{
          backgroundImage:
            "linear-gradient(45deg,#e5e7eb 25%,transparent 25%)," +
            "linear-gradient(-45deg,#e5e7eb 25%,transparent 25%)," +
            "linear-gradient(45deg,transparent 75%,#e5e7eb 75%)," +
            "linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)",
          backgroundSize: "8px 8px",
          backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
        }}
      >
        <img
          src={src}
          alt="Signature preview"
          className="max-w-full max-h-full object-contain p-0.5"
          onError={onRemove}
        />
      </div>

      {/* <div className="flex-1 min-w-0">
        <p className="text-theme-caption font-semibold text-gray-700 flex items-center gap-1">
          <ImageIcon size={11} className="text-gray-400" />
          {label}
        </p>
        <p className="text-theme-tiny text-gray-400 truncate mt-0.5">{src}</p>
      </div> */}

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="shrink-0 p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        aria-label={SIGNATURE_UPLOAD_TEXT.REMOVE}
      >
        <X size={14} />
      </button>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-2">

      {/* Existing server image — remove only, no upload shown */}
      {showExisting && (
        <PreviewCard
          src={existingUrl!}
          label={SIGNATURE_UPLOAD_TEXT.CURRENT}
          onRemove={handleRemoveExisting}
        />
      )}

      {/* Newly picked file preview */}
      {showNewPreview && (
        <PreviewCard
          src={newFilePreview!.src}
          label={newFilePreview!.name}
          onRemove={handleRemoveNew}
        />
      )}

      {/* Drop zone — hidden while existing image is present */}
      {showUploader && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center gap-2
            w-full h-24 rounded-lg border-2 border-dashed cursor-pointer
            transition-colors select-none
            ${isDragging
              ? "border-gray-900 bg-gray-50"
              : "border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50"}
          `}
        >
          <Upload size={18} className="text-gray-400" />
          <p className="text-theme-caption text-gray-400">
            <span className="font-semibold text-gray-600">{SIGNATURE_UPLOAD_TEXT.CLICK_UPLOAD}</span> {SIGNATURE_UPLOAD_TEXT.OR_DRAG}
          </p>
          <p className="text-theme-tiny text-gray-300">{SIGNATURE_UPLOAD_TEXT.HINT}</p>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>
      )}

    </div>
  );
}