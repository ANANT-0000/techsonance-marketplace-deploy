import { STEPS } from "@/constants";
import { CheckCircle2 } from "lucide-react";

export function FormStepBar({ current }: { current: number }) {
    return (
        <div className="flex items-center gap-0 mb-8">
            {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done   = i < current;
                const active = i === current;
                return (
                    <div key={step.id} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className={[
                                "w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all duration-200",
                                done   ? "bg-emerald-500 border-emerald-500 text-white"
                                : active ? "bg-slate-800 border-slate-800 text-white"
                                :          "bg-white border-gray-200 text-gray-400",
                            ].join(" ")}>
                                {done ? <CheckCircle2 size={16} /> : <Icon size={15} />}
                            </div>
                            <span className={[
                                "text-theme-tiny font-semibold whitespace-nowrap",
                                active ? "text-slate-800" : done ? "text-emerald-600" : "text-gray-400",
                            ].join(" ")}>
                                {step.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={[
                                "flex-1 h-px mx-2 mt-[-16px] transition-all duration-400",
                                i < current ? "bg-emerald-400" : "bg-gray-200",
                            ].join(" ")} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
