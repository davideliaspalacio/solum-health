"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload,
  X,
  FileText,
  Loader2,
  Sparkles,
  ScanSearch,
  BrainCircuit,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface UploadZoneProps {
  onExtracted: (formId: string) => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
}

const MAX_FILES = 6;
const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

export function UploadZone({ onExtracted }: UploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedIds, setUploadedIds] = useState<string[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (incoming: File[]): File[] => {
      const valid: File[] = [];
      const remaining = MAX_FILES - files.length;

      for (const file of incoming.slice(0, remaining)) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError(`${file.name}: unsupported file type`);
          continue;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`${file.name}: exceeds ${MAX_SIZE_MB}MB limit`);
          continue;
        }
        valid.push(file);
      }

      if (incoming.length > remaining) {
        setError(`Maximum ${MAX_FILES} files allowed`);
      }

      return valid;
    },
    [files.length],
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      setError(null);
      const valid = validateFiles(newFiles);
      const uploaded = valid.map((file) => ({
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      }));
      setFiles((prev) => [...prev, ...uploaded]);
    },
    [validateFiles],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const removed = prev[index];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
    setUploadedIds([]);
    setThumbnails([]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    [addFiles],
  );

  const handleUploadAndExtract = async () => {
    if (files.length === 0) return;

    try {
      setError(null);
      setIsUploading(true);

      const rawFiles = files.map((f) => f.file);
      const uploadRes = await api.uploadDocuments(rawFiles);
      setUploadedIds(uploadRes.document_ids);
      setThumbnails(uploadRes.thumbnails);

      setIsUploading(false);
      setIsExtracting(true);

      const extractRes = await api.extractDocuments(uploadRes.document_ids);
      onExtracted(extractRes.form_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
      setIsExtracting(false);
    }
  };

  const isProcessing = isUploading || isExtracting;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up">
      <div className="mb-6 text-center">
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Upload Medical Documents
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload up to {MAX_FILES} files (PDF, PNG, JPG) — max {MAX_SIZE_MB}MB
          each
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-12
          transition-all duration-300 ease-out
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : files.length > 0
                ? "border-border bg-card hover:border-primary/40"
                : "border-border bg-card hover:border-primary/40 hover:bg-primary/[0.02]"
          }
          ${isProcessing ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(Array.from(e.target.files));
            e.target.value = "";
          }}
        />

        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className={`
              flex h-16 w-16 items-center justify-center rounded-2xl
              transition-colors duration-300
              ${isDragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
            `}
          >
            <Upload className="h-7 w-7" strokeWidth={1.5} />
          </div>

          <div>
            <p className="font-semibold text-foreground">
              {isDragging
                ? "Drop files here"
                : "Drag & drop files here"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or{" "}
              <span className="font-medium text-primary underline underline-offset-2">
                browse files
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-5 space-y-2">
          {files.map((uploadedFile, i) => (
            <div
              key={i}
              className="animate-fade-in-up flex items-center gap-3 rounded-lg border bg-card px-4 py-3"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {uploadedFile.preview ? (
                <img
                  src={uploadedFile.preview}
                  alt=""
                  className="h-10 w-10 rounded-md object-cover border"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-50 text-red-500">
                  <FileText className="h-5 w-5" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(uploadedFile.file.size)}
                </p>
              </div>

              {thumbnails[i] && (
                <img
                  src={thumbnails[i]}
                  alt=""
                  className="h-10 w-10 rounded border object-cover"
                />
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                disabled={isProcessing}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-fade-in">
          {error}
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="mt-6 flex items-center justify-between animate-fade-in-up stagger-3">
          <p className="text-sm text-muted-foreground">
            {files.length} file{files.length !== 1 ? "s" : ""} selected
          </p>

          <Button
            onClick={handleUploadAndExtract}
            disabled={isProcessing}
            size="lg"
            className="gap-2 min-w-[200px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : isExtracting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Extracting data...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Extract Data
              </>
            )}
          </Button>
        </div>
      )}

      {/* Extraction skeleton — form being built */}
      {isExtracting && <ExtractionSkeleton />}
    </div>
  );
}

/* ─── Skeleton sections that mimic the real form ─── */

const SKELETON_SECTIONS = [
  { title: "Header", fields: 4 },
  { title: "Section A — Member Information", fields: 7 },
  { title: "Section B — Provider Information", fields: 7 },
  { title: "Section C — Referring Provider", fields: 3 },
  { title: "Section D — Service Information", fields: 9 },
  { title: "Section E — Clinical Information", fields: 3, hasTable: true },
  { title: "Section F — Clinical Justification", fields: 2, tall: true },
  { title: "Section G — Attestation", fields: 4 },
];

type ConfLevel = "high" | "medium" | "low" | "missing";

const CONFIDENCE_STYLES: Record<
  ConfLevel,
  { border: string; bg: string; label: string; value: string }
> = {
  high: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-50/60",
    label: "bg-emerald-200/60",
    value: "bg-emerald-100/50",
  },
  medium: {
    border: "border-l-amber-400",
    bg: "bg-amber-50/60",
    label: "bg-amber-200/60",
    value: "bg-amber-100/50",
  },
  low: {
    border: "border-l-red-500",
    bg: "bg-red-50/60",
    label: "bg-red-200/60",
    value: "bg-red-100/50",
  },
  missing: {
    border: "border-l-slate-300",
    bg: "bg-slate-50/60",
    label: "bg-slate-200/60",
    value: "bg-slate-100/50",
  },
};

