import { ProductImageType } from "@/utils/Types";
import { clsx, type ClassValue } from "clsx"
import { useCallback, useRef } from "react";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatCurrency(amount: number, locale = 'en-IN'): string {
  if (isNaN(amount)) {
    console.warn(`Invalid amount provided to formatCurrency: ${amount}`);
    return amount.toString();
  }
  return amount.toLocaleString(locale);
}

export function formatNumber(value: number, locale = 'en-IN'): string {
  if (isNaN(value)) {
    console.warn(`Invalid value provided to formatNumber: ${value}`);
    return value.toString();
  }
  return value.toLocaleString(locale);
}

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