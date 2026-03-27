"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Step = "upload" | "strategy" | "brief";

const STEPS: Step[] = ["upload", "strategy", "brief"];

const STEP_META: Record<Step, { number: number; label: string; description: string }> = {
  upload: {
    number: 1,
    label: "Brand Intel",
    description: "Drop your URLs and docs \u2014 I'll research you before we talk",
  },
  strategy: {
    number: 2,
    label: "Strategy Session",
    description: "Your fractional CMO, already informed",
  },
  brief: {
    number: 3,
    label: "Your Playbook",
    description: "Turn strategy into action — workflows, moves, and first steps",
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
