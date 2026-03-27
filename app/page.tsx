"use client";

import { Zap } from "lucide-react";
import { StepIndicator } from "@/components/layout/step-indicator";
import { useStepper } from "@/context/stepper-context";
import { UploadStep } from "@/components/steps/upload-step";
import { StrategyStep } from "@/components/steps/strategy-step";
import { BriefStep } from "@/components/steps/brief-step";
import { DashboardStep } from "@/components/steps/dashboard-step";

const STEP_COMPONENTS = {
  upload: UploadStep,
  strategy: StrategyStep,
  brief: BriefStep,
  dashboard: DashboardStep,
} as const;

export default function Page() {
  const { currentStep, meta } = useStepper();
  const StepComponent = STEP_COMPONENTS[currentStep];
  const m = meta[currentStep];
  const isDashboard = currentStep === "dashboard";

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <header className="flex h-[56px] shrink-0 items-center justify-between border-b border-white/[0.06] px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-brand">
            <Zap className="size-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-[-0.01em]">
            Zeta
          </span>
          <span className="text-xs text-muted-foreground">
            Your AI Fractional CMO
          </span>
        </div>
        {!isDashboard && <StepIndicator />}
        <div className="w-[90px]" />
      </header>

      {/* Step header — hidden on dashboard (it has its own layout) */}
      {!isDashboard && (
        <div className="shrink-0 border-b border-white/[0.06] px-8 py-5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {m.label}
          </h1>
          {currentStep === "upload" && (
            <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
          )}
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 overflow-hidden">
        <StepComponent />
      </div>
    </div>
  );
}
