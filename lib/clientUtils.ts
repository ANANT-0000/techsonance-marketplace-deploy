"use client";
import { FileOrImage, ProductImageType } from "@/utils/Types";
import { useCallback, useRef } from "react";

export function usePreviewUrls() {
    const urlCache = useRef<Map<File, string>>(new Map());
    const getPreviewUrl = useCallback((file: FileOrImage): string => {
        if (!(file instanceof File)) {

            return (file as ProductImageType).image_url;
        }
        if (urlCache.current.has(file)) {

            return urlCache.current.get(file)!;
        }

        const newUrl = URL.createObjectURL(file);
        urlCache.current.set(file, newUrl);
        return newUrl;
    }, []);

    const revokeAll = useCallback(() => {
        urlCache.current.forEach((url) => URL.revokeObjectURL(url));
        urlCache.current.clear();
    }, []);

    const revokeOne = useCallback((file: FileOrImage) => {
        if (!(file instanceof File)) return;
        const url = urlCache.current.get(file);
        if (url) {
            URL.revokeObjectURL(url);
            urlCache.current.delete(file);
        }
    }, []);

    return { getPreviewUrl, revokeAll, revokeOne };
}