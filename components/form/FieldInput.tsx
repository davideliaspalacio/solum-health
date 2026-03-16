"use client";

import { AlertTriangle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { FieldData } from "@/types";
import {
  getConfidenceBorder,
  getConfidenceLabel,
} from "@/lib/form-utils";
import type { FieldConfig } from "@/lib/form-config";

interface FieldInputProps {
  config: FieldConfig;
  field: FieldData;
  onChange: (value: string) => void;
}

export function FieldInput({ config, field, onChange }: FieldInputProps) {
  const borderClass = getConfidenceBorder(field.confidence);
  const confidenceLabel = getConfidenceLabel(field.confidence);

  const glowClass = `field-glow-${field.confidence}`;

  return (
    <div
      className={`
        group relative rounded-lg border-l-[3px] bg-card px-3.5 py-2.5
        transition-all duration-200 hover:shadow-sm
        ${borderClass} ${glowClass}
      `}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Label
          htmlFor={config.key}
          className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        >
          {config.label}
        </Label>

        {field.needs_review && (
          <Tooltip>
            <TooltipTrigger className="inline-flex">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            </TooltipTrigger>
            <TooltipContent>Needs review</TooltipContent>
          </Tooltip>
        )}

        {field.reason && (
          <Tooltip>
            <TooltipTrigger className="inline-flex">
              <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              {field.reason}
            </TooltipContent>
          </Tooltip>
        )}

        <span
          className={`
            ml-auto text-[10px] font-medium uppercase tracking-widest
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            ${
              field.confidence === "high"
                ? "text-emerald-600"
                : field.confidence === "medium"
                  ? "text-amber-600"
                  : field.confidence === "low"
                    ? "text-red-600"
                    : "text-slate-400"
            }
          `}
        >
          {confidenceLabel}
        </span>
      </div>

      {config.type === "textarea" ? (
        <Textarea
          id={config.key}
          value={field.value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config.placeholder ?? "Not extracted"}
          rows={3}
          className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 resize-none text-sm"
        />
      ) : config.type === "select" && config.options ? (
        <select
          id={config.key}
          value={field.value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-0 bg-transparent p-0 text-sm focus:outline-none focus:ring-0"
        >
          <option value="">— Select —</option>
          {config.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <Input
          id={config.key}
          value={field.value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config.placeholder ?? "Not extracted"}
          className="border-0 bg-transparent p-0 h-auto shadow-none focus-visible:ring-0 text-sm"
        />
      )}
    </div>
  );
}
