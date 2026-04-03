"use client";
import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";

export const VariantImgGrid = ({ 
  variantImages 
}: { 
  variantImages: { id: string; image_url: string; alt_text: string }[] 
}) => {
  // Use the first image ID as default, or null if empty
  const [selectedId, setSelectedId] = useState<string | null>(variantImages[0]?.id || null);

  // Memoize the active image to avoid repeated .find() calls on every render
  const activeImage = useMemo(() => 
    variantImages.find((img) => img.id === selectedId) || variantImages[0],
    [selectedId, variantImages]
  );

  if (!variantImages || variantImages.length === 0) {
    return (
      <div className="flex h-48 w-full items-center justify-center bg-gray-100 rounded-lg">
        <ImageOff className="text-slate-300 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="flex h-48 w-full gap-4 bg-gray-100 p-3 rounded-xl overflow-hidden">
      {variantImages.length > 1 && (
        <div className="flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-hide no-scrollbar">
          {variantImages.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelectedId(img.id)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                selectedId === img.id ? "border-blue-500 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.image_url}
                alt={img.alt_text}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

  
      <div className="relative flex-1 bg-white rounded-lg overflow-hidden border border-gray-200">
        {activeImage ? (
          <Image
            src={activeImage.image_url}
            alt={activeImage.alt_text}
            fill
            priority 
            className="object-contain p-2"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff className="text-slate-300" />
          </div>
        )}
      </div>
    </div>
  );
};