"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AlgorithmicProblem, DrillCheckpoint } from "@/lib/types";
import { clampStep, getCheckpointForStep } from "@/lib/trace-utils";

interface UseTracePlayerOptions {
  problem: AlgorithmicProblem;
  drillMode: boolean;
  onDrillCheckpoint?: (checkpoint: DrillCheckpoint) => void;
}

export function useTracePlayer({
  problem,
  drillMode,
  onDrillCheckpoint
}: UseTracePlayerOptions) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [historyStack, setHistoryStack] = useState<number[]>([0]);
  const [answeredCheckpoints, setAnsweredCheckpoints] = useState<Set<number>>(new Set());
  const checkpointCallback = useRef(onDrillCheckpoint);

  checkpointCallback.current = onDrillCheckpoint;

  const currentStep = problem.fullTrace[currentStepIndex];
  const previousStep = problem.fullTrace[currentStepIndex - 1];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === problem.fullTrace.length - 1;
  const progress =
    problem.fullTrace.length <= 1
      ? 100
      : (currentStepIndex / (problem.fullTrace.length - 1)) * 100;

  const activeCheckpoint = useMemo(() => {
    if (!drillMode || answeredCheckpoints.has(currentStepIndex)) return undefined;
    return getCheckpointForStep(problem, currentStepIndex);
  }, [answeredCheckpoints, currentStepIndex, drillMode, problem]);

  const goToStep = useCallback(
    (index: number) => {
      setCurrentStepIndex((current) => {
        const next = clampStep(index, problem.fullTrace.length);
        if (next !== current) {
          setHistoryStack((history) => [...history, next].slice(-48));
        }
        return next;
      });
    },
    [problem.fullTrace.length]
  );

  const stepForward = useCallback(() => {
    setCurrentStepIndex((current) => {
      const next = clampStep(current + 1, problem.fullTrace.length);
      if (next !== current) {
        setHistoryStack((history) => [...history, next].slice(-48));
      }
      return next;
    });
  }, [problem.fullTrace.length]);

  const stepBackward = useCallback(() => {
    setCurrentStepIndex((current) => {
      const next = clampStep(current - 1, problem.fullTrace.length);
      if (next !== current) {
        setHistoryStack((history) => [...history, next].slice(-48));
      }
      return next;
    });
  }, [problem.fullTrace.length]);

  const reset = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setHistoryStack([0]);
  }, []);

  const markCheckpointAnswered = useCallback((stepIndex: number) => {
    setAnsweredCheckpoints((previous) => {
      const next = new Set(previous);
      next.add(stepIndex);
      return next;
    });
  }, []);

  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setHistoryStack([0]);
    setAnsweredCheckpoints(new Set());
  }, [problem.id]);

  useEffect(() => {
    if (!activeCheckpoint) return;
    setIsPlaying(false);
    checkpointCallback.current?.(activeCheckpoint);
  }, [activeCheckpoint]);

  useEffect(() => {
    if (!isPlaying || activeCheckpoint) return;
    if (isLastStep) {
      setIsPlaying(false);
      return;
    }

    const delay = Math.max(180, 900 / playbackSpeed);
    const timer = window.setTimeout(() => {
      stepForward();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [activeCheckpoint, isLastStep, isPlaying, playbackSpeed, stepForward]);

  return {
    currentStep,
    previousStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    isPlaying,
    playbackSpeed,
    progress,
    historyStack,
    activeCheckpoint,
    answeredCheckpoints,
    setIsPlaying,
    setPlaybackSpeed,
    goToStep,
    stepForward,
    stepBackward,
    reset,
    markCheckpointAnswered
  };
}
