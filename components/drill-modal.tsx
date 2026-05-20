"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Lock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AlgorithmicProblem, DrillCheckpoint, TraceStep } from "@/lib/types";
import { getExpectedAnswer } from "@/lib/trace-utils";
import { cn } from "@/lib/utils";

function normalizeAnswer(answer: string) {
  return answer.trim().replace(/\s+/g, "");
}

interface DrillModalProps {
  problem: AlgorithmicProblem;
  checkpoint?: DrillCheckpoint;
  currentStep: TraceStep;
  onResolve: (correct: boolean, answer: string, expected: string) => void;
}

export function DrillModal({ problem, checkpoint, currentStep, onResolve }: DrillModalProps) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  const expected = useMemo(
    () => (checkpoint ? getExpectedAnswer(problem, checkpoint) : ""),
    [checkpoint, problem]
  );

  if (!checkpoint) return null;

  const prompt =
    checkpoint.promptType === "line"
      ? "The current branch has been evaluated. Which line number will the cursor jump to next?"
      : `What will be the value of ${checkpoint.target} after this line executes?`;

  function submit(selectedAnswer = answer) {
    const isCorrect = normalizeAnswer(selectedAnswer) === normalizeAnswer(expected);
    setResult(isCorrect ? "correct" : "incorrect");
    if (isCorrect) {
      window.setTimeout(() => {
        onResolve(true, selectedAnswer, expected);
        setAnswer("");
        setResult(null);
      }, 600);
    }
  }

  function continueAfterReview() {
    onResolve(false, answer, expected);
    setAnswer("");
    setResult(null);
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-glow"
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
        >
          <div className="border-b border-border bg-secondary/40 p-4">
            <div className="flex items-center gap-2 text-primary">
              <Lock className="h-4 w-4" />
              <p className="text-sm font-semibold">Predict the Next State</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Execution paused at line {currentStep.lineNumber}. {prompt}
            </p>
          </div>

          <div className="p-4">
            {checkpoint.choices?.length ? (
              <div className="grid grid-cols-2 gap-2">
                {checkpoint.choices.map((choice) => (
                  <button
                    key={choice}
                    onClick={() => {
                      setAnswer(choice);
                      submit(choice);
                    }}
                    disabled={result !== null}
                    className={cn(
                      "rounded-lg border border-border bg-secondary/40 px-3 py-3 text-left font-mono text-sm transition-colors hover:border-primary/60 hover:bg-primary/10",
                      answer === choice && "border-primary bg-primary/10",
                      result === "incorrect" && answer === choice && "border-destructive bg-destructive/10 text-destructive",
                      result === "correct" && answer === choice && "border-primary bg-primary/20 text-primary"
                    )}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") submit();
                  }}
                  className="h-10 flex-1 rounded-md border border-input bg-black/20 px-3 font-mono text-sm outline-none ring-0 transition focus:border-primary"
                  placeholder="Type the predicted value"
                />
                <Button onClick={() => submit()} disabled={!answer || result !== null}>
                  Check
                </Button>
              </div>
            )}

            {result === "correct" ? (
              <motion.div
                className="mt-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Correct. The trace can keep moving.
              </motion.div>
            ) : null}

            {result === "incorrect" ? (
              <motion.div
                className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <XCircle className="h-4 w-4" />
                  Not quite. Execution stays locked until you review the divergence.
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Expected <span className="font-mono text-foreground">{expected}</span>. The current line says:
                  {" "}{currentStep.explanation}
                </p>
                <Button className="mt-3" variant="outline" onClick={continueAfterReview}>
                  Continue after review
                </Button>
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
