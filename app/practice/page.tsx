import Link from "next/link";
import { ArrowRight, Braces } from "lucide-react";
import { blind75Categories, blind75Problems } from "@/lib/blind75";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function difficultyTone(difficulty: "Easy" | "Medium" | "Hard") {
  if (difficulty === "Easy") return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
  if (difficulty === "Medium") return "border-amber-400/25 bg-amber-400/10 text-amber-200";
  return "border-rose-400/25 bg-rose-400/10 text-rose-200";
}

export default function PracticePage() {
  const easy = blind75Problems.filter((problem) => problem.difficulty === "Easy").length;
  const medium = blind75Problems.filter((problem) => problem.difficulty === "Medium").length;
  const hard = blind75Problems.filter((problem) => problem.difficulty === "Hard").length;

  return (
    <main className="min-h-screen p-3 lg:p-4">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
        <header className="rounded-lg border border-border bg-card/80 p-5 shadow-glow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                <Braces className="h-4 w-4" />
                Back to CodeAssist trace lab
              </Link>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Blind 75 Practice</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A focused coding catalog for the NeetCode Blind 75. Pick a problem, write Python,
                run sample tests, add your own cases, and use guided assists when you get stuck.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                ["Total", blind75Problems.length],
                ["Easy", easy],
                ["Medium", medium],
                ["Hard", hard]
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-border bg-secondary/25 px-4 py-3">
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <Card className="bg-card/75">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Question List</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Grouped by NeetCode topic so you can work pattern by pattern.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-black/20 px-3 py-2 text-xs text-muted-foreground">
                {blind75Categories.length} topic groups
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5">
              {blind75Categories.map((category) => {
                const categoryProblems = blind75Problems.filter((problem) => problem.category === category);
                return (
                  <section key={category} className="rounded-lg border border-border bg-secondary/15 p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h2 className="text-sm font-semibold">{category}</h2>
                      <Badge variant="outline">{categoryProblems.length} questions</Badge>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                      {categoryProblems.map((problem, index) => (
                        <Link
                          key={problem.id}
                          href={`/practice/${problem.id}`}
                          className="group rounded-lg border border-border bg-card/70 p-3 transition-colors hover:border-primary/50 hover:bg-primary/5"
                        >
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <span className="font-mono text-xs text-muted-foreground">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium", difficultyTone(problem.difficulty))}>
                              {problem.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold leading-5">{problem.title}</p>
                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                          </div>
                          <p className="mt-2 font-mono text-xs text-muted-foreground">
                            {problem.practice.functionName}()
                          </p>
                        </Link>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
