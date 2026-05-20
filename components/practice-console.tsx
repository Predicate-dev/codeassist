"use client";

import { useEffect, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import {
  CheckCircle2,
  Code2,
  FlaskConical,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  TerminalSquare,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AlgorithmicProblem, PracticeTestCase } from "@/lib/types";
import { cn, compactValue } from "@/lib/utils";

interface RunResult {
  id: string;
  name: string;
  passed: boolean;
  input: unknown;
  expected: unknown;
  actual: unknown;
  stdout: string[];
  error: string | null;
}

interface PracticeConsoleProps {
  problem: AlgorithmicProblem;
}

function storageKey(problemId: string) {
  return `codeassist.practice.${problemId}.code`;
}

function getApproach(problem: AlgorithmicProblem) {
  switch (problem.id) {
    case "two-sum":
      return "Scan once with a hash map. For each number, compute the complement first; if it is already in the map, return that saved index and the current index.";
    case "binary-search":
      return "Maintain a low/high search window. Compare target with the middle value, then discard the half that cannot contain the answer.";
    case "lcs":
      return "Build a 2D DP table over prefixes. A character match extends the diagonal; otherwise carry the best value from the top or left cell.";
    case "fibonacci":
      return "Handle base cases, then build each value from the two previous values. A DP list is easiest to debug; rolling variables are leaner.";
    case "course-schedule":
      return "Use topological sorting. Build edges from prerequisite to course, queue zero-indegree courses, and count how many courses you can remove.";
    default:
      return "Start from the state variables shown in the trace, then translate each state transition into code.";
  }
}

function getScaffoldSnippet(problem: AlgorithmicProblem) {
  switch (problem.id) {
    case "two-sum":
      return `    seen = {}
    for i, num in enumerate(nums):
        need = target - num
        # if need is already in seen, return the pair
        # otherwise remember num at index i`;
    case "binary-search":
      return `    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        # compare nums[mid] to target and shrink the search window`;
    case "lcs":
      return `    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    # fill dp row by row using match vs carry-forward transitions`;
    case "fibonacci":
      return `    if n <= 1:
        return n
    # build from the two previous Fibonacci values`;
    case "course-schedule":
      return `    graph = {i: [] for i in range(num_courses)}
    indegree = [0] * num_courses
    # build edges, queue zero-indegree courses, and count visits`;
    default:
      return "    # Translate the trace state transitions into code here.";
  }
}

function customTestTemplate(problem: AlgorithmicProblem) {
  const firstSample = problem.practice.sampleTests[0];
  return JSON.stringify(
    [
      {
        id: "custom-1",
        name: "my edge case",
        input: firstSample?.input ?? { args: [] },
        expected: firstSample?.expected ?? null
      }
    ],
    null,
    2
  );
}

function parseCustomTests(raw: string): PracticeTestCase[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const parsed = JSON.parse(trimmed) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Custom tests must be a JSON array.");
  }

  return parsed.map((test, index) => {
    if (!test || typeof test !== "object") {
      throw new Error(`Custom test ${index + 1} must be an object.`);
    }
    const record = test as Partial<PracticeTestCase>;
    if (!record.input || !Array.isArray(record.input.args)) {
      throw new Error(`Custom test ${index + 1} needs input.args as an array.`);
    }
    return {
      id: record.id ?? `custom-${index + 1}`,
      name: record.name ?? `Custom ${index + 1}`,
      input: record.input,
      expected: record.expected
    };
  });
}

