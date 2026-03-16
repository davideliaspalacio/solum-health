"use client";

import { Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Dashboard } from "@/components/analytics/Dashboard";

export default function AnalyticsPage() {
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
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Forms
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Extraction accuracy, correction patterns, and AI usage metrics.
          </p>
        </div>

        <Dashboard />
      </main>
    </div>
  );
}
