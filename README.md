# TraceCode

TraceCode is a small, serious attempt to make algorithm practice feel less like memorizing patterns and more like actually understanding a living program.

Instead of reading a solution and hoping it sticks, you can step through real code line by line, watch variables and data structures change, and pause for prediction drills that ask: what happens next?

It is built as an interactive DSA workspace inspired by [tracecode.app](https://tracecode.app): part debugger, part visualizer, part active-recall coach.

## What It Does

- Shows syntax-highlighted algorithm code with the currently executing line highlighted.
- Plays through precompiled execution traces for classic LeetCode-style problems.
- Visualizes variables, arrays, DP tables, objects, and graph adjacency structures as they mutate.
- Offers media-player controls for stepping, playback, speed, reset, and timeline progress.
- Includes Drill Mode, which pauses at checkpoints and asks the learner to predict the next state.
- Tracks drill attempts locally so the dashboard can show accuracy and topic progress.
- Includes a small Python `sys.settrace` harness for generating trace steps from sandboxed function snippets.

## Why This Exists

A lot of DSA learning gets flattened into “recognize the pattern, paste the template.” That can work for passing a few questions, but it often leaves the actual mental model blurry.

TraceCode is meant to slow the loop down just enough for the important things to become visible:

- Which variable changed?
- Why did the pointer move?
- What does this DP cell really mean?
- Where will the branch jump?
- Could I have predicted this before seeing it?

That last question is the heart of the product. Prediction is where passive reading turns into understanding.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Shadcn-style local UI primitives
- CodeMirror for read-only code display
- Framer Motion for state transitions
- Python trace harness through a Next.js API route

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Useful checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Project Map

- `app/page.tsx` renders the main TraceCode workspace.
- `components/trace-workspace.tsx` coordinates problem selection, player state, drills, and progress.
- `hooks/use-trace-player.ts` owns playback state, stepping, speed, reset, and drill checkpoint pauses.
- `lib/types.ts` defines the trace schema and problem model.
- `lib/problems.ts` contains the precompiled fallback traces.
- `components/code-panel.tsx` renders read-only CodeMirror with active line highlighting.
- `components/dynamic-visualizer.tsx` adapts raw variable snapshots into visual blocks, tables, and graphs.
- `components/drill-modal.tsx` handles prediction prompts and remediation feedback.
- `scripts/python_trace.py` generates trace snapshots from Python code using `sys.settrace`.
- `app/api/trace/route.ts` exposes the trace harness through a server route.

## Trace Schema

Every algorithm is represented as a sequence of trace steps:

```ts
interface TraceStep {
  stepIndex: number;
  lineNumber: number;
  explanation: string;
  variables: Record<string, unknown>;
  stdout: string[];
  pointerChanges?: Record<string, "read" | "write" | "active">;
}
```

The app is designed to work beautifully from precompiled traces first. The Python harness is there as an experimental path for generating traces, not as a requirement for the learning experience.

## Current Problems

- Two Sum
- Binary Search
- Longest Common Subsequence
- Fibonacci DP
- Course Schedule

Each problem includes a code snippet, a full execution trace, and prediction checkpoints.

## Product Direction

The next good steps are:

- Add an editor flow for learners to write their own solution and generate a trace.
- Expand the problem library across more patterns from arrays, graphs, trees, DP, and backtracking.
- Add richer graph and tree layouts.
- Store progress in a real database instead of local storage.
- Add shareable trace sessions for teaching and interviews.

## A Note On The Vibe

This project is intentionally not just another code runner. The goal is to make the invisible parts of execution feel tangible, and to give learners the quiet satisfaction of saying, “I knew that was going to happen.”

That is the moment TraceCode is built for.