export function PracticeConsole({ problem }: PracticeConsoleProps) {
  const [code, setCode] = useState(problem.practice.starterCode);
  const [activePanel, setActivePanel] = useState<"tests" | "results" | "assist">("tests");
  const [customTestsRaw, setCustomTestsRaw] = useState(() => customTestTemplate(problem));
  const [selectedHint, setSelectedHint] = useState(0);
  const [results, setResults] = useState<RunResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runnerError, setRunnerError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const extensions = useMemo(
    () => [
      python(),
      EditorView.lineWrapping,
      EditorView.theme({
        "&": {
          background: "transparent",
          color: "#dbeafe"
        },
        ".cm-content": {
          caretColor: "#2dd4bf",
          padding: "14px 0"
        },
        ".cm-line": {
          padding: "0 16px"
        },
        ".cm-gutters": {
          background: "transparent",
          color: "#64748b",
          borderRight: "1px solid rgba(148, 163, 184, 0.12)"
        },
        ".cm-activeLine": {
          background: "rgba(20, 184, 166, 0.08)"
        },
        ".cm-activeLineGutter": {
          background: "rgba(20, 184, 166, 0.08)",
          color: "#5eead4"
        }
      })
    ],
    []
  );

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey(problem.id));
    setCode(saved ?? problem.practice.starterCode);
    setCustomTestsRaw(customTestTemplate(problem));
    setSelectedHint(0);
    setResults([]);
    setRunnerError(null);
    setParseError(null);
    setActivePanel("tests");
  }, [problem]);

  useEffect(() => {
    window.localStorage.setItem(storageKey(problem.id), code);
  }, [code, problem.id]);

  const parsedCustomTests = useMemo(() => {
    try {
      const parsed = parseCustomTests(customTestsRaw);
      return parsed;
    } catch {
      return [];
    }
  }, [customTestsRaw]);

  const passingCount = results.filter((result) => result.passed).length;

  function resetCode() {
    setCode(problem.practice.starterCode);
    setResults([]);
    setRunnerError(null);
  }

  function insertSnippet(snippet: string) {
    setCode((current) => `${current.trimEnd()}\n\n${snippet}`);
  }

  async function runTests(includeCustom: boolean) {
    setIsRunning(true);
    setRunnerError(null);
    setParseError(null);
    setActivePanel("results");

    let customCases: PracticeTestCase[] = [];
    if (includeCustom) {
      try {
        customCases = parseCustomTests(customTestsRaw);
      } catch (error) {
        setParseError(error instanceof Error ? error.message : "Custom tests are invalid.");
        setIsRunning(false);
        return;
      }
    }

    const tests = includeCustom
      ? [...problem.practice.sampleTests, ...customCases]
      : problem.practice.sampleTests;

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          functionName: problem.practice.functionName,
          tests
        })
      });
      const payload = (await response.json()) as { results?: RunResult[]; error?: string };
      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "Runner failed.");
      }
      setResults(payload.results ?? []);
    } catch (error) {
      setRunnerError(error instanceof Error ? error.message : "Unable to run tests.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card/80 shadow-glow">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg border border-primary/30 bg-primary/10">
            <Code2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold">Practice Console</h2>
              <Badge variant="secondary">{problem.practice.functionName}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{problem.practice.prompt}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetCode}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button variant="secondary" size="sm" onClick={() => runTests(false)} disabled={isRunning}>
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Run samples
          </Button>
          <Button size="sm" onClick={() => runTests(true)} disabled={isRunning}>
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
            Run all
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(420px,1.1fr)_minmax(320px,0.9fr)]">
        <div className="min-h-[520px] border-b border-border lg:border-b-0 lg:border-r">
          <CodeMirror
            value={code}
            height="520px"
            extensions={extensions}
            theme="dark"
            onChange={setCode}
            basicSetup={{
              foldGutter: true,
              highlightActiveLine: true,
              highlightActiveLineGutter: true
            }}
          />
        </div>

        <div className="flex min-h-[520px] flex-col">
          <div className="flex border-b border-border bg-black/10 p-2">
            {[
              { id: "tests", label: "Tests", icon: FlaskConical },
              { id: "results", label: "Results", icon: TerminalSquare },
              { id: "assist", label: "Assist", icon: Sparkles }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id as typeof activePanel)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                  activePanel === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4">
            {activePanel === "tests" ? (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Sample Tests
                    </p>
                    <Badge variant="outline">{problem.practice.sampleTests.length} cases</Badge>
                  </div>
                  <div className="space-y-2">
                    {problem.practice.sampleTests.map((test) => (
                      <div key={test.id} className="rounded-lg border border-border bg-secondary/25 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-medium">{test.name}</p>
                          <Badge variant="secondary">sample</Badge>
                        </div>
                        <div className="space-y-1 font-mono text-xs text-muted-foreground">
                          <p className="overflow-x-auto whitespace-nowrap">input: {compactValue(test.input.args)}</p>
                          <p className="overflow-x-auto whitespace-nowrap">expected: {compactValue(test.expected)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Custom Tests
                    </p>
                    <Badge variant={parsedCustomTests.length ? "default" : "outline"}>
                      {parsedCustomTests.length} parsed
                    </Badge>
                  </div>
                  <textarea
                    value={customTestsRaw}
                    onChange={(event) => setCustomTestsRaw(event.target.value)}
                    spellCheck={false}
                    className="h-56 w-full resize-y rounded-lg border border-input bg-black/20 p-3 font-mono text-xs leading-5 text-slate-200 outline-none transition focus:border-primary"
                  />
                  {parseError ? <p className="mt-2 text-xs text-destructive">{parseError}</p> : null}
                </div>
              </div>
            ) : null}

            {activePanel === "results" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Test Results
                  </p>
                  {results.length ? (
                    <Badge variant={passingCount === results.length ? "default" : "danger"}>
                      {passingCount}/{results.length} passing
                    </Badge>
                  ) : null}
                </div>

                {isRunning ? (
                  <div className="grid min-h-48 place-items-center rounded-lg border border-border bg-secondary/20 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      Running your code against the selected cases...
                    </div>
                  </div>
                ) : null}

                {runnerError ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {runnerError}
                  </div>
                ) : null}

                {!isRunning && !runnerError && !results.length ? (
                  <div className="grid min-h-48 place-items-center rounded-lg border border-border bg-secondary/20 text-center text-sm text-muted-foreground">
                    Run sample tests or add custom cases to see output here.
                  </div>
                ) : null}

                {results.map((result) => (
                  <div
                    key={result.id}
                    className={cn(
                      "rounded-lg border p-3",
                      result.passed ? "border-primary/30 bg-primary/10" : "border-destructive/30 bg-destructive/10"
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {result.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <p className="text-sm font-medium">{result.name}</p>
                      </div>
                      <Badge variant={result.passed ? "default" : "danger"}>
                        {result.passed ? "passed" : "failed"}
                      </Badge>
                    </div>
                    <div className="space-y-1 font-mono text-xs text-muted-foreground">
                      <p className="overflow-x-auto whitespace-nowrap">input: {compactValue((result.input as { args?: unknown[] }).args ?? result.input)}</p>
                      <p className="overflow-x-auto whitespace-nowrap">expected: {compactValue(result.expected)}</p>
                      <p className="overflow-x-auto whitespace-nowrap">actual: {compactValue(result.actual)}</p>
                      {result.stdout.length ? <p>stdout: {result.stdout.join(" | ")}</p> : null}
                      {result.error ? <p className="text-destructive">error: {result.error}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {activePanel === "assist" ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                    <Lightbulb className="h-4 w-4" />
                    Approach
                  </div>
                  <p className="text-sm leading-6 text-foreground">{getApproach(problem)}</p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Guided Hints
                  </p>
                  <div className="space-y-2">
                    {problem.practice.hints.map((hint, index) => (
                      <button
                        key={hint}
                        onClick={() => setSelectedHint(index)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2 text-left text-sm leading-5 transition-colors",
                          selectedHint === index
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-secondary/20 text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        Hint {index + 1}: {selectedHint === index ? hint : "Reveal when you need it"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Code Assist
                  </p>
                  <div className="grid gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => insertSnippet(getScaffoldSnippet(problem))}
                    >
                      Insert approach scaffold
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => insertSnippet("# Quick sanity print\n# print(locals())")}
                    >
                      Add debug print
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => insertSnippet("# Edge cases to think about:\n# - empty structures\n# - duplicate values\n# - no valid path / missing target")}
                    >
                      Add edge-case checklist
                    </Button>
                    <Button variant="outline" onClick={resetCode}>
                      Restore starter scaffold
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Constraints
                  </p>
                  <ul className="space-y-2">
                    {problem.practice.constraints.map((constraint) => (
                      <li key={constraint} className="rounded-lg border border-border bg-secondary/20 px-3 py-2 text-sm text-muted-foreground">
                        {constraint}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
