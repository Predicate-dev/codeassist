"use client";

import { Activity, Brain, Brackets, Box, Hash, TerminalSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { TraceStep } from "@/lib/types";
import { cn, compactValue } from "@/lib/utils";

interface SidebarTrackerProps {
  currentStep: TraceStep;
}

function valueKind(value: unknown) {
  if (Array.isArray(value)) {
    return Array.isArray(value[0]) ? "matrix" : "array";
  }
  if (value !== null && typeof value === "object") return "object";
  return typeof value;
}

function ValueIcon({ value }: { value: unknown }) {
  const kind = valueKind(value);
  if (kind === "array" || kind === "matrix") return <Brackets className="h-3.5 w-3.5" />;
  if (kind === "object") return <Box className="h-3.5 w-3.5" />;
  return <Hash className="h-3.5 w-3.5" />;
}

function stateTone(state?: "read" | "write" | "active") {
  if (state === "write") return "border-primary/50 bg-primary/10";
  if (state === "read") return "border-sky-400/35 bg-sky-400/10";
  if (state === "active") return "border-amber-300/45 bg-amber-300/10";
  return "border-border bg-secondary/25";
}

export function SidebarTracker({ currentStep }: SidebarTrackerProps) {
  const entries = Object.entries(currentStep.variables);

  return (
    <aside className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-border bg-card/80 shadow-glow xl:h-[calc(100vh-22rem)] xl:min-h-[560px]">
      <div className="border-b border-border bg-secondary/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Debugger</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Live scope and line reasoning</p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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
            const kind = valueKind(value);
            return (
              <motion.div
                key={key}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "rounded-lg border px-3 py-2.5 transition-colors duration-300",
                  stateTone(state)
                )}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-border bg-black/20 text-muted-foreground">
                      <ValueIcon value={value} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-semibold text-teal-100">{key}</p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{kind}</p>
                    </div>
                  </div>
                  {state ? (
                    <Badge
                      variant={state === "write" ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {state}
                    </Badge>
                  ) : null}
                </div>
                <div className="overflow-x-auto rounded-md border border-border/60 bg-black/20 px-2.5 py-2">
                  <code className="block whitespace-nowrap font-mono text-xs leading-5 text-slate-200">
                    {compactValue(value)}
                  </code>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg border border-border bg-black/20 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <TerminalSquare className="h-3.5 w-3.5" />
            stdout
          </div>
          <pre className="min-h-12 whitespace-pre-wrap rounded-md bg-black/20 p-2 text-xs text-slate-300">{currentStep.stdout.length ? currentStep.stdout.join("\n") : "No output yet"}</pre>
        </div>
      </div>
    </aside>
  );
}
