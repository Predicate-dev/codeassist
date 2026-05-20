import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AlgorithmVisualizer } from "@/components/algorithm-visualizer";
import { PracticeConsole } from "@/components/practice-console";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { blind75Problems, getBlind75Problem } from "@/lib/blind75";

export function generateStaticParams() {
  return blind75Problems.map((problem) => ({ id: problem.id }));
}

interface PracticeProblemPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PracticeProblemPage({ params }: PracticeProblemPageProps) {
  const { id } = await params;
  const problem = getBlind75Problem(id);
  if (!problem) notFound();

  return (
    <main className="min-h-screen p-3 lg:p-4">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
        <header className="rounded-lg border border-border bg-card/80 p-4 shadow-glow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link href="/practice" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
                Back to Blind 75
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{problem.title}</h1>
                <Badge variant="secondary">{problem.category}</Badge>
                <Badge variant={problem.difficulty === "Hard" ? "danger" : "outline"}>{problem.difficulty}</Badge>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {problem.practice.prompt} The local runner uses JSON-friendly Python signatures so
                every Blind 75 problem can be practiced directly in the browser.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <a href="#logic-visualizer">Visualize logic</a>
              </Button>
              <Button asChild variant="outline">
                <a
                  href={`https://leetcode.com/problems/${problem.leetcodeSlug}/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  LeetCode
                </a>
              </Button>
            </div>
          </div>
        </header>

        <PracticeConsole problem={problem} />
        <AlgorithmVisualizer problem={problem} />
      </div>
    </main>
  );
}
