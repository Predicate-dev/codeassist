import type { AlgorithmicProblem, DrillCheckpoint, TraceStep } from "@/lib/types";
import { formatValue, stableStringify } from "@/lib/utils";

export function clampStep(index: number, traceLength: number) {
  if (traceLength <= 0) return 0;
  return Math.min(Math.max(index, 0), traceLength - 1);
}

export function getCheckpointForStep(
  problem: AlgorithmicProblem,
  stepIndex: number
): DrillCheckpoint | undefined {
  return problem.drillCheckpoints.find((checkpoint) => checkpoint.stepIndex === stepIndex);
}

export function getValueAtTarget(step: TraceStep | undefined, target: string): unknown {
  if (!step) return undefined;
  if (target === "lineNumber") return step.lineNumber;

  const rootMatch = target.match(/^([A-Za-z_$][\w$]*)(.*)$/);
  if (!rootMatch) return undefined;

  let value: unknown = step.variables[rootMatch[1]];
  const rest = rootMatch[2];
  const tokenRegex = /\[([^\]]+)\]|\.([A-Za-z_$][\w$]*)/g;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(rest))) {
    const key = match[1] ?? match[2];
    const normalizedKey = key.replace(/^["']|["']$/g, "");

    if (Array.isArray(value)) {
      value = value[Number(normalizedKey)];
    } else if (value && typeof value === "object") {
      value = (value as Record<string, unknown>)[normalizedKey];
    } else {
      return undefined;
    }
  }

  return value;
}

export function getExpectedAnswer(
  problem: AlgorithmicProblem,
  checkpoint: DrillCheckpoint
): string {
  const nextStep = problem.fullTrace[checkpoint.stepIndex + 1];
  const value =
    checkpoint.promptType === "line"
      ? nextStep?.lineNumber
      : getValueAtTarget(nextStep, checkpoint.target);

  return formatValue(value);
}

export function valuesDiffer(previous: unknown, current: unknown) {
  return stableStringify(previous) !== stableStringify(current);
}

export function getCategoryTone(category: AlgorithmicProblem["category"]) {
  switch (category) {
    case "Arrays":
      return "text-cyan-300 bg-cyan-400/10 border-cyan-400/20";
    case "Two Pointers":
      return "text-amber-300 bg-amber-400/10 border-amber-400/20";
    case "Dynamic Programming":
      return "text-fuchsia-300 bg-fuchsia-400/10 border-fuchsia-400/20";
    case "Trees":
      return "text-emerald-300 bg-emerald-400/10 border-emerald-400/20";
    case "Graphs":
      return "text-sky-300 bg-sky-400/10 border-sky-400/20";
  }
}
