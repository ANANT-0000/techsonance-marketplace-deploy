import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatCurrency(amount: number, locale = 'en-IN'): string {
  if (typeof amount === 'string' || !amount) {
    return String(amount);
  }
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


