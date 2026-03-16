"use client";

import type { ConfidenceSummary } from "@/types";

interface ConfidenceBarProps {
  summary: ConfidenceSummary;
}

export function ConfidenceBar({ summary }: ConfidenceBarProps) {
  const total = summary.high + summary.medium + summary.low + summary.missing;
  if (total === 0) return null;

  const segments = [
    {
      key: "high",
      count: summary.high,
      pct: (summary.high / total) * 100,
      color: "bg-emerald-500",
      label: "High",
      textColor: "text-emerald-700",
      dotColor: "bg-emerald-500",
    },
    {
      key: "medium",
      count: summary.medium,
      pct: (summary.medium / total) * 100,
      color: "bg-amber-400",
      label: "Medium",
      textColor: "text-amber-700",
      dotColor: "bg-amber-400",
    },
    {
      key: "low",
      count: summary.low,
      pct: (summary.low / total) * 100,
      color: "bg-red-500",
      label: "Low",
      textColor: "text-red-700",
      dotColor: "bg-red-500",
    },
    {
      key: "missing",
      count: summary.missing,
      pct: (summary.missing / total) * 100,
      color: "bg-slate-300",
      label: "Missing",
      textColor: "text-slate-600",
      dotColor: "bg-slate-400",
    },
  ];

  return (
    <div className="animate-fade-in-up rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold tracking-tight">
          Extraction Confidence
        </h3>
        <span className="text-xs text-muted-foreground">
          {total} fields total
        </span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {segments.map(
          (seg) =>
            seg.count > 0 && (
              <div
                key={seg.key}
                className={`${seg.color} transition-all duration-700 ease-out first:rounded-l-full last:rounded-r-full`}
                style={{ width: `${seg.pct}%` }}
              />
            ),
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${seg.dotColor}`}
            />
            <span className={`text-xs font-medium ${seg.textColor}`}>
              {seg.label}
            </span>
            <span className="text-xs text-muted-foreground">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
