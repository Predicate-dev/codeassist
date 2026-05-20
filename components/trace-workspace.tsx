"use client";

import { useEffect, useMemo, useState } from "react";
import { Braces, Sparkles } from "lucide-react";
import { CodePanel } from "@/components/code-panel";
import { DrillModal } from "@/components/drill-modal";
import { DynamicVisualizer } from "@/components/dynamic-visualizer";
import { ExecutionControls } from "@/components/execution-controls";
import { PracticeConsole } from "@/components/practice-console";
import { ProblemDashboard } from "@/components/problem-dashboard";
import { SidebarTracker } from "@/components/sidebar-tracker";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useTracePlayer } from "@/hooks/use-trace-player";
import { getProblemById, problems } from "@/lib/problems";
import type { DrillAttempt } from "@/lib/types";

const STORAGE_KEY = "codeassist.drillAttempts.v1";

export function TraceWorkspace() {
  const [selectedProblemId, setSelectedProblemId] = useState(problems[0].id);
  const [drillMode, setDrillMode] = useState(true);
  const [attempts, setAttempts] = useState<DrillAttempt[]>([]);

  const selectedProblem = useMemo(
    () => getProblemById(selectedProblemId),
    [selectedProblemId]
  );

  const player = useTracePlayer({
    problem: selectedProblem,
    drillMode
  });

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      setAttempts(JSON.parse(raw) as DrillAttempt[]);
    } catch {
      setAttempts([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  }, [attempts]);

  const activeCheckpoint = player.activeCheckpoint;

  function handleDrillResolve(correct: boolean, answer: string, expected: string) {
    if (!activeCheckpoint) return;

    setAttempts((current) => [
      ...current,
      {
        problemId: selectedProblem.id,
        stepIndex: activeCheckpoint.stepIndex,
        correct,
        target: activeCheckpoint.target,
        answer,
        expected,
        createdAt: new Date().toISOString()
      }
    ]);

    player.markCheckpointAnswered(activeCheckpoint.stepIndex);
    if (!player.isLastStep) {
      player.stepForward();
    }
    player.setIsPlaying(correct);
  }

  return (
    <main className="min-h-screen p-3 lg:p-4">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/70 px-4 py-3 shadow-glow">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-primary/30 bg-primary/10">
              <Braces className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight">CodeAssist</h1>
                <Badge variant="secondary">interactive DSA lab</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Step through real code, watch state mutate, and predict the next move.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Drill Mode</span>
            <Switch checked={drillMode} onCheckedChange={setDrillMode} aria-label="Toggle drill mode" />
          </div>
        </header>

        <ProblemDashboard
          problems={problems}
          selectedProblemId={selectedProblem.id}
          attempts={attempts}
          onSelectProblem={setSelectedProblemId}
        />

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(340px,0.9fr)_minmax(520px,1.35fr)_minmax(320px,0.85fr)]">
          <CodePanel problem={selectedProblem} lineNumber={player.currentStep.lineNumber} />

          <div className="grid min-h-0 gap-4">
            <DynamicVisualizer
              currentStep={player.currentStep}
              previousStep={player.previousStep}
            />
            <ExecutionControls
              isPlaying={player.isPlaying}
              isFirstStep={player.isFirstStep}
              isLastStep={player.isLastStep}
              playbackSpeed={player.playbackSpeed}
              progress={player.progress}
              currentStepIndex={player.currentStepIndex}
              totalSteps={selectedProblem.fullTrace.length}
              onPlayChange={player.setIsPlaying}
              onStepBackward={player.stepBackward}
              onStepForward={player.stepForward}
              onReset={player.reset}
              onSpeedChange={player.setPlaybackSpeed}
            />
          </div>

          <SidebarTracker currentStep={player.currentStep} />
        </div>

        <PracticeConsole problem={selectedProblem} />
      </div>

      <DrillModal
        problem={selectedProblem}
        checkpoint={activeCheckpoint}
        currentStep={player.currentStep}
        onResolve={handleDrillResolve}
      />
    </main>
  );
}
