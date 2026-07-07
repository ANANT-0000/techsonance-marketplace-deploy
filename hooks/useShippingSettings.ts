"use client";
import { useEffect, useState } from "react";
import { fetchPublicShippingSettings } from "@/utils/customerApiClient";

export interface ShippingSettings {
  is_free_shipping_enabled: boolean;
  free_delivery_threshold: number;
  standard_delivery_charge: number;
  shipping_charge_strategy: "STANDARD_FLAT_RATE" | "DYNAMIC_CUSTOMER_RATE";
}

interface UseShippingSettingsReturn {
  settings: ShippingSettings | null;
  isLoading: boolean;
  /** Compute the shipping fee for a given cart subtotal based on vendor config */
  computeShippingFee: (cartTotal: number) => number;
}

// Sensible fallback when the API is unreachable
const DEFAULT_SETTINGS: ShippingSettings = {
  is_free_shipping_enabled: false,
  free_delivery_threshold: 500,
  standard_delivery_charge: 50,
  shipping_charge_strategy: "STANDARD_FLAT_RATE",
};

export function useShippingSettings(): UseShippingSettingsReturn {
  const [settings, setSettings] = useState<ShippingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchPublicShippingSettings();
        if (!cancelled) {
          setSettings(data ?? DEFAULT_SETTINGS);
        }
      } catch {
        if (!cancelled) setSettings(DEFAULT_SETTINGS);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const computeShippingFee = (cartTotal: number): number => {
    if (cartTotal === 0) return 0;

    const s = settings ?? DEFAULT_SETTINGS;

    // If vendor has free shipping enabled and cart meets the threshold → free
    if (s.is_free_shipping_enabled && cartTotal >= s.free_delivery_threshold) {
      return 0;
    }

    // Otherwise apply the configured flat rate
    // (DYNAMIC_CUSTOMER_RATE would normally call the rate API, but for cart
    //  preview we fall back to the standard_delivery_charge as an estimate)
    return Number(s.standard_delivery_charge) || 0;
  };

  return { settings, isLoading, computeShippingFee };
}
