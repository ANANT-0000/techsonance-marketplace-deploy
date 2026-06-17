import { UiText } from "@/constants/ui-text";
import AxiosAPI from "@/lib/axios";
import { authToken } from "@/utils/authToken";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
export async function deleteCloudinaryAsset(url: string): Promise<void> {
  try {
    await AxiosAPI.delete("/v1/cms/delete-cloudinary-image", {
      params: { url: url },
    });
  } catch {
    // Silently swallow — stale asset cleanup is non-critical
  }
}
export function ImageUploadField({
  label,
  value,
  onChange,
  onAutoSave,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onAutoSave?: (newUrl: string) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaved, setAutoSaved] = useState(false);
  const token = authToken();

  // Show "✓ Auto-saved" confirmation for 3 seconds after upload
  const flashAutoSaved = () => {
    setAutoSaved(true);
    setTimeout(() => setAutoSaved(false), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(UiText.SIZE_LIMIT_ERROR);
      return;
    }

    setUploading(true);
    setError(null);

    // If there is already an image, queue its Cloudinary deletion (replace flow)
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

        // 1. Delete old asset from Cloudinary (non-blocking)
        if (oldUrl) {
          deleteCloudinaryAsset(oldUrl);
        }

        // 2. Update local state with new URL
        onChange(newUrl);

        // 3. Auto-save to backend so this URL survives a reload
        if (onAutoSave) {
          try {
            await onAutoSave(newUrl);
            flashAutoSaved();
          } catch {
            // Auto-save failed silently; vendor can still click Save manually
          }
        }
      } else {
        throw new Error("Upload succeeded but no URL returned.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || UiText.UPLOAD_FAILED);
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected if needed
      e.target.value = "";
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    setRemoving(true);
    setError(null);
    const urlToDelete = value;

    // Clear local state immediately for snappy UX
    onChange("");

    // Delete from Cloudinary in the background
    await deleteCloudinaryAsset(urlToDelete);

    // Auto-save the cleared state so it persists on reload
    if (onAutoSave) {
      try {
        await onAutoSave("");
        flashAutoSaved();
      } catch {
        // silent
      }
    }
    setRemoving(false);
  };

  return (
    <div>
      <label className="block text-theme-caption font-bold text-gray-500 mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
        {/* Preview thumbnail with Remove button */}
        {value ? (
          <div className="relative w-12 h-12 rounded-lg overflow-visible shrink-0">
            <img
              src={value}
              alt={UiText.PREVIEW}
              className="w-12 h-12 object-cover rounded-lg border border-gray-200 bg-white shadow-sm"
            />
            {/* Remove ✕ button */}
            <button
              type="button"
              onClick={handleRemove}
              disabled={removing || uploading}
              title={UiText.REMOVE_IMAGE}
              className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm transition-colors disabled:opacity-50"
            >
              <X size={9} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-white text-gray-400 shrink-0">
            <ImageIcon size={16} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <label className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-250 rounded-lg px-3 py-1.5 text-theme-caption font-bold cursor-pointer transition-all">
            {uploading ? (
              <>
                <Loader2 size={12} className="animate-spin text-purple-600" />
                <span>{UiText.UPLOADING}</span>
              </>
            ) : (
              <>
                <Upload size={12} className="text-gray-500" />
                <span>{UiText.UPLOAD_IMAGE}</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading || removing}
              className="hidden"
            />
          </label>
          {error && (
            <p className="text-theme-tiny text-red-500 mt-1">{error}</p>
          )}
          {!error && autoSaved && (
            <p className="text-theme-tiny text-emerald-600 mt-1 font-semibold">
              {UiText.AUTO_SAVED}
            </p>
          )}
          {!error && !autoSaved && value && (
            <p
              className="text-theme-tiny text-emerald-600 mt-1 truncate"
              title={value}
            >
              {UiText.CLOUDINARY_ATTACHED}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
