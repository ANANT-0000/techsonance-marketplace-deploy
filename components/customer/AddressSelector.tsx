"use client";
import { fetchGetUserAddresses } from "@/utils/customerApiClient";
import { Address } from "@/utils/Types";
import { MapPin, Plus, CheckCircle2, Edit } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useReducer } from "react";
import { motion } from "motion/react";
import { authToken } from "@/utils/authToken";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "../ui/button";
import { ADDRESS_SELECTOR_TEXT } from "@/constants/customerText";

// ─── State ────────────────────────────────────────────────────────────────────

interface AddressSelectorState {
  addresses: Address[];
  isLoading: boolean;
}

function addressReducer(
  state: AddressSelectorState,
  action: Partial<AddressSelectorState>,
): AddressSelectorState {
  return { ...state, ...action };
}

// ─── Badge style map ──────────────────────────────────────────────────────────

const BADGE_VARIANTS: Record<string, string> = {
  home: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  work: "bg-purple-50  text-purple-700  border border-purple-100",
  other: "bg-gray-100   text-gray-500    border border-gray-200",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AddressSelector({
  userId,
  selectedAddressId,
  onSelect,
  addNewAddress,
  onEditAddress,
  loadingAddresses,
}: {
  userId: string;
  selectedAddressId: string | null;
  onSelect: (id: string) => void;
  addNewAddress: () => void;
  onEditAddress: (id: string, address?: Address) => void;
  loadingAddresses?: boolean;
}) {
  const token = authToken();

  const [state, dispatch] = useReducer(addressReducer, {
    addresses: [],
    isLoading: true,
  });

  // ─── Fetch addresses ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      return;
    }
    const fetchAddresses = async () => {
      dispatch({ isLoading: true });
      const userAddresses = await fetchGetUserAddresses(userId, token);
      if (userAddresses.status === 200)
        dispatch({ addresses: userAddresses.data });
      dispatch({ isLoading: false });
    };
    fetchAddresses();
  }, [userId, loadingAddresses]);

  // ─── Auto-select default ─────────────────────────────────────────────────
  useEffect(() => {
    state.addresses.find((addr) => {
      const isMatch = addr.is_default === true;
      if (isMatch) onSelect(addr.id);
    });
  }, [state.addresses]);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-y-scroll ">
      <CardHeader className="pb-2 pt-4 px-4 lg:px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-theme-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5 text-theme-primary" />
            </div>
            <h2 className="text-theme-body-plus font-semibold text-gray-900">
              {ADDRESS_SELECTOR_TEXT.TITLE}
            </h2>
          </div>

          <button
            onClick={addNewAddress}
            className="flex items-center gap-1.5 text-theme-xxs font-semibold text-theme-primary bg-theme-primary/10 border border-theme-primary/20 px-2.5 py-1.5 rounded-lg hover:bg-theme-primary/20 transition-colors active:scale-95"
          >
            <Plus className="w-3 h-3" />
            {ADDRESS_SELECTOR_TEXT.BTN_ADD_NEW}
          </button>
        </div>
      </CardHeader>

      <CardContent className="px-4 lg:px-5 pb-4">
        {/* Loading skeletons */}
        {state.isLoading && (
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl border border-gray-100"
              >
                <Skeleton className="w-4 h-4 rounded-full mt-0.5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state — shown when no address exists (the "no address" conditional flow) */}
        {!state.isLoading && state.addresses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-theme-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-theme-primary/70" />
            </div>
            <div className="text-center">
              <p className="text-theme-body-sm font-semibold text-gray-700">
                {ADDRESS_SELECTOR_TEXT.NO_SAVED}
              </p>
              <p className="text-theme-caption text-gray-400 mt-0.5">
                {ADDRESS_SELECTOR_TEXT.NO_SAVED_DESC}
              </p>
            </div>
            <button
              onClick={addNewAddress}
              className="flex items-center gap-1.5 text-theme-caption font-semibold text-theme-primary bg-theme-primary/10 border border-theme-primary/20 px-3.5 py-2 rounded-xl hover:bg-theme-primary/20 transition-colors active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              {ADDRESS_SELECTOR_TEXT.BTN_ADD_DELIVERY}
            </button>
          </div>
        )}

        {/* Address list */}
        {!state.isLoading && state.addresses.length > 0 && (
          <ScrollArea className="max-h-72 pr-1">
            <div className="space-y-2 pt-0.5">
              {state.addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                const badgeClass =
                  BADGE_VARIANTS[addr.address_type?.toLowerCase()] ??
                  BADGE_VARIANTS.other;

                return (
                  <motion.div
                    key={addr.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(addr.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(addr.id);
                      }
                    }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full cursor-pointer text-left flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/50 ${
                      isSelected
                        ? "border-theme-primary/30 bg-theme-primary/5 shadow-sm shadow-theme-primary/5"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/60"
                    }`}
                  >
                    {/* Custom radio indicator */}
                    <div
                      className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-theme-primary bg-theme-primary"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>

                    {/* Address content */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-theme-caption-lg font-semibold text-gray-900 break-words line-clamp-2 md:line-clamp-none">
                          {addr.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${badgeClass}`}
                        >
                          {addr.address_type}
                        </span>
                        {addr.is_default && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                            {ADDRESS_SELECTOR_TEXT.BADGE_DEFAULT}
                          </span>
                        )}
                      </div>
                      <p className="text-theme-caption text-gray-500 leading-relaxed break-words line-clamp-3">
                        {[addr.address_line1, addr.address_line2, addr.street]
                          .filter(Boolean)
                          .join(", ")}
                        <br />
                        {addr.city}, {addr.state} — {addr.postal_code}
                      </p>
                      {addr.number && (
                        <p className="text-theme-xxs text-gray-400 mt-1 truncate">
                          {addr.number}
                        </p>
                      )}
                    </div>
                    <span className="flex items-center gap-2 shrink-0 ml-2">
                      <Button
                        className="rounded-md flex px-2 border-gray-200 border"
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditAddress(addr.id, addr);
                        }}
                      >
                        <Edit size={14} />{" "}
                        <span className="text-theme-body-sm md:block hidden">
                          {ADDRESS_SELECTOR_TEXT.BTN_EDIT}
                        </span>
                      </Button>
                      {/* Selected checkmark */}
                      {isSelected && (
                        <CheckCircle2
                          size={15}
                          className="text-theme-primary shrink-0 mt-0.5"
                        />
                      )}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
