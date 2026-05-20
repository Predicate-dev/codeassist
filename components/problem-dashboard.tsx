"use client";

import { BarChart3, BookOpen, CheckCircle2, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AlgorithmicProblem, DrillAttempt } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getCategoryTone } from "@/lib/trace-utils";

interface ProblemDashboardProps {
  problems: AlgorithmicProblem[];
  selectedProblemId: string;
  attempts: DrillAttempt[];
  onSelectProblem: (problemId: string) => void;
}

export function ProblemDashboard({
  problems,
  selectedProblemId,
  attempts,
  onSelectProblem
}: ProblemDashboardProps) {
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;
  const completedProblemIds = new Set(attempts.filter((attempt) => attempt.correct).map((attempt) => attempt.problemId));

  const categories = problems.map((problem) => problem.category);
  const uniqueCategories = Array.from(new Set(categories));

  return (
    <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="bg-card/70">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Watch Your Solutions Come Alive</CardTitle>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                CodeAssist turns DSA practice into an active debugging loop: step through code,
                inspect every variable, and prove the next state before moving on.
              </p>
            </div>
            <Badge variant="secondary">83 practice problems available today</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { icon: BookOpen, label: "Learn", text: "Build foundations with algorithm patterns." },
              { icon: PlayCircle, label: "Practice", text: "Solve and trace real problem flows." },
              { icon: CheckCircle2, label: "Interview", text: "Use prediction drills to sharpen recall." }
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-secondary/30 p-3">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <CardTitle>Progress</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <p className="text-2xl font-semibold">{accuracy}%</p>
              <p className="text-xs text-muted-foreground">accuracy</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <p className="text-2xl font-semibold">{completedProblemIds.size}</p>
              <p className="text-xs text-muted-foreground">mastered</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <p className="text-2xl font-semibold">{attempts.length}</p>
              <p className="text-xs text-muted-foreground">drills</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {uniqueCategories.map((category) => (
              <span key={category} className={cn("rounded-md border px-2 py-1 text-xs", getCategoryTone(category))}>
                {category}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:col-span-2 md:grid-cols-2 xl:grid-cols-5">
        {problems.map((problem) => {
          const selected = problem.id === selectedProblemId;
          const problemAttempts = attempts.filter((attempt) => attempt.problemId === problem.id);
          const problemAccuracy = problemAttempts.length
            ? Math.round((problemAttempts.filter((attempt) => attempt.correct).length / problemAttempts.length) * 100)
            : 0;
          return (
            <motion.button
              key={problem.id}
              layout
              onClick={() => onSelectProblem(problem.id)}
              className={cn(
                "rounded-lg border bg-card/70 p-3 text-left transition-colors hover:border-primary/50",
                selected ? "border-primary shadow-glow" : "border-border"
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <Badge variant={problem.difficulty === "Hard" ? "danger" : "secondary"}>{problem.difficulty}</Badge>
                <span className={cn("rounded-md border px-2 py-0.5 text-[10px]", getCategoryTone(problem.category))}>
                  {problem.category}
                </span>
              </div>
              <p className="text-sm font-semibold">{problem.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {problem.fullTrace.length} steps · {problem.drillCheckpoints.length} drills
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{problemAccuracy}% drill accuracy</span>
                {selected ? (
                  <span className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
                    Open
                  </span>
                ) : null}
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
