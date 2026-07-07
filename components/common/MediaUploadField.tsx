"use client";

import { useState } from "react";
import AxiosAPI from "@/lib/axios";
import { authToken } from "@/utils/authToken";
import { ImageIcon, Film, Loader2, Upload, X } from "lucide-react";

export async function deleteCloudinaryAsset(url: string): Promise<void> {
  try {
    await AxiosAPI.delete("/v1/cms/delete-cloudinary-image", {
      params: { url: url },
    });
  } catch {
    // Silently swallow
  }
}

export function MediaUploadField({
  label,
  value,
  onChange,
  accept = "image/*,video/*",
  maxSizeMB = 15,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accept?: string;
  maxSizeMB?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = authToken();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds limit of ${maxSizeMB}MB.`);
      return;
    }

    setUploading(true);
    setError(null);

    const oldUrl = value;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await AxiosAPI.post("/v1/cms/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data?.data?.secure_url) {
        const newUrl = res.data.data.secure_url;
        if (oldUrl) {
          deleteCloudinaryAsset(oldUrl);
        }
        onChange(newUrl);
      } else {
        throw new Error("Upload succeeded but no URL was returned.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    setRemoving(true);
    setError(null);
    const urlToDelete = value;
    onChange("");
    await deleteCloudinaryAsset(urlToDelete);
    setRemoving(false);
  };

  const isVideo = value && (
    value.endsWith(".mp4") ||
    value.endsWith(".mov") ||
    value.endsWith(".webm") ||
    value.includes("/video/upload/")
  );

  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-3 bg-gray-50/50 border rounded-xl p-3 border-slate-200">
        {/* Preview Container */}
        {value ? (
          <div className="relative w-16 h-16 rounded-lg overflow-visible shrink-0 border border-slate-100 bg-white shadow-sm flex items-center justify-center">
            {isVideo ? (
              <video
                src={value}
                muted
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <img
                src={value}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <button
              type="button"
              onClick={handleRemove}
              disabled={removing || uploading}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
            >
              <X size={10} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg border border-dashed border-slate-200 flex items-center justify-center bg-white text-gray-400 shrink-0">
            {accept.includes("video") && !accept.includes("image") ? (
              <Film size={20} />
            ) : (
              <ImageIcon size={20} />
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <label className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all shadow-sm">
            {uploading ? (
              <>
                <Loader2 size={12} className="animate-spin text-blue-600" />
                <span>Uploading…</span>
              </>
            ) : (
              <>
                <Upload size={12} className="text-gray-500" />
                <span>Upload Media</span>
              </>
            )}
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              disabled={uploading || removing}
              className="hidden"
            />
          </label>
          {error && (
            <p className="text-[10px] text-red-500 mt-1 font-medium">{error}</p>
          )}
          {value && !error && (
            <p className="text-[10px] text-emerald-600 mt-1 truncate" title={value}>
              ✓ Attached: {value.split("/").pop()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
