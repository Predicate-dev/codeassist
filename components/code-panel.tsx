"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";
import { EditorView, Decoration, type DecorationSet } from "@codemirror/view";
import { StateField } from "@codemirror/state";
import { Badge } from "@/components/ui/badge";
import type { AlgorithmicProblem } from "@/lib/types";

function lineHighlightExtension(lineNumber: number) {
  return StateField.define<DecorationSet>({
    create(state) {
      const line = state.doc.line(Math.min(Math.max(lineNumber, 1), state.doc.lines));
      return Decoration.set([
        Decoration.line({ class: "trace-line" }).range(line.from)
      ]);
    },
    update(value, transaction) {
      if (!transaction.docChanged) return value;
      const line = transaction.state.doc.line(
        Math.min(Math.max(lineNumber, 1), transaction.state.doc.lines)
      );
      return Decoration.set([
        Decoration.line({ class: "trace-line" }).range(line.from)
      ]);
    },
    provide: (field) => EditorView.decorations.from(field)
  });
}

function languageExtension(language: AlgorithmicProblem["language"]) {
  if (language === "javascript") return javascript({ jsx: true, typescript: true });
  if (language === "java") return java();
  return python();
}

interface CodePanelProps {
  problem: AlgorithmicProblem;
  lineNumber: number;
}

export function CodePanel({ problem, lineNumber }: CodePanelProps) {
  const extensions = useMemo(
    () => [
      languageExtension(problem.language),
      lineHighlightExtension(lineNumber),
      EditorView.editable.of(false),
      EditorView.theme({
        "&": {
          background: "transparent",
          color: "#dbeafe"
        },
        ".cm-content": {
          caretColor: "#2dd4bf",
          padding: "16px 0"
        },
        ".cm-line": {
          padding: "0 16px 0 12px"
        },
        ".cm-activeLine": {
          background: "transparent"
        },
        ".cm-activeLineGutter": {
          background: "transparent"
        }
      })
    ],
    [lineNumber, problem.language]
  );

  return (
    <section className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-border bg-card/80 shadow-glow xl:h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{problem.title}</p>
          <p className="text-xs text-muted-foreground">Line {lineNumber} is executing</p>
        </div>
        <Badge variant="secondary">{problem.language}</Badge>
      </div>
      <div className="min-h-0 flex-1">
        <CodeMirror
          value={problem.codeSnippet}
          height="100%"
          basicSetup={{
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
            foldGutter: false
          }}
          extensions={extensions}
          theme="dark"
          readOnly
        />
      </div>
    </section>
  );
}
