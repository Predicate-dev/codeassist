"use client";

import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

interface ExecutionControlsProps {
  isPlaying: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  playbackSpeed: number;
  progress: number;
  currentStepIndex: number;
  totalSteps: number;
  onPlayChange: (playing: boolean) => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export function ExecutionControls({
  isPlaying,
  isFirstStep,
  isLastStep,
  playbackSpeed,
  progress,
  currentStepIndex,
  totalSteps,
  onPlayChange,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange
}: ExecutionControlsProps) {
  return (
    <section className="rounded-lg border border-border bg-card/80 p-4 shadow-glow">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="icon" onClick={onReset} aria-label="Reset trace">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={onStepBackward}
          disabled={isFirstStep}
          aria-label="Step backward"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          onClick={() => onPlayChange(!isPlaying)}
          disabled={isLastStep && !isPlaying}
          aria-label={isPlaying ? "Pause trace" : "Play trace"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={onStepForward}
          disabled={isLastStep}
          aria-label="Step forward"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        <div className="ml-auto flex min-w-48 items-center gap-3">
          <span className="text-xs text-muted-foreground">0.5x</span>
          <Slider
            value={[playbackSpeed]}
            min={0.5}
            max={3}
            step={0.25}
            onValueChange={([value]) => onSpeedChange(value)}
            aria-label="Playback speed"
          />
          <span className="w-8 text-right text-xs font-medium text-primary">{playbackSpeed.toFixed(2)}x</span>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Step {currentStepIndex + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>
    </section>
  );
}
