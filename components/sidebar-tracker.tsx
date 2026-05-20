"use client";

import { Activity, Brain, TerminalSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { TraceStep } from "@/lib/types";
import { formatValue, stableStringify } from "@/lib/utils";

interface SidebarTrackerProps {
  currentStep: TraceStep;
}

export function SidebarTracker({ currentStep }: SidebarTrackerProps) {
  const entries = Object.entries(currentStep.variables);

  return (
    <aside className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-border bg-card/80 shadow-glow xl:h-[calc(100vh-2rem)]">
      <div className="border-b border-border bg-secondary/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Debugger</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Live scope and line reasoning</p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary">
            <Brain className="h-3.5 w-3.5" />
            Line {currentStep.lineNumber}
          </div>
          <p className="text-sm leading-6 text-foreground">{currentStep.explanation}</p>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Variables
            </p>
            <Badge variant="outline">{entries.length} active</Badge>
          </div>
          {entries.map(([key, value]) => {
            const state = currentStep.pointerChanges?.[key];
            return (
              <motion.div
                key={key}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-border bg-secondary/30 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-teal-200">{key}</span>
                  {state ? <Badge variant={state === "write" ? "default" : "secondary"}>{state}</Badge> : null}
                </div>
                <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-muted-foreground">
                  {stableStringify(value) === undefined ? formatValue(value) : JSON.stringify(value, null, 2)}
                </pre>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg border border-border bg-black/20 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <TerminalSquare className="h-3.5 w-3.5" />
            stdout
          </div>
          <pre className="min-h-12 whitespace-pre-wrap text-xs text-slate-300">
            {currentStep.stdout.length ? currentStep.stdout.join("\n") : "No output yet"}
          </pre>
        </div>
      </div>
    </aside>
  );
}
