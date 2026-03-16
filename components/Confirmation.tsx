"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  FileCheck,
  ArrowRight,
  BarChart3,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import Link from "next/link";

interface ConfirmationProps {
  correctionsCount: number;
  formId: string;
  onNewForm: () => void;
}

export function Confirmation({
  correctionsCount,
  formId,
  onNewForm,
}: ConfirmationProps) {
  const pdfUrl = api.getFormPdfUrl(formId);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    let revoke: string | null = null;

    fetch(pdfUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load PDF");
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        revoke = url;
        setBlobUrl(url);
      })
      .catch(() => setPdfError(true));

    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [pdfUrl]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `solum-health-form-${formId}.pdf`;
    a.click();
  };

  return (
    <div className="animate-fade-in">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 shadow-lg shadow-emerald-100 animate-scale-in">
          <CheckCircle2
            className="h-9 w-9 text-emerald-500"
            strokeWidth={1.5}
          />
        </div>

        <h1
          className="mb-2 text-2xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Form Approved
        </h1>

        <p className="text-sm text-muted-foreground">
          The Request for Approval of Services has been successfully approved.
        </p>

        {correctionsCount > 0 && (
          <div className="animate-fade-in-up stagger-2 mt-4 mx-auto inline-flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            <FileCheck className="h-4 w-4 shrink-0" />
            <span>
              <strong>{correctionsCount}</strong> field
              {correctionsCount === 1 ? " was" : "s were"} corrected
            </span>
          </div>
        )}
      </div>

      {/* PDF preview */}
      <div className="animate-fade-in-up stagger-3 rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-3">
          <span className="text-sm font-semibold">Generated PDF</span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
        <div className="bg-muted/20">
          {blobUrl ? (
            <iframe
              src={blobUrl + "#toolbar=1&navpanes=0"}
              title="Approved form PDF"
              className="w-full border-0"
              style={{ height: "80vh" }}
            />
          ) : pdfError ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <p className="text-sm">Could not load PDF preview.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Download instead
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="animate-fade-in-up stagger-4 mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          onClick={onNewForm}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          Process New Documents
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Link
          href="/analytics"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          <BarChart3 className="h-4 w-4" />
          View Analytics
        </Link>
      </div>
    </div>
  );
}
