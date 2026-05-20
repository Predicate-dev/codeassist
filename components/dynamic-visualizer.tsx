"use client";

import { motion } from "framer-motion";
import { Network, Table2, Variable } from "lucide-react";
import type { TraceStep } from "@/lib/types";
import { cn, formatValue, stableStringify } from "@/lib/utils";
import { valuesDiffer } from "@/lib/trace-utils";

interface DynamicVisualizerProps {
  currentStep: TraceStep;
  previousStep?: TraceStep;
}

type ObjectRecord = Record<string, unknown>;

function isPrimitive(value: unknown) {
  return value === null || ["string", "number", "boolean", "undefined"].includes(typeof value);
}

function isMatrix(value: unknown): value is unknown[][] {
  return Array.isArray(value) && value.length > 0 && value.every((row) => Array.isArray(row));
}

function isGraphRecord(value: unknown): value is Record<string, unknown[]> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value as ObjectRecord).length > 0 &&
    Object.values(value as ObjectRecord).every((entry) => Array.isArray(entry))
  );
}

function toneForPointer(state?: "read" | "write" | "active") {
  if (state === "write") return "border-primary/60 bg-primary/15 text-teal-100";
  if (state === "read") return "border-sky-400/40 bg-sky-400/10 text-sky-100";
  if (state === "active") return "border-amber-300/50 bg-amber-300/10 text-amber-100";
  return "border-border bg-secondary/40 text-foreground";
}

function PrimitiveBadge({
  name,
  value,
  previous,
  state
}: {
  name: string;
  value: unknown;
  previous: unknown;
  state?: "read" | "write" | "active";
}) {
  const changed = valuesDiffer(previous, value);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex min-h-14 items-center justify-between gap-3 rounded-lg border px-3 py-2 transition-colors duration-300",
        toneForPointer(state),
        changed && "ring-1 ring-primary/50"
      )}
    >
      <span className="font-mono text-xs text-muted-foreground">{name}</span>
      <motion.span
        key={`${name}-${formatValue(value)}`}
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        className="font-mono text-sm font-semibold"
      >
        {formatValue(value)}
      </motion.span>
    </motion.div>
  );
}

