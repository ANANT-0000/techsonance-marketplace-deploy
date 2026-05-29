"use client";

import { useState, Dispatch, SetStateAction } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface DocField {
  value: string;
  label: string;
  required?: boolean;
  helperText?: string;
}

export type FileEntry = {
  file: File | null;
  type: string;
  index: number;
};

type DocUploadInputProps = {
  setFileMap: Dispatch<SetStateAction<FileEntry[]>>;
  fileMap: FileEntry[];
  typeList: DocField[];
  title: string;
  // List of labels that are missing (pushed from parent after validation attempt)
  missingDocs?: string[];
};

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocUploadInput({
  setFileMap,
  fileMap,
  typeList,
  title,
  missingDocs = [],
}: DocUploadInputProps) {
  const [expanded, setExpanded] = useState(true);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldValue: string,
    index: number,
  ) => {
    const file = e.target.files?.[0] ?? null;
    setFileMap((prev) => {
      const idx = prev.findIndex((item) => item.index === index);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { file, type: fieldValue, index };
        return updated;
      }
      return [...prev, { file, type: fieldValue, index }];
    });
  };

  const removeFile = (index: number) => {
    setFileMap((prev) => prev.filter((item) => item.index !== index));
  };

  const requiredFields = typeList.filter((f) => f.required !== false);
  const uploadedCount = fileMap.filter((f) => f.file !== null).length;
  const requiredUploaded = requiredFields.filter((f, i) => {
    const fi = typeList.indexOf(f);
    return fileMap.find((entry) => entry.index === fi)?.file !== null;
  }).length;

  console.log("fileMap",fileMap)
  return (
    <div className="mt-6 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <FileText size={16} className="text-blue-500" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800 text-sm">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {uploadedCount} of {typeList.length} uploaded
              {requiredFields.length > 0 && (
                <span className="ml-2 text-red-500">
                  · {requiredFields.length - requiredUploaded} required missing
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {missingDocs.length > 0 && (
            <AlertCircle size={16} className="text-red-500" />
          )}
          {missingDocs.length === 0 && uploadedCount > 0 && (
            <CheckCircle2 size={16} className="text-emerald-500" />
          )}
          {expanded ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Missing doc errors */}
      {missingDocs.length > 0 && (
        <div className="px-5 py-3 bg-red-50 border-b border-red-100">
          <p className="text-xs font-semibold text-red-600 mb-1 flex items-center gap-1">
            <AlertCircle size={12} />
            Required documents missing:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {missingDocs.map((label) => (
              <li key={label} className="text-xs text-red-500">
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Field list */}
      {expanded && (
        <div className="divide-y divide-gray-100">
          {typeList.map((field, index) => {
            const entry = fileMap.find((item) => item.index === index);
            const hasFile = !!entry?.file;
            const isRequired = field.required !== false;
            const isMissing = missingDocs.includes(field.label);

            return (
              <div
                key={field.value ?? index}
                className={[
                  "flex items-start gap-4 px-5 py-4 transition-colors",
                  isMissing
                    ? "bg-red-50"
                    : hasFile
                      ? "bg-emerald-50/40"
                      : "bg-white hover:bg-gray-50",
                ].join(" ")}
              >
                {/* Index */}
                <span
                  className={[
                    "shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center mt-0.5",
                    hasFile
                      ? "bg-emerald-100 text-emerald-700"
                      : isMissing
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-500",
                  ].join(" ")}
                >
                  {index + 1}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-gray-700">
                      {field.label}
                    </p>
                    {isRequired ? (
                      <span className="text-[10px] text-red-500 font-medium bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                        required
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        optional
                      </span>
                    )}
                  </div>

                  {field.helperText && !hasFile && (
                    <p className="text-xs text-gray-400 mb-2">
                      {field.helperText}
                    </p>
                  )}

                  {hasFile ? (
                    <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-xl px-3 py-2">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {entry!.file!.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {fmtSize(entry!.file!.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex items-center gap-2 border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-xl px-4 py-2.5 transition-colors group">
                      <Upload size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors shrink-0" />
                      <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                        Click to upload — PDF, JPG, PNG (max 10MB)
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileChange(e, field.value, index)}
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}