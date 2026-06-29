import { EXCEPTION_STATUSES } from "@/constants/customerText";
import { getUIConfig, normalizeStatus } from "@/lib/utils";
import { OrderStatus } from "@/utils/Types";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { motion } from "motion/react";
import { JSX } from "react/jsx-runtime";
/**
 * Renders an animated vertical tracking timeline for an order, dynamically adjusting
 * the flow of steps based on the current order status (standard, exception, or terminal).
 *
 * The component visualizes the journey from "Order Placed" to the current state,
 * supporting complex flows like cancellations, returns, replacements, and delivery exceptions.
 * It features an animated progress bar, conditional iconography, and dynamic status labels
 * derived from a UI configuration map.
 *
 * **Visual States:**
 * - **Standard Progress**: Steps turn primary color as they complete; current step is highlighted.
 * - **Negative/Exception State**: Uses destructive colors (red) for cancelled, failed, or RTO statuses.
 * - **Animations**: Smoothly animates the progress bar height and description opacity on mount.
 * @param {string} props.currentStatus - The raw status string of the order (e.g., "delivered", "rto", "cancelled").
 * @param {string} props.date - The ISO date string representing when the order was placed.
 * @returns {JSX.Element} A timeline visualization component with animated progress indicators.
 */
export function TrackingTimeline({
  currentStatus,
  date,
}: {
  currentStatus: string;
  date: string;
}): JSX.Element {
  const normStatus = normalizeStatus(currentStatus);
  const currentConfig = getUIConfig(normStatus);

  const buildSteps = (): {
    icon: IconName;
    label: string;
    isActive: boolean;
    isCurrent: boolean;
  }[] => {
    // 1. Cancelled Flow
    if (normStatus === "cancelled") {
      return [
        {
          icon: "clock",
          label: "Order Placed",
          isActive: true,
          isCurrent: false,
        },
        {
          icon: "x-circle",
          label: "Cancelled",
          isActive: true,
          isCurrent: true,
        },
      ];
    }

    // 2. Post-Delivery Flows (Return, Replace, Refund)
    if (["returned", "refunded", "replaced"].includes(normStatus)) {
      return [
        {
          icon: "clock",
          label: "Order Placed",
          isActive: true,
          isCurrent: false,
        },
        { icon: "truck", label: "Shipped", isActive: true, isCurrent: false },
        {
          icon: "check-circle",
          label: "Delivered",
          isActive: true,
          isCurrent: false,
        },
        {
          icon: normStatus === "refunded" ? "credit-card" : "rotate-ccw",
          label: currentConfig.label,
          isActive: true,
          isCurrent: true,
        },
      ];
    }

    // 3. Exception Flows (RTO, Failed, Undelivered)
    if (
      ["rto", "failed", "undelivered", "out_for_delivery_exception"].includes(
        normStatus,
      )
    ) {
      return [
        {
          icon: "clock",
          label: "Order Placed",
          isActive: true,
          isCurrent: false,
        },
        { icon: "truck", label: "Shipped", isActive: true, isCurrent: false },
        {
          icon: "alert-triangle",
          label: "Exception",
          isActive: true,
          isCurrent: false,
        },
        {
          icon: "x-circle",
          label: currentConfig.label,
          isActive: true,
          isCurrent: true,
        },
      ];
    }

    // 4. Standard Delivery Flow
    const activeIndex = currentConfig.stepIndex ?? 0;
    const standardSteps: { index: number; icon: IconName; label: string }[] = [
      { index: 0, icon: "clock", label: "Order Placed" },
      { index: 1, icon: "package", label: "Processing" },
      { index: 2, icon: "truck", label: "Shipped" },
      { index: 3, icon: "map", label: "Out for Delivery" },
      { index: 4, icon: "check-circle", label: "Delivered" },
    ];

    return standardSteps.map((step, idx) => {
      let icon = step.icon;
      let label = step.label;

      if (idx === activeIndex) {
        label = currentConfig.label;
      }

      return {
        icon,
        label,
        isActive: activeIndex >= idx,
        isCurrent: activeIndex === idx,
      };
    });
  };

  const steps = buildSteps();
  const activeStepIndex =
    steps.findIndex((s) => s.isCurrent) !== -1
      ? steps.findIndex((s) => s.isCurrent)
      : steps.length - 1;
  const isNegativeState = [
    "cancelled",
    "failed",
    "undelivered",
    "rto",
  ].includes(normStatus);

  return (
    <div className="relative space-y-2 pt-1 text-left px-2">
      <div className="absolute left-[20px] top-4 bottom-6 w-[2px] bg-secondary z-0 rounded-full" />
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${(activeStepIndex / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className={`absolute left-[20px] top-4 w-[2px] z-0 rounded-full ${
          isNegativeState ? "bg-destructive" : "bg-primary"
        }`}
      />

      {steps.map((step, idx) => {
        let iconBg = "bg-secondary text-muted-foreground";
        let iconBorder = "border-secondary";

        if (step.isActive && !step.isCurrent) {
          iconBg = "bg-primary text-primary-foreground";
          iconBorder = "border-primary";
        } else if (step.isCurrent) {
          iconBg =
            isNegativeState ||
            EXCEPTION_STATUSES.includes(normStatus as OrderStatus)
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground";
          iconBorder =
            isNegativeState ||
            EXCEPTION_STATUSES.includes(normStatus as OrderStatus)
              ? "border-destructive shadow-sm scale-110"
              : "border-primary shadow-sm scale-110";
        }

        return (
          <div
            key={idx}
            className={`relative z-10 flex gap-3.5 items-start ${!step.isActive ? "opacity-50" : "opacity-100"}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${iconBg} ${iconBorder}`}
            >
              <DynamicIcon
                name={step.icon as IconName}
                size={18}
                strokeWidth={step.isCurrent ? 2.5 : 2}
              />
            </div>

            <div className="flex flex-col pt-[1px]">
              <span
                className={`md:text-md text-sm tracking-tight transition-all ${step.isCurrent ? "text-foreground" : step.isActive ? "text-foreground/90" : "text-muted-foreground"}`}
              >
                {step.label}
              </span>

              {step.isCurrent && currentConfig.description && (
                <motion.p
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-[11px] mt-0.5 font-medium ${currentConfig.color} leading-tight`}
                >
                  {currentConfig.description}
                </motion.p>
              )}

              {idx === 0 && (
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(date).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
