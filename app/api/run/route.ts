import { spawn } from "node:child_process";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import type { PracticeTestCase } from "@/lib/types";

export const runtime = "nodejs";

interface RunRequestBody {
  code: string;
  functionName: string;
  tests: PracticeTestCase[];
}

function runPythonTests(body: RunRequestBody): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "scripts", "python_trace.py");
    const child = spawn("python3", [scriptPath], {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1"
      }
    });

    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Code execution timed out."));
    }, 3000);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(stderr || `Runner exited with code ${code}.`));
        return;
      }
      try {
        const parsed = JSON.parse(stdout) as { results?: unknown[]; error?: string };
        if (parsed.error) {
          reject(new Error(parsed.error));
          return;
        }
        resolve(parsed.results ?? []);
      } catch (error) {
        reject(error);
      }
    });

    child.stdin.write(JSON.stringify({ ...body, mode: "tests" }));
    child.stdin.end();
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RunRequestBody;
    if (!body.code || !body.functionName) {
      return NextResponse.json({ error: "Code and functionName are required." }, { status: 400 });
    }

    const results = await runPythonTests(body);
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to run tests." },
      { status: 500 }
    );
  }
}
