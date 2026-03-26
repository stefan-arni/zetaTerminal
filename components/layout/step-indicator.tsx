"use client";

import { cn } from "@/lib/utils";
import { useStepper, type Step } from "@/context/stepper-context";
import { Check } from "lucide-react";

export function StepIndicator() {
  const { steps, meta, currentStep, currentIndex, goTo } = useStepper();

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const m = meta[step];
        const isActive = step === currentStep;
        const isCompleted = i < currentIndex;
        const isClickable = i <= currentIndex;

        return (
          <div key={step} className="flex items-center">
            {i > 0 && (
              <div
                className={cn(
                  "mx-2 h-px w-8 transition-colors",
                  i <= currentIndex ? "bg-brand/40" : "bg-white/[0.06]"
                )}
              />
            )}
            <button
              onClick={() => isClickable && goTo(step as Step)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-all",
                isActive && "bg-brand/10 text-brand",
                isCompleted && "cursor-pointer text-foreground/70 hover:text-foreground",
                !isActive && !isCompleted && "cursor-default text-muted-foreground/40"
              )}
            >
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all",
                  isActive && "bg-brand text-white",
                  isCompleted && "bg-brand/20 text-brand",
                  !isActive && !isCompleted && "bg-white/[0.05] text-muted-foreground/40"
                )}
              >
                {isCompleted ? <Check className="size-3" /> : m.number}
              </div>
              <span className="hidden font-medium sm:inline">{m.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
