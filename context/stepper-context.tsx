"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Step = "upload" | "strategy" | "schedule" | "review";

const STEPS: Step[] = ["upload", "strategy", "schedule", "review"];

const STEP_META: Record<Step, { number: number; label: string; description: string }> = {
  upload: {
    number: 1,
    label: "Brand Intel",
    description: "Upload docs, plans, and creative so Zeta knows your business",
  },
  strategy: {
    number: 2,
    label: "Strategy Session",
    description: "Brief your AI strategist and design your growth playbook",
  },
  schedule: {
    number: 3,
    label: "Schedule",
    description: "Configure when each automation runs",
  },
  review: {
    number: 4,
    label: "Mission Control",
    description: "Review your campaign pipeline and go live",
  },
};

interface StepperContextValue {
  currentStep: Step;
  steps: Step[];
  meta: typeof STEP_META;
  currentIndex: number;
  goTo: (step: Step) => void;
  next: () => void;
  back: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
}

const StepperContext = createContext<StepperContextValue | null>(null);

export function StepperProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<Step>("upload");

  const currentIndex = STEPS.indexOf(currentStep);

  const goTo = useCallback((step: Step) => {
    setCurrentStep(step);
  }, []);

  const next = useCallback(() => {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1]);
    }
  }, [currentStep]);

  const back = useCallback(() => {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1]);
    }
  }, [currentStep]);

  return (
    <StepperContext.Provider
      value={{
        currentStep,
        steps: STEPS,
        meta: STEP_META,
        currentIndex,
        goTo,
        next,
        back,
        canGoNext: currentIndex < STEPS.length - 1,
        canGoBack: currentIndex > 0,
      }}
    >
      {children}
    </StepperContext.Provider>
  );
}

export function useStepper() {
  const ctx = useContext(StepperContext);
  if (!ctx) throw new Error("useStepper must be used within StepperProvider");
  return ctx;
}
