"use client";
import { getClientCompanyId } from "@/utils/getCompanyId";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  PackageOpen,
} from "lucide-react";
import { toast } from "sonner";
import { authToken } from "@/utils/authToken";
import {
  getAvailableSubscriptionPlans,
  getSubscriptionStatus,
  upgradeSubscriptionPlan,
} from "@/utils/vendorApiClient";
import { SubscriptionPlan, VendorSubscriptionStatus } from "@/utils/Types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VENDOR_BILLING_TEXT } from "@/constants/vendorText";

const formatCapabilityKey = (key: string) => {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const formatPrice = (price: string | null) => {
  if (price === null) return VENDOR_BILLING_TEXT.FORMATTING.CUSTOM;
  const num = parseFloat(price);
  if (isNaN(num) || num === 0) return VENDOR_BILLING_TEXT.FORMATTING.FREE;
  return `₹${num}`;
};

export default function BillingAndBankingPage() {
  const companyId = getClientCompanyId();
  const token = authToken();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [status, setStatus] = useState<VendorSubscriptionStatus | null>(null);

  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<SubscriptionPlan | null>(
    null,
  );

  const fetchData = async () => {
    if (!token || !companyId) {
      return;
    }
    try {
      setLoading(true);

      const [fetchedPlans, fetchedStatus] = await Promise.all([
        getAvailableSubscriptionPlans(companyId),
        token ? getSubscriptionStatus(token, companyId) : Promise.resolve(null),
      ]);

      if (Array.isArray(fetchedPlans.data)) {
        const sortedPlans = [...fetchedPlans.data].sort(
          (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
        );
        setPlans(sortedPlans);
      } else {
        setPlans([]);
      }

      if (fetchedStatus?.data) {
        setStatus(fetchedStatus.data);
      }
    } catch (error) {
      toast.error(VENDOR_BILLING_TEXT.ALERTS.FETCH_ERROR);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (!token || !companyId) {
      return;
    }

    setUpgradeLoading(plan.id);
    try {
      const res = await upgradeSubscriptionPlan(token, plan.id, companyId);
      if (res && res.success === true) {
        toast.success(
          VENDOR_BILLING_TEXT.ALERTS.UPGRADE_SUCCESS.replace(
            "{plan}",
            plan.display_name,
          ),
        );
        await fetchData(); // Refresh status
      } else {
        toast.error(res?.message || VENDOR_BILLING_TEXT.ALERTS.UPGRADE_ERROR);
      }
    } catch (error) {
      toast.error(VENDOR_BILLING_TEXT.ALERTS.UNEXPECTED_ERROR);
    } finally {
      setUpgradeLoading(null);
      setConfirmDialog(null);
    }
  };

  if (loading) {
    return (
      <main className="w-full max-w-6xl mx-auto mt-6 space-y-8">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </main>
    );
  }

  return (
    <main className="w-full   mx-auto mt-6 space-y-12">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {VENDOR_BILLING_TEXT.PAGE_TITLE}
        </h1>
        <p className="text-muted-foreground">
          {VENDOR_BILLING_TEXT.PAGE_SUBTITLE}
        </p>
      </div>

      {/* Current Subscription Banner/Card */}
      {status ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Card
            className={`overflow-hidden border-l-4 ${
              status.is_trial
                ? "border-l-blue-500"
                : status.is_expired
                  ? "border-l-destructive"
                  : "border-l-primary"
            }`}
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <ShieldCheck size={120} />
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {status.plan_display_name} Plan
                    {status.is_trial && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        {VENDOR_BILLING_TEXT.CURRENT_PLAN.TRIAL_BADGE}
                      </Badge>
                    )}
                    {status.is_expired && (
                      <Badge variant="destructive">
                        {VENDOR_BILLING_TEXT.CURRENT_PLAN.EXPIRED_BADGE}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1 text-base">
                    {VENDOR_BILLING_TEXT.CURRENT_PLAN.STATUS_PREFIX}
                    <span className="font-medium text-foreground">
                      {status.status && typeof status.status === "string"
                        ? status.status.charAt(0).toUpperCase() +
                          status.status.slice(1)
                        : String(status.status || "")}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {status.show_banner && (
                <div
                  className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                    status.banner_urgency === "danger"
                      ? "bg-destructive/10 text-destructive"
                      : status.banner_urgency === "warning"
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                        : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  }`}
                >
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium">
                      {status.is_trial
                        ? VENDOR_BILLING_TEXT.CURRENT_PLAN.TRIAL_ENDING
                        : VENDOR_BILLING_TEXT.CURRENT_PLAN.ACTION_REQUIRED}
                    </h4>
                    <p className="text-sm opacity-90">
                      {status.days_remaining !== null &&
                      status.days_remaining !== undefined
                        ? VENDOR_BILLING_TEXT.CURRENT_PLAN.DAYS_REMAINING.replace(
                            "{days}",
                            status.days_remaining.toString(),
                          ).replace(
                            "{type}",
                            status.is_trial ? "trial" : "plan",
                          )
                        : VENDOR_BILLING_TEXT.CURRENT_PLAN.NEEDS_ATTENTION}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card className="bg-muted/50">
          <CardContent className="p-6 text-center text-muted-foreground">
            {VENDOR_BILLING_TEXT.CURRENT_PLAN.NO_SUBSCRIPTION}
          </CardContent>
        </Card>
      )}

      {/* Available Plans Section */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">
            {VENDOR_BILLING_TEXT.AVAILABLE_PLANS.SECTION_TITLE}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {VENDOR_BILLING_TEXT.AVAILABLE_PLANS.SECTION_SUBTITLE}
          </p>
        </div>

        {plans.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8 pt-4">
            {plans.map((plan, index) => {
              const isCurrent = status?.plan_name === plan.plan_name;
              const isPopular = plan.plan_name.toLowerCase().includes("pro");

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card
                    className={`h-full flex flex-col relative transition-all duration-300 hover:shadow-lg ${
                      isCurrent
                        ? "border-primary shadow-md ring-1 ring-primary/20"
                        : isPopular
                          ? "border-border shadow-md"
                          : ""
                    }`}
                  >
                    {isPopular && !isCurrent && (
                      <div className="absolute -top-3 inset-x-0 flex justify-center">
                        <Badge className="bg-gradient-to-r from-violet-500 to-primary text-white border-none shadow-sm">
                          {VENDOR_BILLING_TEXT.AVAILABLE_PLANS.MOST_POPULAR}
                        </Badge>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-3 inset-x-0 flex justify-center">
                        <Badge className="bg-primary text-primary-foreground border-none">
                          {VENDOR_BILLING_TEXT.AVAILABLE_PLANS.CURRENT_PLAN}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl">
                        {plan.display_name}
                      </CardTitle>
                      <CardDescription className="h-10 mt-2">
                        {plan.description ||
                          VENDOR_BILLING_TEXT.AVAILABLE_PLANS.DEFAULT_DESC}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col gap-6">
                      <div className="text-center">
                        <span className="text-4xl font-bold">
                          {formatPrice(plan.price_monthly)}
                        </span>
                        {plan.price_monthly !== null &&
                          parseFloat(plan.price_monthly) > 0 && (
                            <span className="text-muted-foreground">
                              {VENDOR_BILLING_TEXT.AVAILABLE_PLANS.PER_MONTH}
                            </span>
                          )}
                      </div>

                      <div className="space-y-3 flex-1">
                        {Object.entries(plan.capabilities || {})
                          .filter(([_, value]) => value !== false)
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="flex items-start gap-3 text-sm"
                            >
                              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                              <span className="text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  {typeof value === "boolean"
                                    ? value
                                      ? formatCapabilityKey(key)
                                      : ""
                                    : `${value} `}
                                </span>
                                {typeof value !== "boolean" &&
                                  formatCapabilityKey(key)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-6">
                      <Button
                        variant={
                          isCurrent
                            ? "outline"
                            : isPopular
                              ? "default"
                              : "secondary"
                        }
                        className="w-full font-medium"
                        disabled={isCurrent || upgradeLoading === plan.id}
                        onClick={() => setConfirmDialog(plan)}
                      >
                        {upgradeLoading === plan.id ? (
                          VENDOR_BILLING_TEXT.AVAILABLE_PLANS.UPGRADING
                        ) : isCurrent ? (
                          VENDOR_BILLING_TEXT.AVAILABLE_PLANS.CURRENT_PLAN
                        ) : (
                          <>
                            {VENDOR_BILLING_TEXT.AVAILABLE_PLANS.CHOOSE_PLAN}{" "}
                            {plan.display_name}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border rounded-lg bg-muted/30 border-dashed">
            <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">
              {VENDOR_BILLING_TEXT.EMPTY_STATE.TITLE}
            </h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              {VENDOR_BILLING_TEXT.EMPTY_STATE.MESSAGE}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <Dialog
            open={!!confirmDialog}
            onOpenChange={(open) => !open && setConfirmDialog(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{VENDOR_BILLING_TEXT.MODAL.TITLE}</DialogTitle>
                <DialogDescription>
                  {VENDOR_BILLING_TEXT.MODAL.DESC_PREFIX}{" "}
                  <span className="font-semibold text-foreground">
                    {confirmDialog.display_name}
                  </span>{" "}
                  {VENDOR_BILLING_TEXT.MODAL.DESC_SUFFIX}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                  <span className="font-medium">
                    {VENDOR_BILLING_TEXT.MODAL.NEW_PRICE}
                  </span>
                  <span className="text-lg font-bold">
                    {formatPrice(confirmDialog.price_monthly)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {VENDOR_BILLING_TEXT.MODAL.WARNING}
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDialog(null)}
                  disabled={upgradeLoading === confirmDialog.id}
                >
                  {VENDOR_BILLING_TEXT.MODAL.CANCEL}
                </Button>
                <Button
                  onClick={() => handleUpgrade(confirmDialog)}
                  disabled={upgradeLoading === confirmDialog.id}
                >
                  {upgradeLoading === confirmDialog.id
                    ? VENDOR_BILLING_TEXT.MODAL.PROCESSING
                    : VENDOR_BILLING_TEXT.MODAL.CONFIRM}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </main>
  );
}
