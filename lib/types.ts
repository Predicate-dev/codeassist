export interface TraceStep {
  stepIndex: number;
  lineNumber: number;
  explanation: string;
  variables: Record<string, unknown>;
  stdout: string[];
  pointerChanges?: Record<string, "read" | "write" | "active">;
}

export interface DrillCheckpoint {
  stepIndex: number;
  promptType: "variable" | "line";
  target: string;
  choices?: string[];
}

export interface AlgorithmicProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: "Arrays" | "Two Pointers" | "Dynamic Programming" | "Trees" | "Graphs";
  codeSnippet: string;
  language: "python" | "java" | "javascript";
  fullTrace: TraceStep[];
  drillCheckpoints: DrillCheckpoint[];
}

export interface DrillAttempt {
  problemId: string;
  stepIndex: number;
  correct: boolean;
  target: string;
  answer: string;
  expected: string;
  createdAt: string;
}

export interface TopicProgress {
  category: AlgorithmicProblem["category"];
  mastered: number;
  attempted: number;
  accuracy: number;
}
