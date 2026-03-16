"use client";

import { useState } from "react";
import { Activity, BarChart3 } from "lucide-react";
import Link from "next/link";
import { StepIndicator } from "@/components/StepIndicator";
import { UploadZone } from "@/components/upload/UploadZone";
import { FormReview } from "@/components/form/FormReview";
import { Confirmation } from "@/components/Confirmation";

type Step = 1 | 2 | 3;

export default function HomePage() {
  const [step, setStep] = useState<Step>(1);
  const [formId, setFormId] = useState<string | null>(null);
  const [correctionsCount, setCorrectionsCount] = useState(0);

  const handleExtracted = (id: string) => {
    setFormId(id);
    setStep(2);
  };

  const handleApproved = (corrections: number) => {
    setCorrectionsCount(corrections);
    setStep(3);
  };

  const handleNewForm = () => {
    setStep(1);
    setFormId(null);
    setCorrectionsCount(0);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation bar */}
      <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Activity className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <span
                className="text-lg font-bold tracking-tight leading-none"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Solum Health
              </span>
              <span className="block text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
                Document Processing
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/analytics"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
          </nav>
        </div>
      </header>

      {/* Step indicator */}
      <div className="mx-auto max-w-6xl px-6">
        <StepIndicator currentStep={step} />
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 pb-32">
        {step === 1 && <UploadZone onExtracted={handleExtracted} />}

        {step === 2 && formId && (
          <FormReview formId={formId} onApproved={handleApproved} />
        )}

        {step === 3 && formId && (
          <Confirmation
            correctionsCount={correctionsCount}
            formId={formId}
            onNewForm={handleNewForm}
          />
        )}
      </main>
    </div>
  );
}
