"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, ShieldCheck, Loader2, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { FORM_SECTIONS } from "@/lib/form-config";
import { ConfidenceBar } from "./ConfidenceBar";
import { FormSection } from "./FormSection";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import type { FormResponse, FormDataMap, ConfidenceSummary } from "@/types";

interface FormReviewProps {
  formId: string;
  onApproved: (correctionsCount: number) => void;
}

export function FormReview({ formId, onApproved }: FormReviewProps) {
  const [form, setForm] = useState<FormResponse | null>(null);
  const [formData, setFormData] = useState<FormDataMap>({});
  const [confidenceSummary, setConfidenceSummary] =
    useState<ConfidenceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCorrections, setLastCorrections] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await api.getForm(formId);
        setForm(data);
        setFormData(data.form_data);
        setConfidenceSummary(data.confidence_summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load form");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [formId]);

  const handleFormDataChange = useCallback((updated: FormDataMap) => {
    setFormData(updated);
    setSaveSuccess(false);
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const result = await api.updateForm(formId, formData);
      setForm(result.form);
      setFormData(result.form.form_data);
      setConfidenceSummary(result.form.confidence_summary);
      setLastCorrections(result.corrections_count);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      setError(null);

      // Save first
      const saveResult = await api.updateForm(formId, formData);

      // Then approve
      await api.approveForm(formId);
      onApproved(saveResult.corrections_count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error ?? "Form not found"}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Request for Approval of Services
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the AI-extracted data below. Edit any fields that need
          correction.
        </p>
      </div>

      {/* Confidence summary */}
      {confidenceSummary && <ConfidenceBar summary={confidenceSummary} />}

      {/* Main layout: form + documents */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Form sections */}
        <div className="space-y-4">
          {FORM_SECTIONS.map((sectionConfig, i) => (
            <FormSection
              key={sectionConfig.id}
              config={sectionConfig}
              formData={formData}
              onChange={handleFormDataChange}
              index={i}
            />
          ))}
        </div>

        {/* Document viewer sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <DocumentViewer documents={form.source_documents} />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-fade-in">
          {error}
        </div>
      )}

      {/* Actions bar */}
      <div className="sticky bottom-0 z-10 mt-6 -mx-4 px-4 py-4 border-t bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {saveSuccess && lastCorrections !== null && (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 animate-fade-in">
                <CheckCircle2 className="h-4 w-4" />
                Saved — {lastCorrections} correction
                {lastCorrections !== 1 ? "s" : ""} logged
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.open(api.getFormPdfUrl(formId), "_blank")}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving || isApproving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isSaving || isApproving}
              className="gap-2"
            >
              {isApproving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Approve Form
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
