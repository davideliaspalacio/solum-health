"use client";

import { Check, Upload, FileText, ShieldCheck } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { label: "Upload Documents", icon: Upload },
  { label: "Review & Edit", icon: FileText },
  { label: "Approved", icon: ShieldCheck },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 py-6">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        const Icon = step.icon;

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`
                  relative flex h-11 w-11 items-center justify-center rounded-full
                  transition-all duration-500 ease-out
                  ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                      : isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-muted text-muted-foreground"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" strokeWidth={2.5} />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-soft" />
                )}
              </div>
              <span
                className={`
                  text-xs font-semibold tracking-wide whitespace-nowrap
                  transition-colors duration-300
                  ${
                    isActive
                      ? "text-primary"
                      : isCompleted
                        ? "text-emerald-600"
                        : "text-muted-foreground"
                  }
                `}
              >
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={`
                  mx-4 mt-[-1.5rem] h-[2px] w-24
                  transition-colors duration-500
                  ${stepNum < currentStep ? "bg-emerald-400" : "bg-border"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
