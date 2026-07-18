import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SUBSCRIBATION_TEXT } from "@/constants/adminText";
import { SubscriptionStatus } from "@/utils/Types";
import { VendorSubscriptionRow, VendorQuotaItem } from "./SharedUI";

interface VendorEditModalProps {
  selectedVendor: VendorSubscriptionRow | null;
  dispatch: React.Dispatch<any>;
  editPlanId: string;
  editStatus: SubscriptionStatus | "";
  livePlans: any[]; // SubscriptionPlan[]
  editTrialStartsAt: string;
  editTrialEndsAt: string;
  editCurrentPeriodStart: string;
  editCurrentPeriodEnd: string;
  editGracePeriodEndsAt: string;
  editCancelledAt: string;
  handleUpdateVendor: (e: React.FormEvent) => Promise<void>;
  isSavingVendor: boolean;
  vendorQuotaUsage: VendorQuotaItem[];
  isLoadingVendorQuota: boolean;
  ACTION: any;
}

export default function VendorEditModal({
  selectedVendor,
  dispatch,
  editPlanId,
  editStatus,
  livePlans,
  editTrialStartsAt,
  editTrialEndsAt,
  editCurrentPeriodStart,
  editCurrentPeriodEnd,
  editGracePeriodEndsAt,
  editCancelledAt,
  handleUpdateVendor,
  isSavingVendor,
  vendorQuotaUsage,
  isLoadingVendorQuota,
  ACTION,
}: VendorEditModalProps) {
  return (
    <Dialog
      open={selectedVendor !== null}
      onOpenChange={(open) => {
        if (!open) {
          dispatch({ type: ACTION.CLOSE_EDIT_MODAL });
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md border-slate-200">
        <form onSubmit={handleUpdateVendor}>
          <DialogHeader className="border-b border-slate-100 pb-3 mb-4">
            <DialogTitle className="text-base font-bold text-slate-900">
              {SUBSCRIBATION_TEXT.ACTIONS.EDIT_TITLE}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {SUBSCRIBATION_TEXT.ACTIONS.EDIT_DESC}
            </DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-4">
              {/* Details display */}
              <div className="grid grid-cols-2 gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs">
                <div>
                  <span className="block font-semibold text-slate-400 uppercase tracking-wide text-[9px]">
                    {SUBSCRIBATION_TEXT.ACTIONS.COMPANY_LABEL}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedVendor.company?.company_name}
                  </span>
                </div>
                <div>
                  <span className="block font-semibold text-slate-400 uppercase tracking-wide text-[9px]">
                    {SUBSCRIBATION_TEXT.ACTIONS.DOMAIN_LABEL}
                  </span>
                  <span className="font-mono text-slate-650">
                    {selectedVendor.company?.company_domain}
                  </span>
                </div>
              </div>

              {/* Update Plan Select */}
              <div className="grid gap-1">
                <Label className="text-xs font-semibold text-slate-700">
                  {SUBSCRIBATION_TEXT.ACTIONS.PLAN_LABEL}
                </Label>
                <Select
                  value={editPlanId}
                  onValueChange={(val) =>
                    dispatch({
                      type: ACTION.UPDATE_EDIT_FIELD,
                      payload: { key: "editPlanId", value: val },
                    })
                  }
                >
                  <SelectTrigger className="text-xs h-9 border-slate-200">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {livePlans.map((p: any) => (
                      <SelectItem
                        key={p.id}
                        value={p.id || ""}
                        className="text-xs capitalize"
                      >
                        {p.display_name || p.plan_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Update Status Select */}
              <div className="grid gap-1">
                <Label className="text-xs font-semibold text-slate-700">
                  {SUBSCRIBATION_TEXT.ACTIONS.STATUS_LABEL}
                </Label>
                <Select
                  value={editStatus}
                  onValueChange={(val) =>
                    dispatch({
                      type: ACTION.UPDATE_EDIT_FIELD,
                      payload: {
                        key: "editStatus",
                        value: val as SubscriptionStatus,
                      },
                    })
                  }
                >
                  <SelectTrigger className="text-xs h-9 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SubscriptionStatus).map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="text-xs"
                      >
                        {
                          SUBSCRIBATION_TEXT.STATUS_LABELS[
                            status as SubscriptionStatus
                          ]
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="h-px bg-slate-100 my-2" />

              {/* Sub dates form fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label className="text-xs text-slate-500 font-medium">
                    {SUBSCRIBATION_TEXT.ACTIONS.TRIAL_START}
                  </Label>
                  <Input
                    type="datetime-local"
                    value={editTrialStartsAt}
                    onChange={(e) =>
                      dispatch({
                        type: ACTION.UPDATE_EDIT_FIELD,
                        payload: {
                          key: "editTrialStartsAt",
                          value: e.target.value,
                        },
                      })
                    }
                    className="text-xs h-9 border-slate-200"
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-slate-500 font-medium">
                    {SUBSCRIBATION_TEXT.ACTIONS.TRIAL_END}
                  </Label>
                  <Input
                    type="datetime-local"
                    value={editTrialEndsAt}
                    onChange={(e) =>
                      dispatch({
                        type: ACTION.UPDATE_EDIT_FIELD,
                        payload: {
                          key: "editTrialEndsAt",
                          value: e.target.value,
                        },
                      })
                    }
                    className="text-xs h-9 border-slate-200"
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-slate-500 font-medium">
                    {SUBSCRIBATION_TEXT.ACTIONS.PERIOD_START}
                  </Label>
                  <Input
                    type="datetime-local"
                    value={editCurrentPeriodStart}
                    onChange={(e) =>
                      dispatch({
                        type: ACTION.UPDATE_EDIT_FIELD,
                        payload: {
                          key: "editCurrentPeriodStart",
                          value: e.target.value,
                        },
                      })
                    }
                    className="text-xs h-9 border-slate-200"
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-slate-500 font-medium">
                    {SUBSCRIBATION_TEXT.ACTIONS.PERIOD_END}
                  </Label>
                  <Input
                    type="datetime-local"
                    value={editCurrentPeriodEnd}
                    onChange={(e) =>
                      dispatch({
                        type: ACTION.UPDATE_EDIT_FIELD,
                        payload: {
                          key: "editCurrentPeriodEnd",
                          value: e.target.value,
                        },
                      })
                    }
                    className="text-xs h-9 border-slate-200"
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-slate-500 font-medium">
                    {SUBSCRIBATION_TEXT.ACTIONS.GRACE_END}
                  </Label>
                  <Input
                    type="datetime-local"
                    value={editGracePeriodEndsAt}
                    onChange={(e) =>
                      dispatch({
                        type: ACTION.UPDATE_EDIT_FIELD,
                        payload: {
                          key: "editGracePeriodEndsAt",
                          value: e.target.value,
                        },
                      })
                    }
                    className="text-xs h-9 border-slate-200"
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-slate-500 font-medium">
                    {SUBSCRIBATION_TEXT.ACTIONS.CANCELLED_AT}
                  </Label>
                  <Input
                    type="datetime-local"
                    value={editCancelledAt}
                    onChange={(e) =>
                      dispatch({
                        type: ACTION.UPDATE_EDIT_FIELD,
                        payload: {
                          key: "editCancelledAt",
                          value: e.target.value,
                        },
                      })
                    }
                    className="text-xs h-9 border-slate-200"
                  />
                </div>
              </div>

              {/* Vendor Quota Widget Preview */}
              <div className="mt-4 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-900 mb-2">
                  Live Quota Snapshot
                </h4>
                {isLoadingVendorQuota ? (
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading current usage...
                  </div>
                ) : vendorQuotaUsage.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">
                    No active entitlements found for this vendor.
                  </p>
                ) : (
                  <div className="max-h-32 overflow-y-auto pr-1 space-y-1.5 border border-slate-100 rounded-md p-2 bg-slate-50/50">
                    {vendorQuotaUsage.map((u) => {
                      const perc = u.isUnlimited
                        ? 0
                        : u.limit
                          ? Math.min((u.used / u.limit) * 100, 100)
                          : 0;
                      return (
                        <div
                          key={u.featureKey}
                          className="flex flex-col gap-1 text-[10px]"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-slate-600 truncate max-w-[140px]">
                              {u.featureKey}
                            </span>
                            <span className="font-medium text-slate-700">
                              {u.used} / {u.isUnlimited ? "∞" : u.limit}
                            </span>
                          </div>
                          {!u.isUnlimited && (
                            <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  perc > 90 ? "bg-red-500" : "bg-blue-500"
                                }`}
                                style={{ width: `${perc}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: ACTION.CLOSE_EDIT_MODAL })}
              className="text-xs h-8"
              disabled={isSavingVendor}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs h-8"
              disabled={isSavingVendor}
            >
              {isSavingVendor ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
