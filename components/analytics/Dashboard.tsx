"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Zap,
  FileText,
  Loader2,
  ChevronDown,
  Clock,
  Hash,
  Cpu,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import type { AccuracyAnalytics, AIUsageAnalytics } from "@/types";

type AICall = AIUsageAnalytics["recent_calls"][number];

export function Dashboard() {
  const [accuracy, setAccuracy] = useState<AccuracyAnalytics | null>(null);
  const [usage, setUsage] = useState<AIUsageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [acc, usg] = await Promise.all([
          api.getAccuracyAnalytics(),
          api.getAIUsageAnalytics(),
        ]);
        setAccuracy(acc);
        setUsage(usg);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">{error}</div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Global Accuracy"
          value={`${((accuracy?.global_accuracy ?? 0) * 100).toFixed(1)}%`}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          icon={FileText}
          label="Total Forms"
          value={String(accuracy?.total_forms ?? 0)}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          icon={DollarSign}
          label="Total AI Cost"
          value={`$${(usage?.total_cost_usd ?? 0).toFixed(4)}`}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          icon={Zap}
          label="Avg Duration"
          value={`${((usage?.avg_duration_ms ?? 0) / 1000).toFixed(1)}s`}
          color="text-violet-600"
          bgColor="bg-violet-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Corrections by section */}
        {accuracy && (
          <Card className="animate-fade-in-up stagger-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Corrections by Section
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(accuracy.by_field_section).map(
                  ([section, count]) => {
                    const maxCount = Math.max(
                      ...Object.values(accuracy.by_field_section),
                    );
                    const pct =
                      maxCount > 0 ? (count / maxCount) * 100 : 0;

                    return (
                      <div key={section} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium capitalize">
                            {section.replace(/_/g, " ")}
                          </span>
                          <span className="text-muted-foreground tabular-nums">
                            {count}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Corrections by confidence level */}
        {accuracy && (
          <Card className="animate-fade-in-up stagger-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Corrections by Confidence Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(accuracy.by_confidence).map(
                  ([level, count]) => {
                    const colorMap: Record<string, string> = {
                      high: "bg-emerald-500",
                      medium: "bg-amber-400",
                      low: "bg-red-500",
                      missing: "bg-slate-400",
                    };
                    const maxCount = Math.max(
                      ...Object.values(accuracy.by_confidence),
                    );
                    const pct =
                      maxCount > 0 ? (count / maxCount) * 100 : 0;

                    return (
                      <div key={level} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium capitalize">
                            {level}
                          </span>
                          <span className="text-muted-foreground tabular-nums">
                            {count}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${colorMap[level] ?? "bg-primary"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Usage by model */}
      {usage && (
        <Card className="animate-fade-in-up stagger-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              AI Usage by Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(usage.by_model).map(([model, data]) => (
                <div
                  key={model}
                  className="rounded-lg border bg-muted/30 p-4 space-y-2"
                >
                  <p className="text-sm font-semibold">{model}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Calls</p>
                      <p className="font-semibold text-foreground">
                        {data.count}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tokens</p>
                      <p className="font-semibold text-foreground tabular-nums">
                        {data.tokens.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost</p>
                      <p className="font-semibold text-foreground tabular-nums">
                        ${data.cost.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent AI calls — expandable rows */}
      {usage && usage.recent_calls.length > 0 && (
        <Card className="animate-fade-in-up stagger-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Recent AI Calls
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-8" />
                  <TableHead className="text-xs">Doc Type</TableHead>
                  <TableHead className="text-xs">Tokens</TableHead>
                  <TableHead className="text-xs">Cost</TableHead>
                  <TableHead className="text-xs">Duration</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usage.recent_calls.map((call) => (
                  <AICallRow
                    key={call.id}
                    call={call}
                    isExpanded={expandedCallId === call.id}
                    onToggle={() =>
                      setExpandedCallId(
                        expandedCallId === call.id ? null : call.id,
                      )
                    }
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AICallRow({
  call,
  isExpanded,
  onToggle,
}: {
  call: AICall;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <TableCell className="py-2 px-3 w-8">
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </TableCell>
        <TableCell className="text-sm capitalize">
          {(call.doc_type ?? "unknown").replace(/_/g, " ")}
        </TableCell>
        <TableCell className="text-sm tabular-nums">
          {call.total_tokens.toLocaleString()}
        </TableCell>
        <TableCell className="text-sm tabular-nums">
          ${call.estimated_cost.toFixed(4)}
        </TableCell>
        <TableCell className="text-sm tabular-nums">
          {(call.duration_ms / 1000).toFixed(1)}s
        </TableCell>
        <TableCell>
          <Badge
            variant={call.status === "success" ? "default" : "destructive"}
            className="text-[10px]"
          >
            {call.status}
          </Badge>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell colSpan={6} className="p-0">
            <div className="px-5 py-4 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <DetailItem
                  icon={Hash}
                  label="Call ID"
                  value={call.id}
                  mono
                />
                <DetailItem
                  icon={FileText}
                  label="Document ID"
                  value={call.document_id}
                  mono
                />
                <DetailItem
                  icon={Cpu}
                  label="Document Type"
                  value={(call.doc_type ?? "unknown").replace(/_/g, " ")}
                />
                <DetailItem
                  icon={call.status === "success" ? Zap : AlertCircle}
                  label="Status"
                  value={call.status}
                  valueColor={
                    call.status === "success"
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                />
              </div>

              <Separator className="my-3" />

              <div className="grid grid-cols-3 gap-4">
                <DetailItem
                  icon={Hash}
                  label="Total Tokens"
                  value={call.total_tokens.toLocaleString()}
                />
                <DetailItem
                  icon={DollarSign}
                  label="Estimated Cost"
                  value={`$${call.estimated_cost.toFixed(6)}`}
                />
                <DetailItem
                  icon={Clock}
                  label="Duration"
                  value={`${call.duration_ms.toLocaleString()}ms (${(call.duration_ms / 1000).toFixed(2)}s)`}
                />
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  mono,
  valueColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
  valueColor?: string;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p
        className={`text-sm font-medium truncate ${mono ? "font-mono text-xs" : ""} ${valueColor ?? "text-foreground"}`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${bgColor}`}
        >
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xl font-bold tracking-tight tabular-nums">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
