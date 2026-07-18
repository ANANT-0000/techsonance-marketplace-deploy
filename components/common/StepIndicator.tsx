import { VENDOR_REGISTER_FORM_STEPS } from "@/constants";
import { CheckCircle2 } from "lucide-react";

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 ">
      {VENDOR_REGISTER_FORM_STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div
                className={[
                  "w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 border-2 text-xs",
                  done
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : active
                      ? "bg-platform-primary border-platform-primary text-white shadow-md shadow-platform-focus-ring"
                      : "bg-white border-gray-200 text-gray-400",
                ].join(" ")}
              >
                {done ? <CheckCircle2 size={14} /> : <Icon size={13} />}
              </div>
              <span
                className={[
                  "text-[11px] font-semibold whitespace-nowrap hidden sm:block",
                  active
                    ? "text-platform-primary"
                    : done
                      ? "text-emerald-600"
                      : "text-gray-400",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {i < VENDOR_REGISTER_FORM_STEPS.length - 1 && (
              <div
                className={[
                  "w-8 h-0.5 mx-2 rounded-full transition-all duration-500",
                  i < current ? "bg-emerald-400" : "bg-gray-200",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