const PHASE_MESSAGES = [
  { icon: ScanSearch, text: "Reading documents..." },
  { icon: BrainCircuit, text: "Extracting structured data..." },
  { icon: FileCheck2, text: "Filling out the form..." },
];

/** Generate a deterministic confidence level per field index */
function getFieldConfidence(index: number): ConfLevel {
  // Realistic distribution: ~45% high, ~25% medium, ~15% low, ~15% missing
  const pattern: ConfLevel[] = [
    "high", "high", "medium", "high", "low",
    "high", "missing", "high", "medium", "high",
    "high", "medium", "low", "high", "missing",
    "high", "high", "medium", "high", "high",
    "medium", "low", "high", "missing", "high",
    "high", "medium", "high", "high", "low",
    "missing", "high", "medium", "high", "high",
    "high", "low", "high", "medium", "high",
  ];
  return pattern[index % pattern.length];
}

function ExtractionSkeleton() {
  const [phase, setPhase] = useState(0);
  const [filledCount, setFilledCount] = useState(0);

  const totalFields = SKELETON_SECTIONS.reduce((s, sec) => s + sec.fields, 0);

  // Tally filled confidence counts
  const filledCounts = { high: 0, medium: 0, low: 0, missing: 0 };
  for (let i = 0; i < filledCount; i++) {
    filledCounts[getFieldConfidence(i)]++;
  }

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2500);
    const t2 = setTimeout(() => setPhase(2), 6000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (phase < 2) return;
    const interval = setInterval(() => {
      setFilledCount((c) => {
        if (c >= totalFields) {
          clearInterval(interval);
          return c;
        }
        return c + 1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [phase, totalFields]);

  const CurrentIcon = PHASE_MESSAGES[phase].icon;

  return (
    <div className="mt-6 space-y-4 animate-fade-in">
      {/* Status banner */}
      <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
          <CurrentIcon
            className="h-6 w-6 text-primary animate-pulse-soft"
            key={phase}
          />
          <span
            className="absolute inset-0 rounded-full animate-spin"
            style={{ animationDuration: "3s" }}
          >
            <span className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary/60" />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{PHASE_MESSAGES[phase].text}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {phase === 0 && "Scanning pages and identifying document types..."}
            {phase === 1 && "AI is analyzing content and matching fields..."}
            {phase === 2 &&
              `Filling fields... ${filledCount} / ${totalFields}`}
          </p>
        </div>
        <Sparkles className="h-5 w-5 text-primary/40 animate-pulse-soft shrink-0" />
      </div>

      {/* Live confidence tally — appears during fill phase */}
      {phase >= 2 && filledCount > 0 && (
        <div className="flex items-center gap-4 px-1 animate-fade-in">
          {(["high", "medium", "low", "missing"] as ConfLevel[]).map(
            (level) => {
              const count = filledCounts[level];
              if (count === 0) return null;
              const dotColor: Record<ConfLevel, string> = {
                high: "bg-emerald-500",
                medium: "bg-amber-400",
                low: "bg-red-500",
                missing: "bg-slate-400",
              };
              const textColor: Record<ConfLevel, string> = {
                high: "text-emerald-700",
                medium: "text-amber-700",
                low: "text-red-700",
                missing: "text-slate-600",
              };
              return (
                <div
                  key={level}
                  className="flex items-center gap-1.5 animate-fade-in"
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${dotColor[level]}`}
                  />
                  <span
                    className={`text-xs font-semibold capitalize ${textColor[level]}`}
                  >
                    {level}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {count}
                  </span>
                </div>
              );
            },
          )}
        </div>
      )}

      {/* Skeleton form sections */}
      <div className="relative space-y-3">
        {phase < 2 && (
          <div className="scan-line z-10 pointer-events-none" />
        )}

        {SKELETON_SECTIONS.map((sec, si) => {
          const fieldsBefore = SKELETON_SECTIONS.slice(0, si).reduce(
            (s, prev) => s + prev.fields,
            0,
          );

          return (
            <div
              key={sec.title}
              className="rounded-xl border bg-card overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${si * 80}ms` }}
            >
              <div className="border-b bg-muted/30 px-5 py-2.5">
                <div className="h-4 w-56 skeleton-shimmer rounded" />
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: sec.fields }).map((_, fi) => {
                  const globalIdx = fieldsBefore + fi;
                  const isFilled = globalIdx < filledCount;
                  const conf = getFieldConfidence(globalIdx);
                  const styles = CONFIDENCE_STYLES[conf];

                  return (
                    <div
                      key={fi}
                      className={`rounded-lg border-l-[3px] px-3.5 py-2.5 transition-all duration-500 ${
                        sec.tall ? "md:col-span-2" : ""
                      } ${
                        isFilled
                          ? `${styles.border} ${styles.bg}`
                          : "border-l-muted bg-card"
                      }`}
                    >
                      <div
                        className={`h-2.5 rounded mb-2 transition-all duration-500 ${
                          isFilled
                            ? `${styles.label} w-20`
                            : "skeleton-shimmer w-24"
                        }`}
                      />
                      <div
                        className={`rounded transition-all duration-500 ${
                          sec.tall ? "h-12" : "h-5"
                        } ${
                          isFilled
                            ? `${styles.value} w-full`
                            : `skeleton-shimmer ${fi % 3 === 0 ? "w-3/4" : fi % 3 === 1 ? "w-full" : "w-1/2"}`
                        }`}
                      />
                      {/* Warning icon for low/missing */}
                      {isFilled && (conf === "low" || conf === "missing") && (
                        <div className="flex items-center gap-1 mt-1.5 animate-fade-in">
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${
                              conf === "low"
                                ? "bg-red-400 animate-pulse-soft"
                                : "bg-slate-400"
                            }`}
                          />
                          <span
                            className={`text-[10px] font-medium ${
                              conf === "low"
                                ? "text-red-500"
                                : "text-slate-400"
                            }`}
                          >
                            {conf === "low"
                              ? "Low confidence"
                              : "Not found"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {sec.hasTable && (
                <div className="px-5 pb-5 border-t pt-4">
                  <div className="h-3 w-32 skeleton-shimmer rounded mb-3" />
                  <div className="space-y-2">
                    {[0, 1].map((r) => (
                      <div key={r} className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map((c) => (
                          <div
                            key={c}
                            className="h-8 skeleton-shimmer rounded"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
