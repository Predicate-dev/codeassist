"use client";

import { Activity, Brain, Clock, Database, GitBranch, Route, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { PracticeConsoleProblem } from "@/lib/types";
import { compactValue } from "@/lib/utils";

interface AlgorithmVisualizerProps {
  problem: PracticeConsoleProblem;
}

export function AlgorithmVisualizer({ problem }: AlgorithmVisualizerProps) {
  const visualization = problem.visualization;

  if (!visualization) {
    return null;
  }

  return (
    <section id="logic-visualizer" className="overflow-hidden rounded-lg border border-border bg-card/80 shadow-glow">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-secondary/40 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-primary/30 bg-primary/10">
            <Route className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold">Algorithm Logic Visualizer</h2>
              <Badge variant="secondary">{visualization.pattern}</Badge>
            </div>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-muted-foreground">
              {visualization.summary}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{visualization.complexity.time}</Badge>
          <Badge variant="outline">{visualization.complexity.space}</Badge>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Flow</h3>
            </div>
            <div className="grid gap-2">
              {visualization.flow.map((step, index) => (
                <motion.div
                  key={`${step.title}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="grid grid-cols-[2rem_1fr] gap-3 rounded-lg border border-border bg-secondary/20 p-3"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-md border border-primary/25 bg-primary/10 font-mono text-xs font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-black/20 p-3">
            <div className="mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Answer Shape</h3>
            </div>
            <pre className="overflow-x-auto rounded-md bg-black/25 p-3 text-xs leading-6 text-slate-200">
              {visualization.answerPseudocode.join("\n")}
            </pre>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">State Model</h3>
            </div>
            <div className="grid gap-2">
              {visualization.state.map((state) => (
                <div key={state.name} className="rounded-lg border border-border bg-black/20 p-3">
                  <p className="font-mono text-xs font-semibold text-teal-100">{state.name}</p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{state.purpose}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Sample Dry Run</h3>
            </div>
            <div className="grid gap-2">
              {visualization.dryRun.map((entry) => (
                <div key={entry.label} className="rounded-lg border border-border bg-black/20 p-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {entry.label}
                  </p>
                  <code className="block overflow-x-auto whitespace-nowrap font-mono text-xs text-slate-200">
                    {compactValue(entry.value)}
                  </code>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <Clock className="h-4 w-4" />
                <p className="text-sm font-semibold">Time</p>
              </div>
              <p className="font-mono text-sm text-foreground">{visualization.complexity.time}</p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-semibold">Space</p>
              </div>
              <p className="font-mono text-sm text-foreground">{visualization.complexity.space}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
