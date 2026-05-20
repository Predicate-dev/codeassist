import { spawn } from "node:child_process";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import type { TraceStep } from "@/lib/types";

export const runtime = "nodejs";

interface TraceRequestBody {
  code: string;
  input: unknown;
  functionName?: string;
}

function runPythonHarness(body: TraceRequestBody): Promise<TraceStep[]> {
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
      reject(new Error("Trace execution timed out."));
    }, 2500);

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
        reject(new Error(stderr || `Trace harness exited with code ${code}.`));
        return;
      }
      try {
        const parsed = JSON.parse(stdout) as { trace: TraceStep[]; error?: string };
        if (parsed.error) {
          reject(new Error(parsed.error));
          return;
        }
        resolve(parsed.trace);
      } catch (error) {
        reject(error);
      }
    });

    child.stdin.write(JSON.stringify(body));
    child.stdin.end();
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TraceRequestBody;
    if (!body.code || typeof body.code !== "string") {
      return NextResponse.json({ error: "A Python function code block is required." }, { status: 400 });
    }

    const trace = await runPythonHarness(body);
    return NextResponse.json({ trace });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate trace." },
      { status: 500 }
    );
  }
}