function ArrayView({
  name,
  value,
  previous,
  state
}: {
  name: string;
  value: unknown[];
  previous: unknown;
  state?: "read" | "write" | "active";
}) {
  const previousArray = Array.isArray(previous) ? previous : [];
  return (
    <div className={cn("rounded-lg border p-3", toneForPointer(state))}>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-xs font-semibold text-teal-200">{name}</p>
        <span className="text-xs text-muted-foreground">array[{value.length}]</span>
      </div>
      <div className="flex min-w-0 flex-wrap gap-2">
        {value.map((cell, index) => {
          const changed = valuesDiffer(previousArray[index], cell);
          return (
            <motion.div
              layout
              key={`${name}-${index}`}
              className={cn(
                "grid h-14 min-w-14 place-items-center rounded-md border border-border bg-black/20 px-2 transition-colors duration-300",
                changed && "border-primary bg-primary/15 text-primary"
              )}
            >
              <span className="font-mono text-sm font-semibold">{formatValue(cell)}</span>
              <span className="mt-1 text-[10px] text-muted-foreground">{index}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function MatrixView({
  name,
  value,
  previous,
  state
}: {
  name: string;
  value: unknown[][];
  previous: unknown;
  state?: "read" | "write" | "active";
}) {
  const previousMatrix = isMatrix(previous) ? previous : [];
  return (
    <div className={cn("rounded-lg border p-3", toneForPointer(state))}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table2 className="h-4 w-4 text-primary" />
          <p className="font-mono text-xs font-semibold text-teal-200">{name}</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {value.length} x {value[0]?.length ?? 0}
        </span>
      </div>
      <div className="overflow-auto">
        <div
          className="grid w-max gap-1"
          style={{ gridTemplateColumns: `repeat(${value[0]?.length ?? 1}, minmax(2.5rem, 1fr))` }}
        >
          {value.map((row, rowIndex) =>
            row.map((cell, columnIndex) => {
              const changed = valuesDiffer(previousMatrix[rowIndex]?.[columnIndex], cell);
              return (
                <motion.div
                  layout
                  key={`${name}-${rowIndex}-${columnIndex}`}
                  className={cn(
                    "grid h-11 min-w-11 place-items-center rounded-md border border-border bg-black/20 font-mono text-sm transition-colors duration-300",
                    changed && "border-primary bg-primary/15 text-primary"
                  )}
                >
                  {formatValue(cell)}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function GraphView({
  name,
  value,
  state
}: {
  name: string;
  value: Record<string, unknown[]>;
  state?: "read" | "write" | "active";
}) {
  const nodes = Object.keys(value);
  const positions = nodes.reduce<Record<string, { x: number; y: number }>>((acc, node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(nodes.length, 1) - Math.PI / 2;
    acc[node] = { x: 130 + Math.cos(angle) * 88, y: 115 + Math.sin(angle) * 72 };
    return acc;
  }, {});

  return (
    <div className={cn("rounded-lg border p-3", toneForPointer(state))}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" />
          <p className="font-mono text-xs font-semibold text-teal-200">{name}</p>
        </div>
        <span className="text-xs text-muted-foreground">{nodes.length} nodes</span>
      </div>
      <svg viewBox="0 0 260 230" className="h-56 w-full rounded-md bg-black/20">
        {nodes.flatMap((from) =>
          value[from].map((to) => {
            const target = String(to);
            if (!positions[from] || !positions[target]) return null;
            return (
              <motion.line
                key={`${from}-${target}`}
                x1={positions[from].x}
                y1={positions[from].y}
                x2={positions[target].x}
                y2={positions[target].y}
                stroke="rgba(45, 212, 191, 0.45)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            );
          })
        )}
        {nodes.map((node) => (
          <g key={node}>
            <motion.circle
              cx={positions[node].x}
              cy={positions[node].y}
              r="18"
              fill="rgba(15, 23, 42, 0.92)"
              stroke="rgb(45, 212, 191)"
              strokeWidth="2"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
            />
            <text
              x={positions[node].x}
              y={positions[node].y + 4}
              textAnchor="middle"
              className="fill-slate-100 text-xs font-semibold"
            >
              {node}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ObjectView({
  name,
  value,
  state
}: {
  name: string;
  value: ObjectRecord;
  state?: "read" | "write" | "active";
}) {
  return (
    <div className={cn("rounded-lg border p-3", toneForPointer(state))}>
      <p className="mb-3 font-mono text-xs font-semibold text-teal-200">{name}</p>
      <div className="grid gap-2">
        {Object.entries(value).map(([key, entry]) => (
          <div key={key} className="flex items-center justify-between rounded-md bg-black/20 px-3 py-2">
            <span className="font-mono text-xs text-muted-foreground">{key}</span>
            <span className="font-mono text-xs text-foreground">{stableStringify(entry)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DynamicVisualizer({ currentStep, previousStep }: DynamicVisualizerProps) {
  const entries = Object.entries(currentStep.variables);
  const primitives = entries.filter(([, value]) => isPrimitive(value));
  const structured = entries.filter(([, value]) => !isPrimitive(value));

  return (
    <section className="scan-grid min-h-[380px] overflow-hidden rounded-lg border border-border bg-card/80 p-4 shadow-glow">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Variable className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Visualization</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Data shapes adapt as arrays, tables, graphs, and scope values enter the trace.
          </p>
        </div>
        <div className="rounded-md border border-border bg-black/20 px-2.5 py-1 text-xs text-muted-foreground">
          Step {currentStep.stepIndex + 1}
        </div>
      </div>

      <div className="grid gap-3">
        {primitives.length ? (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 2xl:grid-cols-4">
            {primitives.map(([name, value]) => (
              <PrimitiveBadge
                key={name}
                name={name}
                value={value}
                previous={previousStep?.variables[name]}
                state={currentStep.pointerChanges?.[name]}
              />
            ))}
          </div>
        ) : null}

        <div className="grid gap-3">
          {structured.map(([name, value]) => {
            const state = currentStep.pointerChanges?.[name];
            const previous = previousStep?.variables[name];
            if (isMatrix(value)) {
              return <MatrixView key={name} name={name} value={value} previous={previous} state={state} />;
            }
            if (Array.isArray(value)) {
              return <ArrayView key={name} name={name} value={value} previous={previous} state={state} />;
            }
            if (isGraphRecord(value)) {
              return <GraphView key={name} name={name} value={value} state={state} />;
            }
            return <ObjectView key={name} name={name} value={value as ObjectRecord} state={state} />;
          })}
        </div>
      </div>
    </section>
  );
}
